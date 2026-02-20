<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import GameCard from '$lib/components/GameCard.svelte';
</script>

<svelte:head>
	<title>Games - Fairfruit</title>
	<link rel="canonical" href="https://fairfruit.tv/games">
</svelte:head>

<Header title="Welcome to Fairfruit" />

<div class="container">
	<div class="main-content">
		<section data-content="games" class="content">
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
				<GameCard title="Dual Snake" url="https://store.steampowered.com/app/752600/Dual_Snake/" colorClass="links-red" steamAppId="752600" />
				<GameCard title="Primateria" url="https://store.steampowered.com/app/1397130/Primateria/" colorClass="links-purple" steamAppId="1397130" />
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
	</div>
</div>

<hr>
<Footer />
