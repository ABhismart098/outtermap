"use client"
import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css'; // Import OpenLayers CSS
import Map from 'ol/Map'; // Import Map component from OpenLayers
import View from 'ol/View'; // Import View component from OpenLayers
import TileLayer from 'ol/layer/Tile'; // Import TileLayer component from OpenLayers
import OSM from 'ol/source/OSM'; // Import OSM source component from OpenLayers
import VectorLayer from 'ol/layer/Vector'; // Import VectorLayer component from OpenLayers
import VectorSource from 'ol/source/Vector'; // Import VectorSource component from OpenLayers
import { fromLonLat } from 'ol/proj'; // Import fromLonLat function from OpenLayers
import { Draw } from 'ol/interaction'; // Import Draw interaction component from OpenLayers
import './map1.css'; // Import custom CSS file
import Geocoder from 'ol-geocoder'; // Import Geocoder component from ol-geocoder

// Index:
// 1. Component Declaration and Initialization
// 2. Map Initialization and Configuration
// 3. Geocoder Configuration
// 4. Draw Interaction Configuration
// 5. Toggle Fullscreen Function
// 6. Zoom Handlers
// 7. Distance Calculation Function
// 8. Render JSX

// 1. Component Declaration and Initialization
const MapComponent: React.FC = () => {
  // References
  const mapRef = useRef<HTMLDivElement>(null);

  // State variables
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const vectorSource = new VectorSource();
  const vectorLayer = new VectorLayer({ source: vectorSource });

  // 2. Map Initialization and Configuration
  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    // 3. Geocoder Configuration
    const geocoder = new Geocoder('nominatim', {
      provider: 'osm',
      lang: 'en',
      placeholder: 'Search for a place',
      targetType: 'text-input',
      limit: 5,
      keepOpen: true,
    });

    geocoder.on('addresschosen', (evt) => {
      const lonLat = evt.coordinate;
      map.getView().animate({ center: lonLat, zoom: 10 });
    });

    map.addControl(geocoder);

    // 4. Draw Interaction Configuration
    const drawPoint = new Draw({
      source: vectorSource,
      type: 'Point',
    });

    map.addInteraction(drawPoint);

    setMapInstance(map);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // 5. Toggle Fullscreen Function
  const toggleFullscreen = () => {
    const mapContainer = mapRef.current;
    if (mapContainer) {
      mapContainer.classList.toggle('fullscreen-map');
      setIsFullscreen(!isFullscreen);
    }
  };

  // 6. Zoom Handlers
  const handleZoomIn = () => {
    if (mapInstance) {
      const view = mapInstance.getView();
      const currentZoom = view.getZoom();
      view.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      const view = mapInstance.getView();
      const currentZoom = view.getZoom();
      view.setZoom(currentZoom - 1);
    }
  };

  // 7. Distance Calculation Function
  const calculateDistance = () => {
    const features = vectorSource.getFeatures();

    if (features.length < 2) {
      alert('Please draw at least two points to calculate distance.');
      return;
    }

    let totalDistance = 0;

    for (let i = 0; i < features.length - 1; i++) {
      const coords1 = features[i].getGeometry().getCoordinates();
      const coords2 = features[i + 1].getGeometry().getCoordinates();
      const distanceInMeters = getDistance(coords1, coords2);
      totalDistance += distanceInMeters;
    }

    const totalDistanceInKm = totalDistance / 1000;
    setDistance(totalDistanceInKm);

    alert(`Total Distance: ${totalDistanceInKm.toFixed(2)} km`);
  };

  // 8. Render JSX
  return (
    <div>
      <div ref={mapRef} className={`map-container ${isFullscreen ? 'fullscreen-map' : ''}`} />
      <div className="fullscreen-button" onClick={toggleFullscreen}>
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </div>
      <div className="zoom-buttons">
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
      </div>
      <div>
        {distance !== null && <p>Distance: {distance.toFixed(2)} km</p>}
        <button onClick={calculateDistance}>Calculate Distance</button>
      </div>
    </div>
  );
};

export default MapComponent;
