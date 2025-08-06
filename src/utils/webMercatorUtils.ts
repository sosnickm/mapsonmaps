/**
 * Web Mercator projection utilities for real-time shape transformation
 */

export interface LatLng {
    lat: number;
    lng: number;
}

export interface ProjectionTransform {
    // Instead of single scale factors, we now have gradient scaling
    topLatitude: number;
    bottomLatitude: number;
    topHorizontalScale: number;
    bottomHorizontalScale: number;
    topVerticalScale: number;
    bottomVerticalScale: number;
    centerLat: number;
    centerLng: number;
}

/**
 * Calculate the horizontal distortion factor at a given latitude for Web Mercator projection
 */
export function calculateHorizontalScale(latitude: number): number {
    const clampedLat = Math.max(-85, Math.min(85, latitude));
    const latRad = (clampedLat * Math.PI) / 180;
    return 1 / Math.cos(latRad);
}

/**
 * Calculate vertical scale factor for Web Mercator projection
 */
export function calculateVerticalScale(latitude: number): number {
    const clampedLat = Math.max(-85, Math.min(85, latitude));
    const latRad = (clampedLat * Math.PI) / 180;
    return 1 + (Math.abs(Math.tan(latRad)) * 0.3);
}

/**
 * Interpolate between two values based on position
 */
export function interpolate(value1: number, value2: number, factor: number): number {
    return value1 + (value2 - value1) * factor;
}

/**
 * Calculate scaling factors for a specific latitude within a range
 */
export function calculateScaleAtLatitude(
    latitude: number,
    topLat: number,
    bottomLat: number,
    topHorizontalScale: number,
    bottomHorizontalScale: number,
    topVerticalScale: number,
    bottomVerticalScale: number
): { horizontalScale: number; verticalScale: number } {
    // Calculate interpolation factor (0 = top, 1 = bottom)
    const latRange = Math.abs(topLat - bottomLat);
    const factor = latRange > 0 ? Math.abs(latitude - topLat) / latRange : 0;
    
    return {
        horizontalScale: interpolate(topHorizontalScale, bottomHorizontalScale, factor),
        verticalScale: interpolate(topVerticalScale, bottomVerticalScale, factor)
    };
}

/**
 * Calculate the bounding box center point
 */
export function calculateCenter(bounds: { southWest: LatLng; northEast: LatLng }): LatLng {
    return {
        lat: (bounds.southWest.lat + bounds.northEast.lat) / 2,
        lng: (bounds.southWest.lng + bounds.northEast.lng) / 2
    };
}

/**
 * Create a gradient projection transform for a shape moved to a new position
 * Uses 20% inset from top/bottom to avoid extreme distortion at edges
 */
export function createGradientProjectionTransform(
    originalBounds: { southWest: LatLng; northEast: LatLng },
    targetCenter: LatLng
): ProjectionTransform {
    // Calculate the original shape's latitude span
    const originalLatSpan = originalBounds.northEast.lat - originalBounds.southWest.lat;
    const originalLngSpan = originalBounds.northEast.lng - originalBounds.southWest.lng;
    
    // Calculate where the shape will be positioned
    const newTopLat = targetCenter.lat + (originalLatSpan / 2);
    const newBottomLat = targetCenter.lat - (originalLatSpan / 2);
    
    // ✅ NEW: Use 20% inset from edges for more realistic gradient
    const latSpanFor20Percent = originalLatSpan * 0.2;
    const effectiveTopLat = newTopLat - latSpanFor20Percent;      // 20% down from top
    const effectiveBottomLat = newBottomLat + latSpanFor20Percent; // 20% up from bottom
    
    // Calculate original reference points (also 20% inset)
    const originalEffectiveTopLat = originalBounds.northEast.lat - latSpanFor20Percent;
    const originalEffectiveBottomLat = originalBounds.southWest.lat + latSpanFor20Percent;
    
    // Get original scaling factors at the 20% inset points
    const originalTopHorizontal = calculateHorizontalScale(originalEffectiveTopLat);
    const originalBottomHorizontal = calculateHorizontalScale(originalEffectiveBottomLat);
    const originalTopVertical = calculateVerticalScale(originalEffectiveTopLat);
    const originalBottomVertical = calculateVerticalScale(originalEffectiveBottomLat);
    
    // Get new scaling factors at the 20% inset points
    const newTopHorizontal = calculateHorizontalScale(effectiveTopLat);
    const newBottomHorizontal = calculateHorizontalScale(effectiveBottomLat);
    const newTopVertical = calculateVerticalScale(effectiveTopLat);
    const newBottomVertical = calculateVerticalScale(effectiveBottomLat);
    
    console.log('🎯 Gradient calculation (20% inset):', {
        originalTop: originalBounds.northEast.lat.toFixed(2),
        originalBottom: originalBounds.southWest.lat.toFixed(2),
        effectiveTop: effectiveTopLat.toFixed(2),
        effectiveBottom: effectiveBottomLat.toFixed(2),
        topScale: (newTopHorizontal / originalTopHorizontal).toFixed(2),
        bottomScale: (newBottomHorizontal / originalBottomHorizontal).toFixed(2)
    });
    
    return {
        topLatitude: effectiveTopLat,
        bottomLatitude: effectiveBottomLat,
        topHorizontalScale: newTopHorizontal / originalTopHorizontal,
        bottomHorizontalScale: newBottomHorizontal / originalBottomHorizontal,
        topVerticalScale: newTopVertical / originalTopVertical,
        bottomVerticalScale: newBottomVertical / originalBottomVertical,
        centerLat: targetCenter.lat,
        centerLng: targetCenter.lng
    };
}

/**
 * Get distortion info for debugging with 20% inset information
 */
export function getDistortionInfo(transform: ProjectionTransform): {
    topHorizontalScale: number;
    bottomHorizontalScale: number;
    topVerticalScale: number;
    bottomVerticalScale: number;
    averageHorizontalScale: number;
    averageVerticalScale: number;
    distortionRange: number;
    description: string;
} {
    const avgHorizontal = (transform.topHorizontalScale + transform.bottomHorizontalScale) / 2;
    const avgVertical = (transform.topVerticalScale + transform.bottomVerticalScale) / 2;
    const distortionRange = Math.abs(transform.topHorizontalScale - transform.bottomHorizontalScale);
    
    let description = '';
    if (avgHorizontal < 1.1) {
        description = 'Minimal distortion';
    } else if (avgHorizontal < 1.3) {
        description = 'Light distortion';
    } else if (avgHorizontal < 1.6) {
        description = 'Moderate distortion';
    } else {
        description = 'Heavy distortion';
    }
    
    // Add gradient information
    if (distortionRange > 0.2) {
        description += ' (gradient)';
    }
    
    return {
        topHorizontalScale: transform.topHorizontalScale,
        bottomHorizontalScale: transform.bottomHorizontalScale,
        topVerticalScale: transform.topVerticalScale,
        bottomVerticalScale: transform.bottomVerticalScale,
        averageHorizontalScale: avgHorizontal,
        averageVerticalScale: avgVertical,
        distortionRange,
        description
    };
}