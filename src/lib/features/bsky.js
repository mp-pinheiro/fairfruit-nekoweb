import { parseDateISO } from './postFilters.js';

export const BSKY_HANDLE = 'fairfruit.tv';
export const BSKY_API_BASE = 'https://public.api.bsky.app/xrpc';
export const SIDEBAR_POSTS_COUNT = 5;

const CACHE_DURATION = 5 * 60 * 1000;
const feeds = new Map();

async function fetchRawPosts(handle, cursor, limit, fetchFn) {
	const url = new URL(`${BSKY_API_BASE}/app.bsky.feed.getAuthorFeed`);
	url.searchParams.set('actor', handle);
	url.searchParams.set('filter', 'posts_no_replies');
	url.searchParams.set('limit', limit.toString());
	if (cursor) url.searchParams.set('cursor', cursor);
	const response = await fetchFn(url.toString());
	if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
	return await response.json();
}

function applyDateFilters(posts, fromDate, toDate) {
	let result = posts;
	if (fromDate) {
		const from = parseDateISO(fromDate);
		if (from) result = result.filter(item => new Date(item.post.record.createdAt) >= from);
	}
	if (toDate) {
		const to = parseDateISO(toDate);
		if (to) {
			to.setHours(23, 59, 59, 999);
			result = result.filter(item => new Date(item.post.record.createdAt) <= to);
		}
	}
	return result;
}

function sortPosts(posts, sortOrder) {
	const result = [...posts];
	result.sort((a, b) => {
		const dateA = new Date(a.post.record.createdAt);
		const dateB = new Date(b.post.record.createdAt);
		return sortOrder === 'latest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
	});
	return result;
}

function resultFor(feed, filters, page, postId) {
	const all = sortPosts(applyDateFilters(feed.items, filters.fromDate, filters.toDate), filters.sortOrder);
	const postIndex = postId ? all.findIndex(item => item.post.uri.split('/').pop() === postId) : -1;
	const startIndex = page * SIDEBAR_POSTS_COUNT;
	const posts = all.slice(startIndex, startIndex + SIDEBAR_POSTS_COUNT)
		.map(item => ({ ...item, ...parsePost(item.post) }));
	const selectedPost = postIndex < 0 ? null : (
		posts[postIndex - startIndex] ?? { ...all[postIndex], ...parsePost(all[postIndex].post) }
	);
	const pageReady = posts.length === SIDEBAR_POSTS_COUNT || feed.complete;
	const ready = (filters.sortOrder === 'latest' ? pageReady : feed.complete) &&
		(!postId || selectedPost !== null || feed.complete);
	return {
		posts,
		totalCount: all.length,
		currentPage: page,
		selectedPost,
		postPage: postIndex < 0 ? null : Math.floor(postIndex / SIDEBAR_POSTS_COUNT),
		complete: feed.complete,
		ready
	};
}

function startFeed(feed, fetchFn) {
	if (feed.loading || feed.complete) return;
	feed.loading = true;
	(async () => {
		let cursor = null;
		for (let batch = 0; batch < 15 && feed.rawCount < 750; batch++) {
			const remaining = 750 - feed.rawCount;
			const data = await fetchRawPosts(feed.handle, cursor, Math.min(100, remaining), fetchFn);
			const accepted = (data.feed || []).slice(0, remaining);
			feed.rawCount += accepted.length;
			feed.items.push(...accepted.filter(item => !item.reason));
			feed.complete = !data.cursor || feed.rawCount >= 750 || batch === 14;
			if (feed.complete) feed.completedAt = Date.now();
			feed.notify();
			if (feed.complete) break;
			cursor = data.cursor;
		}
	})().catch(error => {
		feed.error = error;
		if (feeds.get(feed.handle) === feed) feeds.delete(feed.handle);
		feed.notify();
	}).finally(() => {
		feed.loading = false;
	});
}

export function fetchPaginatedPosts(handle, filters, page, fetchFn = fetch, options = {}) {
	let feed = feeds.get(handle);
	if (feed && feed.complete && Date.now() - feed.completedAt >= CACHE_DURATION) {
		feeds.delete(handle);
		feed = null;
	}
	if (!feed) {
		feed = {
			handle, items: [], rawCount: 0, complete: false, completedAt: 0,
			loading: false, listeners: new Set(), error: null,
			notify() { for (const listener of this.listeners) listener(); }
		};
		feeds.set(handle, feed);
	}
	return new Promise((resolve, reject) => {
		const update = () => {
			if (feed.error) {
				feed.listeners.delete(update);
				reject(feed.error);
				return;
			}
			try {
				const result = resultFor(feed, filters, page, options.postId);
				options.onProgress?.(result);
				if (feed.complete) {
					feed.listeners.delete(update);
					resolve(result);
				}
			} catch (error) {
				feed.listeners.delete(update);
				reject(error);
			}
		};
		feed.listeners.add(update);
		update();
		startFeed(feed, fetchFn);
	});
}


