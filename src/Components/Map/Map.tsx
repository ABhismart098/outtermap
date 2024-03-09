"use client"
import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import { Draw } from 'ol/interaction';
import './map1.css'; // Import the CSS file
import Geocoder from 'ol-geocoder';

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(true); // Set to true by default
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const vectorSource = new VectorSource();
  const vectorLayer = new VectorLayer({ source: vectorSource });

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer, // Add the vector layer to the map
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    // Initialize geocoder
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

    // Add draw interactions for drawing features
    const drawPoint = new Draw({
      source: vectorSource,
      type: 'Point',
    });

    const drawLine = new Draw({
      source: vectorSource,
      type: 'LineString',
    });

    const drawPolygon = new Draw({
      source: vectorSource,
      type: 'Polygon',
    });

    map.addInteraction(drawPoint);
    map.addInteraction(drawLine);
    map.addInteraction(drawPolygon);

    setMapInstance(map);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  // Function to toggle fullscreen
  const toggleFullscreen = () => {
    const mapContainer = mapRef.current;
    if (mapContainer) {
      mapContainer.classList.toggle('fullscreen-map');
      setIsFullscreen(!isFullscreen); // Update state to reflect fullscreen status
    }
  };

  // Function to handle zoom in
  const handleZoomIn = () => {
    if (mapInstance) {
      const view = mapInstance.getView();
      const currentZoom = view.getZoom();
      view.setZoom(currentZoom + 1);
    }
  };

  // Function to handle zoom out
  const handleZoomOut = () => {
    if (mapInstance) {
      const view = mapInstance.getView();
      const currentZoom = view.getZoom();
      view.setZoom(currentZoom - 1);
    }
  };

  return (
    <div>
      <div ref={mapRef} className={`map-container ${isFullscreen ? 'fullscreen-map' : ''}`} /> {/* Add fullscreen class conditionally */}
      {/* Fullscreen button */}
      <div className="fullscreen-button" onClick={toggleFullscreen}>
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </div>
      {/* Zoom buttons */}
      <div className="zoom-buttons">
        <button onClick={handleZoomIn}>+</button>
        <button onClick={handleZoomOut}>-</button>
      </div>
    </div>
  );
};

export default MapComponent;
