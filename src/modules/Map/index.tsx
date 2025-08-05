import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const tileUrl = 'http://37.32.26.141:8080/wmts/gm_layer/gm_grid/{z}/{x}/{y}.png'

function SetView({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, zoom)
    }, [center, zoom, map])
    return null
}

export default function MapTest() {
    useEffect(() => {
        import('leaflet/dist/leaflet.css')
    }, [])

    const center: [number, number] = [35.7, 51.4]

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <MapContainer style={{ height: '100%', width: '100%' }}>
                <SetView center={center} zoom={7} />
                <TileLayer url={tileUrl} />
            </MapContainer>
        </div>
    )
}
