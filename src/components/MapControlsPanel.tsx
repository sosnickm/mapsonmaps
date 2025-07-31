import React from 'react';
import type { MapData } from '../types/index.js';
import MapSelector from './MapSelector';
import ProjectionControls from './ProjectionControls';
import MapDragger from './MapDragger';

interface MapControlsPanelProps {
    selectedMap: MapData | null;
    projectionSettings: any;
    onMapSelect: (mapData: any) => void;
    onProjectionChange: (newSettings: any) => void;
}

const MapControlsPanel: React.FC<MapControlsPanelProps> = ({
    selectedMap,
    projectionSettings,
    onMapSelect,
    onProjectionChange
}) => {
    return (
        <div className="space-y-6">
            {/* Map Selection Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Map Selection</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Choose a city to display on the map
                    </p>
                </div>
                <div className="p-4">
                    <MapSelector onSelect={onMapSelect} />
                </div>
            </div>
            
            {selectedMap && (
                <>
                    {/* Projection Settings Card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Projection Settings</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Adjust how the map projection is displayed
                            </p>
                        </div>
                        <div className="p-4">
                            <ProjectionControls 
                                onChange={onProjectionChange}
                            />
                        </div>
                    </div>

                    {/* Map Display Card */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Map Display</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Drag and position your selected map
                            </p>
                        </div>
                        <div className="p-4">
                            <MapDragger 
                                mapData={selectedMap}
                                projectionSettings={projectionSettings}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MapControlsPanel;
