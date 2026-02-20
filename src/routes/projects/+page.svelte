<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Projects - Fairfruit</title>
	<link rel="canonical" href="https://fairfruit.tv/projects">
</svelte:head>

<Header title="Welcome to Fairfruit" />

<div class="container">
	<div class="main-content">
		<section data-content="projects" class="content">
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
					<p>My indie game studio where I make <a href="/games">games</a> and stuff.</p>
				</div>
				<a class="link" href="https://yfrit.com" target="_blank">yfrit.com</a>
			</div>
			<div class="project expanded">
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
					<iframe width="560" height="315" class="youtube-embed"
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
	</div>
</div>

<hr>
<Footer />

<style>
	.project {
		border: 2px solid var(--color-quinary);
		border-radius: 15px;
		padding: 20px;
		margin: 10px 0;
		height: 180px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		background-color: var(--color-quaternary);
	}

	.project.expanded {
		height: auto;
	}

	.project .title {
		font-size: 20px;
		font-weight: bold;
	}

	.project .text {
		font-size: 14px;
		margin: 10px 0;
		flex: 1;
		overflow: hidden;
	}

	.project .header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.youtube-embed {
		max-width: 100%;
		padding-bottom: 10px;
	}
</style>
