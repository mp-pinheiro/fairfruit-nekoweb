import { fetchPosts, BSKY_HANDLE, POSTS_PER_PAGE, SIDEBAR_POSTS_COUNT } from '$lib/features/bsky.js';
import { error } from '@sveltejs/kit';

export const prerender = false;

function parseDateISO(isoString) {
	if (!isoString) return null;
	const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (match) {
		const [, year, month, day] = match;
		return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
	}
	return null;
}

function applyFilters(posts, fromDate, toDate, sortOrder) {
	let result = [...posts];

	if (fromDate) {
		const from = parseDateISO(fromDate);
		if (from) {
			result = result.filter(item => {
				const postDate = new Date(item.post.record.createdAt);
				return postDate >= from;
			});
		}
	}

	if (toDate) {
		const to = parseDateISO(toDate);
		if (to) {
			to.setHours(23, 59, 59);
			result = result.filter(item => {
				const postDate = new Date(item.post.record.createdAt);
				return postDate <= to;
			});
		}
	}

	result.sort((a, b) => {
		const dateA = new Date(a.post.record.createdAt);
		const dateB = new Date(b.post.record.createdAt);
		return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
	});

	return result;
}

export async function load({ params, url, fetch }) {
	const { postId } = params;
	const fromDate = url.searchParams.get('from') || '';
	const toDate = url.searchParams.get('to') || '';
	const sortOrder = url.searchParams.get('sort') || 'newest';

	try {
		const data = await fetchPosts(BSKY_HANDLE, null, POSTS_PER_PAGE, fetch);
		const allPosts = data.feed.filter(item => !item.reason);

		const filteredPosts = applyFilters(allPosts, fromDate, toDate, sortOrder);

		const postIndex = filteredPosts.findIndex(item => {
			const uri = item.post.uri;
			const match = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/);
			return match && match[1] === postId;
		});

		if (postIndex === -1) {
			throw error(404, `Post with ID ${postId} not found`);
		}

		const selectedPost = filteredPosts[postIndex];

		const currentPage = Math.floor(postIndex / SIDEBAR_POSTS_COUNT);

		return {
			allPosts: filteredPosts,
			selectedPost,
			currentPage,
			postIndex,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			postId,
			filters: { fromDate, toDate, sortOrder }
		};
	} catch (e) {
		if (e.status === 404) {
			throw e;
		}
		return {
			allPosts: [],
			selectedPost: null,
			currentPage: 0,
			postIndex: 0,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			postId,
			filters: { fromDate, toDate, sortOrder },
			error: `Failed to load posts: ${e.message}`
		};
	}
}
