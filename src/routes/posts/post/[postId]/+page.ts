import { fetchPaginatedPosts, BSKY_HANDLE, SIDEBAR_POSTS_COUNT } from '$lib/features/bsky.js';
import { error } from '@sveltejs/kit';

export const prerender = false;

async function findPostInAllPages(postId, filters, fetchFn) {
	let page = 0;
	const maxPages = 100;

	while (page < maxPages) {
		const result = await fetchPaginatedPosts(BSKY_HANDLE, filters, page, fetchFn);

		const foundIndex = result.posts.findIndex(item => {
			const uri = item.post.uri;
			const match = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/);
			return match && match[1] === postId;
		});

		if (foundIndex !== -1) {
			return {
				post: result.posts[foundIndex],
				currentPage: page,
				totalCount: result.totalCount
			};
		}

		if ((page + 1) * SIDEBAR_POSTS_COUNT >= result.totalCount) {
			break;
		}

		page++;
	}

	return null;
}

export async function load({ params, url, fetch }: { params: { postId: string }; url: URL; fetch: any }) {
	const { postId } = params;
	const pageParam = url.searchParams.get('page');
	const requestedPage = pageParam ? parseInt(pageParam, 10) || 0 : 0;
	const fromDate = url.searchParams.get('from') ?? '';
	const toDate = url.searchParams.get('to') ?? '';
	const sortOrder = url.searchParams.get('sort') ?? 'newest';

	const filters = { fromDate, toDate, sortOrder };

	try {
		const result = await findPostInAllPages(postId, filters, fetch);

		if (!result) {
			throw error(404, `Post with ID ${postId} not found`);
		}

		const { post, currentPage, totalCount } = result;

		const pagePostsResult = await fetchPaginatedPosts(BSKY_HANDLE, filters, requestedPage, fetch);

		return {
			posts: pagePostsResult.posts,
			selectedPost: post,
			currentPage: requestedPage,
			postPage: currentPage,
			totalCount,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			postId,
			filters
		};
	} catch (e: unknown) {
		if (e && typeof e === 'object' && 'status' in e && e.status === 404) {
			throw e;
		}
		const err = e instanceof Error ? e : new Error(String(e));
		return {
			posts: [],
			selectedPost: null,
			currentPage: 0,
			postPage: 0,
			totalCount: 0,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			postId,
			filters: { fromDate, toDate, sortOrder },
			error: `Failed to load posts: ${err.message}`
		};
	}
}
