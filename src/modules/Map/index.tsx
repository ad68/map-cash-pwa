import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const tileUrl = 'http://map.optimoai.ir/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png';

function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 17);
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


const unregisterSW = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
                registration.unregister().then(() => {
                    console.log('Service Worker unregistered');
                    window.location.reload();
                });
            }
        });
    }
};
export default function MapTest() {
    const center: [number, number] = [35.7, 51.4];

    /*   function clearTileCache() {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_TILE_CACHE' });
          } else {
              console.warn('Service Worker controller not available');
          }
      } */
    /*     const clearTileCache = () => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'CLEAR_TILE_CACHE',
                });
                alert("درخواست پاک‌سازی کش ارسال شد. صفحه برای اعمال تغییرات مجدداً بارگذاری می‌شود.");
    
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                alert("Service Worker فعال نیست.");
            }
        }; */
    /*   const sendMsg = () => {
         
          if (navigator.serviceWorker && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({ type: 'HELLO' });
          } else {
              console.warn('No active SW controller');
          }
      } */


    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <MapContainer style={{ height: '100%', width: '100%' }}>
                <SetView center={center} zoom={7} />
                <TileLayerWithLock url={tileUrl} />
            </MapContainer>
            <button
                onClick={unregisterSW}
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
