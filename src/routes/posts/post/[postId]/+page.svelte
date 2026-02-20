<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page, navigating } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import PostMain from '$lib/components/post/PostMain.svelte';
	import PostSidebarItem from '$lib/components/post/PostSidebarItem.svelte';
	import FilterDialog from '$lib/components/FilterDialog.svelte';
	import { SIDEBAR_POSTS_COUNT } from '$lib/features/bsky.js';
	import {
		formatDisplayDate,
		convertToISO
	} from '$lib/features/postFilters.js';

	let { data } = $props();

	let posts = $state([]);
	let selectedPost = $state(null);
	let currentPage = $state(0);
	let totalCount = $state(0);
	let bskyError = $state('');
	let postId = $state('');
	let isLoading = $state(true);

	let filters = $state({
		fromDate: '',
		toDate: '',
		sortOrder: 'newest'
	});

	let tempFilters = $state({
		fromDate: '',
		toDate: '',
		sortOrder: 'newest'
	});

	let showFilterDialog = $state(false);
	let isMobileSidebarOpen = $state(false);

	let totalPages = $derived.by(() => Math.ceil(totalCount / SIDEBAR_POSTS_COUNT));
	let hasPrev = $derived.by(() => currentPage > 0);
	let hasNext = $derived.by(() => (currentPage + 1) * SIDEBAR_POSTS_COUNT < totalCount);

	$effect(() => {
		posts = data.posts ?? [];
		selectedPost = data.selectedPost ?? null;
		currentPage = data.currentPage ?? 0;
		totalCount = data.totalCount ?? 0;
		bskyError = data.error ?? '';
		postId = data.postId ?? '';
		if (data.filters) {
			filters.fromDate = data.filters.fromDate;
			filters.toDate = data.filters.toDate;
			filters.sortOrder = data.filters.sortOrder;
		}
		isLoading = false;
	});

	function selectPost(index) {
		const post = posts[index];
		if (!post) return;
		const uri = post.post.uri;
		const match = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/);
		if (match) {
			const params = new URLSearchParams();
			params.set('page', currentPage.toString());
			if (filters.fromDate) params.set('from', filters.fromDate);
			if (filters.toDate) params.set('to', filters.toDate);
			if (filters.sortOrder !== 'newest') params.set('sort', filters.sortOrder);
			const queryString = params.toString();
			goto(queryString ? `/posts/post/${match[1]}?${queryString}` : `/posts/post/${match[1]}`);
			if (window.innerWidth <= 1024) {
				toggleSidebar();
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}
		}
	}

	function prevPage() {
		if (hasPrev) {
			currentPage--;
			updateUrl();
		}
	}

	function nextPage() {
		if (hasNext) {
			currentPage++;
			updateUrl();
		}
	}

	function getPostId(uri) {
		const match = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/);
		return match ? match[1] : null;
	}

	function hasActiveFilters() {
		return filters.fromDate !== '' || filters.toDate !== '' || filters.sortOrder !== 'newest';
	}

	function openFilterDialog() {
		tempFilters.fromDate = filters.fromDate ? formatDisplayDate(filters.fromDate) : '';
		tempFilters.toDate = filters.toDate ? formatDisplayDate(filters.toDate) : '';
		tempFilters.sortOrder = filters.sortOrder;
		showFilterDialog = true;
	}

	function handleFilterReset() {
		tempFilters.fromDate = '';
		tempFilters.toDate = '';
		tempFilters.sortOrder = 'newest';
		filters.fromDate = '';
		filters.toDate = '';
		filters.sortOrder = 'newest';
		showFilterDialog = false;
		goto('/posts');
	}

	function handleFilterApply(newFilters) {
		filters.fromDate = newFilters.fromDate ? convertToISO(newFilters.fromDate) : '';
		filters.toDate = newFilters.toDate ? convertToISO(newFilters.toDate) : '';
		filters.sortOrder = newFilters.sortOrder;
		showFilterDialog = false;

		const params = new URLSearchParams();
		if (filters.fromDate) params.set('from', filters.fromDate);
		if (filters.toDate) params.set('to', filters.toDate);
		if (filters.sortOrder !== 'newest') params.set('sort', filters.sortOrder);
		goto(params.toString() ? `/posts?${params.toString()}` : '/posts');
	}

	function handleFilterClose() {
		showFilterDialog = false;
	}

	function toggleSidebar() {
		isMobileSidebarOpen = !isMobileSidebarOpen;
		document.body.style.overflow = isMobileSidebarOpen ? 'hidden' : '';
	}

	function updateUrl() {
		const params = new URLSearchParams();
		params.set('page', currentPage.toString());
		if (filters.fromDate) params.set('from', filters.fromDate);
		if (filters.toDate) params.set('to', filters.toDate);
		if (filters.sortOrder !== 'newest') params.set('sort', filters.sortOrder);
		const queryString = params.toString();
		goto(queryString ? `/posts/post/${postId}?${queryString}` : `/posts/post/${postId}`, { keepFocus: true });
	}

	onMount(() => {
		if (filters.fromDate) {
			tempFilters.fromDate = formatDisplayDate(filters.fromDate);
		}
		if (filters.toDate) {
			tempFilters.toDate = formatDisplayDate(filters.toDate);
		}
		tempFilters.sortOrder = filters.sortOrder;
	});
