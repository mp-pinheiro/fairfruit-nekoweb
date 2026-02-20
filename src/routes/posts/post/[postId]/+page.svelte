<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import {
		renderMainPost,
		SIDEBAR_POSTS_COUNT
	} from '$lib/features/bsky.js';

	let { data } = $props();

	let allPosts = $state(data.allPosts || []);
	let selectedPost = $state(data.selectedPost);
	let currentPage = $state(data.currentPage || 0);
	let currentPostIndex = $state(data.postIndex || 0);
	let bskyError = $state(data.error || '');
	let postId = $state(data.postId || '');

	$effect(() => {
		allPosts = data.allPosts || [];
		selectedPost = data.selectedPost;
		currentPage = data.currentPage || 0;
		currentPostIndex = data.postIndex || 0;
		bskyError = data.error || '';
		postId = data.postId || '';
	});

	let sidebarPosts = $derived.by(() =>
		allPosts.slice(currentPage * SIDEBAR_POSTS_COUNT, (currentPage + 1) * SIDEBAR_POSTS_COUNT)
	);

	let totalPages = $derived.by(() => Math.ceil(allPosts.length / SIDEBAR_POSTS_COUNT));
	let hasPrev = $derived.by(() => currentPage > 0);
	let hasNext = $derived.by(() => (currentPage + 1) * SIDEBAR_POSTS_COUNT < allPosts.length);

	function selectPost(index) {
		const post = allPosts[index];
		if (!post) return;
		const uri = post.post.uri;
		const match = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/);
		if (match) {
			goto(`/posts/post/${match[1]}`);
		}
	}

	function prevPage() {
		if (hasPrev) {
			const newPage = currentPage - 1;
			currentPage = newPage;
		}
	}

	function nextPage() {
		if (hasNext) {
			const newPage = currentPage + 1;
			currentPage = newPage;
		}
	}

	function formatDate(isoString) {
		const date = new Date(isoString);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}

	function getPostId(uri) {
		const match = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/);
		return match ? match[1] : null;
	}
</script>

<svelte:head>
	<title>Post - Fairfruit</title>
	<link rel="canonical" href="https://fairfruit.tv/posts/post/{postId}">
</svelte:head>

<Header title="Welcome to Fairfruit" />

<div class="container">
	<div class="main-content">
		<section data-content="posts" class="content">
			<div id="bsky-posts-feed">
				{#if bskyError}
					<div class="error-message">{bskyError}</div>
				{:else if selectedPost?.post}
					{@html renderMainPost(selectedPost)}
				{:else}
					<div class="error-message">Post not found</div>
				{/if}
			</div>
		</section>
	</div>

	<div
		data-content="posts"
		class="main-content posts-sidebar content"
	>
		<section class="content" style="display: flex; flex-direction: column;">
			<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
				<h2 style="margin: 0;">Posts</h2>
				<a href="/posts" style="background: var(--color-secondary); border: none; border-radius: 8px; padding: 6px 12px; text-decoration: none; cursor: pointer; font-family: 'Courier New', monospace; font-size: 12px; color: var(--color-quinary); transition: all 0.2s ease-in-out;">View All</a>
			</div>
			<div id="bsky-posts-sidebar">
				{#if bskyError}
					<div class="error-message">{bskyError}</div>
				{:else}
					{#each sidebarPosts as postData, i}
						{@const globalIndex = currentPage * SIDEBAR_POSTS_COUNT + i}
						{@const post = postData.post}
						{@const record = post.record}
						{@const date = formatDate(record.createdAt)}
						{@const uri = post.uri}
						{@const postMatch = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/)}
						{@const postUrl = postMatch ? `https://bsky.app/profile/${$page.params.handle || 'fairfruit.tv'}/post/${postMatch[1]}` : `https://bsky.app/profile/fairfruit.tv`}
						{@const text = record.text || ''}
						{@const isSelected = getPostId(uri) === postId}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="post"
							style="cursor: pointer; {isSelected ? 'border: 2px solid var(--color-primary);' : ''}"
							onclick={() => selectPost(globalIndex)}
						>
							<div class="header">
								<div class="title-block">
									<div class="title">Bsky Post</div>
									<span class="post-link">{postUrl}</span>
								</div>
							</div>
							<div class="text">
								<p style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">{text}</p>
							</div>
							<div class="metadata">
								<div class="item date">{date}</div>
								<div class="item origin">Bluesky</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
			<div class="pagination-controls" style="text-align: center; margin: 20px 0;">
				<button onclick={prevPage} disabled={!hasPrev} style="margin-right: 10px;">Prev</button>
				{#if allPosts.length > 0}
					<span id="page-info">{currentPage + 1} / {totalPages}</span>
				{/if}
				<button onclick={nextPage} disabled={!hasNext} style="margin-left: 10px;">Next</button>
			</div>
		</section>
	</div>
</div>

<hr>
<Footer />
