export function mercatorProjection(lat: number, lon: number): { x: number; y: number } {
    const R = 6378137; // Radius of the Earth in meters
    const x = R * lon * (Math.PI / 180);
    const y = R * Math.log(Math.tan((Math.PI / 4) + (lat * (Math.PI / 180)) / 2));
    return { x, y };
}

export function inverseMercatorProjection(x: number, y: number): { lat: number; lon: number } {
    const R = 6378137; // Radius of the Earth in meters
    const lon = (x / R) * (180 / Math.PI);
    const lat = (Math.atan(Math.exp(y / R)) * 2 - Math.PI / 2) * (180 / Math.PI);
    return { lat, lon };
}

export function scaleCoordinates(coords: { x: number; y: number }, scale: number): { x: number; y: number } {
    return {
        x: coords.x * scale,
        y: coords.y * scale,
    };
}

export function translateCoordinates(coords: { x: number; y: number }, dx: number, dy: number): { x: number; y: number } {
    return {
        x: coords.x + dx,
        y: coords.y + dy,
    };
}

export function getRealSize(mapData: any): { width: number; height: number } {
  // Replace with your actual implementation
  return { width: 100, height: 100 };
}