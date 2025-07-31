import React, { useRef, useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getRealSize } from '../utils/projections';
import type { MapData } from '../types/index.js';

interface MapDraggerProps {
  mapData: MapData;
  projectionSettings: any; // Replace 'any' with a more specific type if you have one
}

const MapDragger: React.FC<MapDraggerProps> = ({ mapData, projectionSettings }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'map',
    item: { mapData },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Function to calculate geographic boundary constraints based on latitude
  const calculateGeographicBounds = (newX: number, newY: number) => {
    if (!mapRef.current || !containerRef.current) return { x: newX, y: newY };

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Calculate the actual map dimensions
    const mapWidth = getRealSize(mapData).width;
    const mapHeight = getRealSize(mapData).height;
    
    // Calculate container dimensions
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // Calculate what latitude range is currently visible based on position
    // Assuming the map covers the full world (-90 to +90 degrees latitude)
    const totalLatitudeDegrees = 180; // From -90° to +90°
    const degreesPerPixel = totalLatitudeDegrees / mapHeight;
    
    // Calculate the latitude at the top of the map when positioned at newY
    // When newY = 0, the top of the map shows 90°N
    // When newY is negative, we're showing latitudes > 90°N (which shouldn't happen)
    const topOfMapLatitude = 90 + (newY * degreesPerPixel);
    
    // Calculate the latitude at the bottom of the visible container
    const bottomOfVisibleAreaLatitude = topOfMapLatitude - (containerHeight * degreesPerPixel);
    
    let constrainedY = newY;
    
    // Prevent showing beyond North Pole (90°N)
    if (topOfMapLatitude > 90) {
      // Calculate how much we need to adjust Y to keep top at 90°N
      constrainedY = 0; // Keep the top of the map at the container top
    }
    
    // Prevent showing beyond South Pole (-90°S)  
    if (bottomOfVisibleAreaLatitude < -90) {
      // Calculate Y position where bottom visible area shows exactly -90°S
      const targetTopLatitude = -90 + (containerHeight * degreesPerPixel);
      constrainedY = (90 - targetTopLatitude) / degreesPerPixel;
    }
    
    // X-axis constraints (longitude) - keep existing pixel-based logic
    let constrainedX = newX;
    if (mapWidth > containerWidth) {
      const maxX = 0;
      const minX = containerWidth - mapWidth;
      constrainedX = Math.max(minX, Math.min(maxX, newX));
    }
    
    // Debug logging (remove in production)
    console.log(`Position: (${newX.toFixed(1)}, ${newY.toFixed(1)}) -> (${constrainedX.toFixed(1)}, ${constrainedY.toFixed(1)})`);
    console.log(`Top latitude: ${topOfMapLatitude.toFixed(1)}°, Bottom latitude: ${bottomOfVisibleAreaLatitude.toFixed(1)}°`);
    
    return { x: constrainedX, y: constrainedY };
  };

  useEffect(() => {
    const mapElement = mapRef.current;
    
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX - position.x;
      const startY = e.clientY - position.y;
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newX = moveEvent.clientX - startX;
        const newY = moveEvent.clientY - startY;
        
        // Apply boundary constraints
        const constrainedPosition = calculateGeographicBounds(newX, newY);
        setPosition(constrainedPosition);
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    if (mapElement) {
      mapElement.addEventListener('mousedown', handleMouseDown);
      return () => {
        mapElement.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, [position]);

  // Recalculate bounds when window resizes or component mounts
  useEffect(() => {
    const handleResize = () => {
      // Reset position within bounds when window resizes
      const constrainedPosition = calculateGeographicBounds(position.x, position.y);
      if (constrainedPosition.x !== position.x || constrainedPosition.y !== position.y) {
        setPosition(constrainedPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    // Also run on mount to ensure initial position is within bounds
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mapData]); // Re-run when mapData changes

  // You can use projectionSettings here as needed for projection logic

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div
        ref={(node) => {
          drag(node);
          mapRef.current = node;
        }}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab',
          width: getRealSize(mapData).width,
          height: getRealSize(mapData).height,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <img 
          src={mapData.imageUrl} 
          alt={mapData.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
};

export default MapDragger;