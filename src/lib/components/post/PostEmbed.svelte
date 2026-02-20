<script>
	import { escapeHtml } from '$lib/features/bsky.js';

	let { embedData } = $props();

	let type = $derived(embedData?.type || '');
	let data = $derived(embedData?.data || null);
</script>

{#if type === 'images' && data?.images}
	<div class="embed-images">
		{#each data.images as img}
			<img src={img.url} alt={img.alt || 'Image'} class="embed-image" loading="lazy" />
		{/each}
	</div>

{:else if type === 'external' && data}
	<a href={data.uri} target="_blank" class="embed-card">
		{#if data.thumb}
			<img src={data.thumb} alt="" class="embed-card-thumb" />
		{/if}
		<div class="embed-card-body">
			{#if data.title}
				<div class="embed-card-title">{escapeHtml(data.title)}</div>
			{/if}
			{#if data.description}
				<div class="embed-card-desc">
					{escapeHtml(data.description.length > 200 ? data.description.substring(0, 200) + '...' : data.description)}
				</div>
			{/if}
			<div class="embed-card-domain">{escapeHtml(data.domain)}</div>
		</div>
	</a>

{:else if type === 'youtube' && data?.videoId}
	<div class="embed-youtube">
		<iframe
			src={`https://www.youtube-nocookie.com/embed/${data.videoId}`}
			class="youtube-iframe"
			title="YouTube video"
			allowfullscreen
			loading="lazy"
		></iframe>
	</div>

{:else if type === 'quote' && data}
	<div class="embed-quote">
		<div class="quote-header">
			<strong class="quote-author">{escapeHtml(data.author.displayName)}</strong>
			<small class="quote-handle">@{escapeHtml(data.author.handle)}</small>
		</div>
		{#if data.text}
			<div class="quote-text">
				{@html data.text}
			</div>
		{/if}
		{#if data.embeds && data.embeds.length > 0}
			{#each data.embeds as embedData}
				<svelte:self embedData={embedData} />
			{/each}
		{/if}
	</div>

{:else if type === 'feed' && data}
	<div class="embed-feed">
		<div class="feed-header">
			<strong class="feed-name">{escapeHtml(data.displayName)}</strong>
			<small class="feed-label">Feed</small>
		</div>
		{#if data.description}
			<p class="feed-description">
				{escapeHtml(data.description.length > 200 ? data.description.substring(0, 200) + '...' : data.description)}
			</p>
		{/if}
	</div>
{/if}

<style>
	.embed-images {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 12px 0;
	}

	.embed-image {
		max-width: 100%;
		border-radius: 8px;
	}

	.embed-youtube {
		position: relative;
		padding-bottom: 56.25%;
		height: 0;
		overflow: hidden;
		border-radius: 8px;
		margin: 12px 0;
	}

	.youtube-iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: none;
	}

	.embed-quote {
		border: 2px solid var(--color-secondary);
		border-radius: 8px;
		padding: 12px;
		margin: 12px 0;
		background: var(--color-quaternary);
	}

	.quote-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.quote-author {
		color: var(--color-primary);
	}

	.quote-handle {
		color: var(--color-quinary);
	}

	.quote-text {
		font-size: 14px;
	}

	.quote-text :global(p) {
		margin: 4px 0;
		line-height: 1.4;
	}

	.embed-feed {
		border: 2px solid var(--color-secondary);
		border-radius: 8px;
		padding: 12px;
		margin: 12px 0;
	}

	.feed-header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 8px;
	}

	.feed-name {
		color: var(--color-primary);
	}

	.feed-label {
		color: var(--color-quinary);
	}

	.feed-description {
		font-size: 14px;
		margin: 0;
	}

	.embed-card {
		display: flex;
		border: 1px solid var(--color-secondary);
		border-radius: 8px;
		overflow: hidden;
		margin: 12px 0;
		text-decoration: none;
		color: inherit;
		transition: border-color 0.2s;
	}

	.embed-card:hover {
		border-color: var(--color-primary);
	}

	.embed-card-thumb {
		width: 120px;
		min-height: 80px;
		object-fit: cover;
		flex-shrink: 0;
	}

	.embed-card-body {
		padding: 10px;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.embed-card-title {
		font-size: 14px;
		font-weight: bold;
		color: var(--color-quinary);
	}

	.embed-card-desc {
		font-size: 12px;
		color: var(--color-quinary);
		opacity: 0.8;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.embed-card-domain {
		font-size: 11px;
		color: var(--color-primary);
	}

	.empty-para {
		margin: 8px 0;
		min-height: 4px;
	}
</style>
