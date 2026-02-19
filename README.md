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

The site is deployed to [Nekoweb](https://nekoweb.org) via GitHub Actions on push to `main`.

## Credits

This was once based on the [Minimal Pastel](https://github.com/MichaelBarney/LinkFree/tree/master/Templates/Minimal%20Pastel) linkfree template, but so much has changed that I'm not sure what's left of it.
