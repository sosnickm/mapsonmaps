export interface MapData {
    id: string;
    name: string;
    imageUrl: string;
    coordinates: number[]; // [latitude, longitude]
    bounds: {
        northEast: number[];
        southWest: number[];
    };
}

export interface ProjectionSettings {
    type: string; // e.g., 'Mercator', 'Equirectangular'
    scale: number;
    center: number[]; // [latitude, longitude]
}

export interface UserSelection {
    city: string;
    state?: string;
    country?: string;
}