<script>
	let { title = '', url = '', colorClass = 'links-red', steamAppId = '' } = $props();
	let widgetUrl = $derived(`https://store.steampowered.com/widget/${steamAppId}/`);
</script>

<div class="link-container">
	<a class="links {colorClass}" href={url} target="_blank">{title}</a>
	<div class="iframe-popup">
		<iframe src={widgetUrl} frameborder="0" width="646" height="190" title="Steam store widget for {title}"></iframe>
	</div>
</div>

<style>
	iframe {
		border: none;
	}

	.link-container {
		position: relative;
		display: inline-block;
		margin: 0 auto;
	}

	.links {
		display: block;
		margin: 10px auto;
		padding: 15px 20px;
		max-width: 400px;
		font-size: 0.95rem;
		color: black;
		text-decoration: none;
		border-radius: 10px;
		transition: all 0.2s ease-in-out;
		text-align: center;
	}

	.links:hover {
		animation: shake 0.5s infinite;
	}

	.links-red {
		background-color: #ffa093;
	}

	.links-purple {
		background-color: #b39ddb;
	}

	.links-green {
		background-color: #73e2a7;
	}

	.links-yellow {
		background-color: #ffc15e;
	}

	.iframe-popup {
		visibility: hidden;
		position: absolute;
		width: 646px;
		height: 190px;
		z-index: 1;
		opacity: 0;
		transition: visibility 0s, opacity 0.5s linear;
		transition-delay: 0s, 0s;
	}

	.link-container:hover .iframe-popup,
	.iframe-popup:hover {
		visibility: visible;
		opacity: 1;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}

		10%,
		30%,
		50%,
		70% {
			transform: translateX(-1px);
		}

		20%,
		40%,
		60% {
			transform: translateX(1px);
		}

		80% {
			transform: translateX(8px);
		}

		90% {
			transform: translateX(-8px);
		}
	}

	@media (max-width: 768px) {
		.links {
			padding: 10px 20px;
			max-width: 100%;
		}
	}

	@media (max-width: 1024px) {
		.iframe-popup {
			position: static;
			visibility: visible;
			opacity: 1;
			width: 100%;
			height: auto;
			aspect-ratio: 646 / 190;
			margin-top: 15px;
		}

		.iframe-popup iframe {
			width: 100%;
			height: 100%;
		}
	}
</style>
