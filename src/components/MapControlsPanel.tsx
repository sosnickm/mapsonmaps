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
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Map Selection</h2>
                <MapSelector onSelect={onMapSelect} />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Projection Controls</h2>
                <ProjectionControls onChange={onProjectionChange} />
            </div>
            
            {selectedMap && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Map Display</h2>
                    <MapDragger mapData={selectedMap} projectionSettings={projectionSettings} />
                </div>
            )}
        </div>
    );
};

export default MapControlsPanel;
