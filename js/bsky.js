const BSKY_HANDLE = 'fairfruit.tv';
const BSKY_API_BASE = 'https://public.api.bsky.app/xrpc';
const POSTS_PER_PAGE = 50;
const SIDEBAR_POSTS_COUNT = 5;

let allPosts = [];
let bskyCursor = null;
let isLoading = false;
let currentPage = 0;
let currentPostIndex = 0;

async function fetchPosts(handle, cursor, limit) {
    const url = new URL(`${BSKY_API_BASE}/app.bsky.feed.getAuthorFeed`);
    url.searchParams.set('actor', handle);
    url.searchParams.set('filter', 'posts_no_replies');
    url.searchParams.set('limit', limit.toString());
    if (cursor) {
        url.searchParams.set('cursor', cursor);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
}

function extractEmbedContent(embed) {
    if (!embed) return '';

    const embedType = embed.$type;

    if (embedType === 'app.bsky.embed.images#view') {
        const images = embed.images || [];
        return images.map(img => {
            const altText = img.alt ? img.alt : 'Image';
            const url = img.fullsize || img.thumb;
            return `<img src="${url}" alt="${altText}" style="max-width: 100%; border-radius: 8px; margin: 8px 0;">`;
        }).join('');
    }

    if (embedType === 'app.bsky.embed.external#view') {
        const external = embed.external;
        const uri = external.uri;

        const youtubeMatch = uri.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (youtubeMatch) {
            const videoId = youtubeMatch[1];
            return `<br><div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; margin: 12px 0;">
                <iframe src="https://www.youtube.com/embed/${videoId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
            </div>`;
        }

        const title = external.title || '';
        const description = external.description || '';
        const thumb = external.thumb || '';
        const domain = uri.replace(/^https?:\/\//, '').split('/')[0];

        let cardHtml = `<a href="${uri}" target="_blank" class="embed-card">`;
        if (thumb) {
            cardHtml += `<img src="${thumb}" alt="" class="embed-card-thumb">`;
        }
        cardHtml += `<div class="embed-card-body">`;
        if (title) cardHtml += `<div class="embed-card-title">${escapeHtml(title)}</div>`;
        if (description) cardHtml += `<div class="embed-card-desc">${escapeHtml(description.substring(0, 200))}${description.length > 200 ? '...' : ''}</div>`;
        cardHtml += `<div class="embed-card-domain">${escapeHtml(domain)}</div>`;
        cardHtml += `</div></a>`;
        return cardHtml;
    }

    if (embedType === 'app.bsky.embed.recordWithMedia#view') {
        let html = '';
        if (embed.media) {
            html += extractEmbedContent(embed.media);
        }
        if (embed.record) {
            html += extractEmbedContent(embed.record);
        }
        return html;
    }

    if (embedType === 'app.bsky.embed.record#view') {
        const quoted = embed.record;

        if (quoted.$type === 'app.bsky.embed.record#viewRecord') {
            const author = quoted.author?.displayName || quoted.author?.handle || 'Unknown';
            const quoteText = quoted.value?.text || '';
            const quoteLines = quoteText.split('\n').map(line => `<p>${line}</p>`).join('');

            let quoteEmbeds = '';
            if (quoted.embeds && quoted.embeds.length > 0) {
                quoteEmbeds = quoted.embeds.map(e => extractEmbedContent(e)).join('');
            }

            return `<br><div style="border-left: 3px solid var(--color-secondary); padding-left: 12px; margin: 12px 0;">
                <small style="color: var(--color-primary);">Replying to @${escapeHtml(author)}</small><br>
                ${quoteLines}${quoteEmbeds}
            </div>`;
        }

        if (quoted.did) {
            const creator = quoted.creator?.displayName || quoted.creator?.handle || 'Unknown';
            const displayName = quoted.displayName || quoted.creator?.displayName || creator;
            const description = quoted.description || quoted.creator?.description || '';

            return `<br><div style="border: 2px solid var(--color-secondary); border-radius: 8px; padding: 12px; margin: 12px 0;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <strong style="color: var(--color-primary);">${escapeHtml(displayName)}</strong>
                    <small style="color: var(--color-quinary);">Feed</small>
                </div>
                <p style="font-size: 14px; margin: 0;">${escapeHtml(description.substring(0, 200))}${description.length > 200 ? '...' : ''}</p>
            </div>`;
        }
    }

    return '';
}

function extractPostText(post) {
    const record = post.record;
    const text = record.text || '';
    let embedHtml = '';

    const embed = post.embed;
    if (embed) {
        embedHtml = extractEmbedContent(embed);
    }

    return { text, embedHtml };
}

function createPostLink(uri) {
    const match = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/);
    if (match) {
        return `https://bsky.app/profile/${BSKY_HANDLE}/post/${match[1]}`;
    }
    return `https://bsky.app/profile/${BSKY_HANDLE}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatPostText(text) {
    const lines = text.split('\n');
    let result = '';
    let prevEmpty = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
            result += `<p>${escapeHtml(line)}</p>`;
            prevEmpty = false;
        } else if (!prevEmpty) {
            result += '<p class="empty-para"></p>';
            prevEmpty = true;
        }
    }

    return result;
}

function renderSidebarPost(postData, index) {
    const post = postData.post;
    const record = post.record;
    const { text, embedHtml } = extractPostText(post);
    const date = formatDate(record.createdAt);
    const postUrl = createPostLink(post.uri);

    const truncatedText = text.length > 150 ? text.substring(0, 150) + '...' : text;

    return `
        <div class="post" data-post-index="${index}" style="cursor: pointer;">
            <div class="header">
                <div class="title-block">
                    <div class="title">Bsky Post</div>
                    <span class="post-link">${postUrl}</span>
                </div>
            </div>
            <div class="text">
                <p>${escapeHtml(truncatedText)}</p>
            </div>
            <div class="metadata">
                <div class="item date">${date}</div>
                <div class="item origin">Bluesky</div>
            </div>
        </div>
    `;
}

function renderMainPost(postData) {
    const post = postData.post;
    const record = post.record;
    const { text, embedHtml } = extractPostText(post);
    const date = formatDate(record.createdAt);
    const postUrl = createPostLink(post.uri);

    return `
        <div class="post-main">
            <div class="post-main header">
                <div class="title-block">
                    <div class="title">Bsky Post</div>
                    <a class="post-link" href="${postUrl}" target="_blank">${postUrl}</a>
                </div>
                <div class="post-main metadata">
                    <div class="item date">${date}</div>
                    <div class="item origin">Bluesky</div>
                </div>
            </div>
            <div class="text">
                ${formatPostText(text)}
                ${embedHtml}
            </div>
        </div>
    `;
}

function showMainPost(index) {
    const container = document.getElementById('bsky-posts-feed');
    if (!container || !allPosts[index]) return;

    currentPostIndex = index;
    currentPage = Math.floor(index / SIDEBAR_POSTS_COUNT);
    container.innerHTML = renderMainPost(allPosts[index]);
    container.scrollTop = 0;

    updateSidebarHighlight();
}

function updateSidebarHighlight() {
    document.querySelectorAll('.post[data-post-index]').forEach(el => {
        const index = parseInt(el.dataset.postIndex);
        if (index === currentPostIndex) {
            el.style.backgroundColor = 'var(--color-quaternary)';
            el.style.border = '2px solid var(--color-primary)';
        } else {
            el.style.backgroundColor = '';
            el.style.border = '';
        }
    });
}

function renderSidebarPage() {
    const container = document.getElementById('bsky-posts-sidebar');
    if (!container) return;

    const startIndex = currentPage * SIDEBAR_POSTS_COUNT;
    const endIndex = Math.min(startIndex + SIDEBAR_POSTS_COUNT, allPosts.length);

    let html = '';
    for (let i = startIndex; i < endIndex; i++) {
        html += renderSidebarPost(allPosts[i], i);
    }

    container.innerHTML = html;

    setupSidebarClickHandlers();
    updatePaginationButtons();
    updateSidebarHighlight();
}

function setupSidebarClickHandlers() {
    const sidebarPosts = document.querySelectorAll('.post[data-post-index]');
    sidebarPosts.forEach(postEl => {
        postEl.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) return;
            const index = parseInt(postEl.dataset.postIndex);
            showMainPost(index);
        });
    });
}

function updatePaginationButtons() {
    const prevBtn = document.getElementById('prev-posts');
    const nextBtn = document.getElementById('next-posts');
    const pageInfo = document.getElementById('page-info');

    if (prevBtn) prevBtn.style.display = currentPage > 0 ? 'inline-block' : 'none';
    if (nextBtn) nextBtn.style.display = (currentPage + 1) * SIDEBAR_POSTS_COUNT < allPosts.length ? 'inline-block' : 'none';
    if (pageInfo) {
        const totalPages = Math.ceil(allPosts.length / SIDEBAR_POSTS_COUNT);
        pageInfo.textContent = `${currentPage + 1} / ${totalPages}`;
        pageInfo.style.display = allPosts.length > 0 ? 'inline' : 'none';
    }
}

function showLoading(container) {
    container.innerHTML = '<div class="loading">Loading posts...</div>';
}

function showError(container, message) {
    container.innerHTML = `<div class="error-message">${escapeHtml(message)}</div>`;
}

async function loadInitialPosts() {
    const sidebarContainer = document.getElementById('bsky-posts-sidebar');
    const mainContainer = document.getElementById('bsky-posts-feed');
    if (!sidebarContainer || !mainContainer) return;

    showLoading(sidebarContainer);
    showLoading(mainContainer);

    try {
        const data = await fetchPosts(BSKY_HANDLE, null, POSTS_PER_PAGE);

        if (!data.feed || data.feed.length === 0) {
            showError(sidebarContainer, 'No posts found.');
            showError(mainContainer, 'No posts found.');
            return;
        }

        allPosts = data.feed.filter(item => !item.reason);
        bskyCursor = data.cursor || null;

        currentPage = 0;
        currentPostIndex = 0;
        renderSidebarPage();
        showMainPost(0);

    } catch (error) {
        showError(sidebarContainer, `Failed to load posts: ${error.message}`);
        showError(mainContainer, `Failed to load posts: ${error.message}`);
    }
}

function setupPagination() {
    const prevBtn = document.getElementById('prev-posts');
    const nextBtn = document.getElementById('next-posts');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                renderSidebarPage();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if ((currentPage + 1) * SIDEBAR_POSTS_COUNT < allPosts.length) {
                currentPage++;
                renderSidebarPage();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadInitialPosts();
    setupPagination();
});
