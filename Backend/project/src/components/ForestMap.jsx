import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 10.8505,
  lng: 76.2711
};

function ForestMap() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  if (loadError) {
    console.error('Map load error:', loadError);
    return <div>Error loading maps</div>;
  }
  
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={7}
        center={center}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
      </GoogleMap>
    </div>
  );
}

const ForestMarkers = ({ locations, onLocationSelect }) => {
  const map = useMap();
  const [markers, setMarkers] = useState({});
  const clusterer = useRef(null);
  const [circleCenter, setCircleCenter] = useState(null);

  const handleClick = useCallback((ev, location) => {
    if (!map || !ev.latLng) return;
    map.panTo(ev.latLng);
    setCircleCenter(ev.latLng);
    
    if (onLocationSelect && location) {
      onLocationSelect(location);
    }
  }, [map, onLocationSelect]);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker, key) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers(prev => {
      if (marker) {
        return { ...prev, [key]: marker };
      }
      const newMarkers = { ...prev };
      delete newMarkers[key];
      return newMarkers;
    });
  };

  // If no locations provided, show a message
  if (!locations || locations.length === 0) {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-md">
        <p className="text-gray-700">Loading forest locations...</p>
      </div>
    );
  }

  return (
    <>
      <Circle
        radius={50000} // 50km radius
        center={circleCenter}
        strokeColor={'#15803d'} // Green stroke
        strokeOpacity={1}
        strokeWeight={3}
        fillColor={'#22c55e'} // Lighter green fill
        fillOpacity={0.3}
      />
      {locations.map((location, index) => (
        <AdvancedMarker
          key={`${location.name}-${index}`}
          position={{ lat: location.lat, lng: location.lng }}
          ref={marker => setMarkerRef(marker, `${location.name}-${index}`)}
          onClick={(ev) => handleClick(ev, location.name)}
          title={location.name}
        >
          <Pin background={'#15803d'} glyphColor={'#fff'} borderColor={'#064e3b'} />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default ForestMap;