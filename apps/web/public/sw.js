// =============================================================================
// Quantangle Progressive Web App (PWA) Service Worker
// =============================================================================
// Provides zero-latency offline quantum simulation, App Shell caching,
// WebAssembly binary caching, and resilient offline API fallback.
// =============================================================================

const VERSION = "v1.0.0";
const CORE_CACHE = `quantangle-core-${VERSION}`;
const WASM_CACHE = `quantangle-wasm-${VERSION}`;
const STATIC_CACHE = `quantangle-static-${VERSION}`;
const RUNTIME_CACHE = `quantangle-runtime-${VERSION}`;

// Core assets to pre-cache immediately during installation
const PRECACHE_ASSETS = [
  "/",
  "/verify",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
];

// Install Event — Pre-cache critical App Shell and activate immediately
self.addEventListener("install", (event) => {
  console.log(`[SW ${VERSION}] Installing Service Worker...`);
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => {
        console.log(`[SW ${VERSION}] Pre-caching Core App Shell...`);
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log(`[SW ${VERSION}] Pre-cache complete. Skipping waiting.`);
        return self.skipWaiting();
      })
      .catch((err) => {
        console.warn(`[SW ${VERSION}] Pre-cache warning:`, err);
        return self.skipWaiting();
      })
  );
});

// Activate Event — Clean up outdated cache versions and claim all open clients
self.addEventListener("activate", (event) => {
  console.log(`[SW ${VERSION}] Activating Service Worker...`);
  const activeCaches = [CORE_CACHE, WASM_CACHE, STATIC_CACHE, RUNTIME_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!activeCaches.includes(key)) {
              console.log(`[SW ${VERSION}] Deleting stale cache: ${key}`);
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => {
        console.log(`[SW ${VERSION}] Clients claiming control.`);
        return self.clients.claim();
      })
  );
});

// Fetch Event — Multi-tier routing & caching strategies
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST, PUT, DELETE)
  if (request.method !== "GET") {
    return;
  }

  // Strategy 1: WebAssembly Binaries & Web Workers (.wasm or worker chunks)
  // Cache-First with immediate return for instant 0-latency offline execution
  if (url.pathname.endsWith(".wasm") || url.pathname.includes("worker")) {
    event.respondWith(
      caches.open(WASM_CACHE).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        })
      )
    );
    return;
  }

  // Strategy 2: Next.js Static Chunks, Fonts, and Icons (/_next/static/*)
  // Cache-First with network fallback
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Return fallback if available
              return caches.match(request);
            });
        })
      )
    );
    return;
  }

  // Strategy 3: API Endpoints (/api/*)
  // Network-First with graceful offline mock response fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache successful GET API responses in runtime cache
          if (networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Check if we have a cached version
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          // Return structured offline fallback JSON
          return new Response(
            JSON.stringify({
              offline: true,
              status: "offline_mode",
              message:
                "Offline Mode Active: All 16-qubit quantum simulations and quest evaluations run locally via WebAssembly.",
              timestamp: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        })
    );
    return;
  }

  // Strategy 4: HTML Navigation Requests (e.g. "/", "/verify")
  // Network-First with cached App Shell fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CORE_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log(`[SW ${VERSION}] Serving offline fallback for navigation: ${url.pathname}`);
          const cached = await caches.match(request);
          if (cached) {
            return cached;
          }
          // Fall back to cached root App Shell
          return caches.match("/");
        })
    );
    return;
  }

  // Strategy 5: Default Stale-While-Revalidate for other GET requests
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    )
  );
});

// Communication with frontend clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "PING") {
    event.ports[0]?.postMessage({
      type: "PONG",
      version: VERSION,
      status: "active",
      timestamp: Date.now(),
    });
  }
});
