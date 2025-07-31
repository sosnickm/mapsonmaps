import React, { useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
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

// Component to add zoom control in bottom-right
const ZoomControl: React.FC = () => {
    const map = useMap();
    const zoomControlRef = useRef<L.Control.Zoom | null>(null);
    
    React.useEffect(() => {
        // Only add zoom control if it doesn't exist
        if (!zoomControlRef.current) {
            // Remove any existing zoom controls first
            map.eachLayer((layer: any) => {
                if (layer instanceof L.Control.Zoom) {
                    map.removeControl(layer);
                }
            });
            
            // Add new zoom control in bottom-right position
            zoomControlRef.current = L.control.zoom({ position: 'bottomright' });
            zoomControlRef.current.addTo(map);
        }
        
        return () => {
            // Cleanup on unmount
            if (zoomControlRef.current) {
                map.removeControl(zoomControlRef.current);
                zoomControlRef.current = null;
            }
        };
    }, [map]);

    return null;
};

interface MapViewProps {
    center?: [number, number];
    zoom?: number;
    className?: string;
    style?: React.CSSProperties;
}

const MapView: React.FC<MapViewProps> = ({ 
    center = [38.001722, -39.471810], 
    zoom = 2,
    className = "",
    style = { height: '100vh', width: '100%' }
}) => (
    <div className={`${className} relative`} style={{ zIndex: 0 }}>
        <MapContainer 
            center={center} 
            zoom={zoom} 
            style={{...style, zIndex: 0}}
            scrollWheelZoom={true}
            dragging={true}
            touchZoom={true}
            doubleClickZoom={true}
            keyboard={true}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={17}
            />
            <ZoomControl />
        </MapContainer>
    </div>
);

export default MapView;