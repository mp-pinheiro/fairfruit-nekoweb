<script>
	import { escapeHtml, createPostLink, formatDate } from '$lib/features/bsky.js';

	let { postData, index, isSelected = false, onclick } = $props();

	let post = $derived(postData?.post);
	let record = $derived(post?.record);
	let text = $derived(record?.text || '');
	let date = $derived(record?.createdAt ? formatDate(record.createdAt) : '');
	let postUrl = $derived(post?.uri ? createPostLink(post.uri) : '');
	let displayText = $derived(text.length > 150 ? text.substring(0, 150) + '...' : text);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="post {isSelected ? 'selected' : ''}"
	onclick={() => onclick?.(index)}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && onclick?.(index)}
>
	<div class="header">
		<div class="title-block">
			<div class="title">Bsky Post</div>
			<span class="post-link">{postUrl}</span>
		</div>
	</div>
	<div class="text">
		<p>{escapeHtml(displayText)}</p>
	</div>
	<div class="metadata">
		<div class="item date">{date}</div>
		<div class="item origin">Bluesky</div>
	</div>
</div>

<style>
	.post {
		border: 2px solid var(--color-quinary);
		border-radius: 15px;
		padding: 20px;
		margin: 10px 0;
		height: 180px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background-color: var(--color-quaternary);
	}

	.post:hover {
		cursor: pointer;
	}

	.post.selected {
		border: 2px solid var(--color-primary);
	}

	.post:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.post .header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.post .metadata {
		display: flex;
		justify-content: end;
		text-align: right;
		gap: 10px;
	}

	.post .item {
		font-size: 12px;
		background-color: var(--color-secondary);
		color: var(--color-quinary);
		border-radius: 5px;
		padding: 5px;
		margin: 5px 0;
	}

	.title {
		font-size: 20px;
		font-weight: bold;
	}

	.text {
		font-size: 14px;
		margin: 10px 0;
	}

	.post .text {
		flex: 1;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
	}

	.title-block {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.post .title-block .post-link {
		font-size: 10px;
		color: var(--color-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 180px;
	}
</style>
