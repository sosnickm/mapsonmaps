import React from 'react';

interface CountryShapeProps {
    countryId: string;
    countryData: any;
    position: { x: number; y: number };
    scale: number;
    exactDimensions: { width: number; height: number };
    onRemove: () => void;
    onPositionUpdate: (newPosition: { x: number; y: number }) => void;
}

const CountryShape: React.FC<CountryShapeProps> = ({ 
    countryId,
    countryData, 
    position, 
    scale, 
    exactDimensions,
    onRemove,
    onPositionUpdate
}) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [currentPosition, setCurrentPosition] = React.useState(position);

    // Update position when prop changes
    React.useEffect(() => {
        setCurrentPosition(position);
    }, [position]);

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
        if (!isDragging) return;

        // Calculate new position based on mouse position and offset
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Keep the shape within screen bounds
        const containerWidth = exactDimensions.width + 40;
        const containerHeight = exactDimensions.height + 60;
        
        const boundedX = Math.min(Math.max(newX, 0), window.innerWidth - containerWidth);
        const boundedY = Math.min(Math.max(newY, 0), window.innerHeight - containerHeight);

        const newPosition = { x: boundedX, y: boundedY };
        setCurrentPosition(newPosition);
        onPositionUpdate(newPosition);
    }, [isDragging, dragOffset, exactDimensions, onPositionUpdate]);

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

    // Convert GeoJSON coordinates to SVG path using exact map projection
    const createSVGPath = (geometry: any, mapBounds: any) => {
        if (!geometry || !geometry.coordinates || !mapBounds) return '';

        const coords = geometry.coordinates;
        let path = '';

        // Use the exact map bounds to create precise SVG coordinates
        const { southWest, northEast } = mapBounds;
        const lonRange = northEast.lng - southWest.lng;
        const latRange = northEast.lat - southWest.lat;

        const convertCoordinate = (lng: number, lat: number) => {
            const x = ((lng - southWest.lng) / lonRange) * exactDimensions.width;
            const y = ((northEast.lat - lat) / latRange) * exactDimensions.height;
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

    const svgPath = createSVGPath(countryData.geometry, countryData.mapBounds);

    // Calculate center point for text positioning
    const centerX = exactDimensions.width / 2;
    const centerY = exactDimensions.height / 2;

    // Calculate appropriate font size based on country size
    const fontSize = Math.min(exactDimensions.width / 8, exactDimensions.height / 4, 16);

    return (
        <div
            className={`absolute select-none ${isDragging ? 'cursor-grabbing z-50' : 'cursor-grab'}`}
            style={{
                left: currentPosition.x,
                top: currentPosition.y,
                width: exactDimensions.width + 40,
                height: exactDimensions.height + 60,
                zIndex: isDragging ? 1000 : 10, // Higher z-index when dragging
                transition: isDragging ? 'none' : 'all 0.2s ease'
            }}
            onMouseDown={handleMouseDown}
        >
            <div className={`relative bg-white rounded-lg shadow-lg p-2 ${isDragging ? 'shadow-2xl scale-105' : ''}`}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 z-10"
                >
                    ×
                </button>
                <svg 
                    width={exactDimensions.width} 
                    height={exactDimensions.height} 
                    viewBox={`0 0 ${exactDimensions.width} ${exactDimensions.height}`}
                    className="pointer-events-none" // Prevent SVG from interfering with drag
                >
                    {/* Country shape */}
                    <path
                        d={svgPath}
                        fill="#3b82f6"
                        fillOpacity="0.6"
                        stroke="#1d4ed8"
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
                        stroke="rgba(29, 78, 216, 0.8)"
                        strokeWidth="0.5"
                        style={{ 
                            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.7))'
                        }}
                    >
                        {countryData.name}
                    </text>
                </svg>
            </div>
        </div>
    );
};

export default CountryShape;