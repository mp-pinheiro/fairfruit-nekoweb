import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createActiveTabStore() {
	const { subscribe, set } = writable('me');

	return {
		subscribe,
		init() {
			if (!browser) return;
			const saved = localStorage.getItem('activeLink') || 'me';
			set(saved);
		},
		setTab(tab) {
			set(tab);
			if (browser) {
				localStorage.setItem('activeLink', tab);
			}
		}
	};
}

export const activeTab = createActiveTabStore();
