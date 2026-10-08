import { redirect } from '@sveltejs/kit';

export const prerender = false;

export function load({ url }: { url: URL }) {
	if (url.pathname.startsWith('/posts/post/')) {
		const postId = url.pathname.split('/').pop();
		if (postId) {
			const params = new URLSearchParams(url.search);
			params.set('post', postId);
			throw redirect(307, `/posts?${params.toString()}`);
		}
	}

	return {};
}
