import React from 'react';
import { Map as LeafletMap } from 'leaflet';
import { useProjectionTransform } from '../hooks/useProjectionTransform';

interface CountryShapeProps {
    countryId: string;
    countryData: any;
    position: { x: number; y: number };
    scale: number;
    exactDimensions: { width: number; height: number };
    map?: LeafletMap;
    onRemove: () => void;
    onPositionUpdate: (newPosition: { x: number; y: number }) => void;
}

const CountryShape: React.FC<CountryShapeProps> = ({ 
    countryId,
    countryData, 
    position, 
    scale, 
    exactDimensions,
    map,
    onRemove,
    onPositionUpdate
}) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [currentPosition, setCurrentPosition] = React.useState(position);

    // Initialize projection transform hook
    const {
        currentGeometry,
        projectionInfo,
        updateProjection,
        resetProjection,
        isTransformed
    } = useProjectionTransform({
        geometry: countryData.geometry,
        mapBounds: countryData.mapBounds,
        map
    });

    // Update position when prop changes
    React.useEffect(() => {
        setCurrentPosition(position);
    }, [position]);

    // ✅ ENHANCED: Calculate dynamic dimensions with both horizontal AND vertical scaling
    const getDynamicDimensions = () => {
        if (!isTransformed || !projectionInfo.horizontalScale) {
            return exactDimensions;
        }
        
        // Scale both dimensions based on the projection
        const newWidth = Math.round(exactDimensions.width * projectionInfo.horizontalScale);
        
        // Use vertical scale from projection info if available
        const verticalScale = projectionInfo.verticalScale || 1.0;
        const newHeight = Math.round(exactDimensions.height * verticalScale);
        
        return {
            width: Math.max(newWidth, 20), // Minimum width
            height: Math.max(newHeight, 10) // Minimum height
        };
    };

    const dynamicDimensions = getDynamicDimensions();

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        
        // Calculate offset from mouse to top-left of the element
        const rect = e.currentTarget.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (!isDragging || !map) return;

        // Calculate new position based on mouse position and offset
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // ✅ FIXED: Use dynamic dimensions for boundary calculations
        const containerWidth = dynamicDimensions.width + 40;
        const containerHeight = dynamicDimensions.height + 60;
        
        const boundedX = Math.min(Math.max(newX, 0), window.innerWidth - containerWidth);
        const boundedY = Math.min(Math.max(newY, 0), window.innerHeight - containerHeight);

        const newPosition = { x: boundedX, y: boundedY };
        setCurrentPosition(newPosition);
        onPositionUpdate(newPosition);

        // Update projection based on new screen position
        // Calculate center of the shape for projection
        const shapeCenterX = boundedX + (containerWidth / 2);
        const shapeCenterY = boundedY + (containerHeight / 2);
        updateProjection(shapeCenterX, shapeCenterY);
    }, [isDragging, dragOffset, dynamicDimensions, onPositionUpdate, updateProjection, map]);

    const handleMouseUp = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            
            // Prevent text selection while dragging
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';
        } else {
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // ✅ Calculate bounds from the current geometry (original OR transformed)
    const calculateGeometryBounds = (geometry: any) => {
        if (!geometry || !geometry.coordinates) return countryData.mapBounds;
        
        let minLng = Infinity, maxLng = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;
        
        const processCoord = (coord: number[]) => {
            const [lng, lat] = coord;
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
        };
        
        if (geometry.type === 'Polygon') {
            geometry.coordinates.forEach((ring: number[][]) => {
                ring.forEach(processCoord);
            });
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach((polygon: number[][][]) => {
                polygon.forEach((ring: number[][]) => {
                    ring.forEach(processCoord);
                });
            });
        }
        
        return {
            southWest: { lat: minLat, lng: minLng },
            northEast: { lat: maxLat, lng: maxLng }
        };
    };

    // Convert GeoJSON coordinates to SVG path using exact map projection
    const createSVGPath = (geometry: any, mapBounds: any, dimensions = dynamicDimensions) => {
        if (!geometry || !geometry.coordinates || !mapBounds) return '';

        const coords = geometry.coordinates;
        let path = '';

        // Use the exact map bounds to create precise SVG coordinates
        const { southWest, northEast } = mapBounds;
        const lonRange = northEast.lng - southWest.lng;
        const latRange = northEast.lat - southWest.lat;

        const convertCoordinate = (lng: number, lat: number) => {
            const x = ((lng - southWest.lng) / lonRange) * dimensions.width;
            const y = ((northEast.lat - lat) / latRange) * dimensions.height;
            return { x, y };
        };

        if (geometry.type === 'Polygon') {
            coords.forEach((ring: number[][]) => {
                ring.forEach((coord: number[], index: number) => {
                    const [lng, lat] = coord;
                    const { x, y } = convertCoordinate(lng, lat);
                    
                    if (index === 0) {
                        path += `M ${x} ${y}`;
                    } else {
                        path += ` L ${x} ${y}`;
                    }
                });
                path += ' Z';
            });
        } else if (geometry.type === 'MultiPolygon') {
            coords.forEach((polygon: number[][][]) => {
                polygon.forEach((ring: number[][]) => {
                    ring.forEach((coord: number[], index: number) => {
                        const [lng, lat] = coord;
                        const { x, y } = convertCoordinate(lng, lat);
                        
                        if (index === 0) {
                            path += `M ${x} ${y}`;
                        } else {
                            path += ` L ${x} ${y}`;
                        }
                    });
                    path += ' Z';
                });
            });
        }

        return path;
    };

    // ✅ FIXED: Use bounds calculated from the current geometry
    const currentBounds = calculateGeometryBounds(currentGeometry);
    const svgPath = createSVGPath(currentGeometry, currentBounds, dynamicDimensions);

    // ✅ FIXED: Calculate center point using dynamic dimensions
    const centerX = dynamicDimensions.width / 2;
    const centerY = dynamicDimensions.height / 2;

    // ✅ FIXED: Calculate font size based on dynamic dimensions
    const fontSize = Math.min(dynamicDimensions.width / 8, dynamicDimensions.height / 4, 16);

    return (
        <div
            className={`absolute select-none ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'}`}
            style={{
                left: currentPosition.x,
                top: currentPosition.y,
                width: dynamicDimensions.width + 40,
                height: dynamicDimensions.height + 60,
                zIndex: isDragging ? 1000 : 10,
                transition: isDragging ? 'none' : 'all 0.2s ease'
            }}
            onMouseDown={handleMouseDown}
        >
            {/* ✅ FIXED: Removed border for transformed shapes, cleaner styling */}
            <div className={`relative bg-white rounded-lg shadow-lg p-2 ${isDragging ? 'shadow-2xl scale-105' : ''} ${isTransformed ? '' : ''}`}>
                
                {/* Enhanced gradient projection info indicator */}
                {isTransformed && projectionInfo.horizontalScale && (
                    <div className="absolute -top-1 left-2 bg-blue-500 text-white text-xs px-1 rounded">
                        {projectionInfo.topHorizontalScale && projectionInfo.bottomHorizontalScale ? (
                            <div className="flex flex-col leading-tight">
                                <span>T:{projectionInfo.topHorizontalScale.toFixed(1)}x</span>
                                <span>B:{projectionInfo.bottomHorizontalScale.toFixed(1)}x</span>
                            </div>
                        ) : (
                            `H:${projectionInfo.horizontalScale.toFixed(1)}x`
                        )}
                    </div>
                )}
                
                <svg 
                    width={dynamicDimensions.width}
                    height={dynamicDimensions.height}
                    viewBox={`0 0 ${dynamicDimensions.width} ${dynamicDimensions.height}`}
                    className="pointer-events-none relative"
                >
                    {/* Country shape */}
                    <path
                        d={svgPath}
                        fill={isTransformed ? "#10b981" : "#3b82f6"}
                        fillOpacity="0.6"
                        stroke={isTransformed ? "#047857" : "#1d4ed8"}
                        strokeWidth="1"
                    />
                    
                    {/* Country name text */}
                    <text
                        x={centerX}
                        y={centerY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={fontSize}
                        fontWeight="bold"
                        fill="white"
                        stroke={isTransformed ? "rgba(4, 120, 87, 0.8)" : "rgba(29, 78, 216, 0.8)"}
                        strokeWidth="0.5"
                        style={{ 
                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))'
                        }}
                    >
                        {countryData.name}
                    </text>

                    {/* ✅ NEW: X button positioned within the shape (top-right area) */}
                    <g>
                        {/* Semi-transparent background circle for better visibility */}
                        <circle
                            cx={dynamicDimensions.width - 15}
                            cy={15}
                            r="12"
                            fill="rgba(239, 68, 68, 0.9)"
                            stroke="white"
                            strokeWidth="1"
                            className="cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            style={{ pointerEvents: 'all' }}
                        />
                        {/* X symbol */}
                        <text
                            x={dynamicDimensions.width - 15}
                            y={15}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="14"
                            fontWeight="bold"
                            fill="white"
                            className="cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            style={{ 
                                pointerEvents: 'all',
                                userSelect: 'none'
                            }}
                        >
                            ×
                        </text>
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default CountryShape;