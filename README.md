# Fairfruit TV

Once my linkfree repository, now my nekoweb repository.

## Development

This project uses [SvelteKit](https://kit.svelte.dev/) with [adapter-static](https://github.com/sveltejs/kit/tree/main/packages/adapter-static) for static site generation, and [Bun](https://bun.sh/) as the runtime and package manager.

```bash
bun install      # install dependencies
bun run dev      # start dev server
bun run build    # build static site to build/
bun run preview  # preview built site
```

## Posts

The first usable page renders after its Bluesky batch arrives. The remaining archive loads in the background, and pagination shows `loading...` until the page total is known. Pages, filters and individual-post links share the same five-minute author-feed cache.

Date filters include both boundary days. Latest retains newest-first order, and Top retains its existing oldest-first order. The sidebar has five posts per page and excludes reposts. The archive retains its existing limit of 750 raw feed entries.

```bash
bun test
bun run check
```

## Publishing

The site is published at [fairfruit.tv](https://fairfruit.tv) and [Nekoweb](https://fairfruit.nekoweb.org).

## Credits

This was once based on the [Minimal Pastel](https://github.com/MichaelBarney/LinkFree/tree/master/Templates/Minimal%20Pastel) linkfree template, but so much has changed that I'm not sure what's left of it.
