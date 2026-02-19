<script>
	import { activeTab } from '$lib/stores/activeTab.js';
	import ThemeToggle from './ThemeToggle.svelte';

	const tabs = [
		{ id: 'me', label: 'Me', icon: 'fa-solid fa-apple-whole' },
		{ id: 'games', label: 'Games', icon: 'fa-solid fa-gamepad' },
		{ id: 'projects', label: 'Projects', icon: 'fa-solid fa-tablet' },
		{ id: 'posts', label: 'Posts', icon: 'fa-solid fa-comments' }
	];
</script>

<div class="container">
	<nav>
		<ul id="navList">
			{#each tabs as tab}
				<li>
					<a
						href="#"
						class:active={$activeTab === tab.id}
						onclick={(e) => { e.preventDefault(); activeTab.setTab(tab.id); }}
					>
						<i class={tab.icon}></i> {tab.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
	<ThemeToggle />
</div>
