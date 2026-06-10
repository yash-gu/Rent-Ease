import React, { useEffect, useState } from 'react';
import SidebarHost from '../components/SidebarHost';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const HostEarnings = () => {
  const { user, token } = useAuth();
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    occupancyRate: 0,
    averageDailyRate: 342 // Fallback default
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        // Fetch earnings log
        const earnRes = await fetch(`${API_BASE_URL}/api/earnings/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!earnRes.ok) throw new Error('Failed to load earnings log');
        const earnData = await earnRes.json();
        // Backend returns newest first. Let's store them
        setEarnings(earnData);

        // Fetch stats
        const statsRes = await fetch(`${API_BASE_URL}/api/dashboard/stats/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!statsRes.ok) throw new Error('Failed to load financial statistics');
        const statsData = await statsRes.json();
        setStats(prev => ({
          ...prev,
          totalEarnings: statsData.totalEarnings || 0,
          occupancyRate: statsData.occupancyRate || 0
        }));

      } catch (err) {
        setError(err.message || 'Error occurred while retrieving financials');
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, [user, token]);

  return (
    <div className="flex bg-slate-955 min-h-screen text-slate-100">
      <SidebarHost />
      
      <main className="ml-64 p-8 md:p-12 w-full space-y-12 pb-32">
        <header className="space-y-2 border-b border-slate-900 pb-6">
          <span className="text-emerald-400 text-xs font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            Financial Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mt-3 tracking-tight">Earnings Dashboard</h1>
          <p className="text-slate-400 mt-1 font-medium">Track your revenue streams, check bookings performance, and execute payouts.</p>
        </header>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400 text-sm">
            <span className="material-symbols-outlined text-lg">error</span>
            <p>{error}</p>
          </div>
        )}

        {/* Dynamic Financial Overview Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-panel bg-slate-900/30 border border-slate-850 p-8 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Revenue</h3>
              <p className="text-3xl font-black text-white">${stats.totalEarnings?.toLocaleString() || '0'}</p>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold pt-2">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                <span>+9.7% vs last year</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-3xl">trending_up</span>
            </div>
          </div>
          
          <div className="glass-panel bg-slate-900/30 border border-slate-850 p-8 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Average Daily Rate</h3>
              <p className="text-3xl font-black text-white">${stats.averageDailyRate}</p>
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold pt-2">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                <span>+5.2% vs last quarter</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-3xl">payments</span>
            </div>
          </div>
          
          <div className="glass-panel bg-slate-900/30 border border-slate-850 p-8 rounded-2xl shadow-xl flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Occupancy Rate</h3>
              <p className="text-3xl font-black text-white">{stats.occupancyRate}%</p>
              <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold pt-2">
                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                <span>+7.3% vs last month</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
              <span className="material-symbols-outlined text-3xl">calendar_month</span>
            </div>
          </div>
        </section>

        {/* Monthly Performance Table */}
        <section className="glass-panel bg-slate-900/20 border border-slate-850 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-850 bg-slate-900/40">
            <h3 className="text-xl font-bold text-white">Monthly Performance Log</h3>
            <p className="text-xs text-slate-400 mt-1">Audit log of payouts and bookings volume.</p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 text-sm">Analyzing ledger...</p>
            </div>
          ) : earnings.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-600">receipt_long</span>
              <p className="text-sm font-medium">No ledger sheets filed yet.</p>
              <p className="text-xs max-w-xs mx-auto">Earnings summaries will generate automatically when bookings settle.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-900/10 text-slate-400">
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Statement Period</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Revenue Settled</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Occupancy</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Bookings Volume</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {earnings.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-white">{item.month} {item.year}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400">${item.revenue?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{item.occupancyRate}%</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{item.bookings} stays</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                          <span className="material-symbols-outlined text-sm">trending_up</span>
                          <span>Growth positive</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        
        {/* Withdrawal Options section */}
        <section className="glass-panel bg-slate-900/30 border border-slate-850 p-8 rounded-2xl shadow-xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white">Withdrawal & Payout Methods</h3>
            <p className="text-xs text-slate-400 mt-1">Direct payout gateways linked to your portfolio accounts.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-855 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors cursor-pointer group flex flex-col justify-between h-48">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Bank Transfer (ACH)</h4>
                  <p className="text-slate-400 text-xs mt-1">Direct deposit settlement in 1-2 business days.</p>
                </div>
              </div>
              <button className="text-emerald-400 font-bold text-xs text-left group-hover:translate-x-1 transition-transform mt-4 block">
                Configure Routing →
              </button>
            </div>
            
            <div className="bg-slate-950 border border-slate-855 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors cursor-pointer group flex flex-col justify-between h-48">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">payments</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">PayPal Checkout</h4>
                  <p className="text-slate-400 text-xs mt-1">Instant transfers available immediately.</p>
                </div>
              </div>
              <button className="text-emerald-400 font-bold text-xs text-left group-hover:translate-x-1 transition-transform mt-4 block">
                Connect Account →
              </button>
            </div>
            
            <div className="bg-slate-950 border border-slate-855 rounded-2xl p-6 hover:border-emerald-500/40 transition-colors cursor-pointer group flex flex-col justify-between h-48">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">credit_card</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Wire Transfer</h4>
                  <p className="text-slate-400 text-xs mt-1">International wire transfer settlement in 3-5 days.</p>
                </div>
              </div>
              <button className="text-emerald-400 font-bold text-xs text-left group-hover:translate-x-1 transition-transform mt-4 block">
                Learn Requirements →
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HostEarnings;