export function formatDate(isoString) {
	const date = new Date(isoString);
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

export function escapeHtml(text) {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, m => map[m]);
}

function extractDomain(uri) {
	return uri.replace(/^https?:\/\//, '').split('/')[0];
}

export function extractEmbedData(embed) {
	if (!embed) return null;

	const embedType = embed.$type;

	if (embedType === 'app.bsky.embed.images#view') {
		const images = embed.images || [];
		return {
			type: 'images',
			data: {
				images: images.map(img => {
					const altText = img.alt ? img.alt : 'Image';
					const url = img.fullsize || img.thumb;
					return { url, alt: altText };
				})
			}
		};
	}

	if (embedType === 'app.bsky.embed.external#view') {
		const external = embed.external;
		const uri = external.uri;
		const title = external.title || '';
		const description = external.description || '';

		if (uri.includes('tenor.com') || uri.includes('media.tenor.com') || description.includes('tenor.co') || title.toLowerCase().includes('gif')) {
			const gifUrl = uri.split('?')[0];
			return {
				type: 'images',
				data: {
					images: [{ url: gifUrl, alt: title }]
				}
			};
		}

		const youtubeMatch = uri.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
		if (youtubeMatch) {
			return {
				type: 'youtube',
				data: { videoId: youtubeMatch[1] }
			};
		}

		return {
			type: 'external',
			data: {
				uri,
				title,
				description,
				thumb: external.thumb || '',
				domain: extractDomain(uri)
			}
		};
	}

	if (embedType === 'app.bsky.embed.recordWithMedia#view') {
		const result = [];
		if (embed.media) {
			const mediaData = extractEmbedData(embed.media);
			if (mediaData) result.push(mediaData);
		}
		if (embed.record) {
			const recordData = extractEmbedData(embed.record);
			if (recordData && recordData.type === 'quote') {
				result.push(recordData);
			}
		}
		return result.length > 0 ? result : null;
	}

	if (embedType === 'app.bsky.embed.record#view') {
		const quoted = embed.record;

		if (quoted.$type === 'app.bsky.embed.record#viewRecord' || quoted.value?.text) {
			const author = quoted.author?.displayName || quoted.author?.handle || 'Unknown';
			const handle = quoted.author?.handle || 'unknown';
			const quoteText = quoted.value?.text || '';

			let quoteEmbeds = [];
			if (quoted.embeds && quoted.embeds.length > 0) {
				quoteEmbeds = quoted.embeds.map(e => {
					if (e.$type === 'app.bsky.embed.recordWithMedia#view' && e.media) {
						return extractEmbedData(e.media);
					}
					if (e.$type === 'app.bsky.embed.record#view' || e.$type === 'app.bsky.embed.recordWithMedia#view') {
						return null;
					}
					return extractEmbedData(e);
				}).filter(Boolean);
			}

			return {
				type: 'quote',
				data: {
					author: { displayName: author, handle },
					text: formatPostText(quoteText),
					embeds: quoteEmbeds
				}
			};
		}

		if (quoted.did) {
			const creator = quoted.creator?.displayName || quoted.creator?.handle || 'Unknown';
			const displayName = quoted.displayName || quoted.creator?.displayName || creator;
			const description = quoted.description || quoted.creator?.description || '';

			return {
				type: 'feed',
				data: { displayName, description }
			};
		}

		return {
			type: 'quote',
			data: { author: { displayName: 'Unknown', handle: 'unknown' }, text: '', embeds: [] }
		};
	}

	return null;
}

export function parsePost(post) {
	const record = post.record;
	const text = record.text || '';
	const embed = post.embed;

	let embeds = [];
	if (embed) {
		const embedData = extractEmbedData(embed);
		if (embedData) {
			if (Array.isArray(embedData)) {
				embeds = embedData;
			} else {
				embeds = [embedData];
			}
		}
	}

	return { text, embeds };
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
			result += `<p>${escapeHtml(trimmed)}</p>`;
			prevEmpty = false;
		} else if (!prevEmpty) {
			result += '<p class="empty-para"></p>';
			prevEmpty = true;
		}
	}

	return result;
}
