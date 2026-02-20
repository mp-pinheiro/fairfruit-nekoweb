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
</style>
