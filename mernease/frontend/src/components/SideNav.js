import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SideNav = ({ active = 'dashboard' }) => {
  const navigate = useNavigate();
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 flex flex-col p-6 space-y-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/30">
      <div className="mb-8">
        <Link to="/" className="font-display-lg text-headline-sm font-black text-primary">RentEase</Link>
      </div>
      <div className="flex items-center space-x-3 mb-6 px-2">
        <img alt="Landlord Avatar" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAMPiHsoqRXJnU9jtP7ZRxwvtcMe8xs9h66uCaHAr75_t2tAPJisVQHeFg5ouUJyS2kabGGGFrIoIN9d0f91db-oORBejXdf_m4F8Eky6zoBs2KaJzINvkm3JMZx6gr-VAhRlKAAlL_VkAB3q9CWYKyK4X8es82iq3pIvcZRtLPXi6PSuAkPlMcQVPshzSvvdOFvdXqmHxmM8F15ZD3Rra9aq-hyTvba1XZ95X8h4i7flxIIVy0R6WRieY3Qi2DzzdDc-C0e9LXzU" />
        <div>
          <p className="font-label-md font-bold text-primary">Host Portal</p>
          <p className="text-xs text-secondary">Premium Management</p>
        </div>
      </div>
      <nav className="flex-grow space-y-2">
        <Link to="/landlord" className={`flex items-center px-4 py-3 rounded-xl transition-all ${active === 'dashboard' ? 'bg-primary-container/20 text-primary font-bold' : 'text-secondary hover:bg-surface-container-low'}`}>
          <span className="material-symbols-outlined mr-3">dashboard</span> Dashboard
        </Link>
        <Link to="/landlord/listings" className={`flex items-center px-4 py-3 rounded-xl transition-all ${active === 'listings' ? 'bg-primary-container/20 text-primary font-bold' : 'text-secondary hover:bg-surface-container-low'}`}>
          <span className="material-symbols-outlined mr-3">domain</span> Listings
        </Link>
        <Link to="/landlord/documents" className={`flex items-center px-4 py-3 rounded-xl transition-all ${active === 'documents' ? 'bg-primary-container/20 text-primary font-bold' : 'text-secondary hover:bg-surface-container-low'}`}>
          <span className="material-symbols-outlined mr-3">folder_open</span> Documents
        </Link>
        <Link to="/messages" className="flex items-center px-4 py-3 text-secondary hover:bg-surface-container-low rounded-xl transition-all">
          <span className="material-symbols-outlined mr-3">chat_bubble</span> Messages
        </Link>
      </nav>
      <button onClick={() => navigate('/landlord/add')} className="w-full bg-primary text-white py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform active:scale-95 mb-4">
        New Property
      </button>
      <div className="border-t border-outline-variant pt-4 space-y-1">
        <button onClick={() => navigate('/tenant')} className="w-full flex items-center px-4 py-2 text-secondary hover:bg-surface-container-low rounded-xl text-sm transition-all">
          <span className="material-symbols-outlined mr-3 text-lg">swap_horiz</span> Role Switch
        </button>
        <button className="w-full flex items-center px-4 py-2 text-secondary hover:bg-surface-container-low rounded-xl text-sm transition-all">
          <span className="material-symbols-outlined mr-3 text-lg">logout</span> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default SideNav;