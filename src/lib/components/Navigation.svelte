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
					<button
						type="button"
						class:active={$activeTab === tab.id}
						onclick={() => activeTab.setTab(tab.id)}
						style="background: none; border: none; padding: 0; color: inherit; text-decoration: none; font: inherit; cursor: pointer;"
					>
						<i class={tab.icon}></i> {tab.label}
					</button>
				</li>
			{/each}
		</ul>
	</nav>
	<ThemeToggle />
</div>
