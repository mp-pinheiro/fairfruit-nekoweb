# Fairfruit TV

Once my linkfree repository, now my nekoweb repository.

#

This is **very loosely speaking** a node project. Nodemon and a simple http server are used to serve the site locally and to provide a simple way to reload the page when the source files change.

You can do that by running `npm start` in the project root.

The actual site is a static site, built with `build.sh` and served from the `build` directory, which is created by the build script. Deployment is done via Github Actions, which runs the build script and then pushes the result to the `mains` branch, deploying the site to Nekoweb and Fairfruit TV.

# Credits

This was once based on the [Minimal Pastel](https://github.com/MichaelBarney/LinkFree/tree/master/Templates/Minimal%20Pastel) linkfree template, but so much has changed that I'm not sure what's left of it.
