const CACHE_VERSION = "v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll([
        "./icon.svg",
        "./icon.png",
        "./index.html",
        "./index.css",
        "./index.js",
        "./SudokuGrid.js",
        "./formatRelativeTime.js",
        "./checkGrid.js",
        "./sudoku-generator.js",
        "./sudoku-generator.wasm",
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  const networkResponse = fetch(event.request).then(response => {
    return response.ok
      ? caches.open(CACHE_VERSION).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        })
      : new Response(
          "<h1>Not Found</h1>" +
            "<p>This request failed. Maybe a typo or a dead link?</p>" +
            '<p><img src="./icon.svg" alt="Web Sudoku"></p>' +
            '<p><a href="./index.html">Back to the game</a></p>',
          {
            headers: { "Content-Type": "text/html" },
            status: 404,
            statusText: "Not Found",
          }
        );
  });
  event.respondWith(
    caches
      .match(event.request)
      .then(response => response || networkResponse)
      .catch(console.error)
  );
});