</script>

<svelte:head>
	<title>Post - Fairfruit</title>
	<link rel="canonical" href="https://fairfruit.tv/posts/post/{postId}">
</svelte:head>

<Header title="Welcome to Fairfruit" />

{#if isMobileSidebarOpen}
	<div
		class="sidebar-backdrop"
		onclick={toggleSidebar}
		onkeydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && toggleSidebar()}
		role="button"
		tabindex="0"
		aria-label="Close posts sidebar"
	></div>
{/if}

<button class="fab-trigger" onclick={toggleSidebar}>
	<i class="fa-solid fa-list"></i> Posts
</button>

<div class="container">
	<div class="main-content">
		<section data-content="posts" class="content">
			<div id="bsky-posts-feed">
				{#if bskyError}
					<div class="error-message">{bskyError}</div>
				{:else if isLoading || $navigating}
					<div class="skeleton-main">
						<div class="skeleton-main-header">
							<div class="skeleton-main-title"></div>
							<div class="skeleton-main-link"></div>
						</div>
						<div class="skeleton-main-text">
							<div class="skeleton-line-long"></div>
							<div class="skeleton-line-long"></div>
							<div class="skeleton-line-long"></div>
							<div class="skeleton-line-short"></div>
						</div>
						<div class="skeleton-main-metadata">
							<div class="skeleton-main-item"></div>
							<div class="skeleton-main-item"></div>
						</div>
					</div>
				{:else if selectedPost}
					<PostMain postData={selectedPost} />
				{:else}
					<div class="error-message">Post not found</div>
				{/if}
			</div>
		</section>
	</div>

	<div data-content="posts" class="main-content posts-sidebar content" class:open={isMobileSidebarOpen}>
		<section class="content">
			<div class="sidebar-header">
				<h2>Posts</h2>
				<button
					type="button"
					class="filter-button"
					onclick={() => openFilterDialog()}
				>
					<i class="fa-solid fa-filter"></i>
					{#if hasActiveFilters()}
						<span class="filter-indicator">!</span>
					{/if}
				</button>
			</div>
			<div id="bsky-posts-sidebar">
				{#if bskyError}
					<div class="error-message">{bskyError}</div>
				{:else if isLoading || $navigating}
					<div class="skeleton-container">
						{#each Array(SIDEBAR_POSTS_COUNT) as _}
							<div class="skeleton-post">
								<div class="skeleton-header">
									<div class="skeleton-title"></div>
								</div>
								<div class="skeleton-text">
									<div class="skeleton-line"></div>
									<div class="skeleton-line"></div>
									<div class="skeleton-line short"></div>
								</div>
								<div class="skeleton-metadata">
									<div class="skeleton-item"></div>
									<div class="skeleton-item"></div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					{#each posts as postData, i}
						{@const globalIndex = currentPage * SIDEBAR_POSTS_COUNT + i}
						{@const isSelected = getPostId(postData.post.uri) === postId}
						<PostSidebarItem
							{postData}
							index={globalIndex}
							{isSelected}
							onclick={selectPost}
						/>
					{/each}
				{/if}
			</div>
			<div class="pagination-controls">
				<button onclick={prevPage} disabled={!hasPrev}>Prev</button>
				{#if totalCount > 0}
					<span id="page-info">{currentPage + 1} / {totalPages}</span>
				{/if}
				<button onclick={nextPage} disabled={!hasNext}>Next</button>
			</div>
		</section>
	</div>
</div>

<FilterDialog
	show={showFilterDialog}
	{filters}
	onClose={handleFilterClose}
	onApply={handleFilterApply}
	onReset={handleFilterReset}
/>

<hr>
<Footer />

<style>
	.content {
		display: flex;
		flex-direction: column;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.sidebar-header h2 {
		margin: 0;
		line-height: 1;
	}

	.filter-button {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-secondary);
		border: none;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
		position: relative;
	}

	.filter-button i {
		color: var(--color-quinary);
		font-size: 13px;
	}

	.filter-indicator {
		position: absolute;
		top: -2px;
		right: -2px;
		background: var(--color-primary);
		color: white;
		border-radius: 50%;
		width: 14px;
		height: 14px;
		font-size: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pagination-controls {
		text-align: center;
		margin: 20px 0;
	}

	.skeleton-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.skeleton-post {
		border: 2px solid var(--color-quinary);
		border-radius: 15px;
		padding: 20px;
		height: 180px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background: var(--color-quaternary);
		position: relative;
		width: 100%;
		box-sizing: border-box;
	}

	.skeleton-post::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.3) 50%,
			transparent 100%
		);
		animation: shimmer 1.5s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.skeleton-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.skeleton-title {
		width: 100px;
		height: 24px;
		background: var(--color-secondary);
		border-radius: 4px;
		opacity: 0.5;
	}

	.skeleton-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 10px 0;
	}

	.skeleton-line {
		height: 14px;
		background: var(--color-secondary);
		border-radius: 4px;
		opacity: 0.5;
	}

	.skeleton-line.short {
		width: 60%;
	}

	.skeleton-metadata {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: auto;
	}

	.skeleton-item {
		width: 60px;
		height: 24px;
		background: var(--color-secondary);
		border-radius: 5px;
		opacity: 0.5;
	}

	.skeleton-main {
		padding: 20px;
		position: relative;
		width: 100%;
		box-sizing: border-box;
	}

	.skeleton-main::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.3) 50%,
			transparent 100%
		);
		animation: shimmer 1.5s infinite;
	}

	.skeleton-main-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
	}

	.skeleton-main-title {
		width: 150px;
		height: 32px;
		background: var(--color-secondary);
		border-radius: 4px;
		opacity: 0.5;
	}

	.skeleton-main-link {
		width: 200px;
		height: 16px;
		background: var(--color-secondary);
		border-radius: 4px;
		opacity: 0.5;
	}

	.skeleton-main-text {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin: 20px 0;
	}

	.skeleton-line-long {
		height: 18px;
		background: var(--color-secondary);
		border-radius: 4px;
		opacity: 0.5;
		width: 100%;
	}

	.skeleton-line-short {
		height: 18px;
		background: var(--color-secondary);
		border-radius: 4px;
		opacity: 0.5;
		width: 60%;
	}

	.skeleton-main-metadata {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 20px;
	}

	.skeleton-main-item {
		width: 80px;
		height: 28px;
		background: var(--color-secondary);
		border-radius: 5px;
		opacity: 0.5;
	}

	.pagination-controls button {
		background-color: var(--color-secondary);
		color: var(--color-quinary);
		border: none;
		border-radius: 10px;
		padding: 8px 16px;
		font-family: 'Courier New', monospace;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s ease-in-out;
	}

	.pagination-controls button:hover {
		transform: scale(1.05);
		background-color: var(--color-primary);
	}

	.pagination-controls button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	#page-info {
		color: var(--color-quinary);
		font-size: 12px;
	}

	.fab-trigger,
	.sidebar-backdrop {
		display: none;
	}

	@media (max-width: 1024px) {
		.fab-trigger {
			display: flex;
			align-items: center;
			gap: 10px;
			position: fixed;
			bottom: 20px;
			right: 20px;
			background: var(--color-primary);
			color: white;
			border: none;
			border-radius: 25px;
			padding: 12px 20px;
			font-family: inherit;
			font-weight: bold;
			box-shadow: 0 4px 12px rgba(0,0,0,0.4);
			z-index: 999;
			cursor: pointer;
		}

		.sidebar-backdrop {
			display: block;
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.6);
			z-index: 1000;
			backdrop-filter: blur(2px);
		}

		.posts-sidebar {
			position: fixed;
			top: 0;
			right: -100%;
			width: 85vw;
			max-width: 380px;
			height: 100dvh;
			margin: 0;
			border-radius: 20px 0 0 20px;
			z-index: 1001;
			transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			-webkit-overflow-scrolling: touch;
			overflow-y: auto;
		}

		.posts-sidebar.open {
			right: 0;
		}
	}
</style>
