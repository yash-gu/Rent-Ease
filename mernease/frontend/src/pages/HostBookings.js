import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarHost from '../components/SidebarHost';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const HostBookings = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All'); // 'All', 'Confirmed', 'Pending', 'Cancelled'

  const fetchBookings = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/host/bookings/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load host reservations');
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Error occurred while loading reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user, token]);

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update reservation status');
      
      // Update local state
      setBookings(prev => 
        prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b)
      );
    } catch (err) {
      setError(err.message || 'Error updating booking');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'All') return true;
    return b.status === filter;
  });

  return (
    <div className="flex bg-slate-955 min-h-screen text-slate-100">
      <SidebarHost />
      
      <main className="ml-64 p-8 md:p-12 w-full space-y-12 pb-32">
        <header className="space-y-2 border-b border-slate-900 pb-6">
          <span className="text-emerald-400 text-xs font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            Reservation Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-100 mt-3 tracking-tight">Booking Management</h1>
          <p className="text-slate-400 mt-1 font-medium">Approve, cancel, and audit guest reservations across your portfolio.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            <p>{error}</p>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            {['All', 'Pending', 'Confirmed', 'Cancelled'].map((roleFilter) => (
              <button 
                key={roleFilter}
                onClick={() => setFilter(roleFilter)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  filter === roleFilter 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'bg-slate-900 border border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                {roleFilter} Stays
              </button>
            ))}
          </div>
        </div>

        {/* Table list */}
        <section className="glass-panel bg-slate-900/20 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-850 bg-slate-900/40">
            <h3 className="text-xl font-bold text-slate-100">Guest Reservations Ledger</h3>
            <p className="text-xs text-slate-400 mt-1">Audit guest arrivals and confirm reservations.</p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 text-xs">Retrieving ledger sheets...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-650">event_busy</span>
              <p className="text-sm font-medium">No reservations filed under status "{filter}".</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-900/10 text-slate-400">
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Guest Name</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Property Booked</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Stay Dates</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Stays Guests</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Booking Status</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Payout Amount</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Confirmations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-900/30 transition-colors">
                      {/* Guest details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-850 border border-slate-800 shrink-0">
                            <img src={b.userId?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDhUS5LsRz4vJXm8dXqoP56KLDKNLYq_R2uTta_iUf31SEvvHsr6ZD7B3DjlsWbwclOIabcBos0WS5Yz3CjbMhudQkLzHTUbDujCWq4z1Sl52T0m_OjThrJis_3DOkf2i5Wty_syIr2fykvDlDfJ6X1weye-6eTZ_zgFqSWnsq55Cixn80STAHpH4ij_E1EQCOHbbVB-HfJCmaL_TFpwfSjbPBOVkI7ag-7lvaf2Jjby_bcUwAOVPBRgc8qriE8k3Bn0TyU7yKX7mE"} className="w-full h-full object-cover" alt="Guest"/>
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{b.guestName || b.userId?.name}</p>
                            <p className="text-[10px] text-slate-500">{b.guestEmail || b.userId?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Property Title */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-white">{b.propertyId?.title || 'Unknown Asset'}</span>
                      </td>

                      {/* Stay Dates */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-slate-300">
                          <span className="font-semibold">{formatDate(b.checkIn)}</span>
                          <span className="text-slate-500">to {formatDate(b.checkOut)}</span>
                        </div>
                      </td>

                      {/* Guests number */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-slate-300 text-xs">
                          <span className="material-symbols-outlined text-sm text-slate-500">group</span>
                          <span>{b.guests} guests</span>
                        </div>
                      </td>

                      {/* Status tag */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(b.status)}`}>
                          {b.status}
                        </span>
                      </td>

                      {/* Payout price */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-emerald-400">${b.totalPrice?.toLocaleString()}</span>
                      </td>

                      {/* Actions Confirmation */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.userId && (
                            <button 
                              onClick={() => navigate('/messages', { state: { recipient: b.userId } })}
                              className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold transition-all"
                              title="Message Guest"
                            >
                              <span className="material-symbols-outlined text-sm block">chat</span>
                            </button>
                          )}
                          {b.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => updateBookingStatus(b._id, 'Confirmed')}
                                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all"
                                title="Confirm Stay"
                              >
                                <span className="material-symbols-outlined text-sm block">check</span>
                              </button>
                              <button 
                                onClick={() => updateBookingStatus(b._id, 'Cancelled')}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all"
                                title="Decline Stay"
                              >
                                <span className="material-symbols-outlined text-sm block">close</span>
                              </button>
                            </>
                          )}
                          {b.status === 'Confirmed' && (
                            <button 
                              onClick={() => updateBookingStatus(b._id, 'Cancelled')}
                              className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-red-500/30 hover:text-red-400 rounded-lg text-[10px] font-bold text-slate-400 transition-all"
                            >
                              Cancel Stay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default HostBookings;