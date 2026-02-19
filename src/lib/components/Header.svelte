<script>
	import Navigation from './Navigation.svelte';

	let { title = 'Welcome to Fairfruit', showNav = true } = $props();
</script>

<header>
	<img class="logo" src="/img/logo.png" alt="Fairfruit Logo">
	<h1>{title}</h1>
	<hr>
	{#if showNav}
		<Navigation />
	{/if}
</header>
