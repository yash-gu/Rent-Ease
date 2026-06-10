import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavTop from '../components/NavTop';

const StreetViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const streetViewRef = useRef(null);
  const fallbackMapInstanceRef = useRef(null);
  
  const [property, setProperty] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (location.state?.property) {
      setProperty(location.state.property);
    } else {
      // Default to Paris if no property selected
      setProperty({
        id: 1,
        title: "L'Haussmann Prestige",
        location: "Le Marais, Paris",
        lat: 48.8597,
        lng: 2.3644
      });
    }
  }, [location]);

  useEffect(() => {
    if (!property) return;

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';
    
    // Fallback immediately if Google key is not set or is the default mock key
    if (!apiKey || apiKey === 'AIzaSyDxRbV-GKkJEqy75V5k5P-6L-KZYLwpX7c') {
      console.warn('No valid Google Maps API Key provided. Falling back to Leaflet Map.');
      setUseFallback(true);
      initializeFallbackMap();
      return;
    }

    // Load Google Maps script if not loaded
    if (window.google) {
      initializeStreetView();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = initializeStreetView;
      script.onerror = () => {
        console.error('Google Maps script failed to load. Falling back to Leaflet Map.');
        setUseFallback(true);
        initializeFallbackMap();
      };
      document.head.appendChild(script);
    }
  }, [property]);

  useEffect(() => {
    return () => {
      if (fallbackMapInstanceRef.current) {
        if (typeof fallbackMapInstanceRef.current.remove === 'function') {
          fallbackMapInstanceRef.current.remove();
        }
        fallbackMapInstanceRef.current = null;
      }
    };
  }, []);

  const initializeStreetView = () => {
    if (!streetViewRef.current || !property) return;

    try {
      const lat = parseFloat(property.coordinates?.latitude || property.lat);
      const lng = parseFloat(property.coordinates?.longitude || property.lng);

      if (!window.google || !window.google.maps || !window.google.maps.StreetViewPanorama) {
        throw new Error('Google Maps modules unavailable.');
      }

      const streetView = new window.google.maps.StreetViewPanorama(
        streetViewRef.current,
        {
          position: { lat, lng },
          pov: {
            heading: heading,
            pitch: pitch,
            zoom: zoom
          },
          panControl: true,
          panControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM
          },
          zoomControl: true,
          zoomControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM
          },
          streetViewControl: true,
          streetViewControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_BOTTOM
          }
        }
      );

      // Update heading and pitch when user interacts
      streetView.addListener('pov_changed', () => {
        const newPov = streetView.getPov();
        setHeading(newPov.heading);
        setPitch(newPov.pitch);
        setZoom(newPov.zoom);
      });

      setMapLoaded(true);
    } catch (err) {
      console.error('Failed to initialize Google Street View panorama, falling back to Leaflet:', err);
      setUseFallback(true);
      initializeFallbackMap();
    }
  };

  const initializeFallbackMap = () => {
    const loadLeaflet = (callback) => {
      if (window.L) {
        callback();
        return;
      }

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = callback;
      document.head.appendChild(script);
    };

    loadLeaflet(() => {
      if (!streetViewRef.current || !property || !window.L) return;

      if (fallbackMapInstanceRef.current) {
        fallbackMapInstanceRef.current.remove();
        fallbackMapInstanceRef.current = null;
      }

      const lat = parseFloat(property.coordinates?.latitude || property.lat || 48.8597);
      const lng = parseFloat(property.coordinates?.longitude || property.lng || 2.3644);

      const map = window.L.map(streetViewRef.current).setView([lat, lng], 15);
      fallbackMapInstanceRef.current = map;

      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 20
      }).addTo(map);

      const customIcon = window.L.divIcon({
        html: `<div style="background-color: #4f46e5; width: 18px; height: 18px; border-radius: 50%; border: 3.5px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        className: 'custom-leaflet-marker-streetview',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      window.L.marker([lat, lng], { icon: customIcon }).addTo(map);
      setMapLoaded(true);
    });
  };

  const handleRotateLeft = () => {
    if (streetViewRef.current && streetViewRef.current.__streetViewPanorama) {
      const pov = streetViewRef.current.__streetViewPanorama.getPov();
      pov.heading -= 15;
      streetViewRef.current.__streetViewPanorama.setPov(pov);
    }
  };

  const handleRotateRight = () => {
    if (streetViewRef.current && streetViewRef.current.__streetViewPanorama) {
      const pov = streetViewRef.current.__streetViewPanorama.getPov();
      pov.heading += 15;
      streetViewRef.current.__streetViewPanorama.setPov(pov);
    }
  };

  const handlePitchUp = () => {
    if (streetViewRef.current && streetViewRef.current.__streetViewPanorama) {
      const pov = streetViewRef.current.__streetViewPanorama.getPov();
      pov.pitch = Math.min(pov.pitch + 15, 90);
      streetViewRef.current.__streetViewPanorama.setPov(pov);
    }
  };

  const handlePitchDown = () => {
    if (streetViewRef.current && streetViewRef.current.__streetViewPanorama) {
      const pov = streetViewRef.current.__streetViewPanorama.getPov();
      pov.pitch = Math.max(pov.pitch - 15, -90);
      streetViewRef.current.__streetViewPanorama.setPov(pov);
    }
  };

  if (!property) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 text-primary">
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: '48px' }}>progress_activity</span>
          </div>
          <p className="font-bold text-primary">Loading Street View...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <NavTop role="tenant" />
      <main className="h-full pt-[72px] relative">
        {/* Street View or Fallback Map Container */}
        <div ref={streetViewRef} className="w-full h-full z-0" id="street-view" />

        {/* Header Overlay */}
        <div className="absolute top-8 left-8 right-8 z-10">
          <div className="glass-card p-6 rounded-2xl max-w-md bg-slate-950/80 border border-slate-800 text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-2">{property.title}</h2>
            <p className="text-slate-400 flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {property.location}
            </p>
          </div>
        </div>

        {/* Fallback Notice Overlay */}
        {useFallback && (
          <div className="absolute top-36 left-8 right-8 z-10 max-w-md">
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-2xl flex gap-3 text-xs backdrop-blur-md shadow-lg">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">warning</span>
              <div>
                <p className="font-bold mb-0.5 text-sm">3D Street View Offline</p>
                <p className="opacity-90 leading-relaxed">Street View panorama requires a Google API key. Showing high-precision location map instead.</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-8 left-8 right-8 z-10 flex justify-between items-end">
          {/* Navigation Controls - only show for Google Panorama */}
          {!useFallback ? (
            <div className="glass-card p-4 rounded-2xl flex gap-2 bg-slate-950/80 border border-slate-800 text-white shadow-xl">
              <button
                onClick={handleRotateLeft}
                title="Rotate Left"
                className="p-3 bg-primary/15 hover:bg-primary/25 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-primary">rotate_left</span>
              </button>
              <button
                onClick={handleRotateRight}
                title="Rotate Right"
                className="p-3 bg-primary/15 hover:bg-primary/25 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-primary">rotate_right</span>
              </button>
              <div className="w-px bg-slate-800"></div>
              <button
                onClick={handlePitchUp}
                title="Look Up"
                className="p-3 bg-primary/15 hover:bg-primary/25 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-primary">arrow_upward</span>
              </button>
              <button
                onClick={handlePitchDown}
                title="Look Down"
                className="p-3 bg-primary/15 hover:bg-primary/25 rounded-lg transition-all"
              >
                <span className="material-symbols-outlined text-primary">arrow_downward</span>
              </button>
            </div>
          ) : (
            <div className="h-10" /> /* Spacer */
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/discover')}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-6 py-3.5 rounded-full font-bold transition-all shadow-lg text-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">map</span>
              Back to Map
            </button>
            <button
              onClick={() => navigate('/details', { state: { property } })}
              className="bg-primary hover:bg-primary/95 text-white px-7 py-3.5 rounded-full font-bold transition-all shadow-lg shadow-primary/20 text-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              View Details
            </button>
          </div>
        </div>

        {/* Info Panel - Right Side (Google POV Stats) */}
        {!useFallback && (
          <div className="absolute top-36 right-8 z-10">
            <div className="glass-card p-4 rounded-2xl text-xs space-y-2 max-w-[200px] bg-slate-950/80 border border-slate-800 text-slate-300 shadow-xl">
              <div className="flex justify-between">
                <span className="text-slate-400">Heading:</span>
                <span className="font-bold text-white">{Math.round(heading)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pitch:</span>
                <span className="font-bold text-white">{Math.round(pitch)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Zoom:</span>
                <span className="font-bold text-white">{zoom.toFixed(1)}x</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-20">
            <div className="text-center">
              <div className="animate-spin mb-4 text-primary">
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '48px' }}>
                  progress_activity
                </span>
              </div>
              <p className="font-bold text-slate-400">Loading map imagery...</p>
            </div>
          </div>
        )}

        {/* Tips */}
        {!useFallback && (
          <div className="absolute bottom-28 left-8 z-10">
            <div className="glass-card p-4 rounded-2xl text-[10px] text-slate-400 max-w-[220px] bg-slate-950/80 border border-slate-800 shadow-xl">
              <p className="font-bold mb-2 text-white">💡 Tips:</p>
              <ul className="space-y-1">
                <li>• Drag to rotate view</li>
                <li>• Scroll to zoom</li>
                <li>• Use control buttons to look around</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StreetViewPage;
