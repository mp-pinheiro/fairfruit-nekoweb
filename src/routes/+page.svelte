<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { activeTab } from '$lib/stores/activeTab.js';
	import {
		fetchPosts,
		renderMainPost,
		BSKY_HANDLE,
		POSTS_PER_PAGE,
		SIDEBAR_POSTS_COUNT
	} from '$lib/features/bsky.js';

	let allPosts = $state([]);
	let currentPage = $state(0);
	let currentPostIndex = $state(0);
	let bskyLoading = $state(false);
	let bskyError = $state('');

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

	let filteredPosts = $derived.by(() => {
		let result = [...allPosts];

		if (filters.fromDate) {
			const fromDate = parseDateDMY(filters.fromDate);
			if (fromDate) {
				result = result.filter(item => {
					const postDate = new Date(item.post.record.createdAt);
					return postDate >= fromDate;
				});
			}
		}

		if (filters.toDate) {
			const toDate = parseDateDMY(filters.toDate);
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

	let contentEls = {};

	function registerContent(tab, el) {
		contentEls[tab] = el;
	}

	function animateContent(el, shouldShow) {
		if (shouldShow) {
			el.style.display = 'flex';
			el.style.visibility = 'visible';
			gsap.to(el, { opacity: 1, duration: 0.2, ease: 'power2.in' });
			gsap.fromTo(el, { scale: 1 }, { scale: 1.1, duration: 0.2, ease: 'power2.in', yoyo: true, repeat: 1 });
		} else {
			el.style.display = 'none';
			el.style.visibility = 'hidden';
			el.style.opacity = 0;
		}
	}

	function handleTabClick(tab) {
		activeTab.setTab(tab);
	}

	// 'posts_sidebar' is shown together with the 'posts' tab
	const tabMap = { posts_sidebar: 'posts' };

	$effect(() => {
		const tab = $activeTab;
		for (const [key, el] of Object.entries(contentEls)) {
			if (el) animateContent(el, (tabMap[key] ?? key) === tab);
		}
	});

	$effect(() => {
		filters.fromDate;
		filters.toDate;
		filters.sortOrder;
		currentPage = 0;
		currentPostIndex = 0;
	});

	function selectPost(index) {
		currentPostIndex = index;
		currentPage = Math.floor(index / SIDEBAR_POSTS_COUNT);
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

	function formatDate(isoString) {
		const date = new Date(isoString);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}

	onMount(async () => {
		activeTab.init();

		bskyLoading = true;
		try {
			const data = await fetchPosts(BSKY_HANDLE, null, POSTS_PER_PAGE);
			if (data.feed && data.feed.length > 0) {
				allPosts = data.feed.filter(item => !item.reason);
				currentPage = 0;
				currentPostIndex = 0;
			} else {
				bskyError = 'No posts found.';
			}
		} catch (e) {
			bskyError = `Failed to load posts: ${e.message}`;
		} finally {
			bskyLoading = false;
		}
	});
</script>

<svelte:head>
	<title>Welcome to Fairfruit</title>
	<link rel="canonical" href="https://fairfruit.tv/">
</svelte:head>

<Header title="Welcome to Fairfruit" />

<div class="container">
	<div class="main-content">
		<section
			data-content="me"
			class="content"
			bind:this={contentEls['me']}
		>
			<h2>About Me</h2>
			<section class="introduction">
				<p>Hi! I'm Fairfruit.</p>
				<br>
				<p>
					I make <button type="button" onclick={() => handleTabClick('games')} style="background: none; border: none; padding: 0; color: var(--color-primary); text-decoration: none; font: inherit; cursor: pointer;">games</button>,
					<button type="button" onclick={() => handleTabClick('projects')} style="background: none; border: none; padding: 0; color: var(--color-primary); text-decoration: none; font: inherit; cursor: pointer;">bad code</button>
					and <button type="button" onclick={() => handleTabClick('posts')} style="background: none; border: none; padding: 0; color: var(--color-primary); text-decoration: none; font: inherit; cursor: pointer;">dumb tweets</button>.
					You should play my games though, they're pretty cool.
				</p>
			</section>
		</section>

		<section
			data-content="games"
			class="content"
			bind:this={contentEls['games']}
		>
			<h2>Check Out My Games</h2>
			<p>
				I am very passionate about making games that evoke a feeling of "this is something I've never seen
				or played before".
			</p>
			<br>
			<p>So if you're into that kind of thing, you should definitely check out my games. </p>
			<br>
			<p>If not, you should
				still do it because <a href="https://store.steampowered.com/app/752600/Dual_Snake/">snek 🐍.</a></p>
			<div class="buttons-container">
				<div class="link-container">
					<a class="links links-red" href="https://store.steampowered.com/app/752600/Dual_Snake/" target="_blank">Dual Snake</a>
					<div class="iframe-popup dual-snake">
						<iframe src="https://store.steampowered.com/widget/752600/" frameborder="0" width="646" height="190" title="Steam store widget for Dual Snake"></iframe>
					</div>
				</div>

				<div class="link-container">
					<a class="links links-purple" href="https://store.steampowered.com/app/1397130/Primateria/" target="_blank">Primateria</a>
					<div class="iframe-popup primateria">
						<iframe src="https://store.steampowered.com/widget/1397130/" frameborder="0" width="646" height="190" title="Steam store widget for Primateria"></iframe>
					</div>
				</div>
			</div>
			<br>
			<h3>Jam Games</h3>
			<br>
			<p>Sometimes I participate in game jams! Here are some of the results:</p>
			<br>
			<div class="project">
				<div class="header">
					<div class="title">Riderquest</div>
					<div class="metadata"><div class="item">Ludum Dare 41</div></div>
				</div>
				<div class="text">
					<p>Made in 48h. Theme: "Combine 2 Incompatible Genres" — so we did a Racing + JRPG meme.</p>
				</div>
				<a class="link" href="/riderquest/">Play it here</a>
			</div>
			<div class="project">
				<div class="header">
					<div class="title">The Storm Always Comes</div>
					<div class="metadata"><div class="item">Pirate Jam 2025</div></div>
				</div>
				<div class="text">
					<p>Made in a couple of days with <a href="https://bsky.app/profile/pureishatsu.bsky.social/" target="_blank">Pureishatsu</a>. We picked a large jam that fit our schedules as an excuse to practice 3D. Theme: "You Are The Weapon": you're a war machine managing humanity's last survivors before the storm.</p>
				</div>
				<a class="link" href="https://fairfruit.itch.io/the-storm-always-comes" target="_blank">Play it on itch.io</a>
			</div>
		</section>

		<section
			data-content="projects"
			class="content"
			bind:this={contentEls['projects']}
		>
			<h2>Projects</h2>
			<div class="project">
				<div class="header">
					<div class="title">Nekoweb API Docs</div>
				</div>
				<div class="text">
					<p>An unofficial documentation for the Nekoweb API with code examples and usage.</p>
				</div>
				<a class="link" href="https://nekoapi.nekoweb.org" target="_blank">nekoapi.nekoweb.org</a>
			</div>
			<div class="project">
				<div class="header">
					<div class="title">Nekoweb Github Integration</div>
				</div>
				<div class="text">
					<p>A Github Action that integrates with Nekoweb and deploys your website with a single push to
						the main branch. Allows git integration for free users.</p>
				</div>
				<a class="link" href="https://github.com/mp-pinheiro/nekoweb-deploy" target="_blank">github.com/mp-pinheiro/nekoweb-deploy</a>
			</div>
			<div class="project">
				<div class="header">
					<div class="title">Yfrit Games</div>
				</div>
				<div class="text">
					<p>My indie game studio where I make <button type="button" onclick={() => handleTabClick('games')} style="background: none; border: none; padding: 0; color: var(--color-primary); text-decoration: none; font: inherit; cursor: pointer;">games</button> and stuff.</p>
				</div>
				<a class="link" href="https://yfrit.com" target="_blank">yfrit.com</a>
			</div>
			<div class="project" style="height: auto">
				<div class="header">
					<div class="title">FairFruit-Bot (Twitch Chat Plays)</div>
				</div>
				<div class="text">
					<p>A bot that can setup Twitch Chat Plays streams of many emulated games with a simple
						configuration file. It was used in<a href="https://www.youtube.com/watch?v=Gq2a1TrDIK8">
							Simply's stream</a> with 2k+ people and on a <a
							href="https://youtu.be/67ZoYjg0lvA?t=14424">Brawlhalla
							charity stream</a> with 60k+ people!
					</p>
					<br>
					<p>Here's a video of it in action:</p>
					<br>
					<iframe width="560" height="315" style="max-width: 100%; padding-bottom: 10px;"
						src="https://www.youtube-nocookie.com/embed/7gfgvar73L0?si=avbH3mQy6IRAO244"
						title="YouTube video player" frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowfullscreen>
					</iframe>
					<br>
					<a class="link" href="https://github.com/mp-pinheiro/FairFruit-Bot" target="_blank">
						github.com/mp-pinheiro/FairFruit-Bot</a>
				</div>
			</div>
			<div class="project">
				<div class="header">
					<div class="title">Github</div>
				</div>
				<div class="text">
					<p>My Github profile with a bunch of other silly projects and contributions, including <a
							href="https://github.com/mp-pinheiro/fairfruit-nekoweb">this website</a>.
					</p>
				</div>
				<a class="link" href="https://github.com/mp-pinheiro">github.com/mp-pinheiro</a>
			</div>
		</section>

		<section
			data-content="posts"
			class="content"
			bind:this={contentEls['posts']}
		>
			<div id="bsky-posts-feed">
				{#if bskyLoading}
					<div class="loading">Loading posts...</div>
				{:else if bskyError}
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
		bind:this={contentEls['posts_sidebar']}
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
				{#if bskyLoading}
					<div class="loading">Loading posts...</div>
				{:else if bskyError}
					<div class="error-message">{bskyError}</div>
				{:else}
					{#each sidebarPosts as postData, i}
						{@const globalIndex = currentPage * SIDEBAR_POSTS_COUNT + i}
						{@const post = postData.post}
						{@const record = post.record}
						{@const date = formatDate(record.createdAt)}
						{@const uri = post.uri}
						{@const postMatch = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/)}
						{@const postUrl = postMatch ? `https://bsky.app/profile/${BSKY_HANDLE}/post/${postMatch[1]}` : `https://bsky.app/profile/${BSKY_HANDLE}`}
						{@const text = record.text || ''}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="post"
							style="cursor: pointer; {globalIndex === currentPostIndex ? 'border: 2px solid var(--color-primary);' : ''}"
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
