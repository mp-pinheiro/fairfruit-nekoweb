import { fetchPosts, BSKY_HANDLE, POSTS_PER_PAGE, SIDEBAR_POSTS_COUNT, parsePost } from '$lib/features/bsky.js';

export const prerender = false;

export async function load({ url, fetch }: { url: URL; fetch: any }) {
	const pageParam = url.searchParams.get('page');
	const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;
	const fromDate = url.searchParams.get('from') ?? '';
	const toDate = url.searchParams.get('to') ?? '';
	const sortOrder = url.searchParams.get('sort') ?? 'newest';

	try {
		const data = await fetchPosts(BSKY_HANDLE, null, POSTS_PER_PAGE, fetch);
		const allPosts = data.feed
			.filter((item: any) => !item.reason)
			.map((item: any) => ({ ...item, ...parsePost(item.post) }));

		return {
			allPosts,
			currentPage: page,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			filters: { fromDate, toDate, sortOrder }
		};
	} catch (e: unknown) {
		const error = e instanceof Error ? e : new Error(String(e));
		return {
			allPosts: [],
			currentPage: 1,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			filters: { fromDate: '', toDate: '', sortOrder: 'newest' },
			error: `Failed to load posts: ${error.message}`
		};
	}
}
