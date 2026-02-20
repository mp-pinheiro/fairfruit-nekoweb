import { fetchPosts, BSKY_HANDLE, POSTS_PER_PAGE, SIDEBAR_POSTS_COUNT } from '$lib/features/bsky.js';
import { error } from '@sveltejs/kit';

export const prerender = false;

export async function load({ params, fetch }) {
	const { postId } = params;

	try {
		const data = await fetchPosts(BSKY_HANDLE, null, POSTS_PER_PAGE, fetch);
		const allPosts = data.feed.filter(item => !item.reason);

		const postIndex = allPosts.findIndex(item => {
			const uri = item.post.uri;
			const match = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/);
			return match && match[1] === postId;
		});

		if (postIndex === -1) {
			throw error(404, `Post with ID ${postId} not found`);
		}

		const selectedPost = allPosts[postIndex];

		const currentPage = Math.floor(postIndex / SIDEBAR_POSTS_COUNT);

		return {
			allPosts,
			selectedPost,
			currentPage,
			postIndex,
			sidebarPostsCount: SIDEBAR_POSTS_COUNT,
			postId
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
			error: `Failed to load posts: ${e.message}`
		};
	}
}
