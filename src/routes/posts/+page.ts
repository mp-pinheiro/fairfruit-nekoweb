import { fetchPosts, BSKY_HANDLE, POSTS_PER_PAGE, SIDEBAR_POSTS_COUNT } from '$lib/features/bsky.js';

export const prerender = false;

export async function load({ url, fetch }) {
	const page = parseInt(url.searchParams.get('page')) || 1;
	const fromDate = url.searchParams.get('from') || '';
	const toDate = url.searchParams.get('to') || '';
	const sortOrder = url.searchParams.get('sort') || 'newest';

	try {
		const data = await fetchPosts(BSKY_HANDLE, null, POSTS_PER_PAGE, fetch);
		const allPosts = data.feed.filter(item => !item.reason);

		return {
			allPosts,
			currentPage: page,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			filters: { fromDate, toDate, sortOrder }
		};
	} catch (e) {
		return {
			allPosts: [],
			currentPage: 1,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			filters: { fromDate: '', toDate: '', sortOrder: 'newest' },
			error: `Failed to load posts: ${e.message}`
		};
	}
}
