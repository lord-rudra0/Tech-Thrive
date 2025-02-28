export interface LocationData {
    name: string;
    id: string;
  }
  
  export interface DensityData {
    location: string;
    density: number;
    population?: number;
    area?: number;
  }
  
  export interface DensityOption {
    value: string;
    label: string;
  }
  
  export interface LocationsResponse {
    states: LocationData[];
    districts: LocationData[];
  }
  
  // Fetch available locations
  export async function fetchLocations(): Promise<LocationData[]> {
    try {
      const response = await fetch('https://tech-thrive.onrender.com/data/available-locations');
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data: LocationsResponse = await response.json();
      
      // The API returns an object with states and districts arrays
      // We'll return the appropriate array based on the context
      return [...(data.states || []), ...(data.districts || [])];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }
  
  // Fetch available density options for a location
  export async function fetchDensityOptions(location: string): Promise<DensityOption[]> {
    try {
      const response = await fetch(`https://tech-thrive.onrender.com/data/densities?location=${location}`);
      if (!response.ok) {
        throw new Error('Failed to fetch density options');
      }
      const data = await response.json();
      
      // Handle both array and object responses
      const densities = Array.isArray(data) ? data : data.densities || [];
      
      return densities.map((density: string) => ({
        value: density,
        label: formatDensityLabel(density),
      }));
    } catch (error) {
      console.error('Error fetching density options:', error);
      return [];
    }
  }
  
  // Fetch data for a specific location and density
  export async function fetchLocationData(
    locationType: 'state' | 'district' | 'india',
    locationName: string,
    density: string
  ): Promise<DensityData[]> {
    try {
      let url = '';
      
      if (locationType === 'india') {
        url = `https://tech-thrive.onrender.com/data/india/${density}`;
      } else if (locationType === 'state') {
        url = `https://tech-thrive.onrender.com/data/state/${locationName}/${density}`;
      } else if (locationType === 'district') {
        url = `https://tech-thrive.onrender.com/data/district/${locationName}/${density}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${locationType} data`);
      }
      const data = await response.json();
      
      // Handle both array and object responses
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error(`Error fetching ${locationType} data:`, error);
      return [];
    }
  }
  
  // Helper function to format density labels
  function formatDensityLabel(density: string): string {
    return density
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }