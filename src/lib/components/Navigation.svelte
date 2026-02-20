<script>
	import { page } from '$app/stores';
	import ThemeToggle from './ThemeToggle.svelte';

	const tabs = [
		{ id: 'me', label: 'Me', icon: 'fa-solid fa-apple-whole', href: '/me' },
		{ id: 'games', label: 'Games', icon: 'fa-solid fa-gamepad', href: '/games' },
		{ id: 'projects', label: 'Projects', icon: 'fa-solid fa-tablet', href: '/projects' },
		{ id: 'posts', label: 'Posts', icon: 'fa-solid fa-comments', href: '/posts' }
	];

	$: currentPath = $page.url.pathname;
	$: isActive = (href) => {
		if (href === '/posts') {
			return currentPath.startsWith('/posts');
		}
		return currentPath === href;
	};
</script>

<div class="container">
	<nav>
		<ul id="navList">
			{#each tabs as tab}
				<li>
					<a
						href={tab.href}
						class:active={isActive(tab.href)}
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
