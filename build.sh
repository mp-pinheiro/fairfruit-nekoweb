#!/bin/bash
mkdir -p build
cp -r ./css ./build
cp -r ./js ./build
cp -r ./img ./build
cp -r ./riderquest ./build
cp ./elements.css ./build
cp ./index.html ./build
cp ./404.html ./build
cp ./404.html ./build/not_found.html
cp ./robots.txt ./build
cp ./sitemap.xml ./build

# Rewrite canonical URLs for the Nekoweb deployment
sed -i 's|https://fairfruit.tv/|https://fairfruit.nekoweb.org/|g' ./build/index.html
sed -i 's|https://fairfruit.tv/|https://fairfruit.nekoweb.org/|g' ./build/riderquest/index.html
sed -i 's|https://fairfruit.tv/|https://fairfruit.nekoweb.org/|g' ./build/robots.txt
sed -i 's|https://fairfruit.tv/|https://fairfruit.nekoweb.org/|g' ./build/sitemap.xml