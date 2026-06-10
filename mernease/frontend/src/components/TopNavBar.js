import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TopNavBar = ({ activeRole = 'tenant' }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-secondary/60 backdrop-blur-xl border-b border-white/20 dark:border-outline-variant/10 shadow-[0_20px_40px_rgba(0,0,0,0.05)] h-20">
      <div className="flex justify-between items-center h-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <Link to="/" className="flex items-center gap-2 hover:scale-[1.02] transition-transform duration-200 ease-out">
          <span className="font-display-lg text-headline-sm md:text-display-lg font-bold text-primary dark:text-inverse-primary tracking-tight">RentEase</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-secondary dark:text-secondary-fixed-dim font-medium hover:text-primary transition-colors font-label-md" to="/discover">Discover</Link>
          <Link className="text-secondary dark:text-secondary-fixed-dim font-medium hover:text-primary transition-colors font-label-md" to={activeRole === 'landlord' ? '/landlord' : '/tenant'}>Dashboard</Link>
          <Link className="text-secondary dark:text-secondary-fixed-dim font-medium hover:text-primary transition-colors font-label-md" to="/messages">Messages</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(activeRole === 'landlord' ? '/tenant' : '/landlord')}
            className="hidden lg:flex items-center px-5 py-2.5 rounded-full bg-primary-container text-white font-label-md hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
            Switch to {activeRole === 'landlord' ? 'Tenant' : 'Landlord'}
          </button>
          <button onClick={toggleTheme} aria-label="Toggle Theme" className="p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined dark:hidden">dark_mode</span>
            <span className="material-symbols-outlined hidden dark:block text-primary-fixed-dim">light_mode</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline-variant hover:scale-[1.02] transition-transform cursor-pointer">
            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhUS5LsRz4vJXm8dXqoP56KLDKNLYq_R2uTta_iUf31SEvvHsr6ZD7B3DjlsWbwclOIabcBos0WS5Yz3CjbMhudQkLzHTUbDujCWq4z1Sl52T0m_OjThrJis_3DOkf2i5Wty_syIr2fykvDlDfJ6X1weye-6eTZ_zgFqSWnsq55Cixn80STAHpH4ij_E1EQCOHbbVB-HfJCmaL_TFpwfSjbPBOVkI7ag-7lvaf2Jjby_bcUwAOVPBRgc8qriE8k3Bn0TyU7yKX7mE" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;