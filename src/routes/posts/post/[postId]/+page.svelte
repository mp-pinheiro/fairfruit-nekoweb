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
	import {
		formatDisplayDate,
		convertToISO,
		handleDateInput
	} from '$lib/features/postFilters.js';

	let { data } = $props();

	let allPosts = $state([]);
	let selectedPost = $state(null);
	let currentPage = $state(0);
	let currentPostIndex = $state(0);
	let bskyError = $state('');
	let postId = $state('');

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

	$effect(() => {
		allPosts = data.allPosts || [];
		selectedPost = data.selectedPost;
		currentPage = data.currentPage || 0;
		currentPostIndex = data.postIndex || 0;
		bskyError = data.error || '';
		postId = data.postId || '';
		if (data.filters) {
			filters.fromDate = data.filters.fromDate;
			filters.toDate = data.filters.toDate;
			filters.sortOrder = data.filters.sortOrder;
		}
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

	function hasActiveFilters() {
		return filters.fromDate !== '' || filters.toDate !== '' || filters.sortOrder !== 'newest';
	}

	function openFilterDialog() {
		tempFilters.fromDate = filters.fromDate ? formatDisplayDate(filters.fromDate) : '';
		tempFilters.toDate = filters.toDate ? formatDisplayDate(filters.toDate) : '';
		tempFilters.sortOrder = filters.sortOrder;
		showFilterDialog = true;
	}

	function resetFilters() {
		tempFilters.fromDate = '';
		tempFilters.toDate = '';
		tempFilters.sortOrder = 'newest';
		filters.fromDate = '';
		filters.toDate = '';
		filters.sortOrder = 'newest';
		showFilterDialog = false;
	}

	function applyFilters() {
		filters.fromDate = tempFilters.fromDate ? convertToISO(tempFilters.fromDate) : '';
		filters.toDate = tempFilters.toDate ? convertToISO(tempFilters.toDate) : '';
		filters.sortOrder = tempFilters.sortOrder;
		showFilterDialog = false;

		const params = new URLSearchParams();
		if (filters.fromDate) params.set('from', filters.fromDate);
		if (filters.toDate) params.set('to', filters.toDate);
		if (filters.sortOrder !== 'newest') params.set('sort', filters.sortOrder);
		goto(params.toString() ? `/posts?${params.toString()}` : '/posts');
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
				<h2 style="margin: 0; line-height: 1;">Posts</h2>
				<button
					type="button"
					class="filter-button"
					onclick={() => openFilterDialog()}
					style="display: flex; justify-content: center; align-items: center; width: 32px; height: 32px; border-radius: 50%; background: var(--color-secondary); border: none; cursor: pointer; transition: all 0.2s ease-in-out; position: relative;"
				>
					<i class="fa-solid fa-filter" style="color: var(--color-quinary); font-size: 13px;"></i>
					{#if hasActiveFilters()}
						<span style="position: absolute; top: -2px; right: -2px; background: var(--color-primary); color: white; border-radius: 50%; width: 14px; height: 14px; font-size: 9px; display: flex; align-items: center; justify-content: center;">!</span>
					{/if}
				</button>
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

{#if showFilterDialog}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="filter-dialog-overlay"
		onclick={(e) => { if (e.target === e.currentTarget) showFilterDialog = false; }}
		style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 1000; display: flex; align-items: center; justify-content: center;"
	>
		<div class="filter-dialog" style="background: var(--color-tertiary); border: 2px solid var(--color-primary); border-radius: 15px; padding: 24px; width: 320px; max-width: 90vw; box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);">
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
				<h3 style="color: var(--color-primary); margin: 0;">Filter Posts</h3>
				<button type="button" onclick={() => showFilterDialog = false} style="background: none; border: none; color: var(--color-quinary); font-size: 20px; cursor: pointer; padding: 0;">&times;</button>
			</div>

			<div style="margin-bottom: 16px;">
				<label for="from-date" style="display: block; margin-bottom: 6px; font-size: 14px; color: var(--color-quinary);">From Date</label>
				<input id="from-date" type="text" placeholder="dd/mm/yyyy" value={tempFilters.fromDate} oninput={(e) => handleDateInput(e, 'fromDate', tempFilters)} style="width: 100%; padding: 8px 12px; border: 1px solid var(--color-primary); border-radius: 8px; background: var(--color-quaternary); color: var(--color-quinary); font-family: 'Courier New', monospace;" />
			</div>

			<div style="margin-bottom: 16px;">
				<label for="to-date" style="display: block; margin-bottom: 6px; font-size: 14px; color: var(--color-quinary);">To Date</label>
				<input id="to-date" type="text" placeholder="dd/mm/yyyy" value={tempFilters.toDate} oninput={(e) => handleDateInput(e, 'toDate', tempFilters)} style="width: 100%; padding: 8px 12px; border: 1px solid var(--color-primary); border-radius: 8px; background: var(--color-quaternary); color: var(--color-quinary); font-family: 'Courier New', monospace;" />
			</div>

			<div style="margin-bottom: 20px;">
				<label for="sort-order" style="display: block; margin-bottom: 6px; font-size: 14px; color: var(--color-quinary);">Sort By</label>
				<select id="sort-order" bind:value={tempFilters.sortOrder} style="width: 100%; padding: 8px 12px; border: 1px solid var(--color-primary); border-radius: 8px; background: var(--color-quaternary); color: var(--color-quinary); font-family: 'Courier New', monospace;">
					<option value="newest">Newest First</option>
					<option value="oldest">Oldest First</option>
				</select>
			</div>

			<div style="display: flex; gap: 10px; justify-content: flex-end;">
				<button type="button" onclick={resetFilters} style="background: none; border: 1px solid var(--color-quinary); border-radius: 8px; padding: 8px 16px; cursor: pointer; font-family: 'Courier New', monospace; font-size: 12px; color: var(--color-quinary);">Reset</button>
				<button type="button" onclick={applyFilters} style="background: var(--color-primary); border: none; border-radius: 8px; padding: 8px 16px; cursor: pointer; font-family: 'Courier New', monospace; font-size: 12px; color: white;">Apply</button>
			</div>
		</div>
	</div>
{/if}

<hr>
<Footer />
