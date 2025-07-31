import React, { useState } from 'react';
import { Menu, X } from "lucide-react";
import MapControlsPanel from './components/MapControlsPanel';
import MapView from './components/MapView';
import './App.css'

const App: React.FC = () => {
    const [selectedMap, setSelectedMap] = useState(null);
    const [projectionSettings, setProjectionSettings] = useState({});
    const [showControls, setShowControls] = useState(false);

    const handleMapSelect = (mapData: any) => {
        setSelectedMap(mapData);
    };

    const handleProjectionChange = (newSettings: any) => {
        setProjectionSettings(newSettings);
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
                />
            </div>
            
            {/* Floating header - HIGH z-index */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2" style={{ zIndex: 100 }}>
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg px-6 py-3">
                    <h1 className="text-2xl font-bold text-blue-600">Maps on Maps</h1>
                </div>
            </div>

            {/* Hamburger with controls */}
            {!showControls && (
                <button
                    onClick={() => setShowControls(true)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg p-3 transition-all"
                    style={{ 
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        margin: 0, 
                        zIndex: 9999,
                        minWidth: '60px',
                        minHeight: '60px'
                    }}
                >
                    <Menu className="w-8 h-8" />
                    <span className="sr-only">Menu</span>
                </button>
            )}

            {/* Sliding controls panel - MEDIUM z-index */}
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
                    </div>
                </div>
            </div>

            {/* Overlay when controls are open - MEDIUM z-index */}
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


