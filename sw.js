const CACHE_VERSION = "v2";
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;
const APP_SHELL = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/main.js",
    "./vendor/jquery/jquery.min.js",
    "./schema.json",
    "./offline.html"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter(
                        (key) =>
                            key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE
                    )
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

const isHtmlRequest = (request) =>
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

const networkFirst = async (request) => {
    try {
        const response = await fetch(request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        return caches.match("./offline.html");
    }
};

const staleWhileRevalidate = async (request) => {
    const cached = await caches.match(request);
    const fetchPromise = fetch(request)
        .then((response) => {
            if (response && response.status === 200) {
                const cache = caches.open(RUNTIME_CACHE);
                cache.then((c) => c.put(request, response.clone()));
            }
            return response;
        })
        .catch(() => cached);

    return cached || fetchPromise;
};

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    if (isHtmlRequest(request)) {
        event.respondWith(networkFirst(request));
        return;
    }

    if (
        ["style", "script", "worker", "font", "image"].includes(
            request.destination
        )
    ) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => cached || fetch(request))
    );
});
