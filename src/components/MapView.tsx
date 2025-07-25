import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet with Vite
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface MapViewProps {
    center?: [number, number];
    zoom?: number;
    className?: string;
    style?: React.CSSProperties;
}

const MapView: React.FC<MapViewProps> = ({ 
    center = [38.001722, -39.471810], 
    zoom = 3,
    className = "",
    style = { height: '100vh', width: '100%' }
}) => (
    <div className={className}>
        <MapContainer 
            center={center} 
            zoom={zoom} 
            style={style}
            scrollWheelZoom={true}
            dragging={true}
            touchZoom={true}
            doubleClickZoom={true}
            keyboard={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={17}
            />
        </MapContainer>
    </div>
);

export default MapView;