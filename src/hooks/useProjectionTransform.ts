import { useState, useCallback, useRef } from 'react';
import { Map as LeafletMap } from 'leaflet';
import type { ShapeProjectionData } from '../utils/shapeProjection';
import {
    initializeShapeProjection,
    updateShapeProjection,
    getCurrentGeometry,
    getProjectionInfo
} from '../utils/shapeProjection';
import type { GeoJSONGeometry } from '../utils/coordinateTransformer';
import type { LatLng } from '../utils/webMercatorUtils';

export interface UseProjectionTransformProps {
    geometry: GeoJSONGeometry;
    mapBounds: {
        southWest: LatLng;
        northEast: LatLng;
    };
    map?: LeafletMap;
}

export interface ProjectionTransformResult {
    currentGeometry: GeoJSONGeometry;
    projectionInfo: ReturnType<typeof getProjectionInfo>;
    updateProjection: (screenX: number, screenY: number) => void;
    resetProjection: () => void;
    isTransformed: boolean;
}

export function useProjectionTransform({
    geometry,
    mapBounds,
    map
}: UseProjectionTransformProps): ProjectionTransformResult {
    const [projectionData, setProjectionData] = useState<ShapeProjectionData>(() =>
        initializeShapeProjection(geometry, mapBounds)
    );
    
    const throttleRef = useRef<NodeJS.Timeout | null>(null);
    
    const updateProjection = useCallback((screenX: number, screenY: number) => {
        console.log('🔄 updateProjection called:', { screenX, screenY, hasMap: !!map });
        
        if (!map) {
            console.log('❌ No map available for projection');
            return;
        }
        
        // Throttle updates for performance (30fps)
        if (throttleRef.current) {
            clearTimeout(throttleRef.current);
        }
        
        throttleRef.current = setTimeout(() => {
            console.log('🔄 Processing projection update...');
            
            try {
                const updatedData = updateShapeProjection(projectionData, map, screenX, screenY);
                
                console.log('📊 Projection result:', {
                    hasTransform: !!updatedData.currentTransform,
                    topHorizontalScale: updatedData.currentTransform?.topHorizontalScale,
                    targetLat: updatedData.currentTransform?.centerLat,
                    hasTransformedGeometry: !!updatedData.transformedGeometry
                });
                
                setProjectionData(updatedData);
            } catch (error) {
                console.error('❌ Projection update failed:', error);
            }
        }, 32);
    }, [map, projectionData]);
    
    const resetProjection = useCallback(() => {
        setProjectionData(prev => ({
            ...prev,
            transformedGeometry: undefined,
            currentTransform: undefined
        }));
    }, []);
    
    const currentGeometry = getCurrentGeometry(projectionData);
    const projectionInfo = getProjectionInfo(projectionData);
    
    console.log('🎯 Hook state:', {
        hasCurrentTransform: !!projectionData.currentTransform,
        hasTransformedGeometry: !!projectionData.transformedGeometry,
        projectionInfoIsTransformed: projectionInfo.isTransformed,
        horizontalScale: projectionInfo.horizontalScale
    });
    
    return {
        currentGeometry,
        projectionInfo,
        updateProjection,
        resetProjection,
        isTransformed: projectionInfo.isTransformed
    };
}