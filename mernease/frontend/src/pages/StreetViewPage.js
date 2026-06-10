import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavTop from '../components/NavTop';

const StreetViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const streetViewRef = useRef(null);
  const [property, setProperty] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
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

    // Load Google Maps script if not loaded
    if (window.google) {
      initializeStreetView();
    } else {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY || 'AIzaSyDxRbV-GKkJEqy75V5k5P-6L-KZYLwpX7c';
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = initializeStreetView;
      document.head.appendChild(script);
    }
  }, [property]);

  const initializeStreetView = () => {
    if (!streetViewRef.current || !property) return;

    const lat = parseFloat(property.coordinates?.latitude || property.lat);
    const lng = parseFloat(property.coordinates?.longitude || property.lng);

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
          <div className="animate-spin mb-4">
            <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>progress_activity</span>
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
        {/* Street View Container */}
        <div ref={streetViewRef} className="w-full h-full" id="street-view" />

        {/* Header Overlay */}
        <div className="absolute top-8 left-8 right-8 z-10">
          <div className="glass-card p-6 rounded-2xl max-w-md">
            <h2 className="text-2xl font-bold text-on-surface mb-2">{property.title}</h2>
            <p className="text-secondary flex items-center gap-2">
              <span className="material-symbols-outlined">location_on</span>
              {property.location}
            </p>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-8 left-8 right-8 z-10 flex justify-between items-end">
          {/* Navigation Controls */}
          <div className="glass-card p-4 rounded-2xl flex gap-2">
            <button
              onClick={handleRotateLeft}
              title="Rotate Left"
              className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-primary">rotate_left</span>
            </button>
            <button
              onClick={handleRotateRight}
              title="Rotate Right"
              className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-primary">rotate_right</span>
            </button>
            <div className="w-px bg-primary/20"></div>
            <button
              onClick={handlePitchUp}
              title="Look Up"
              className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-primary">arrow_upward</span>
            </button>
            <button
              onClick={handlePitchDown}
              title="Look Down"
              className="p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
            >
              <span className="material-symbols-outlined text-primary">arrow_downward</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/discover')}
              className="glass-card px-6 py-3 rounded-lg font-bold text-secondary hover:bg-surface-container-low transition-all"
            >
              <span className="material-symbols-outlined inline mr-2">map</span>
              Back to Map
            </button>
            <button
              onClick={() => navigate('/details', { state: { property } })}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined inline mr-2">info</span>
              View Details
            </button>
          </div>
        </div>

        {/* Info Panel - Right Side */}
        <div className="absolute top-24 right-8 z-10">
          <div className="glass-card p-4 rounded-2xl text-sm space-y-2 max-w-[200px]">
            <div className="flex justify-between">
              <span className="text-secondary">Heading:</span>
              <span className="font-bold">{Math.round(heading)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Pitch:</span>
              <span className="font-bold">{Math.round(pitch)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Zoom:</span>
              <span className="font-bold">{zoom.toFixed(1)}x</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
            <div className="text-center">
              <div className="animate-spin mb-4">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '48px' }}>
                  progress_activity
                </span>
              </div>
              <p className="font-bold text-white">Loading 3D Street View...</p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="absolute bottom-24 left-8 z-10">
          <div className="glass-card p-4 rounded-2xl text-xs text-secondary max-w-[220px]">
            <p className="font-bold mb-2">💡 Tips:</p>
            <ul className="space-y-1">
              <li>• Drag to rotate view</li>
              <li>• Scroll to zoom</li>
              <li>• Use arrow buttons to navigate</li>
              <li>• Fullscreen for immersive experience</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StreetViewPage;
