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

	const initialPosts = data.allPosts || [];
	const initialPage = data.currentPage - 1;
	const initialError = data.error || '';
	const initialFilters = data.filters || { fromDate: '', toDate: '', sortOrder: 'newest' };

	let allPosts = $state(initialPosts);
	let currentPage = $state(initialPage);
	let currentPostIndex = $state(0);
	let bskyError = $state(initialError);

	let filters = $state({
		fromDate: initialFilters.fromDate,
		toDate: initialFilters.toDate,
		sortOrder: initialFilters.sortOrder
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
			goto(`/posts/post/${match[1]}`);
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

	function resetFilters() {
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
		tempFilters.fromDate = filters.fromDate;
		tempFilters.toDate = filters.toDate;
		tempFilters.sortOrder = filters.sortOrder;
		showFilterDialog = true;
	}

	function applyFilters() {
		filters.fromDate = tempFilters.fromDate;
		filters.toDate = tempFilters.toDate;
		filters.sortOrder = tempFilters.sortOrder;
		showFilterDialog = false;
		updateUrl();
	}

	function updateUrl() {
		const params = new URLSearchParams();
		if (filters.fromDate) params.set('from', filters.fromDate);
		if (filters.toDate) params.set('to', filters.toDate);
		if (filters.sortOrder !== 'newest') params.set('sort', filters.sortOrder);
		const queryString = params.toString();
		goto(queryString ? `/posts?${queryString}` : '/posts', { keepFocus: true });
	}

	function handleDateInput(event, field) {
		let input = event.target;
		let value = input.value.replace(/\D/g, '');

		if (value.length > 8) {
			value = value.slice(0, 8);
		}

		if (value.length >= 2) {
			const day = parseInt(value.slice(0, 2), 10);
			if (day > 31) value = '31' + value.slice(2);
		}
		if (value.length >= 4) {
			const month = parseInt(value.slice(2, 4), 10);
			if (month > 12) value = value.slice(0, 2) + '12' + value.slice(4);
		}
		if (value.length >= 6) {
			const year = parseInt(value.slice(4, 8), 10);
			if (year > 9999) value = value.slice(0, 4) + '9999';
		}

		let formatted = '';
		if (value.length > 0) {
			formatted = value.slice(0, 2);
			if (value.length >= 4) {
				formatted += '/' + value.slice(2, 4);
			}
			if (value.length >= 6) {
				formatted += '/' + value.slice(4, 8);
			}
		}

		tempFilters[field] = formatted;
		input.value = formatted;
	}

	function parseDateDMY(dmyString) {
		if (!dmyString || dmyString.length !== 10) return null;
		const parts = dmyString.split('/');
		if (parts.length !== 3) return null;
		const [dayStr, monthStr, yearStr] = parts;
		if (dayStr.length !== 2 || monthStr.length !== 2 || yearStr.length !== 4) return null;

		const day = parseInt(dayStr, 10);
		const month = parseInt(monthStr, 10);
		const year = parseInt(yearStr, 10);

		if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
		if (day < 1 || day > 31) return null;
		if (month < 1 || month > 12) return null;
		if (year < 1900 || year > 9999) return null;

		const date = new Date(year, month - 1, day);
		if (date.getDate() !== day) return null;
		return date;
	}

	function parseDateISO(isoString) {
		if (!isoString || isoString.length !== 10) return null;
		const parts = isoString.split('-');
		if (parts.length !== 3) return null;
		const [yearStr, monthStr, dayStr] = parts;
		if (yearStr.length !== 4 || monthStr.length !== 2 || dayStr.length !== 2) return null;

		const year = parseInt(yearStr, 10);
		const month = parseInt(monthStr, 10);
		const day = parseInt(dayStr, 10);

		if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
		if (day < 1 || day > 31) return null;
		if (month < 1 || month > 12) return null;
		if (year < 1900 || year > 9999) return null;

		const date = new Date(year, month - 1, day);
		if (date.getDate() !== day) return null;
		return date;
	}

	function formatDate(isoString) {
		const date = new Date(isoString);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}

	function formatDisplayDate(isoString) {
		if (!isoString) return '';
		const date = parseDateISO(isoString);
		if (!date) return isoString;
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
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
				{:else if selectedPost?.post}
					{@html renderMainPost(selectedPost)}
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
				<button
					type="button"
					class="filter-button"
					onclick={() => openFilterDialog()}
					style="background: var(--color-secondary); border: none; border-radius: 8px; padding: 6px 12px; cursor: pointer; font-family: 'Courier New', monospace; font-size: 12px; color: var(--color-quinary); transition: all 0.2s ease-in-out;"
				>
					Filter
					{#if hasActiveFilters()}
						<span style="background: var(--color-primary); color: white; border-radius: 50%; width: 16px; height: 16px; font-size: 10px; display: inline-flex; align-items: center; justify-content: center; margin-left: 4px;">!</span>
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
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="post"
							style="cursor: pointer;"
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
				{#if filteredPosts.length > 0}
					<span id="page-info">{currentPage + 1} / {totalPages}</span>
				{/if}
				<button onclick={nextPage} disabled={!hasNext} style="margin-left: 10px;">Next</button>
			</div>
			{#if hasActiveFilters()}
				<div style="text-align: center; font-size: 11px; color: var(--color-primary); margin-top: 10px;">
					Showing {filteredPosts.length} of {allPosts.length} posts
				</div>
			{/if}
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
				<input id="from-date" type="text" placeholder="dd/mm/yyyy" value={tempFilters.fromDate} oninput={(e) => handleDateInput(e, 'fromDate')} style="width: 100%; padding: 8px 12px; border: 1px solid var(--color-primary); border-radius: 8px; background: var(--color-quaternary); color: var(--color-quinary); font-family: 'Courier New', monospace;" />
			</div>

			<div style="margin-bottom: 16px;">
				<label for="to-date" style="display: block; margin-bottom: 6px; font-size: 14px; color: var(--color-quinary);">To Date</label>
				<input id="to-date" type="text" placeholder="dd/mm/yyyy" value={tempFilters.toDate} oninput={(e) => handleDateInput(e, 'toDate')} style="width: 100%; padding: 8px 12px; border: 1px solid var(--color-primary); border-radius: 8px; background: var(--color-quaternary); color: var(--color-quinary); font-family: 'Courier New', monospace;" />
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
