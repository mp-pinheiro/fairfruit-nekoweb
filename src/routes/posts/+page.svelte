<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import PostMain from '$lib/components/post/PostMain.svelte';
	import PostSidebarItem from '$lib/components/post/PostSidebarItem.svelte';
	import FilterDialog from '$lib/components/FilterDialog.svelte';
	import { SIDEBAR_POSTS_COUNT } from '$lib/features/bsky.js';
	import {
		parseDateISO,
		formatDisplayDate,
		convertToISO
	} from '$lib/features/postFilters.js';

	let { data } = $props();

	let allPosts = $state(data.allPosts ?? []);
	let currentPage = $state((data.currentPage ?? 1) - 1);
	let currentPostIndex = $state(0);
	let bskyError = $state(data.error ?? '');

	let filters = $state({
		fromDate: data.filters?.fromDate ?? '',
		toDate: data.filters?.toDate ?? '',
		sortOrder: data.filters?.sortOrder ?? 'newest'
	});

	let tempFilters = $state({
		fromDate: '',
		toDate: '',
		sortOrder: 'newest'
	});

	let showFilterDialog = $state(false);

	let filteredPosts = $derived.by(() => {
		let result = [...allPosts];

		if (filters.fromDate) {
			const fromDate = parseDateISO(filters.fromDate);
			if (fromDate) {
				result = result.filter(item => {
					const postDate = new Date(item.post.record.createdAt);
					return postDate >= fromDate;
				});
			}
		}

		if (filters.toDate) {
			const toDate = parseDateISO(filters.toDate);
			if (toDate) {
				toDate.setHours(23, 59, 59);
				result = result.filter(item => {
					const postDate = new Date(item.post.record.createdAt);
					return postDate <= toDate;
				});
			}
		}

		result.sort((a, b) => {
			const dateA = new Date(a.post.record.createdAt);
			const dateB = new Date(b.post.record.createdAt);
			return filters.sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
		});

		return result;
	});

	let sidebarPosts = $derived.by(() =>
		filteredPosts.slice(currentPage * SIDEBAR_POSTS_COUNT, (currentPage + 1) * SIDEBAR_POSTS_COUNT)
	);

	let totalPages = $derived.by(() => Math.ceil(filteredPosts.length / SIDEBAR_POSTS_COUNT));
	let hasPrev = $derived.by(() => currentPage > 0);
	let hasNext = $derived.by(() => (currentPage + 1) * SIDEBAR_POSTS_COUNT < filteredPosts.length);
	let selectedPost = $derived.by(() => {
		if (currentPostIndex >= filteredPosts.length) return null;
		return filteredPosts[currentPostIndex] ?? null;
	});

	$effect(() => {
		filters.fromDate;
		filters.toDate;
		filters.sortOrder;
		currentPage = 0;
		currentPostIndex = 0;
	});

	function selectPost(index) {
		const post = filteredPosts[index];
		if (!post) return;
		const uri = post.post.uri;
		const match = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/);
		if (match) {
			const params = new URLSearchParams();
			if (filters.fromDate) params.set('from', filters.fromDate);
			if (filters.toDate) params.set('to', filters.toDate);
			if (filters.sortOrder !== 'newest') params.set('sort', filters.sortOrder);
			const queryString = params.toString();
			goto(queryString ? `/posts/post/${match[1]}?${queryString}` : `/posts/post/${match[1]}`);
		}
	}

	function prevPage() {
		if (hasPrev) currentPage--;
	}

	function nextPage() {
		if (hasNext) currentPage++;
	}

	function hasActiveFilters() {
		return filters.fromDate !== '' || filters.toDate !== '' || filters.sortOrder !== 'newest';
	}

	function handleFilterReset() {
		tempFilters.fromDate = '';
		tempFilters.toDate = '';
		tempFilters.sortOrder = 'newest';
		filters.fromDate = '';
		filters.toDate = '';
		filters.sortOrder = 'newest';
		showFilterDialog = false;
		updateUrl();
	}

	function openFilterDialog() {
		tempFilters.fromDate = filters.fromDate ? formatDisplayDate(filters.fromDate) : '';
		tempFilters.toDate = filters.toDate ? formatDisplayDate(filters.toDate) : '';
		tempFilters.sortOrder = filters.sortOrder;
		showFilterDialog = true;
	}

	function handleFilterApply(newFilters) {
		filters.fromDate = newFilters.fromDate ? convertToISO(newFilters.fromDate) : '';
		filters.toDate = newFilters.toDate ? convertToISO(newFilters.toDate) : '';
		filters.sortOrder = newFilters.sortOrder;
		showFilterDialog = false;
		updateUrl();
	}

	function handleFilterClose() {
		showFilterDialog = false;
	}

	function updateUrl() {
		const params = new URLSearchParams();
		if (filters.fromDate) params.set('from', filters.fromDate);
		if (filters.toDate) params.set('to', filters.toDate);
		if (filters.sortOrder !== 'newest') params.set('sort', filters.sortOrder);
		const queryString = params.toString();
		goto(queryString ? `/posts?${queryString}` : '/posts', { keepFocus: true });
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
	<title>Posts - Fairfruit</title>
	<link rel="canonical" href="https://fairfruit.tv/posts">
</svelte:head>

<Header title="Welcome to Fairfruit" />

<div class="container">
	<div class="main-content">
		<section data-content="posts" class="content">
			<div id="bsky-posts-feed">
				{#if bskyError}
					<div class="error-message">{bskyError}</div>
				{:else if selectedPost}
					<PostMain postData={selectedPost} />
				{/if}
			</div>
		</section>
	</div>

	<div data-content="posts" class="main-content posts-sidebar content">
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
				{:else}
					{#each sidebarPosts as postData, i}
						{@const globalIndex = currentPage * SIDEBAR_POSTS_COUNT + i}
						<PostSidebarItem
							{postData}
							index={globalIndex}
							onclick={selectPost}
						/>
					{/each}
				{/if}
			</div>
			<div class="pagination-controls">
				<button onclick={prevPage} disabled={!hasPrev}>Prev</button>
				{#if filteredPosts.length > 0}
					<span id="page-info">{currentPage + 1} / {totalPages}</span>
				{/if}
				<button onclick={nextPage} disabled={!hasNext}>Next</button>
				{#if hasActiveFilters()}
					<div class="filter-info">
						Showing {filteredPosts.length} of {allPosts.length} posts
					</div>
				{/if}
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

	.filter-info {
		text-align: center;
		font-size: 11px;
		color: var(--color-primary);
		margin-top: 10px;
	}
</style>
