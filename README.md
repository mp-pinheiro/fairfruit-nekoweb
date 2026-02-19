# Fairfruit TV

Once my linkfree repository, now my nekoweb repository.

#

This project uses Bun for local development. A lightweight static file server (`dev.ts`) serves the site locally .

To start the dev server, run `bun start` (or `bun dev.ts`) in the project root.

The actual site is a static site, built with `build.sh` and served from the `build` directory, which is created by the build script. Deployment is done via Github Actions, which runs the build script and then pushes the result to the `mains` branch, deploying the site to Nekoweb and Fairfruit TV.

# Credits

This was once based on the [Minimal Pastel](https://github.com/MichaelBarney/LinkFree/tree/master/Templates/Minimal%20Pastel) linkfree template, but so much has changed that I'm not sure what's left of it.
