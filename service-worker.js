const CACHE_NAME = "simple-pwa-cache-v1";
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/app.js",
    "/manifest.json"
];

// Install
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Fetch
self.addEventListener("fetch", event => {
    // Skip API calls - always go to network
    if (event.request.url.includes("/api/")) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});