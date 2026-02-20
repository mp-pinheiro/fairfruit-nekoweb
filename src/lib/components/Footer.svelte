<footer>
	<div class="channels">
		<a class="channels_item" href="https://www.youtube.com/channel/UCGrIIgP90v2OmXK1ulpUX0g" target="_blank" aria-label="Fairfruit's YouTube channel"><i class="fa fa-youtube"></i></a>
		<a class="channels_item" href="https://twitch.tv/fairfruit" target="_blank" aria-label="Fairfruit's Twitch channel"><i class="fa fa-twitch"></i></a>
		<a class="channels_item" href="https://discord.gg/hcVr3kpE7K" target="_blank" aria-label="Fairfruit's Discord server"><i class="fa-brands fa-discord"></i></a>
		<a class="channels_item" href="https://fairfruit.yfrit.social" target="_blank" aria-label="Fairfruit's Bluesky profile"><i class="fa-brands fa-bluesky"></i></a>
		<a class="channels_item" href="https://github.com/mp-pinheiro/" target="_blank" aria-label="Fairfruit's GitHub profile"><i class="fa fa-github"></i></a>
	</div>
	<p>© 2024 Fairfruit. All rights reserved.</p>
	<br>
	<div class="external-links">
		<a href="https://nekoweb.org/"><img src="https://nekoweb.org/assets/buttons/button4.gif" alt="Nekoweb"></a>
		<a href="https://districts.nekoweb.org"><img src="/img/buttons/districts002.png" alt="Districts"></a>
		<a href="https://fairfruit.nekoweb.org"><img src="/img/buttons/button.png" alt="Fairfruit"></a>
	</div>
</footer>

<style>
	.channels {
		display: flex;
		justify-content: center;
		gap: 10px;
		max-width: 400px;
		margin: 20px auto;
	}

	.channels_item {
		transition: transform 0.2s;
		color: var(--color-primary);
	}

	.channels_item:hover {
		transform: scale(1.1) rotate(360deg);
		transition: transform 0.5s;
	}

	.external-links {
		display: flex;
		justify-content: center;
		gap: 10px;
		padding-bottom: 20px;
	}

	@media (max-width: 768px) {
		.channels {
			flex-direction: row;
			justify-content: center;
			gap: 5px;
		}

		.external-links {
			flex-wrap: wrap;
			padding: 0 10px 20px 10px;
		}

		.channels_item {
			padding: 10px;
			font-size: 1.2rem;
		}
	}
</style>
