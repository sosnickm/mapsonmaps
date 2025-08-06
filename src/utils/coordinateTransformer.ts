import type { ProjectionTransform } from './webMercatorUtils';
import { calculateScaleAtLatitude } from './webMercatorUtils';

export interface GeoJSONGeometry {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
}

export interface TransformedGeometry extends GeoJSONGeometry {
    originalBounds: {
        minLng: number;
        maxLng: number;
        minLat: number;
        maxLat: number;
    };
}

/**
 * Transform a single coordinate pair with gradient distortion using 20% inset reference
 */
function transformCoordinateWithGradient(
    coordinate: [number, number],
    originalCenter: { lng: number; lat: number },
    transform: ProjectionTransform
): [number, number] {
    const [lng, lat] = coordinate;
    
    // Calculate relative position from original center
    const relativeLng = lng - originalCenter.lng;
    const relativeLat = lat - originalCenter.lat;
    
    // Calculate the new latitude for this coordinate
    const newLatitude = transform.centerLat + relativeLat;
    
    // ✅ IMPROVED: Calculate interpolation factor based on position within the effective range
    // The effective range is between our 20% inset points
    const effectiveLatRange = Math.abs(transform.topLatitude - transform.bottomLatitude);
    
    // Clamp the latitude to the effective range and calculate factor
    const clampedLat = Math.max(
        Math.min(newLatitude, Math.max(transform.topLatitude, transform.bottomLatitude)),
        Math.min(transform.topLatitude, transform.bottomLatitude)
    );
    
    const factor = effectiveLatRange > 0 ? 
        Math.abs(clampedLat - transform.topLatitude) / effectiveLatRange : 0;
    
    // Interpolate between top and bottom scaling factors
    const horizontalScale = transform.topHorizontalScale + 
        (transform.bottomHorizontalScale - transform.topHorizontalScale) * factor;
    const verticalScale = transform.topVerticalScale + 
        (transform.bottomVerticalScale - transform.topVerticalScale) * factor;
    
    // ✅ ENHANCED: Apply smoothing to reduce sharp transitions
    const smoothingFactor = 0.8; // Reduces the intensity of the gradient effect
    const smoothedHorizontalScale = 1 + (horizontalScale - 1) * smoothingFactor;
    const smoothedVerticalScale = 1 + (verticalScale - 1) * smoothingFactor;
    
    // Apply the latitude-specific scaling
    const transformedLng = (relativeLng * smoothedHorizontalScale) + transform.centerLng;
    const transformedLat = (relativeLat * smoothedVerticalScale) + transform.centerLat;
    
    return [transformedLng, transformedLat];
}

/**
 * Transform a ring of coordinates with gradient distortion
 */
function transformRingWithGradient(
    ring: number[][],
    originalCenter: { lng: number; lat: number },
    transform: ProjectionTransform
): number[][] {
    return ring.map(coord => 
        transformCoordinateWithGradient(coord as [number, number], originalCenter, transform)
    );
}

/**
 * Transform a polygon with gradient distortion
 */
function transformPolygonWithGradient(
    polygon: number[][][],
    originalCenter: { lng: number; lat: number },
    transform: ProjectionTransform
): number[][][] {
    return polygon.map(ring => transformRingWithGradient(ring, originalCenter, transform));
}

/**
 * Calculate the original bounds of a geometry
 */
function calculateBounds(geometry: GeoJSONGeometry): {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
} {
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    const processCoordinate = (coord: number[]) => {
        const [lng, lat] = coord;
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
    };
    
    if (geometry.type === 'Polygon') {
        const coords = geometry.coordinates as number[][][];
        coords.forEach(ring => ring.forEach(processCoordinate));
    } else if (geometry.type === 'MultiPolygon') {
        const coords = geometry.coordinates as number[][][][];
        coords.forEach(polygon => 
            polygon.forEach(ring => 
                ring.forEach(processCoordinate)
            )
        );
    }
    
    return { minLng, maxLng, minLat, maxLat };
}

/**
 * Main function to transform GeoJSON geometry with gradient projection
 */
export function transformGeometry(
    geometry: GeoJSONGeometry,
    originalCenter: { lng: number; lat: number },
    transform: ProjectionTransform
): TransformedGeometry {
    const originalBounds = calculateBounds(geometry);
    
    let transformedCoordinates: number[][][] | number[][][][];
    
    if (geometry.type === 'Polygon') {
        transformedCoordinates = transformPolygonWithGradient(
            geometry.coordinates as number[][][],
            originalCenter,
            transform
        );
    } else if (geometry.type === 'MultiPolygon') {
        const coords = geometry.coordinates as number[][][][];
        transformedCoordinates = coords.map(polygon => 
            transformPolygonWithGradient(polygon, originalCenter, transform)
        );
    } else {
        throw new Error(`Unsupported geometry type: ${geometry.type}`);
    }
    
    return {
        type: geometry.type,
        coordinates: transformedCoordinates,
        originalBounds
    };
}

/**
 * Create a throttled version of the transform function for performance
 */
export function createThrottledTransformer(delay: number = 32) {
    let lastCall = 0;
    let timeoutId: NodeJS.Timeout | null = null;
    
    return function throttledTransform(
        geometry: GeoJSONGeometry,
        originalCenter: { lng: number; lat: number },
        transform: ProjectionTransform,
        callback: (result: TransformedGeometry) => void
    ) {
        const now = Date.now();
        
        if (now - lastCall >= delay) {
            lastCall = now;
            const result = transformGeometry(geometry, originalCenter, transform);
            callback(result);
        } else {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                lastCall = Date.now();
                const result = transformGeometry(geometry, originalCenter, transform);
                callback(result);
            }, delay - (now - lastCall));
        }
    };
}