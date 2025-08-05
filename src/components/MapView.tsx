import React, { useRef } from 'react';
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet with Vite
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
        if (!zoomControlRef.current) {
            map.eachLayer((layer: any) => {
                if (layer instanceof L.Control.Zoom) {
                    map.removeControl(layer);
                }
            });
            
            zoomControlRef.current = L.control.zoom({ position: 'bottomright' });
            zoomControlRef.current.addTo(map);
        }
        
        return () => {
            if (zoomControlRef.current) {
                map.removeControl(zoomControlRef.current);
                zoomControlRef.current = null;
            }
        };
    }, [map]);

    return null;
};

// Helper function to check if a point is inside a polygon
const pointInPolygon = (point: [number, number], polygon: number[][]) => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    
    return inside;
};

// Helper function to find which specific polygon was clicked
const findClickedPolygon = (geometry: any, clickLatLng: L.LatLng) => {
    const clickPoint: [number, number] = [clickLatLng.lng, clickLatLng.lat];
    
    if (geometry.type === 'Polygon') {
        // Single polygon - check if click is inside
        const outerRing = geometry.coordinates[0];
        if (pointInPolygon(clickPoint, outerRing)) {
            return {
                type: 'Polygon',
                coordinates: geometry.coordinates
            };
        }
    } else if (geometry.type === 'MultiPolygon') {
        // Multiple polygons - find which one was clicked
        for (const polygon of geometry.coordinates) {
            const outerRing = polygon[0];
            if (pointInPolygon(clickPoint, outerRing)) {
                return {
                    type: 'Polygon',
                    coordinates: polygon
                };
            }
        }
    }
    
    return null;
};

// Helper function to calculate bounds for a single polygon
const calculatePolygonBounds = (coordinates: number[][][]) => {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    // Check all rings (outer + holes)
    coordinates.forEach(ring => {
        ring.forEach(([lng, lat]) => {
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
        });
    });
    
    return L.latLngBounds(
        L.latLng(minLat, minLng),
        L.latLng(maxLat, maxLng)
    );
};

// Component to handle country boundaries and clicks
const CountryBoundaries: React.FC<{ onCountryDoubleClick: (countryData: any) => void }> = ({ onCountryDoubleClick }) => {
    const map = useMap();
    const [countriesData, setCountriesData] = React.useState<any>(null);

    React.useEffect(() => {
        // Load world countries GeoJSON data
        fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
            .then(response => response.json())
            .then(data => {
                setCountriesData(data);
            })
            .catch(error => {
                console.error('Error loading countries data:', error);
            });
    }, []);

    const onEachFeature = (feature: any, layer: L.Layer) => {
        layer.on({
            dblclick: (e) => {
                // Stop the event from propagating to prevent map zoom
                L.DomEvent.stopPropagation(e);
                
                // Get the click location
                const clickLatLng = e.latlng;
                
                // Find which specific polygon was clicked
                const clickedPolygon = findClickedPolygon(feature.geometry, clickLatLng);
                
                if (!clickedPolygon) {
                    console.log('No polygon found at click location');
                    return;
                }
                
                // Calculate bounds for just the clicked polygon
                const polygonBounds = calculatePolygonBounds(clickedPolygon.coordinates);
                
                // Get exact pixel coordinates of the polygon bounds on the map
                const southWestPoint = map.latLngToContainerPoint(polygonBounds.getSouthWest());
                const northEastPoint = map.latLngToContainerPoint(polygonBounds.getNorthEast());
                
                // Calculate exact pixel dimensions
                const pixelWidth = Math.abs(northEastPoint.x - southWestPoint.x);
                const pixelHeight = Math.abs(southWestPoint.y - northEastPoint.y);
                
                const countryName = feature.properties.name || feature.properties.NAME || feature.properties.ADMIN;
                
                const countryData = {
                    name: countryName,
                    geometry: clickedPolygon, // Only the clicked polygon
                    properties: feature.properties,
                    bounds: polygonBounds, // Bounds of just the clicked polygon
                    mapZoom: map.getZoom(),
                    pixelDimensions: {
                        width: pixelWidth,
                        height: pixelHeight
                    },
                    mapBounds: {
                        southWest: polygonBounds.getSouthWest(),
                        northEast: polygonBounds.getNorthEast(),
                        southWestPixel: southWestPoint,
                        northEastPixel: northEastPoint
                    },
                    clickPosition: {
                        x: e.containerPoint.x,
                        y: e.containerPoint.y
                    }
                };
                
                console.log(`Clicked on ${countryName} polygon:`, clickedPolygon);
                onCountryDoubleClick(countryData);
            },
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 3,
                    color: '#3b82f6',
                    dashArray: '',
                    fillOpacity: 0.4,
                    fillColor: '#60a5fa'
                });
                
                // Show cursor hint
                layer.getElement().style.cursor = 'pointer';
            },
            mouseout: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 1,
                    color: '#94a3b8',
                    dashArray: '',
                    fillOpacity: 0.1,
                    fillColor: '#e2e8f0'
                });
            }
        });

        // Single click for debugging
        layer.on('click', (e) => {
            const countryName = feature.properties.name || feature.properties.NAME || feature.properties.ADMIN;
            console.log(`Single-clicked: ${countryName} at`, e.latlng);
        });
    };

    const countryStyle = {
        fillColor: '#e2e8f0',
        weight: 1,
        opacity: 1,
        color: '#94a3b8',
        dashArray: '',
        fillOpacity: 0.1
    };

    if (!countriesData) return null;

    return (
        <GeoJSON
            data={countriesData}
            style={countryStyle}
            onEachFeature={onEachFeature}
        />
    );
};

interface MapViewProps {
    center?: [number, number];
    zoom?: number;
    className?: string;
    style?: React.CSSProperties;
    onCountrySelect?: (countryData: any) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
    center = [38.001722, -39.471810], 
    zoom = 2,
    className = "",
    style = { height: '100vh', width: '100%' },
    onCountrySelect
}) => {
    const handleCountryDoubleClick = (countryData: any) => {
        if (onCountrySelect) {
            onCountrySelect(countryData);
        }
    };

    return (
        <div className={`${className} relative`} style={{ zIndex: 0 }}>
            <MapContainer 
                center={center} 
                zoom={zoom} 
                style={{...style, zIndex: 0}}
                scrollWheelZoom={true}
                dragging={true}
                touchZoom={true}
                doubleClickZoom={false} // Disable default double click zoom
                keyboard={true}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={17}
                />
                <ZoomControl />
                <CountryBoundaries onCountryDoubleClick={handleCountryDoubleClick} />
            </MapContainer>
        </div>
    );
};

export default MapView;