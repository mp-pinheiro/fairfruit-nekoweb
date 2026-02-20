<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Welcome to Fairfruit</title>
	<link rel="canonical" href="https://fairfruit.tv/me">
</svelte:head>

<Header title="Welcome to Fairfruit" />

<div class="container">
	<div class="main-content">
		<section data-content="me" class="content">
			<h2>About Me</h2>
			<section class="introduction">
				<p>Hi! I'm Fairfruit.</p>
				<br>
				<p>
					I make <a href="/games">games</a>,
					<a href="/projects">bad code</a>
					and <a href="/posts">dumb tweets</a>.
					You should play my games though, they're pretty cool.
				</p>
			</section>
		</section>
	</div>
</div>

<hr>
<Footer />
