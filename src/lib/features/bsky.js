export const BSKY_HANDLE = 'fairfruit.tv';
export const BSKY_API_BASE = 'https://public.api.bsky.app/xrpc';
export const POSTS_PER_PAGE = 50;
export const SIDEBAR_POSTS_COUNT = 5;

export async function fetchPosts(handle, cursor, limit) {
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

export function formatDate(isoString) {
	const date = new Date(isoString);
	return date.toISOString().split('T')[0];
}

export function escapeHtml(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

export function extractEmbedContent(embed) {
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
		const title = external.title || '';
		const description = external.description || '';

		if (uri.includes('tenor.com') || uri.includes('media.tenor.com') || description.includes('tenor.co') || title.toLowerCase().includes('gif')) {
			const gifUrl = uri.split('?')[0];
			return `<br><img src="${gifUrl}" alt="${escapeHtml(title)}" style="max-width: 100%; border-radius: 8px; margin: 12px 0;">`;
		}

		const youtubeMatch = uri.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
		if (youtubeMatch) {
			const videoId = youtubeMatch[1];
			return `<br><div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; margin: 12px 0;">
                <iframe src="https://www.youtube-nocookie.com/embed/${videoId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" allowfullscreen loading="lazy"></iframe>
            </div>`;
		}

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
			const quoted = embed.record.record;
			if (quoted && (quoted.$type === 'app.bsky.embed.record#viewRecord' || quoted.value)) {
				const author = quoted.author?.displayName || quoted.author?.handle || 'Unknown';
				const handle = quoted.author?.handle || 'unknown';
				const quoteText = quoted.value?.text || '';
				const quoteLines = quoteText.split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join('');

				let quoteEmbeds = '';
				if (quoted.embeds && quoted.embeds.length > 0) {
					quoteEmbeds = quoted.embeds.map(e => {
						if (e.$type === 'app.bsky.embed.recordWithMedia#view' && e.media) {
							return extractEmbedContent(e.media);
						}
						if (e.$type === 'app.bsky.embed.record#view' || e.$type === 'app.bsky.embed.recordWithMedia#view') {
							return '';
						}
						return extractEmbedContent(e);
					}).join('');
				}

				html += `<br><div style="border: 2px solid var(--color-secondary); border-radius: 8px; padding: 12px; margin: 12px 0; background: var(--color-quaternary);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <strong style="color: var(--color-primary);">${escapeHtml(author)}</strong>
                        <small style="color: var(--color-quinary);">@${escapeHtml(handle)}</small>
                    </div>
                    ${quoteLines}${quoteEmbeds}
                </div>`;
			} else {
				html += extractEmbedContent(embed.record);
			}
		}
		return html;
	}

	if (embedType === 'app.bsky.embed.record#view') {
		const quoted = embed.record;

		if (quoted.$type === 'app.bsky.embed.record#viewRecord' || quoted.value?.text) {
			const author = quoted.author?.displayName || quoted.author?.handle || 'Unknown';
			const handle = quoted.author?.handle || 'unknown';
			const quoteText = quoted.value?.text || '';
			const quoteLines = quoteText.split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join('');

			let quoteEmbeds = '';
			if (quoted.embeds && quoted.embeds.length > 0) {
				quoteEmbeds = quoted.embeds.map(e => {
					if (e.$type === 'app.bsky.embed.recordWithMedia#view' && e.media) {
						return extractEmbedContent(e.media);
					}
					if (e.$type === 'app.bsky.embed.record#view' || e.$type === 'app.bsky.embed.recordWithMedia#view') {
						return '';
					}
					return extractEmbedContent(e);
				}).join('');
			}

			return `<br><div style="border: 2px solid var(--color-secondary); border-radius: 8px; padding: 12px; margin: 12px 0; background: var(--color-quaternary);">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <strong style="color: var(--color-primary);">${escapeHtml(author)}</strong>
                    <small style="color: var(--color-quinary);">@${escapeHtml(handle)}</small>
                </div>
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

		return `<br><div style="border: 2px solid var(--color-secondary); border-radius: 8px; padding: 12px; margin: 12px 0; background: var(--color-quaternary);">
            <small style="color: var(--color-quinary);">Quoted Post</small>
        </div>`;
	}

	return '';
}

export function extractPostText(post) {
	const record = post.record;
	const text = record.text || '';
	let embedHtml = '';

	const embed = post.embed;
	if (embed) {
		embedHtml = extractEmbedContent(embed);
	}

	return { text, embedHtml };
}

export function createPostLink(uri) {
	const match = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/);
	if (match) {
		return `https://bsky.app/profile/${BSKY_HANDLE}/post/${match[1]}`;
	}
	return `https://bsky.app/profile/${BSKY_HANDLE}`;
}

export function formatPostText(text) {
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

export function renderSidebarPost(postData, index) {
	const post = postData.post;
	const record = post.record;
	const { text } = extractPostText(post);
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

export function renderMainPost(postData) {
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
