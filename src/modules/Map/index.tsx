import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const tileUrl = 'http://map.optimoai.ir/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png';

function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([35.70041, 51.33754], 16);
    }, [center, zoom, map]);
    return null;
}

function TileLayerWithLock({ url }: { url: string }) {
    return <TileLayer url={url} />;
}

function MapInfo() {
    const map = useMap();
    const [info, setInfo] = useState({ lat: 0, lng: 0, zoom: 0 });

    useEffect(() => {
        const updateInfo = () => {
            const center = map.getCenter();
            setInfo({
                lat: Number(center.lat.toFixed(5)),
                lng: Number(center.lng.toFixed(5)),
                zoom: map.getZoom(),
            });
        };

        updateInfo(); // مقدار اولیه
        map.on('moveend', updateInfo);
        map.on('zoomend', updateInfo);

        return () => {
            map.off('moveend', updateInfo);
            map.off('zoomend', updateInfo);
        };
    }, [map]);

    return (
        <div
            style={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                padding: '5px 10px',
                borderRadius: 4,
                fontSize: 14,
                zIndex: 1000,
            }}
        >
            Lat: {info.lat} | Lng: {info.lng} | Zoom: {info.zoom}
        </div>
    );
}

export default function MapTest() {
    const center: [number, number] = [35.7, 51.4];

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <MapContainer style={{ height: '100%', width: '100%' }}>
                <SetView center={center} zoom={7} />
                <TileLayerWithLock url={tileUrl} />
                <MapInfo />
            </MapContainer>


        </div>
    );
}
