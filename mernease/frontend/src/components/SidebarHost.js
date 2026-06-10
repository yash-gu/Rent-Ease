import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const SidebarHost = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navLink = (path, icon, label) => (
    <Link 
      to={path} 
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${location.pathname === path ? 'nav-active' : 'text-secondary hover:bg-surface-container-low'}`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-label-md">{label}</span>
    </Link>
  );

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-40 sidebar-glass border-r border-white/20 flex flex-col p-6 space-y-4">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-primary">Host Portal</h1>
        <p className="text-xs text-secondary font-medium uppercase tracking-wider">Premium Management</p>
      </div>
      <div className="flex flex-col space-y-1 flex-grow">
        {navLink("/landlord", "dashboard", "Dashboard")}
        {navLink("/landlord/listings", "domain", "Listings")}
        {navLink("/landlord/bookings", "calendar_today", "Bookings")}
        {navLink("/messages", "chat", "Messages")}
        {navLink("/landlord/documents", "folder_open", "Documents")}
        {navLink("/landlord/earnings", "payments", "Earnings")}
      </div>
      <div className="pt-6 border-t border-outline-variant space-y-1">
        <button 
          onClick={() => navigate("/landlord/add")} 
          className="w-full bg-primary text-white py-3 rounded-full font-bold shadow-lg hover-scale active-scale mb-4"
        >
          New Property
        </button>
        <a className="flex items-center gap-3 p-3 text-secondary hover:bg-surface-container-low rounded-xl transition-all" href="#">
          <span className="material-symbols-outlined">help</span>
          <span className="font-label-md">Help Center</span>
        </a>
        <Link to="/" className="flex items-center gap-3 p-3 text-secondary hover:bg-surface-container-low rounded-xl transition-all">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-label-md">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
};

export default SidebarHost;