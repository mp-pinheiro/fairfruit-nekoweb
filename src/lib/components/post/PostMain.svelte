<script>
	import { escapeHtml, createPostLink, formatDate, formatPostText } from '$lib/features/bsky.js';
	import PostEmbed from './PostEmbed.svelte';

	let { postData } = $props();

	let post = $derived(postData?.post);
	let record = $derived(post?.record);
	let text = $derived(record?.text || '');
	let embeds = $derived(postData?.embeds || []);
	let date = $derived(record?.createdAt ? formatDate(record.createdAt) : '');
	let postUrl = $derived(post?.uri ? createPostLink(post.uri) : '');
	let formattedText = $derived(formatPostText(text));
</script>

<div class="post-main">
	<div class="header">
		<div class="title-block">
			<div class="title">Bsky Post</div>
			<a class="post-link" href={postUrl} target="_blank">{postUrl}</a>
		</div>
		<div class="metadata">
			<div class="item date">{date}</div>
			<div class="item origin">Bluesky</div>
		</div>
	</div>
	<div class="text">
		{@html formattedText}
		{#each embeds as embed}
			<PostEmbed embedData={embed} />
		{/each}
	</div>
</div>
