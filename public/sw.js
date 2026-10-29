// Offline support: pages are network-first (fresh when there is signal,
// cached copy on the course), build assets and icons are cache-first.
const CACHE = "la-chouette-v2";
const PRECACHE = [
  "/",
  "/partie",
  "/regles-du-jeu",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  } else if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);

  try {
    const response = await fetch(request);

    if (response.ok) cache.put(request, response.clone());

    return response;
  } catch {
    const cached =
      (await cache.match(request, { ignoreSearch: true })) ||
      (request.mode === "navigate" && (await cache.match("/")));

    return cached || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);

  if (cached) return cached;

  const response = await fetch(request);

  if (response.ok) cache.put(request, response.clone());

  return response;
}
