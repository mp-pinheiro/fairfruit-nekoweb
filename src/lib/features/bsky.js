export const BSKY_HANDLE = 'fairfruit.tv';
export const BSKY_API_BASE = 'https://public.api.bsky.app/xrpc';
export const POSTS_PER_PAGE = 50;
export const SIDEBAR_POSTS_COUNT = 5;

let postsCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function fetchPosts(handle, cursor, limit, fetchFn = fetch) {
	const now = Date.now();

	if (postsCache && (now - cacheTime) < CACHE_DURATION) {
		return postsCache;
	}

	const url = new URL(`${BSKY_API_BASE}/app.bsky.feed.getAuthorFeed`);
	url.searchParams.set('actor', handle);
	url.searchParams.set('filter', 'posts_no_replies');
	url.searchParams.set('limit', limit.toString());
	if (cursor) {
		url.searchParams.set('cursor', cursor);
	}

	const response = await fetchFn(url.toString(), {
		headers: {
			'Cache-Control': 'max-age=300'
		}
	});
	if (!response.ok) {
		throw new Error(`API error: ${response.status} ${response.statusText}`);
	}
	const data = await response.json();

	postsCache = data;
	cacheTime = now;

	return data;
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
