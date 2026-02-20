import { SIDEBAR_POSTS_COUNT } from '$lib/features/bsky.js';

export const prerender = false;

export async function load({ url }: { url: URL }) {
	const pageParam = url.searchParams.get('page');
	const page = pageParam ? parseInt(pageParam, 10) || 0 : 0;
	const fromDate = url.searchParams.get('from') ?? '';
	const toDate = url.searchParams.get('to') ?? '';
	const sortOrder = url.searchParams.get('sort') ?? 'newest';

	return {
		initialPage: page,
		initialFilters: { fromDate, toDate, sortOrder },
		sidebarPostsCount: SIDEBAR_POSTS_COUNT
	};
}
