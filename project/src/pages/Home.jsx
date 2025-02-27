import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TreePine, BarChart3, Map as MapIcon, AlertTriangle } from 'lucide-react';
import ForestMap from '../components/ForestMap';

const Home = ({ locations = [] }) => {
  const [forestLocations, setForestLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Convert location names to map coordinates
    if (Array.isArray(locations) && locations.length > 0) {
      // This is a simplified example - in a real app, you'd get actual coordinates
      const locationCoordinates = {
        'kerala': { lat: 10.8505, lng: 76.2711 },
        'karnataka': { lat: 15.3173, lng: 75.7139 },
        'tamil nadu': { lat: 11.1271, lng: 78.6569 },
        'maharashtra': { lat: 19.7515, lng: 75.7139 },
        'gujarat': { lat: 22.2587, lng: 71.1924 },
        'rajasthan': { lat: 27.0238, lng: 74.2179 },
        'punjab': { lat: 31.1471, lng: 75.3412 },
        'assam': { lat: 26.2006, lng: 92.9376 },
        'odisha': { lat: 20.9517, lng: 85.0985 },
        'west bengal': { lat: 22.9868, lng: 87.8550 },
      };

      const mappedLocations = locations.map(loc => ({
        name: loc,
        lat: locationCoordinates[loc.toLowerCase()]?.lat || 20.5937,
        lng: locationCoordinates[loc.toLowerCase()]?.lng || 78.9629
      }));

      setForestLocations(mappedLocations);
    }
    setIsLoading(false);
  }, [locations]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!Array.isArray(locations) || locations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No locations available at the moment. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-96 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")' }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Monitoring India's Forest Health
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl">
            Track tree cover changes, carbon emissions, and forest health across states and districts.
          </p>
          <Link 
            to="/dashboard" 
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg inline-block transition-colors w-max"
          >
            Explore Dashboard
          </Link>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Explore Forest Regions</h2>
          
          <div className="mb-8">
            <ForestMap 
              forestLocations={forestLocations} 
              onLocationSelect={handleLocationSelect}
            />
          </div>
          
          {selectedLocation && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <TreePine className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Selected location: <span className="font-bold capitalize">{selectedLocation}</span>
                  </p>
                  <Link 
                    to="/dashboard" 
                    className="text-sm text-green-700 underline hover:text-green-800"
                  >
                    View detailed data for this location
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <MapIcon size={32} className="text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Interactive Maps</h3>
              <p className="text-gray-600 text-center">
                Visualize forest cover changes across different regions of India with interactive maps.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <BarChart3 size={32} className="text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Data Analytics</h3>
              <p className="text-gray-600 text-center">
                Analyze trends in forest loss, carbon emissions, and tree cover gain over time.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <AlertTriangle size={32} className="text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Health Monitoring</h3>
              <p className="text-gray-600 text-center">
                Track forest health status and identify areas of concern for conservation efforts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Locations */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Available Locations</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {locations.map((location, index) => (
              <Link 
                key={index}
                to="/dashboard"
                state={{ selectedLocation: location }}
                className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="flex justify-center mb-2">
                  <TreePine size={24} className="text-green-600" />
                </div>
                <span className="font-medium capitalize">{location}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Explore Forest Data?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Dive into our interactive dashboard to discover insights about India's forests and contribute to conservation efforts.
          </p>
          <Link 
            to="/dashboard" 
            className="bg-white text-green-700 hover:bg-gray-100 font-medium px-6 py-3 rounded-lg inline-block transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;