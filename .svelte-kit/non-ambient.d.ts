
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/riderquest";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/riderquest": Record<string, never>
		};
		Pathname(): "/" | "/riderquest/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/CNAME" | "/img/bg.png" | "/img/buttons/button.png" | "/img/buttons/districts002.png" | "/img/icon.png" | "/img/logo.png" | "/img/sitebox-fg.png" | "/riderquest/Build/UnityLoader.js" | "/riderquest/Build/web.data.unityweb" | "/riderquest/Build/web.json" | "/riderquest/Build/web.wasm.code.unityweb" | "/riderquest/Build/web.wasm.framework.unityweb" | "/riderquest/game.html" | "/robots.txt" | "/sitemap.xml" | string & {};
	}
}