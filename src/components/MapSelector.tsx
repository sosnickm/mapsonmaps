import React, { useState, useEffect } from 'react';
import { fetchMapData } from '../data/openstreetmap';
import type { MapData } from '../types/index.js';

interface MapSelectorProps {
    onSelect: (mapData: MapData | null) => void;
}

const locationCoords: { [key: string]: { lat: number; lon: number } } = {
    'New York': { lat: 40.7128, lon: -74.0060 },
    'Los Angeles': { lat: 34.0522, lon: -118.2437 },
    'Chicago': { lat: 41.8781, lon: -87.6298 },
    'Houston': { lat: 29.7604, lon: -95.3698 },
    'Phoenix': { lat: 33.4484, lon: -112.0740 },
};

const MapSelector: React.FC<MapSelectorProps> = ({ onSelect }) => {
    const [selectedLocation, setSelectedLocation] = useState<string>('');
    const [mapData, setMapData] = useState<MapData | null>(null);
    const [locations, setLocations] = useState<string[]>(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']);

    useEffect(() => {
        if (selectedLocation && locationCoords[selectedLocation]) {
            const { lat, lon } = locationCoords[selectedLocation];
            fetchMapData(lat, lon).then(data => {
                setMapData(data);
                onSelect(data); // Notify parent of new map data
            });
        } else {
            setMapData(null);
            onSelect(null); // Notify parent of no selection
        }
    }, [selectedLocation, onSelect]);

    const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLocation(event.target.value);
    };

    return (
        <div>
            <h1>Select a Map</h1>
            <select onChange={handleLocationChange} value={selectedLocation}>
                <option value="">Select a city</option>
                {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                ))}
            </select>
            {mapData && (
                <div>
                    <h2>Map of {selectedLocation}</h2>
                    {/* Here you would render the map using the mapData */}
                </div>
            )}
        </div>
    );
};

export default MapSelector;