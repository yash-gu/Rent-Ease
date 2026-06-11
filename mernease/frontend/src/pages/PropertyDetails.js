import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavTop from '../components/NavTop';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const PropertyDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const [property, setProperty] = useState(location.state?.property || null);
  const [loading, setLoading] = useState(!property);
  const [error, setError] = useState('');

  // Date and Pricing states for dynamic booking calendar
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [nights, setNights] = useState(1);

  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const difference = end.getTime() - start.getTime();
      const calculatedNights = Math.ceil(difference / (1000 * 3600 * 24));
      setNights(calculatedNights > 0 ? calculatedNights : 1);
    }
  }, [checkIn, checkOut]);

  const serviceFee = parseFloat((property?.price * nights * 0.1 || 0).toFixed(2));
  const taxAmount = parseFloat((property?.price * nights * 0.05 || 0).toFixed(2));
  const totalPrice = parseFloat((property?.price * nights + serviceFee + taxAmount || 0).toFixed(2));

  const handleReserve = () => {
    navigate('/checkout', {
      state: {
        property,
        bookingDetails: {
          checkIn,
          checkOut,
          nights,
          serviceFee,
          taxAmount,
          totalPrice
        }
      }
    });
  };

  // Extract ID from query params if state not available
  useEffect(() => {
    const fetchPropertyById = async () => {
      if (property) return; // Already have it

      const queryParams = new URLSearchParams(location.search);
      const id = queryParams.get('id');

      if (!id) {
        setError('No property specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Property not found');
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        setError(err.message || 'Failed to load property details');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyById();
  }, [location.search, property, token]);

  // Initialize map via Leaflet
  useEffect(() => {
    if (!property || !mapRef.current) return;

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
  }, [property]);

  const initializeMap = () => {
    if (!mapRef.current || !property || !window.L) return;

    if (mapInstanceRef.current) {
      if (typeof mapInstanceRef.current.remove === 'function') {
        mapInstanceRef.current.remove();
      }
      mapInstanceRef.current = null;
    }

    const lat = property.coordinates?.latitude || 48.8584;
    const lng = property.coordinates?.longitude || 2.2945;

    const map = window.L.map(mapRef.current).setView([lat, lng], 14);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 20
    }).addTo(map);

    const customIcon = window.L.divIcon({
      html: `<div style="background-color: #4f46e5; width: 18px; height: 18px; border-radius: 50%; border: 3.5px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
      className: 'custom-leaflet-marker-details',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    window.L.marker([lat, lng], { icon: customIcon }).addTo(map);

    setMapLoaded(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        <NavTop />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading stay details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
        <NavTop />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="glass-panel border border-slate-800 p-8 rounded-2xl max-w-md text-center space-y-4">
            <span className="material-symbols-outlined text-4xl text-red-400">error</span>
            <h3 className="text-xl font-bold">Error Loading Stay</h3>
            <p className="text-slate-400 text-sm">{error || 'Specified listing could not be resolved.'}</p>
            <button onClick={() => navigate('/discover')} className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm">
              Back to Stays
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const galleryImages = [
    property.images && property.images[0] ? property.images[0] : "https://via.placeholder.com/800x500",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
  ];

  const defaultAmenities = property.amenities && property.amenities.length > 0
    ? property.amenities
    : ['WiFi', 'Air Conditioning', 'Kitchen', 'Parking'];

  return (
    <div className="bg-slate-950 text-slate-100 pt-20">
      <NavTop />
      
      <main className="mt-8 max-w-7xl mx-auto px-4 md:px-12 pb-24 space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">{property.title}</h1>
          <div className="flex gap-4 text-slate-400 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              {property.rating || '5.0'} • {property.reviews || '0'} reviews
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <span className="material-symbols-outlined text-primary text-sm">location_on</span>
              {property.location}
            </span>
          </div>
        </header>

        {/* Gallery Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-3 h-[450px] rounded-2xl overflow-hidden shadow-2xl shrink-0">
          <div className="md:col-span-2 md:row-span-2 overflow-hidden border border-slate-900">
            <img
              className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
              src={galleryImages[0]}
              alt="Main stay representation"
            />
          </div>
          {galleryImages.slice(1, 5).map((img, idx) => (
            <div key={idx} className="overflow-hidden border border-slate-900 hidden md:block">
              <img
                className="w-full h-full object-cover hover:scale-103 transition-transform duration-500"
                src={img}
                alt={`Stay gallery index ${idx + 1}`}
              />
            </div>
          ))}
        </section>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-grow lg:max-w-[calc(100%-420px)] space-y-10">
            {/* Property specs */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Entire {property.propertyType} hosted by {property.hostId?.name || 'Private Host'}
              </h2>
              <p className="text-slate-400 text-base">
                {property.guests} guests • {property.bedrooms} bedrooms • {property.bathrooms} bathrooms
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4 border-t border-slate-900 pt-6">
              <h3 className="text-xl font-bold text-white">About this luxury space</h3>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-4 border-t border-slate-900 pt-6">
              <h3 className="text-xl font-bold text-white">Amenities included</h3>
              <div className="grid grid-cols-2 gap-4">
                {defaultAmenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-300 text-sm">
                    <span className="material-symbols-outlined text-primary text-xl">
                      {amenity === 'WiFi' ? 'wifi' : amenity === 'Air Conditioning' ? 'ac_unit' : amenity === 'Infinity Pool' ? 'pool' : 'check_circle'}
                    </span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Section */}
            <div className="space-y-4 border-t border-slate-900 pt-6">
              <h3 className="text-xl font-bold text-white">Where you will stay</h3>
              <div className="rounded-2xl overflow-hidden h-96 shadow-lg relative border border-slate-900">
                <div
                  ref={mapRef}
                  className="w-full h-full"
                  id="property-map"
                />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-10">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl">
                      progress_activity
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar - Checkout/Booking Card */}
          <aside className="w-full lg:w-[380px] shrink-0">
            <div className="glass-card bg-slate-900/30 border border-slate-850 p-6 rounded-2xl sticky top-28 shadow-xl space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl font-black text-white">${property.price?.toLocaleString()}</span>
                  <span className="text-slate-400 text-sm"> / night</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 border border-slate-850 rounded-xl p-3 bg-slate-950/40">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Check-In</label>
                    <input 
                      type="date" 
                      min={today}
                      value={checkIn}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        if (e.target.value >= checkOut) {
                          const nextDay = new Date(new Date(e.target.value).getTime() + 86400000).toISOString().split('T')[0];
                          setCheckOut(nextDay);
                        }
                      }}
                      className="bg-transparent border-none text-white text-xs outline-none focus:ring-2 focus:ring-primary/20 p-0"
                    />
                  </div>
                  <div className="flex flex-col gap-1 border-l border-slate-850 pl-3">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Check-Out</label>
                    <input 
                      type="date"
                      min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : tomorrow}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="bg-transparent border-none text-white text-xs outline-none focus:ring-2 focus:ring-primary/20 p-0"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleReserve}
                className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold text-center text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Reserve Now
              </button>
              
              <div className="space-y-3 border-t border-slate-850 pt-4 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>${property.price?.toLocaleString()} x {nights} nights</span>
                  <span>${(property.price * nights)?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vault Service fee (10%)</span>
                  <span>${serviceFee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span>${taxAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-850">
                  <span>Total</span>
                  <span className="text-primary">${totalPrice?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PropertyDetails;