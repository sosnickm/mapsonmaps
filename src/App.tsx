import React, { useState } from 'react';
import { Menu, X } from "lucide-react";
import MapControlsPanel from './components/MapControlsPanel';
import MapView from './components/MapView';
import './App.css'
import CountryShape from './components/CountryShape';

interface SelectedCountry {
    id: string;
    data: any;
    position: { x: number; y: number };
    scale: number;
    exactDimensions: { width: number; height: number };
}

const App: React.FC = () => {
    const [selectedMap, setSelectedMap] = useState(null);
    const [projectionSettings, setProjectionSettings] = useState({});
    const [showControls, setShowControls] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<SelectedCountry[]>([]);

    const handleMapSelect = (mapData: any) => {
        setSelectedMap(mapData);
    };

    const handleProjectionChange = (newSettings: any) => {
        setProjectionSettings(newSettings);
    };

    const handleCountrySelect = (countryData: any) => {
        // Position the shape near where the user clicked, but offset so it's visible
        const clickX = countryData.clickPosition?.x || Math.random() * (window.innerWidth - 400);
        const clickY = countryData.clickPosition?.y || Math.random() * (window.innerHeight - 400);
        
        // Use exact pixel dimensions from the map
        const exactWidth = countryData.pixelDimensions?.width || 200;
        const exactHeight = countryData.pixelDimensions?.height || 200;
        
        // Offset the shape so it doesn't cover the clicked area
        const offsetX = clickX + 50;
        const offsetY = clickY + 50;
        
        // Ensure the shape stays within screen bounds using exact dimensions
        const finalX = Math.min(Math.max(offsetX, 20), window.innerWidth - exactWidth - 40);
        const finalY = Math.min(Math.max(offsetY, 20), window.innerHeight - exactHeight - 40);

        const newCountry: SelectedCountry = {
            id: `${countryData.name}-${Date.now()}`,
            data: countryData,
            position: { 
                x: finalX,
                y: finalY
            },
            scale: 1, // Always 1 since we're using exact dimensions
            exactDimensions: {
                width: exactWidth,
                height: exactHeight
            }
        };
        
        setSelectedCountries(prev => [...prev, newCountry]);
        
        // Show notification with exact dimensions
        console.log(`Selected country: ${countryData.name} at position (${finalX}, ${finalY}) with exact dimensions ${exactWidth}x${exactHeight}px`);
    };

    const handleRemoveCountry = (countryId: string) => {
        setSelectedCountries(prev => prev.filter(country => country.id !== countryId));
    };

    const handleUpdateCountryPosition = (countryId: string, newPosition: { x: number; y: number }) => {
        setSelectedCountries(prev => 
            prev.map(country => 
                country.id === countryId 
                    ? { ...country, position: newPosition }
                    : country
            )
        );
    };

    return (
        <div 
            className="fixed inset-0 overflow-hidden" 
            style={{ 
                margin: 0, 
                padding: 0, 
                width: '100vw', 
                height: '100vh',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
        >
            {/* Full-screen map - LOWEST z-index */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                <MapView 
                    style={{ height: '100vh', width: '100vw', margin: 0, padding: 0 }}
                    onCountrySelect={handleCountrySelect}
                />
            </div>
            
            {/* Floating header - HIGH z-index */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2" style={{ zIndex: 100 }}>
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg px-6 py-3">
                    <h1 className="text-2xl font-bold text-blue-600">Maps on Maps</h1>
                </div>
            </div>

            {/* Instructions overlay */}
            {selectedCountries.length === 0 && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" style={{ zIndex: 100 }}>
                    <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2">
                        <p className="text-sm text-gray-600">Double-click any country to create a shape</p>
                    </div>
                </div>
            )}

            {/* Hamburger Menu Button */}
            {!showControls && (
                <button
                    onClick={() => setShowControls(true)}
                    className="absolute top-4 left-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-3 hover:bg-opacity-100 transition-all"
                    style={{ margin: 0, zIndex: 100 }}
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* Country Shapes - rendered on top */}
            {selectedCountries.map(country => (
                <CountryShape
                    key={country.id}
                    countryId={country.id}
                    countryData={country.data}
                    position={country.position}
                    scale={country.scale}
                    exactDimensions={country.exactDimensions}
                    onRemove={() => handleRemoveCountry(country.id)}
                    onPositionUpdate={(newPosition: { x: number; y: number }) => handleUpdateCountryPosition(country.id, newPosition)}
                />
            ))}

            {/* Sliding controls panel */}
            <div 
                className={`absolute top-0 left-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
                    showControls ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{ zIndex: 50 }}
            >
                <div className="h-full overflow-y-auto">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Map Controls</h2>
                        <button
                            onClick={() => setShowControls(false)}
                            className="text-gray-500 hover:text-gray-700 p-1"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <MapControlsPanel 
                            selectedMap={selectedMap}
                            projectionSettings={projectionSettings}
                            onMapSelect={handleMapSelect}
                            onProjectionChange={handleProjectionChange}
                        />
                        
                        {/* Selected Countries List */}
                        {selectedCountries.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-3">Selected Countries ({selectedCountries.length})</h3>
                                <div className="space-y-2">
                                    {selectedCountries.map(country => (
                                        <div key={country.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <div>
                                                <span className="text-sm font-medium">{country.data.name}</span>
                                                <div className="text-xs text-gray-500">
                                                    {country.exactDimensions.width}×{country.exactDimensions.height}px
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    ({Math.round(country.position.x)}, {Math.round(country.position.y)})
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveCountry(country.id)}
                                                className="text-red-500 hover:text-red-700 text-xs"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Overlay when controls are open */}
            {showControls && (
                <div 
                    className="absolute inset-0 bg-black bg-opacity-50"
                    style={{ zIndex: 40 }}
                    onClick={() => setShowControls(false)}
                />
            )}
        </div>
    );
};

export default App;


