/**
 * Full-Stack Roadmap - Service Worker
 * v2.0 - Advanced Caching Strategy
 */

const CACHE_VERSION = 'v3';
const STATIC_CACHE = `fullstack-roadmap-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `fullstack-roadmap-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `fullstack-roadmap-images-${CACHE_VERSION}`;

const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './favicon.png',
    './manifest.json'
];

const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap'
];

// Offline fallback page
const OFFLINE_FALLBACK = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline | Full-Stack Roadmap</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            background: #030712; 
            color: #f9fafb; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            text-align: center; 
            padding: 24px;
            line-height: 1.6;
        }
        .icon { 
            width: 80px; 
            height: 80px; 
            background: rgba(99, 102, 241, 0.1); 
            border-radius: 24px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin-bottom: 24px;
            font-size: 40px;
        }
        h1 { 
            color: #6366f1; 
            margin-bottom: 12px; 
            font-size: 28px;
            font-weight: 700;
        }
        p { 
            color: #9ca3af; 
            max-width: 400px; 
            margin-bottom: 32px;
            font-size: 16px;
        }
        .btn { 
            padding: 14px 28px; 
            background: linear-gradient(135deg, #6366f1, #a855f7); 
            color: white; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: 600; 
            cursor: pointer; 
            border: none;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }
    </style>
</head>
<body>
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>Your internet connection is taking a break. Don't worry — the Roadmap works offline once cached!</p>
    <button class="btn" onclick="window.location.reload()">Try Again</button>
</body>
</html>`;

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll([...STATIC_ASSETS, ...EXTERNAL_ASSETS]);
            })
            .catch((err) => console.error('[SW] Cache failed:', err))
    );
    self.skipWaiting();
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('fullstack-roadmap-') && !name.includes(CACHE_VERSION))
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// ============================================
// FETCH EVENT - Advanced Caching Strategy
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) return;

    // Strategy: Cache First for static assets
    if (isStaticAsset(url)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // Strategy: Stale While Revalidate for images
    if (isImage(request)) {
        event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
        return;
    }

    // Strategy: Network First for API calls
    if (isAPI(request)) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
        return;
    }

    // Default: Network with cache fallback
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(request).then((cached) => {
                    if (cached) return cached;

                    // Return offline fallback for navigation
                    if (request.mode === 'navigate') {
                        return new Response(OFFLINE_FALLBACK, {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    }

                    return new Response('Offline', { status: 503 });
                });
            })
    );
});

// ============================================
// CACHING STRATEGIES
// ============================================

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return cached || new Response('Offline', { status: 503 });
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(() => cached);

    return cached || fetchPromise;
}

async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cache = await caches.open(cacheName);
        const cached = await cache.match(request);
        return cached || new Response('Offline', { status: 503 });
    }
}

// ============================================
// HELPERS
// ============================================

function isStaticAsset(url) {
    const staticHosts = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com'
    ];
    return staticHosts.includes(url.hostname) ||
        STATIC_ASSETS.some(asset => url.href.includes(asset.replace('./', '')));
}

function isImage(request) {
    return request.destination === 'image';
}

function isAPI(request) {
    return request.url.includes('/api/');
}

// ============================================
// BACKGROUND SYNC (Placeholder)
// ============================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-progress') {
        event.waitUntil(syncProgressData());
    }
});

async function syncProgressData() {
    // Placeholder for background sync functionality
    console.log('[SW] Background sync executed');
}

// ============================================
// PUSH NOTIFICATIONS (Placeholder)
// ============================================
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {
        title: 'Full-Stack Roadmap',
        body: 'New content available!',
        icon: './favicon.png'
    };

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || './favicon.png',
            badge: './favicon.png',
            tag: 'roadmap-update',
            requireInteraction: false
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./')
    );
});
