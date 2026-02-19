<script>
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>My Silly Game</title>
	<link rel="canonical" href="https://fairfruit.tv/riderquest/">
</svelte:head>

<header>
	<img class="logo" src="/img/logo.png" alt="Fairfruit Logo">
	<h1>My Silly Game</h1>
	<hr>
	<div class="container">
		<nav>
			<ul id="navList">
				<li><a href="/"><i class="fa-solid fa-apple-whole"></i> Home</a></li>
			</ul>
		</nav>
		<ThemeToggle />
	</div>
</header>

<div class="container">
	<div class="game-content">
		<section>
			<h2>Riderquest</h2>
			<p>This was made in 48h for a <a href="https://github.com/mp-pinheiro/riderquest" target="_blank">game
					jam</a>. The theme was <a href="https://ldjam.com/events/ludum-dare/41/">Combine 2 Incompatible
					Genres</a>, so we did this Racing + JRPG meme.</p>
			<br>
			<section class="riderquest">
				<iframe class="game" src="/riderquest/game.html" frameborder="0" title="Riderquest"></iframe>
			</section>
		</section>
	</div>
</div>
<hr>
<Footer />
