const CACHE_NAME = 'fullstack-roadmap-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './favicon.png',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;700;800&display=swap'
];

// Offline fallback page (inline for simplicity or separate if needed)
const OFFLINE_FALLBACK = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline | Full-Stack Roadmap</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #0a0a0c; color: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; }
        h1 { color: #6366f1; margin-bottom: 10px; }
        p { color: #94a3b8; max-width: 400px; line-height: 1.6; }
        .btn { margin-top: 20px; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; }
    </style>
</head>
<body>
    <h1>You're Offline</h1>
    <p>It seems your internet connection is resting. Don't worry, the Roadmap is designed to work offline once cached!</p>
    <button class="btn" onclick="window.location.reload()">Try Again</button>
</body>
</html>
`;

// Install Stage: Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate Stage: Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Strategy: Cache-First for static, Network-First for dynamic
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).catch(() => {
                // If it's a page navigation, show offline fallback
                if (event.request.mode === 'navigate') {
                    return new Response(OFFLINE_FALLBACK, {
                        headers: { 'Content-Type': 'text/html' }
                    });
                }
            });
        })
    );
});

// Handle push notifications (placeholder)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'New Update', body: 'The Roadmap has been updated!' };
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: './favicon.png'
        })
    );
});
