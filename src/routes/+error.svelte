<script>
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>404 - Fairfruit</title>
</svelte:head>

<Header title="Welcome to Fairfruit" showNav={false} />

<div class="container">
	<div class="main-content">
		<section class="content error">
			<h2>Oops!</h2>
			<br>
			<p>{$page.status}: {$page.error?.message ?? 'Page not found'}</p>
			<br>
			<p><a href="/">Go back home</a></p>
		</section>
	</div>
</div>

<hr>
<Footer />

<style>
	.content.error {
		display: flex;
	}
</style>
