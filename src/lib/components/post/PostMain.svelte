<script>
	import { createPostLink, formatDate, formatPostText } from '$lib/features/bsky.js';
	import PostEmbed from './PostEmbed.svelte';

	let { postData } = $props();

	let post = $derived(postData?.post);
	let record = $derived(post?.record);
	let text = $derived(record?.text || '');
	let embeds = $derived(postData?.embeds || []);
	let date = $derived(record?.createdAt ? formatDate(record.createdAt) : '');
	let postUrl = $derived(post?.uri ? createPostLink(post.uri) : '');
	let formattedText = $derived(formatPostText(text));
	let postUrlDisplay = $derived(postUrl.split('/post/')[1] || postUrl);
</script>

<div class="post-main">
	<div class="header">
		<div class="title-block">
			<div class="title">Bsky Post</div>
			<a class="post-link" href={postUrl} target="_blank">{postUrlDisplay}</a>
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

<style>
	.post-main .title {
		font-size: 32px;
		font-weight: bold;
	}

	.post-main .post-link {
		font-size: 12px;
		color: var(--color-primary);
		text-decoration: none;
		display: block;
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.post-main .post-link:hover {
		text-decoration: underline;
	}

	.post-main .text {
		font-size: 18px;
		margin: 10px 0;
		text-align: justify;
		padding-top: 10px;
	}

	.post-main .text :global(p) {
		margin: 4px 0;
		line-height: 1.4;
	}

	.post-main .header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.post-main .metadata {
		display: flex;
		justify-content: end;
		text-align: right;
		gap: 10px;
	}

	.post-main .item {
		font-size: 12px;
		background-color: var(--color-secondary);
		color: var(--color-quinary);
		border-radius: 5px;
		padding: 5px;
		margin: 5px 0;
	}

	@media (max-width: 768px) {
		.post-main .header {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}

		.post-main .title {
			font-size: 24px;
		}

		.post-main .metadata {
			width: 100%;
			justify-content: flex-start;
		}
	}
</style>
