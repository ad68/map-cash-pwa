import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const tileUrl = 'http://map.optimoai.ir/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png';

function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

function TileLayerWithLock({ url }: { url: string }) {
    const map = useMap();

    useEffect(() => {
        // در شروع بارگذاری لایه، زوم و درگ رو غیرفعال کن
        function onLoading() {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            map.doubleClickZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
        }
        // بعد از اتمام بارگذاری، مجدداً فعال کن
        function onLoad() {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
        }

        map.on('loading', onLoading);
        map.on('load', onLoad);

        // پاک‌سازی ایونت‌ها هنگام unmount
        return () => {
            map.off('loading', onLoading);
            map.off('load', onLoad);
        };
    }, [map]);

    return <TileLayer url={url} />;
}

export default function MapTest() {
    const center: [number, number] = [35.7, 51.4];
    const clearTileCache = async () => {
        if ('caches' in window) {
            const cacheNames = await caches.keys()
            for (const name of cacheNames) {
                const cache = await caches.open(name)
                const requests = await cache.keys()
                for (const request of requests) {
                    if (request.url.includes('/gm_layer/gm_grid/')) {
                        await cache.delete(request)
                    }
                }
            }
            alert('کش تایل‌ها پاک شد ✅')
        } else {
            alert('مرورگر از Cache API پشتیبانی نمی‌کند ❌')
        }
    }
    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <MapContainer style={{ height: '100%', width: '100%' }}>
                <SetView center={center} zoom={7} />
                <TileLayerWithLock url={tileUrl} />
            </MapContainer>
            <button
                onClick={clearTileCache}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1000,
                    padding: '10px 20px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: 5,
                    cursor: 'pointer',
                }}
            >
                پاک کردن کش تایل‌ها
            </button>
        </div>
    );
}
