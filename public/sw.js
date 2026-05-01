/* KarVicharTohPamm — Service Worker v2 */

// Update this version whenever static assets change significantly
const CACHE_NAME = "kvtp-v2-static";

// Only cache static assets that don't change often
const STATIC_ASSETS = [
  "/offline",
  "/favicon.ico",
  "/manifest.json",
  "/images/shrimad-rajchandra.png",
];

// Install: Cache static shell and force immediate takeover
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Pre-caching static assets");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy based on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET and cross-origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // 2. Navigation (HTML): ALWAYS go to network first to prevent stale UI
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        // Only return cached offline page if network fails
        return caches.match("/offline");
      })
    );
    return;
  }

  // 3. Static Assets (Images, Fonts, Scripts): Cache-first
  const isStatic = 
    url.pathname.startsWith("/_next/static/") || 
    url.pathname.startsWith("/images/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg");

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Optional: Cache newly discovered static assets
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Everything else: Network only
  event.respondWith(fetch(request));
});
