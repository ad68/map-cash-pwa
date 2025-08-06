

import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'

// لیست فایل‌های precache شده رو خود `vite-plugin-pwa` اینجا تزریق می‌کنه:
precacheAndRoute(self.__WB_MANIFEST || [])

// تنظیمات IndexedDB
const DB_NAME = 'tile-cache-db'
const STORE_NAME = 'tiles'
const DB_VERSION = 1
self.addEventListener('install', (event) => {
    console.log('[SW] نصب شد');
    self.skipWaiting(); // فوراً فعال کنه
});

self.addEventListener('activate', (event) => {
    console.log('[SW] فعال شد');
    event.waitUntil(self.clients.claim()); // کنترل تمام تب‌ها رو بگیره
});
function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = e => {
            const db = e.target.result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' })
            }
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

function makeKey(x, y, z) {
    return `${z}/${x}/${y}`
}

function getFromDb(db, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const req = store.get(key)
        req.onsuccess = () => resolve(req.result ? req.result.blob : null)
        req.onerror = () => reject(req.error)
    })
}

function putInDb(db, key, blob) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const entry = { key, blob, storedAt: Date.now() }
        const req = store.put(entry)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
    })
}

/* const serverMapUrl = 'http://37.32.26.141:8080' */
const serverMapUrl = 'http://map.optimoai.ir'
const tileRegex = /^\/wmts\/gm_layer\/gm_grid\/(\d+)\/(\d+)\/(\d+)\.png$/

// مسیر درخواست Tile
registerRoute(
    ({ url }) => tileRegex.test(url.pathname),
    async ({ request }) => {
        const url = new URL(request.url)
        const match = tileRegex.exec(url.pathname)
        if (!match) return fetch(request)

        const [, x, y, z] = match
        const key = makeKey(x, y, z)
        const db = await openDb()

        // اول سعی کن از کش بگیری
        const cached = await getFromDb(db, key)
        if (cached) {
            return new Response(cached, {
                status: 200,
                headers: { 'Content-Type': 'image/png' },
            })
        }

        // اگر کش نبود از شبکه بگیر و ذخیره کن
        try {
            const fetchUrl = `${serverMapUrl}${url.pathname}`
            const resp = await fetch(fetchUrl)
            if (!resp.ok) throw new Error('Failed to fetch tile')
            const blob = await resp.blob()
            putInDb(db, key, blob).catch(e => console.warn('DB write failed', e))
            return new Response(blob, {
                status: 200,
                headers: { 'Content-Type': 'image/png' },
            })
        } catch (e) {
            return new Response('Offline and tile not available', { status: 503 })
        }
    }
)
// 👇 این بخش رو اضافه کن

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/wmts/gm_layer/gm_grid/')) {
        return; // این روت از قبل با registerRoute مدیریت شده
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request)
                .then((networkResponse) => {
                    return caches.open('dynamic-cache').then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    if (event.request.destination === 'image') {
                        return caches.match('/fallback.png'); // عکس fallback
                    }
                    return new Response('Offline & not cached', {
                        status: 504,
                        statusText: 'Offline & not cached',
                    });
                });
        })
    );
});
/* self.addEventListener('message', async (event) => {
    console.log('Cache API cleared');
    if (event.data && event.data.type === 'CLEAR_TILE_CACHE') {
        console.log('Cache API cleared');
        try {
            // پاک کردن Cache API
            const cacheNames = await caches.keys();
            for (const cacheName of cacheNames) {
                if (cacheName.includes('tile') || cacheName.includes('leaflet') || cacheName.includes('dynamic')) {
                    await caches.delete(cacheName);
                }
            }
            console.log('Cache API cleared');

            // پاک کردن IndexedDB به صورت Promise و await
            await new Promise((resolve, reject) => {
                const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
                deleteRequest.onsuccess = () => {
                    console.log('IndexedDB deleted');
                    resolve();
                };
                deleteRequest.onerror = (e) => {
                    console.warn('Failed to delete IndexedDB', e);
                    reject(e);
                };
                deleteRequest.onblocked = () => {
                    console.warn('Delete blocked: please close other tabs using this site.');
                    reject(new Error('Delete blocked'));
                };
            });

            console.log('Tile cache (Cache API + IndexedDB) cleared');
        } catch (e) {
            console.error('Error clearing tile cache:', e);
        }
    }
});
 */
/* self.addEventListener('message', async (event) => {
    if (event.data?.type === 'CLEAR_ALL_CACHES') {
        // پاک کردن Cache API
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));

        // پاک کردن IndexedDB
        const dbDeleteRequest = indexedDB.deleteDatabase('leafletTileCache');
        dbDeleteRequest.onsuccess = () => {
            console.log('IndexedDB deleted');
            event.source?.postMessage('CACHES_CLEARED');
        };
        dbDeleteRequest.onerror = () => {
            console.warn('Failed to delete IndexedDB');
            event.source?.postMessage('CACHES_CLEARED'); // حتی اگر خطا داد، ادامه بده
        };
    }
}); */
