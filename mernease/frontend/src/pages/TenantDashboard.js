import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavTop from '../components/NavTop';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const TenantDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/bookings/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load bookings');
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setError(err.message || 'Error occurred while loading bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, token]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-red-500/10 text-red-400 border border-red-500/20';
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="pt-20 bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between">
      <NavTop />
      
      <main className="flex-grow pt-12 pb-20 px-4 md:px-12 max-w-7xl mx-auto w-full space-y-12">
        <header className="space-y-2">
          <span className="text-primary text-xs font-black uppercase tracking-widest px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
            Traveler Dashboard
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">
            Welcome back, {user?.name || 'Explorer'}
          </h1>
          <p className="text-slate-400 text-lg">Manage your luxury stays and booking reservations.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            <p>{error}</p>
          </div>
        )}

        {/* Discovery Search Helper Banner */}
        <section className="glass-panel bg-slate-900/30 border border-slate-850 p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <h3 className="text-xl font-bold text-white">Find Your Next Destination</h3>
            <p className="text-slate-400 text-sm max-w-lg">
              Explore our highly vetted elite locations including luxury beach villas, alpine glass cabins, and Parisian penthouses.
            </p>
          </div>
          <button 
            onClick={() => navigate('/discover')}
            className="px-8 py-3.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-full shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 z-10 shrink-0 self-start md:self-center"
          >
            <span className="material-symbols-outlined text-lg">search</span>
            <span>Explore Properties</span>
          </button>
          <div className="absolute right-0 -bottom-10 opacity-5 text-[150px] font-black tracking-tighter select-none pointer-events-none">
            VACATION
          </div>
        </section>

        {/* Bookings Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Your Recent Reservations</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 text-sm">Retrieving stays...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="glass-panel border border-slate-850 p-16 text-center rounded-3xl space-y-4">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                <span className="material-symbols-outlined text-3xl">hotel</span>
              </div>
              <h3 className="text-xl font-bold text-white">No Stays Booked Yet</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                You haven't scheduled any reservations. Browse available rooms and secure your next checkout!
              </p>
              <button 
                onClick={() => navigate('/discover')}
                className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookings.map((booking) => {
                const prop = booking.propertyId || {};
                return (
                  <div key={booking._id} className="glass-panel bg-slate-900/30 border border-slate-850 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-slate-800 transition-all h-[420px]">
                    <div className="relative h-48 overflow-hidden shrink-0">
                      <img 
                        src={prop.images && prop.images[0] ? prop.images[0] : "https://via.placeholder.com/400"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        alt={prop.title || 'Property'} 
                      />
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-bold text-xl text-white truncate hover:text-primary transition-colors">
                          {prop.title || 'Luxury Accommodation'}
                        </h3>
                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-1 font-medium">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {prop.location || 'Santorini, Greece'}
                        </p>
                      </div>
                      
                      <div className="space-y-1.5 border-t border-slate-850 pt-4 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Check-in:</span>
                          <span className="font-bold text-white">{formatDate(booking.checkIn)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Check-out:</span>
                          <span className="font-bold text-white">{formatDate(booking.checkOut)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Paid:</span>
                          <span className="font-bold text-primary">${booking.totalPrice?.toLocaleString()}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => navigate(`/details?id=${prop._id}`)}
                        className="w-full text-center py-2.5 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default TenantDashboard;