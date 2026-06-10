import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavTop from '../components/NavTop';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const DiscoverMap = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [activePin, setActivePin] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Fetch properties from backend
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/properties`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch properties');
      const data = await res.json();
      setProperties(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [token]);

  // Load Leaflet dynamically and initialize markers
  useEffect(() => {
    if (properties.length === 0) return;

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
      initializeMap();
    });

    return () => {
      if (mapInstanceRef.current) {
        if (typeof mapInstanceRef.current.remove === 'function') {
          mapInstanceRef.current.remove();
        }
        mapInstanceRef.current = null;
      }
    };
  }, [properties]);

  const initializeMap = () => {
    if (!mapRef.current || properties.length === 0 || !window.L) return;

    if (mapInstanceRef.current) {
      if (typeof mapInstanceRef.current.remove === 'function') {
        mapInstanceRef.current.remove();
      }
      mapInstanceRef.current = null;
    }

    const firstProp = properties[0];
    const centerLat = firstProp.coordinates?.latitude || 48.8584;
    const centerLng = firstProp.coordinates?.longitude || 2.2945;

    const map = window.L.map(mapRef.current).setView([centerLat, centerLng], 4);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 20
    }).addTo(map);

    const customIcon = window.L.divIcon({
      html: `<div style="background-color: #4f46e5; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5); cursor: pointer;"></div>`,
      className: 'custom-leaflet-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    markersRef.current = [];

    properties.forEach((property) => {
      const lat = property.coordinates?.latitude || 48.8584;
      const lng = property.coordinates?.longitude || 2.2945;

      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(map);
      markersRef.current.push(marker);

      marker.on('click', () => {
        setSelectedProperty(property);
        setActivePin(property._id);
        map.setView([lat, lng], 12);

        const popupContent = `
          <div style="padding: 10px; font-family: 'Inter', sans-serif; color: #0f172a; max-width: 200px;">
            <strong style="font-size: 14px; display: block; margin-bottom: 2px;">${property.title}</strong>
            <span style="font-size: 12px; color: #475569; display: block; margin-bottom: 6px;">${property.location}</span>
            <strong style="color: #4f46e5; font-size: 13px;">$${property.price}/night</strong>
          </div>
        `;
        marker.bindPopup(popupContent).openPopup();
      });
    });

    setMapLoaded(true);
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setActivePin(property._id);
    const lat = property.coordinates?.latitude || 48.8584;
    const lng = property.coordinates?.longitude || 2.2945;

    if (mapInstanceRef.current && window.L) {
      mapInstanceRef.current.setView([lat, lng], 13);
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.propertyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col">
      <NavTop />
      
      <main className="flex flex-1 pt-20 h-[calc(100vh-80px)]">
        {/* Left Panel - Property List */}
        <section className="w-full md:w-[45%] h-full overflow-y-auto custom-scrollbar bg-slate-950 px-6 py-8 border-r border-slate-900">
          <div className="max-w-2xl mx-auto space-y-8 pb-10">
            <header className="flex flex-col gap-4">
              <div>
                <span className="text-primary text-xs font-black uppercase tracking-widest px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                  Elite Directory
                </span>
                <h1 className="text-3xl font-black text-white mt-3 tracking-tight">Luxury Stays Worldwide</h1>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
                <span className="material-symbols-outlined text-slate-500">search</span>
                <input 
                  className="bg-transparent border-none focus:ring-0 w-full text-white placeholder-slate-500 outline-none" 
                  placeholder="Search by title, location, or type..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </header>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-500 text-sm">Searching listings...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <span className="material-symbols-outlined text-4xl text-slate-600">domain_disabled</span>
                <h3 className="font-bold text-white">No Properties Found</h3>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">
                  Try adjusting search queries or check back later for new listed assets.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProperties.map(property => (
                  <div
                    key={property._id}
                    onMouseEnter={() => setActivePin(property._id)}
                    onMouseLeave={() => setActivePin(null)}
                    onClick={() => handlePropertySelect(property)}
                    className={`glass-panel bg-slate-900/30 border rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 ${
                      activePin === property._id 
                        ? 'border-primary shadow-2xl shadow-primary/5 scale-[1.01]' 
                        : 'border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={property.images && property.images[0] ? property.images[0] : "https://via.placeholder.com/400"}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        alt={property.title}
                      />
                      <div className="absolute top-4 left-4 bg-slate-950/80 border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400">
                        Verified
                      </div>
                      <div className="absolute top-4 right-4 bg-primary/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-white/10">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        {property.rating || '5.0'}
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{property.title}</h3>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-1 font-medium">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {property.location}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-slate-850">
                        <span className="text-slate-500 text-xs font-medium">
                          {property.propertyType} • {property.bedrooms} Bed
                        </span>
                        <p className="text-lg font-black text-primary">
                          ${property.price?.toLocaleString()}
                          <span className="text-xs font-normal text-slate-500">/night</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Panel - Map */}
        <section className="hidden md:flex md:w-[55%] h-full relative flex-col bg-slate-950 border-l border-slate-900">
          <div ref={mapRef} className="w-full flex-grow h-full" id="map" />

          {/* Details Overlay Drawer */}
          {selectedProperty && (
            <div className="absolute bottom-6 left-6 right-6 glass-panel bg-slate-950/90 border border-slate-800 p-5 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-50">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-20 h-16 rounded-xl overflow-hidden border border-slate-800 shrink-0">
                  <img 
                    src={selectedProperty.images && selectedProperty.images[0] ? selectedProperty.images[0] : "https://via.placeholder.com/150"} 
                    className="w-full h-full object-cover" 
                    alt={selectedProperty.title} 
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm truncate max-w-[200px]">{selectedProperty.title}</h4>
                  <p className="text-slate-400 text-xs mt-0.5">{selectedProperty.location}</p>
                  <p className="text-primary font-bold text-xs mt-1">${selectedProperty.price}/night</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                <button
                  onClick={() => navigate('/details', { state: { property: selectedProperty } })}
                  className="bg-primary hover:bg-primary/95 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  View Stay
                </button>
              </div>
            </div>
          )}

          {/* Map Loading State */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
              <div className="text-center">
                <div className="animate-spin mb-4 text-primary">
                  <span className="material-symbols-outlined text-4xl">progress_activity</span>
                </div>
                <p className="font-bold text-slate-400">Loading satellite map...</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DiscoverMap;