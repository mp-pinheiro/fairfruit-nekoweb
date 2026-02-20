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
	.post.selected {
		border: 2px solid var(--color-primary);
	}

	.post:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}
</style>
