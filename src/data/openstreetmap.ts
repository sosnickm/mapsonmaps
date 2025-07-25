import axios from 'axios';

const OSM_API_URL = 'https://api.openstreetmap.org/api/0.6/';

// Function to fetch map data for a specific location
export const fetchMapData = async (lat: number, lon: number) => {
    try {
        const response = await axios.get(`${OSM_API_URL}map?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching map data:', error);
        throw error;
    }
};

// Function to parse the fetched OSM data
export const parseOSMData = (data: any) => {
    // Implement parsing logic here
    // This is a placeholder for actual parsing logic
    return data;
};

// Constants for map styles or other configurations
export const MAP_STYLES = {
    default: {
        color: '#000',
        weight: 1,
    },
    highlighted: {
        color: '#ff0000',
        weight: 2,
    },
};