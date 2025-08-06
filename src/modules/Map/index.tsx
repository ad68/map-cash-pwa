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

export default function MapTest() {
    const center: [number, number] = [35.7, 51.4];


    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <MapContainer style={{ height: '100%', width: '100%' }}>
                <SetView center={center} zoom={7} />
                <TileLayerWithLock url={tileUrl} />
            </MapContainer>

        </div>
    );
}
