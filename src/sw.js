/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'

// لیست فایل‌های precache شده رو خود `vite-plugin-pwa` اینجا تزریق می‌کنه:
precacheAndRoute(self.__WB_MANIFEST || [])

// تنظیمات IndexedDB
const DB_NAME = 'tile-cache-db'
const STORE_NAME = 'tiles'
const DB_VERSION = 1

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

const serverMapUrl = 'http://37.32.26.141:8080'
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
