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

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'map',
    item: { mapData },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleDrag = (e: MouseEvent) => {
    if (mapRef.current) {
      const newX = position.x + e.movementX;
      const newY = position.y + e.movementY;
      setPosition({ x: newX, y: newY });
    }
  };

  useEffect(() => {
    const mapElement = mapRef.current;
    if (mapElement) {
      mapElement.addEventListener('mousemove', handleDrag);
      return () => {
        mapElement.removeEventListener('mousemove', handleDrag);
      };
    }
  }, [position]);

  // You can use projectionSettings here as needed for projection logic

  return (
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
      }}
    >
      <img src={mapData.imageUrl} alt={mapData.name} />
    </div>
  );
};

export default MapDragger;