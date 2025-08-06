import { Map as LeafletMap } from 'leaflet';
import type { LatLng } from './webMercatorUtils';
import { 
    calculateCenter, 
    createGradientProjectionTransform, // ✅ NEW gradient function
    getDistortionInfo
} from './webMercatorUtils';
import type { ProjectionTransform } from './webMercatorUtils';
import type { GeoJSONGeometry, TransformedGeometry } from './coordinateTransformer';
import { transformGeometry } from './coordinateTransformer';

export interface ShapeProjectionData {
    originalGeometry: GeoJSONGeometry;
    originalCenter: LatLng;
    originalBounds: {
        southWest: LatLng;
        northEast: LatLng;
    };
    transformedGeometry?: TransformedGeometry;
    currentTransform?: ProjectionTransform;
}

/**
 * Convert screen position to map coordinates
 */
export function screenToMapCoordinates(
    map: LeafletMap,
    screenX: number,
    screenY: number
): LatLng {
    try {
        const point = map.containerPointToLatLng([screenX, screenY]);
        return {
            lat: point.lat,
            lng: point.lng
        };
    } catch (error) {
        console.error('❌ Screen to map conversion failed:', error);
        return { lat: 0, lng: 0 };
    }
}

/**
 * Initialize projection data for a country shape
 */
export function initializeShapeProjection(
    geometry: GeoJSONGeometry,
    mapBounds: {
        southWest: LatLng;
        northEast: LatLng;
    }
): ShapeProjectionData {
    const originalCenter = calculateCenter(mapBounds);
    
    return {
        originalGeometry: geometry,
        originalCenter,
        originalBounds: mapBounds,
        transformedGeometry: undefined,
        currentTransform: undefined
    };
}

/**
 * Update shape projection with gradient distortion (20% inset)
 */
export function updateShapeProjection(
    projectionData: ShapeProjectionData,
    map: LeafletMap,
    screenX: number,
    screenY: number
): ShapeProjectionData {
    try {
        // Convert screen position to map coordinates
        const targetCenter = screenToMapCoordinates(map, screenX, screenY);
        
        // Create gradient projection transform using original bounds with 20% inset
        const transform = createGradientProjectionTransform(
            projectionData.originalBounds,
            targetCenter
        );
        
        console.log('🌈 Gradient transform (20% inset):', {
            targetCenter,
            topLat: transform.topLatitude.toFixed(2),
            bottomLat: transform.bottomLatitude.toFixed(2),
            topHScale: transform.topHorizontalScale.toFixed(2),
            bottomHScale: transform.bottomHorizontalScale.toFixed(2),
            scaleRange: Math.abs(transform.topHorizontalScale - transform.bottomHorizontalScale).toFixed(2)
        });
        
        // Transform the geometry with gradient distortion
        const transformedGeometry = transformGeometry(
            projectionData.originalGeometry,
            {
                lng: projectionData.originalCenter.lng,
                lat: projectionData.originalCenter.lat
            },
            transform
        );
        
        return {
            ...projectionData,
            transformedGeometry,
            currentTransform: transform
        };
    } catch (error) {
        console.warn('Error updating shape projection:', error);
        return projectionData;
    }
}

/**
 * Get the current geometry (transformed or original)
 */
export function getCurrentGeometry(projectionData: ShapeProjectionData): GeoJSONGeometry {
    return projectionData.transformedGeometry || projectionData.originalGeometry;
}

/**
 * Get projection info for debugging with gradient information
 */
export function getProjectionInfo(projectionData: ShapeProjectionData): {
    isTransformed: boolean;
    horizontalScale?: number;
    verticalScale?: number;
    topHorizontalScale?: number;
    bottomHorizontalScale?: number;
    targetLatitude?: number;
    distortionDescription?: string;
} {
    if (!projectionData.currentTransform) {
        return { isTransformed: false };
    }
    
    const distortionInfo = getDistortionInfo(projectionData.currentTransform);
    
    return {
        isTransformed: true,
        horizontalScale: distortionInfo.averageHorizontalScale,
        verticalScale: distortionInfo.averageVerticalScale,
        topHorizontalScale: distortionInfo.topHorizontalScale,
        bottomHorizontalScale: distortionInfo.bottomHorizontalScale,
        targetLatitude: projectionData.currentTransform.centerLat,
        distortionDescription: distortionInfo.description
    };
}