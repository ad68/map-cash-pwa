import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const tileUrl = 'http://map.optimoai.ir/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png';

export default function MapLeafletVanilla() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // جلوگیری از ایجاد مجدد نقشه در hot reload یا render مجدد
        if (mapInstanceRef.current) return;

        const map = L.map(mapRef.current).setView([35.7, 51.4], 17);
        mapInstanceRef.current = map;

        const tileLayer = L.tileLayer(tileUrl, {
            maxZoom: 19,
            minZoom: 1,
        });

        // هنگام شروع بارگذاری، تعاملات نقشه را غیرفعال کن
        tileLayer.on('loading', () => {
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            map.doubleClickZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
        });

        // هنگام اتمام بارگذاری، تعاملات را فعال کن
        tileLayer.on('load', () => {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
        });

        tileLayer.addTo(map);

        // پاکسازی هنگام unmount
        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    return <>
        <span style={{ fontSize: "20px" }}>Leaflet</span>
        <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />
    </>
}
