<script>
	import { page } from '$app/stores';
	import ThemeToggle from './ThemeToggle.svelte';

	const tabs = [
		{ id: 'me', label: 'Me', icon: 'fa-solid fa-apple-whole', href: '/me' },
		{ id: 'games', label: 'Games', icon: 'fa-solid fa-gamepad', href: '/games' },
		{ id: 'projects', label: 'Projects', icon: 'fa-solid fa-tablet', href: '/projects' },
		{ id: 'posts', label: 'Posts', icon: 'fa-solid fa-comments', href: '/posts' }
	];

	function getHref(tab, url) {
		if (tab.id === 'posts' && url.pathname.startsWith('/posts')) {
			return url.pathname + url.search;
		}
		return tab.href;
	}

	function isActive(tab, url) {
		if (tab.id === 'posts') return url.pathname.startsWith('/posts');
		return url.pathname === tab.href || url.pathname === tab.href + '/';
	}
</script>

<div class="container">
	<nav>
		<ul id="navList">
			{#each tabs as tab}
				<li>
					<a
						href={getHref(tab, $page.url)}
						class:active={isActive(tab, $page.url)}
						data-sveltekit-preload-data="hover"
					>
						<i class={tab.icon}></i> {tab.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
	<ThemeToggle />
</div>

<style>
	nav {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10px;
	}

	nav ul {
		display: flex;
		flex-direction: row wrap;
		justify-content: space-evenly;
		gap: 0 2rem;
		padding: 8px;
		align-items: center;
		background-color: var(--color-secondary);
		list-style: none;
		border-radius: 10px;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
	}

	nav ul li {
		font-size: 1.2rem;
		transition: all 0.2s ease-in-out;
	}

	nav ul li:hover {
		transform: scale(1.1);
		transition: all 0.5s;
	}

	nav ul li a {
		text-decoration: none;
		color: var(--color-primary);
	}

	nav ul li a.active {
		font-weight: bold;
		text-shadow: -1px -1px 0 var(--color-tertiary), 1px 1px 0 var(--color-tertiary), 1px -1px 0 var(--color-tertiary), -1px 1px 0 var(--color-tertiary);
		text-decoration: underline;
	}

	@media (max-width: 768px) {
		nav ul {
			flex-wrap: wrap;
			gap: 10px;
			padding: 10px;
			justify-content: center;
		}

		nav ul li {
			font-size: 1rem;
			padding: 5px;
		}
	}
</style>
