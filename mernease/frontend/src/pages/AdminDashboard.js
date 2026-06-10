import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavTop from '../components/NavTop';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!usersRes.ok) throw new Error('Failed to load users');
      const usersData = await usersRes.json();
      setUsers(usersData);

      // Fetch properties
      const propsRes = await fetch(`${API_BASE_URL}/api/properties`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!propsRes.ok) throw new Error('Failed to load properties');
      const propsData = await propsRes.json();
      setProperties(propsData);

      // Fetch bookings
      const bookingsRes = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!bookingsRes.ok) throw new Error('Failed to load bookings');
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData);

    } catch (err) {
      setError(err.message || 'Failed to fetch platform data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Block non-admin users from accessing dashboard
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [token, user]);

  const handleDeleteUser = async (userId) => {
    if (userId === user?._id) {
      setError('You cannot delete your own admin account.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This will remove all their listings and data.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete user');
      }
      setSuccessMsg('User successfully deleted');
      setUsers(prev => prev.filter(u => u._id !== userId));
      // Refresh properties in case they were cascade deleted
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProperty = async (propId) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/properties/${propId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete property');
      }
      setSuccessMsg('Property listing successfully removed');
      setProperties(prev => prev.filter(p => p._id !== propId));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Analytics Calculations
  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Completed' || b.paymentStatus === 'Completed')
    .reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0);

  const averageRating = properties.length > 0
    ? (properties.reduce((sum, p) => sum + parseFloat(p.rating || 0), 0) / properties.length).toFixed(2)
    : '5.00';

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.propertyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => 
    b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.propertyId?.title && b.propertyId.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-20">
      <NavTop />
      
      <main className="max-w-7xl mx-auto px-4 md:px-12 py-10 space-y-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-900 pb-8">
          <div>
            <span className="text-primary text-xs font-black uppercase tracking-widest px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
              Platform Oversight
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">Admin Console</h1>
            <p className="text-slate-400 text-sm mt-1">Manage listings, user permissions, and audit platforms metrics.</p>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 self-start"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh Audits
          </button>
        </header>

        {/* Notifications */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400 text-xs items-start">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <p>{error}</p>
          </div>
        )}
        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex gap-3 text-emerald-400 text-xs items-start">
            <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
            <p>{successMsg}</p>
          </div>
        )}

        {/* Stats Blocks */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
              <span className="material-symbols-outlined text-primary text-xl">group</span>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-black text-white">{users.length}</h2>
              <p className="text-[10px] text-slate-400 mt-1">Accounts registered</p>
            </div>
          </div>
          
          <div className="glass-card bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Listings</span>
              <span className="material-symbols-outlined text-primary text-xl">domain</span>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-black text-white">{properties.length}</h2>
              <p className="text-[10px] text-slate-400 mt-1">Active / occupied stays</p>
            </div>
          </div>

          <div className="glass-card bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bookings Log</span>
              <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-black text-white">{bookings.length}</h2>
              <p className="text-[10px] text-slate-400 mt-1">Total reservations secured</p>
            </div>
          </div>

          <div className="glass-card bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
              <span className="material-symbols-outlined text-primary text-xl">payments</span>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl font-black text-emerald-400">${totalRevenue.toLocaleString()}</h2>
              <p className="text-[10px] text-slate-400 mt-1">Secured transaction value</p>
            </div>
          </div>
        </section>

        {/* Tab Selection & Search bar */}
        <section className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-slate-900 pb-4">
          <div className="flex bg-slate-900 border border-slate-850 p-1.5 rounded-xl gap-2 w-full md:w-auto">
            {['overview', 'users', 'properties', 'bookings'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors flex-1 md:flex-none ${
                  activeTab === tab 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab !== 'overview' && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 rounded-xl px-4 py-2.5 w-full md:w-80 focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-slate-500 text-sm">search</span>
              <input
                className="bg-transparent border-none focus:ring-0 w-full text-xs text-white placeholder-slate-500 outline-none"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </section>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Auditing platform databases...</p>
          </div>
        ) : (
          <section className="space-y-6">
            
            {/* Tab 1: Overview Dashboard */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Recent users snippet */}
                <div className="glass-panel bg-slate-900/30 border border-slate-850 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <h3 className="font-bold text-base text-white">Recent Accounts</h3>
                    <button onClick={() => setActiveTab('users')} className="text-xs text-primary font-bold hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-slate-900 space-y-3">
                    {users.slice(0, 4).map(u => (
                      <div key={u._id} className="flex items-center justify-between pt-3">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                          <div>
                            <p className="font-bold text-xs text-white leading-tight">{u.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{u.email}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-red-500/10 text-red-400' : u.role === 'landlord' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-primary/10 text-primary'
                        }`}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent listings snippet */}
                <div className="glass-panel bg-slate-900/30 border border-slate-850 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                    <h3 className="font-bold text-base text-white">Recent Listings</h3>
                    <button onClick={() => setActiveTab('properties')} className="text-xs text-primary font-bold hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-slate-900 space-y-3">
                    {properties.slice(0, 4).map(p => (
                      <div key={p._id} className="flex items-center justify-between pt-3">
                        <div className="flex items-center gap-3 truncate">
                          <img src={p.images && p.images[0] ? p.images[0] : "https://via.placeholder.com/100"} className="w-12 h-8 rounded-lg object-cover" alt="" />
                          <div className="truncate">
                            <p className="font-bold text-xs text-white leading-tight truncate">{p.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 truncate">{p.location}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-primary">${p.price}/night</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Users Management */}
            {activeTab === 'users' && (
              <div className="glass-panel bg-slate-900/30 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">User Details</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-slate-900/35 transition-colors">
                          <td className="p-4 flex items-center gap-3">
                            <img src={u.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                            <div>
                              <p className="font-bold text-white text-sm">{u.name}</p>
                              <p className="text-[10px] text-slate-400">{u.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              u.role === 'admin' ? 'bg-red-500/10 text-red-400' : u.role === 'landlord' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-primary/10 text-primary'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-slate-300 font-medium">{u.phone || 'N/A'}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={u._id === user?._id}
                              className="text-red-400 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
                              title="Delete Account"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-slate-500">No users found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Properties Management */}
            {activeTab === 'properties' && (
              <div className="glass-panel bg-slate-900/30 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">Property</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Host</th>
                        <th className="p-4 text-right">Price</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50">
                      {filteredProperties.map(p => (
                        <tr key={p._id} className="hover:bg-slate-900/35 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={p.images && p.images[0] ? p.images[0] : "https://via.placeholder.com/100"} className="w-12 h-8 rounded-lg object-cover border border-slate-800" alt="" />
                              <div>
                                <p className="font-bold text-white text-sm">{p.title}</p>
                                <p className="text-[10px] text-slate-400">{p.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-300 font-medium">{p.propertyType}</td>
                          <td className="p-4 text-slate-300 font-medium">{p.hostId?.name || 'Unknown'}</td>
                          <td className="p-4 text-right font-black text-white">${p.price}/night</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteProperty(p._id)}
                              className="text-red-400 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Delete Listing"
                            >
                              <span className="material-symbols-outlined text-base">delete_forever</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredProperties.length === 0 && (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-500">No properties found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 4: Bookings Audit log */}
            {activeTab === 'bookings' && (
              <div className="glass-panel bg-slate-900/30 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="p-4">Stay / Property</th>
                        <th className="p-4">Guest Details</th>
                        <th className="p-4">Check In/Out</th>
                        <th className="p-4 text-right">Service Value</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50">
                      {filteredBookings.map(b => (
                        <tr key={b._id} className="hover:bg-slate-900/35 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">{b.propertyId?.title || 'Unknown Stay'}</div>
                            <div className="text-[10px] text-slate-400">{b.propertyId?.location || 'Unknown Location'}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-200">{b.guestName}</div>
                            <div className="text-[10px] text-slate-400">{b.guestEmail}</div>
                          </td>
                          <td className="p-4 text-slate-300 font-medium">
                            <div>{new Date(b.checkIn).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</div>
                            <div className="text-[10px] text-slate-500">to {new Date(b.checkOut).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</div>
                          </td>
                          <td className="p-4 text-right font-black text-emerald-400">${b.totalPrice?.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              b.status === 'Confirmed' || b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredBookings.length === 0 && (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-500">No bookings logged.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
