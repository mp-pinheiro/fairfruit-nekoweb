<script>
	import { theme } from '$lib/stores/theme.js';
</script>

<button class="modeSwitch" onclick={() => theme.toggle()}>
	{#if $theme === 'dark'}
		<i class="fa-solid fa-sun"></i>
	{:else}
		<i class="fa-solid fa-moon"></i>
	{/if}
</button>
