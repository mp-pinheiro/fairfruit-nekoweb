import { fetchPaginatedPosts, BSKY_HANDLE, SIDEBAR_POSTS_COUNT } from '$lib/features/bsky.js';

export const prerender = false;

export async function load({ url, fetch }: { url: URL; fetch: any }) {
	const pageParam = url.searchParams.get('page');
	const page = pageParam ? parseInt(pageParam, 10) || 0 : 0;
	const fromDate = url.searchParams.get('from') ?? '';
	const toDate = url.searchParams.get('to') ?? '';
	const sortOrder = url.searchParams.get('sort') ?? 'newest';

	const filters = { fromDate, toDate, sortOrder };

	try {
		const result = await fetchPaginatedPosts(BSKY_HANDLE, filters, page, fetch);

		return {
			posts: result.posts,
			totalCount: result.totalCount,
			currentPage: result.currentPage,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			filters
		};
	} catch (e: unknown) {
		const error = e instanceof Error ? e : new Error(String(e));
		return {
			posts: [],
			totalCount: 0,
			currentPage: 0,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			filters: { fromDate: '', toDate: '', sortOrder: 'newest' },
			error: `Failed to load posts: ${error.message}`
		};
	}
}
