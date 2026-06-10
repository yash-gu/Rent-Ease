import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarHost from '../components/SidebarHost';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const LandlordDashboard = () => {
  const { user, token } = useAuth();
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeListings: 0,
    occupancyRate: 0,
    newMessages: 0,
    totalBookings: 0,
    totalProperties: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        // Fetch properties
        const propRes = await fetch(`${API_BASE_URL}/api/users/${user._id}/properties`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!propRes.ok) throw new Error('Failed to load properties');
        const propData = await propRes.json();
        setProperties(propData);

        // Fetch stats
        const statsRes = await fetch(`${API_BASE_URL}/api/dashboard/stats/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!statsRes.ok) throw new Error('Failed to load dashboard statistics');
        const statsData = await statsRes.json();
        setStats(statsData);

      } catch (err) {
        setError(err.message || 'Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, token]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Occupied': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Maintenance': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const statCards = [
    { label: "Total Earnings", value: `$${stats.totalEarnings?.toLocaleString() || '0'}`, icon: "payments", color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
    { label: "Active Listings", value: stats.activeListings?.toString() || '0', icon: "domain", color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
    { label: "Occupancy Rate", value: `${stats.occupancyRate || 0}%`, icon: "group", color: "bg-purple-500/10 text-purple-400 border border-purple-500/20" },
    { label: "New Messages", value: stats.newMessages?.toString() || '0', icon: "chat", color: "bg-rose-500/10 text-rose-400 border border-rose-500/20", alert: stats.newMessages > 0 },
  ];

  return (
    <div className="flex bg-slate-950 min-h-screen text-slate-100">
      <SidebarHost />
      
      <main className="ml-64 p-8 md:p-12 w-full space-y-12">
        <header className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tight">Landlord Dashboard</h1>
          <p className="text-slate-400 text-lg">
            Welcome back, {user?.name || 'Marcus'}. Here is your portfolio performance.
          </p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            <p>{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <div key={idx} className="glass-panel bg-slate-900/30 border border-slate-850 p-6 rounded-2xl shadow-xl flex flex-col justify-between h-40 relative group hover:border-slate-800 transition-all">
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                </div>
                {stat.alert && <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>}
              </div>
              <div>
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </section>
        
        {/* Listings Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">My Properties</h2>
              <p className="text-xs text-slate-400 mt-1">Manage, update status, and track yields.</p>
            </div>
            <Link 
              to="/landlord/add" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-[1.03] active:scale-95 transition-all shadow-lg shadow-emerald-600/15"
            >
              <span className="material-symbols-outlined">add</span> 
              Add New Listing
            </Link>
          </div>

          {loading ? (
            <div className="glass-panel border border-slate-850 p-12 text-center rounded-2xl">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="glass-panel border border-slate-850 p-16 text-center rounded-2xl space-y-4">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                <span className="material-symbols-outlined text-3xl">domain_disabled</span>
              </div>
              <h3 className="text-xl font-bold text-white">No Listings Found</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                You haven't listed any luxury accommodations yet. Publish your first property to start earning.
              </p>
              <Link 
                to="/landlord/add" 
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md"
              >
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="glass-panel bg-slate-900/20 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-900/40 text-slate-400">
                      <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">Property Name</th>
                      <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">Type</th>
                      <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">Status</th>
                      <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">Nightly Rate</th>
                      <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {properties.map((prop) => (
                      <tr key={prop._id} className="hover:bg-slate-900/30 transition-colors">
                        {/* Property Image & Details */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shrink-0">
                              <img 
                                src={prop.images && prop.images[0] ? prop.images[0] : "https://via.placeholder.com/150"} 
                                className="w-full h-full object-cover" 
                                alt={prop.title}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-white text-base hover:text-emerald-400 transition-colors">{prop.title}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {prop.location}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Property Type */}
                        <td className="px-6 py-5 text-sm text-slate-300">
                          {prop.propertyType}
                        </td>

                        {/* Status tag */}
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(prop.status)}`}>
                            {prop.status}
                          </span>
                        </td>

                        {/* Nightly price */}
                        <td className="px-6 py-5">
                          <div className="font-bold text-white">${prop.price?.toLocaleString()}</div>
                          <p className="text-[10px] text-slate-500">per night</p>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link 
                              to={`/details?id=${prop._id}`} 
                              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                              title="View Details"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default LandlordDashboard;