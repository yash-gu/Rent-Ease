import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarHost from '../components/SidebarHost';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const PRESET_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    label: 'Santorini Villa'
  },
  {
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    label: 'Modern Penthouse'
  },
  {
    url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80',
    label: 'Alpine Cabin'
  },
  {
    url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
    label: 'Parisian Loft'
  },
  {
    url: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
    label: 'Beach Cottage'
  }
];

const AMENITIES_LIST = [
  'WiFi', 'Air Conditioning', 'Infinity Pool', 'Private Chef', 
  'Hot Tub', 'Gym', 'Sea View', 'Mountain View', 'Kitchen', 'Parking'
];

const LandlordAddListing = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadPreview, setUploadPreview] = useState('');

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    price: '',
    propertyType: 'Apartment',
    bedrooms: '1',
    bathrooms: '1',
    guests: '2',
    imageUrl: PRESET_IMAGES[0].url,
    customImageUrl: '',
    latitude: '40.7128',
    longitude: '-74.0060'
  });

  // Initialize and load Leaflet Maps
  useEffect(() => {
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
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    if (mapInstanceRef.current) {
      if (typeof mapInstanceRef.current.remove === 'function') {
        mapInstanceRef.current.remove();
      }
      mapInstanceRef.current = null;
    }

    const defaultLat = parseFloat(formData.latitude) || 40.7128;
    const defaultLng = parseFloat(formData.longitude) || -74.0060;

    const map = window.L.map(mapRef.current).setView([defaultLat, defaultLng], 12);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 20
    }).addTo(map);

    const customIcon = window.L.divIcon({
      html: `<div style="background-color: #10b981; width: 18px; height: 18px; border-radius: 50%; border: 3.5px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.5); cursor: grab;"></div>`,
      className: 'custom-leaflet-marker-landlord',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    const marker = window.L.marker([defaultLat, defaultLng], { 
      icon: customIcon, 
      draggable: true 
    }).addTo(map);

    markerRef.current = marker;

    map.on('click', (e) => {
      updateCoordinates(e.latlng.lat, e.latlng.lng);
    });

    marker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      updateCoordinates(position.lat, position.lng);
    });

    setMapLoaded(true);
  };

  const updateCoordinates = async (lat, lng) => {
    const latitude = parseFloat(lat.toFixed(6));
    const longitude = parseFloat(lng.toFixed(6));

    setFormData(prev => ({
      ...prev,
      latitude: latitude.toString(),
      longitude: longitude.toString()
    }));

    if (markerRef.current && window.L) {
      markerRef.current.setLatLng([latitude, longitude]);
    }
    if (mapInstanceRef.current && window.L) {
      mapInstanceRef.current.panTo([latitude, longitude]);
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setFormData(prev => ({
            ...prev,
            location: data.display_name
          }));
        }
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    }
  };

  const handleGeocodeSearch = async () => {
    if (!formData.location) return;
    setGeocoding(true);
    setError('');

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.location)}&limit=1`);
      if (!res.ok) throw new Error('Geocoding failed');
      
      const data = await res.json();
      if (data && data.length > 0) {
        const targetLat = parseFloat(data[0].lat);
        const targetLng = parseFloat(data[0].lon);

        setFormData(prev => ({
          ...prev,
          latitude: targetLat.toFixed(6),
          longitude: targetLng.toFixed(6)
        }));

        if (markerRef.current && window.L) {
          markerRef.current.setLatLng([targetLat, targetLng]);
        }
        if (mapInstanceRef.current && window.L) {
          mapInstanceRef.current.setView([targetLat, targetLng], 14);
        }
      } else {
        setError('Location could not be resolved. Please place pin manually on the map.');
      }
    } catch (err) {
      console.error(err);
      setError('Geocoding request failed. Please check your internet or click manually.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await updateCoordinates(latitude, longitude);
        setDetectingLocation(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to retrieve your location. Please check browser permissions.');
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation - limit size to 4MB to prevent excessive DB sizes
    if (file.size > 4 * 1024 * 1024) {
      setError('Selected image is too large. Max size is 4MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ 
        ...prev, 
        customImageUrl: reader.result, // Holds the base64 string
        imageUrl: '' // Clear preset selection
      }));
      setUploadPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const imageUrl = formData.customImageUrl || formData.imageUrl;

    const payload = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      price: Number(formData.price),
      propertyType: formData.propertyType,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      guests: Number(formData.guests),
      amenities: selectedAmenities,
      images: [imageUrl],
      hostId: user._id,
      coordinates: {
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude)
      },
      status: 'Active'
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to list property');
      }

      setPublished(true);
    } catch (err) {
      setError(err.message || 'Error occurred while submitting listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-955 min-h-screen text-slate-100">
      <SidebarHost />
      
      <main className="ml-64 p-8 md:p-12 w-full max-w-5xl mx-auto space-y-12 pb-32">
        <header className="space-y-2">
          <span className="text-emerald-400 text-xs font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            Listings Portal
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mt-3">
            List Your Masterpiece
          </h1>
          <p className="text-slate-400 text-lg">
            Showcase your high-yield luxury property to premium travelers.
          </p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400 text-sm items-start">
            <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <section className="glass-panel bg-slate-900/40 border border-slate-850 rounded-3xl p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 border-b border-slate-850 pb-4">
              <span className="material-symbols-outlined text-emerald-400">edit_note</span> 
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Listing Title *</label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none" 
                  placeholder="e.g. Minimalist Glass Villa in Beverly Hills" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description *</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="4" 
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none" 
                  placeholder="Describe the architectural design, ambiance, views, and exclusive services..." 
                />
              </div>
            </div>
          </section>

          {/* Section 2: Property Specifications & Location */}
          <section className="glass-panel bg-slate-900/40 border border-slate-850 rounded-3xl p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 border-b border-slate-850 pb-4">
              <span className="material-symbols-outlined text-emerald-400">home_work</span> 
              Specifications & Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Type</label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none"
                >
                  {['Apartment', 'Villa', 'Cabin', 'Loft', 'House', 'Cottage', 'Bungalow'].map(t => (
                    <option key={t} value={t} className="bg-slate-950">{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nightly Price ($ USD) *</label>
                <input 
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="1"
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none" 
                  placeholder="e.g. 1200" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location / Address *</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    onBlur={handleGeocodeSearch}
                    required
                    className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none flex-grow" 
                    placeholder="e.g. Beverly Hills, California" 
                  />
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    disabled={detectingLocation}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-[0.98] border border-blue-500/10"
                    title="Detect My Location"
                  >
                    {detectingLocation ? (
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">my_location</span>
                    )}
                    <span>Detect</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGeocodeSearch}
                    disabled={geocoding}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-[0.98] border border-emerald-500/10"
                  >
                    {geocoding ? (
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm">location_searching</span>
                    )}
                    <span>Locate</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bedrooms *</label>
                <input 
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                  min="1"
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bathrooms *</label>
                <input 
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                  min="1"
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Guests *</label>
                <input 
                  type="number"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                  min="1"
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none" 
                />
              </div>
            </div>

            {/* Interactive Location Picker Map */}
            <div className="space-y-2 mt-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Point Address on Map (Click or Drag Marker)</label>
              <div className="rounded-2xl overflow-hidden h-72 shadow-lg relative border border-slate-800">
                <div ref={mapRef} className="w-full h-full" id="landlord-picker-map" style={{ minHeight: '280px' }} />
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-10">
                    <span className="material-symbols-outlined animate-spin text-emerald-400 text-3xl">
                      progress_activity
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Latitude Coordinate</label>
                <input 
                  type="number"
                  step="0.0001"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Longitude Coordinate</label>
                <input 
                  type="number"
                  step="0.0001"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none" 
                />
              </div>
            </div>
          </section>

          {/* Section 3: Amenities */}
          <section className="glass-panel bg-slate-900/40 border border-slate-850 rounded-3xl p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 border-b border-slate-850 pb-4">
              <span className="material-symbols-outlined text-emerald-400">task_alt</span> 
              Amenities Included
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {AMENITIES_LIST.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`flex items-center gap-2 p-3.5 rounded-xl border text-sm font-medium transition-all ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold' 
                        : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {isSelected ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                    {amenity}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 4: Visuals & Images */}
          <section className="glass-panel bg-slate-900/40 border border-slate-850 rounded-3xl p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 border-b border-slate-850 pb-4">
              <span className="material-symbols-outlined text-emerald-400">collections</span> 
              Property Gallery
            </h2>
            
            <div className="space-y-6">
              {/* Upload Image Section */}
              <div className="flex flex-col gap-1.5 p-6 bg-slate-950/50 border border-slate-850 rounded-2xl">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Upload Local Image File (Saved to Database)
                </label>
                <div className="flex items-center gap-6 flex-wrap sm:flex-nowrap">
                  <label className="w-full sm:w-auto cursor-pointer bg-slate-900 border-2 border-slate-800 border-dashed rounded-xl px-8 py-5 text-center hover:border-emerald-500 hover:text-emerald-400 transition-all flex flex-col items-center justify-center gap-2 shrink-0">
                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                    <span className="text-xs font-bold">Upload Property Image</span>
                    <span className="text-[10px] text-slate-500">Max size: 4MB</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  {uploadPreview ? (
                    <div className="w-full sm:w-64 h-36 rounded-xl overflow-hidden border border-slate-800 shrink-0 relative group">
                      <img src={uploadPreview} className="w-full h-full object-cover" alt="Upload Preview" />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <button 
                          type="button" 
                          onClick={() => { setUploadPreview(''); setFormData(p => ({ ...p, customImageUrl: '' })) }}
                          className="p-2 bg-red-500 rounded-full text-white"
                        >
                          <span className="material-symbols-outlined text-sm block">delete</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No custom file uploaded. Choose a preset or list a file.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-850 my-6"></div>

              {/* Preset selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Or Select a Premium Stock Preset Image
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {PRESET_IMAGES.map((img) => {
                    const isSelected = formData.imageUrl === img.url && !formData.customImageUrl;
                    return (
                      <div 
                        key={img.label}
                        onClick={() => {
                          setFormData(p => ({ ...p, imageUrl: img.url, customImageUrl: '' }));
                          setUploadPreview('');
                        }}
                        className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 transition-all aspect-video group ${
                          isSelected ? 'border-emerald-500 scale-[1.03] shadow-md shadow-emerald-500/10' : 'border-slate-850 hover:border-slate-650'
                        }`}
                      >
                        <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={img.label} />
                        <div className="absolute inset-0 bg-slate-950/40 flex items-end p-2.5">
                          <span className="text-[10px] font-bold text-white truncate">{img.label}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-0.5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs">done</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* URL fallback */}
              <div className="flex flex-col gap-1.5 pt-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Or Paste Custom Image URL
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">link</span>
                  <input 
                    type="url"
                    name="customImageUrl"
                    value={formData.customImageUrl.startsWith('data:image/') ? '' : formData.customImageUrl}
                    onChange={(e) => {
                      setFormData(p => ({ ...p, customImageUrl: e.target.value }));
                      setUploadPreview('');
                    }}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-955 border border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white outline-none" 
                    placeholder="https://images.unsplash.com/... (Overrides selection)" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Form Actions Bottom Bar */}
          <div className="fixed bottom-0 right-0 left-64 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 p-6 flex justify-between items-center z-50">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="text-slate-400 font-bold hover:text-white flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span> 
              Back
            </button>
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="px-8 py-3 rounded-full font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-10 py-3 rounded-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">publish</span>
                    <span>Publish Listing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {published && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="glass-panel bg-slate-900 border border-emerald-500/30 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
              {/* Highlight gradient glow */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full" />
              
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-emerald-400">verified</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Listing Published!</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Your premium property has been successfully added to the database and is now discoverable.
              </p>
              <button 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-full font-bold shadow-lg transition-colors" 
                onClick={() => navigate('/landlord')}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LandlordAddListing;