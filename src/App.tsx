import React, { useState } from 'react';
import MapControlsPanel from './components/MapControlsPanel';
import MapView from './components/MapView';
import './App.css'

const App: React.FC = () => {
    const [selectedMap, setSelectedMap] = useState(null);
    const [projectionSettings, setProjectionSettings] = useState({});
    const [showControls, setShowControls] = useState(true);

    const handleMapSelect = (mapData: any) => {
        setSelectedMap(mapData);
    };

    const handleProjectionChange = (newSettings: any) => {
        setProjectionSettings(newSettings);
    };

    return (
        <div className="h-screen w-screen overflow-hidden relative">
            {/* Full-screen map */}
            <MapView 
                style={{ height: '100vh', width: '100vw' }}
            />
            
            {/* Floating header */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg px-6 py-3">
                    <h1 className="text-2xl font-bold text-blue-600">Maps on Maps</h1>
                </div>
            </div>

            {/* Toggle button for controls */}
            <button
                onClick={() => setShowControls(!showControls)}
                className="absolute top-4 right-4 z-10 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg p-3 hover:bg-opacity-100 transition-all"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Sliding controls panel */}
            <div className={`absolute top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-20 ${
                showControls ? 'translate-x-0' : 'translate-x-full'
            }`}>
                <div className="h-full overflow-y-auto p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Map Controls</h2>
                        <button
                            onClick={() => setShowControls(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    
                    <MapControlsPanel 
                        selectedMap={selectedMap}
                        projectionSettings={projectionSettings}
                        onMapSelect={handleMapSelect}
                        onProjectionChange={handleProjectionChange}
                    />
                </div>
            </div>

            {/* Overlay for mobile when controls are open */}
            {showControls && (
                <div 
                    className="md:hidden absolute inset-0 bg-black bg-opacity-50 z-10"
                    onClick={() => setShowControls(false)}
                />
            )}
        </div>
    );
};

export default App;


