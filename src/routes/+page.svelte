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

	let sidebarPosts = $derived(
		allPosts.slice(currentPage * SIDEBAR_POSTS_COUNT, (currentPage + 1) * SIDEBAR_POSTS_COUNT)
	);
	let totalPages = $derived(Math.ceil(allPosts.length / SIDEBAR_POSTS_COUNT));
	let hasPrev = $derived(currentPage > 0);
	let hasNext = $derived((currentPage + 1) * SIDEBAR_POSTS_COUNT < allPosts.length);
	let selectedPost = $derived(allPosts[currentPostIndex] ?? null);

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
				{:else if selectedPost}
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
		<section class="content" style="display: flex;">
			<h2>Posts</h2>
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
						{@const date = new Date(record.createdAt).toISOString().split('T')[0]}
						{@const uri = post.uri}
						{@const postMatch = uri.match(/app\.bsky\.feed\.post\/([a-z0-9]+)/)}
						{@const postUrl = postMatch ? `https://bsky.app/profile/${BSKY_HANDLE}/post/${postMatch[1]}` : `https://bsky.app/profile/${BSKY_HANDLE}`}
						{@const text = record.text || ''}
						{@const truncated = text.length > 150 ? text.substring(0, 150) + '...' : text}
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
								<p>{truncated}</p>
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
