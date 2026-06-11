import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavTop = ({ role = "tenant" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, isLandlord, isAdmin } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const linkClass = (path) => `font-label-md text-label-md font-medium transition-colors ${location.pathname === path ? 'text-primary dark:text-primary-fixed border-b-2 border-primary pb-1' : 'text-secondary dark:text-secondary-fixed-dim hover:text-primary'}`;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-secondary/60 backdrop-blur-xl border-b border-white/20 dark:border-outline-variant/10 shadow-[0_20px_40px_rgba(0,0,0,0.05)] h-20">
      <div className="flex justify-between items-center h-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <Link to="/" className="flex items-center gap-2 hover:scale-[1.02] transition-transform">
          <span className="text-2xl font-black text-primary dark:text-inverse-primary tracking-tight">RentEase</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {isAuthenticated && (
            <>
              <Link to="/discover" className={linkClass("/discover")}>Discover</Link>
              {isAdmin ? (
                <Link to="/admin" className={linkClass("/admin")}>Admin Panel</Link>
              ) : (
                <Link to={isLandlord ? "/landlord" : "/bookings"} className={linkClass(isLandlord ? "/landlord" : "/bookings")}>
                  {isLandlord ? "Manage" : "Bookings"}
                </Link>
              )}
              <Link to="/messages" className={linkClass("/messages")}>Messages</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hidden lg:inline-block items-center px-5 py-2.5 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-all text-sm">
                <span className="material-symbols-outlined inline mr-1" style={{ fontSize: '18px' }}>login</span> Login
              </Link>
              <Link to="/register" className="hidden lg:inline-block items-center px-5 py-2.5 rounded-full bg-primary text-white font-bold hover:opacity-90 transition-all text-sm">
                <span className="material-symbols-outlined inline mr-1" style={{ fontSize: '18px' }}>person_add</span> Sign Up
              </Link>
            </>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-surface-container rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant">
                  <img src={user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDhUS5LsRz4vJXm8dXqoP56KLDKNLYq_R2uTta_iUf31SEvvHsr6ZD7B3DjlsWbwclOIabcBos0WS5Yz3CjbMhudQkLzHTUbDujCWq4z1Sl52T0m_OjThrJis_3DOkf2i5Wty_syIr2fykvDlDfJ6X1weye-6eTZ_zgFqSWnsq55Cixn80STAHpH4ij_E1EQCOHbbVB-HfJCmaL_TFpwfSjbPBOVkI7ag-7lvaf2Jjby_bcUwAOVPBRgc8qriE8k3Bn0TyU7yKX7mE"} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <span className="hidden md:inline text-sm font-medium text-on-surface">{user?.name}</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: '18px' }}>expand_more</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 glass-panel rounded-lg shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant/20">
                    <p className="text-sm font-bold text-on-surface">{user?.name}</p>
                    <p className="text-xs text-secondary capitalize">{user?.role}</p>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-secondary hover:text-primary">
                      <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-secondary hover:text-primary">
                    <span className="material-symbols-outlined text-lg">person</span>
                    <span>Profile</span>
                  </Link>
                  <Link to="/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-secondary hover:text-primary">
                    <span className="material-symbols-outlined text-lg">settings</span>
                    <span>Settings</span>
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-secondary hover:text-error text-left">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default NavTop;