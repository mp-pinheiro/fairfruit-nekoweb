import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createThemeStore() {
	const { subscribe, set } = writable('light');

	return {
		subscribe,
		init() {
			if (!browser) return;
			const saved = localStorage.getItem('theme') || 'light';
			set(saved);
			document.documentElement.setAttribute('data-theme', saved);
		},
		toggle() {
			if (!browser) return;
			const current = localStorage.getItem('theme') || 'light';
			const next = current === 'dark' ? 'light' : 'dark';
			localStorage.setItem('theme', next);
			set(next);
			document.documentElement.setAttribute('data-theme', next);
		}
	};
}

export const theme = createThemeStore();
