<script>
	import { theme } from '$lib/stores/theme.js';
</script>

<button class="modeSwitch" onclick={() => theme.toggle()} aria-label="Toggle theme">
	{#if $theme === 'dark'}
		<i class="fa-solid fa-sun"></i>
	{:else}
		<i class="fa-solid fa-moon"></i>
	{/if}
</button>

<style>
	.modeSwitch {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background-color: var(--color-quinary);
		color: var(--color-quaternary);
		cursor: pointer;
		transition: all 0.2s ease-in-out;
		align-self: center;
		border: none;
	}
</style>
