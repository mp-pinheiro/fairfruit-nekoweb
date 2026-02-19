const server = Bun.serve({
  port: 8080,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    if (path === "/") path = "/index.html";
    if (!path.includes(".")) path += "/index.html";

    const file = Bun.file(`.${path}`);

    if (await file.exists()) return new Response(file);

    const notFound = Bun.file("./404.html");
    if (await notFound.exists()) return new Response(notFound, { status: 404 });

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Dev server running at ${server.url}`);
