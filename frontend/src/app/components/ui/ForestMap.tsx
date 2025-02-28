import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  Pin
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Circle } from './Circle';

// Default center on India
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 5;

interface ForestLocation {
  name: string;
  lat: number;
  lng: number;
}

interface ForestMapProps {
  forestLocations?: ForestLocation[];
  onLocationSelect?: (location: string) => void;
}

const ForestMap: React.FC<ForestMapProps> = ({ forestLocations = [], onLocationSelect }) => {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
        <Map
          defaultZoom={DEFAULT_ZOOM}
          defaultCenter={DEFAULT_CENTER}
          mapId="da37f3254c6a6d1c"
          className="w-full h-full"
        >
          <ForestMarkers 
            locations={forestLocations} 
            onLocationSelect={onLocationSelect}
          />
        </Map>
      </APIProvider>
    </div>
  );
};

interface ForestMarkersProps {
  locations: ForestLocation[];
  onLocationSelect?: (location: string) => void;
}

const ForestMarkers: React.FC<ForestMarkersProps> = ({ locations, onLocationSelect }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker | null }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);
  const [circleCenter, setCircleCenter] = useState<google.maps.LatLng | null>(null);

  const handleClick = useCallback((ev: google.maps.MapMouseEvent, location: string) => {
    if (!map || !ev.latLng) return;
    map.panTo(ev.latLng);
    setCircleCenter(ev.latLng);
    
    if (onLocationSelect) {
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
    clusterer.current?.addMarkers(Object.values(markers).filter(Boolean) as google.maps.Marker[]);
  }, [markers]);

  const setMarkerRef = (marker: google.maps.Marker | null, key: string) => {
    setMarkers(prev => {
      if (marker) {
        return { ...prev, [key]: marker };
      }
      const newMarkers = { ...prev };
      delete newMarkers[key];
      return newMarkers;
    });
  };

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
        center={circleCenter as google.maps.LatLng}
        strokeColor={'#15803d'}
        strokeOpacity={1}
        strokeWeight={3}
        fillColor={'#22c55e'}
        fillOpacity={0.3}
      />
      {locations.map((location, index) => (
        <AdvancedMarker
          key={`${location.name}-${index}`}
          position={{ lat: location.lat, lng: location.lng }}
          ref={(marker) => setMarkerRef(marker as unknown as google.maps.Marker, `${location.name}-${index}`)}
          onClick={(ev) => handleClick(ev as google.maps.MapMouseEvent, location.name)}
          title={location.name}
        >
          <Pin background={'#15803d'} glyphColor={'#fff'} borderColor={'#064e3b'} />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default ForestMap;
