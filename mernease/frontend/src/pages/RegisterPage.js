import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavTop from '../components/NavTop';

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-55 text-slate-900 dark:bg-slate-900 dark:text-white flex flex-col justify-between transition-colors duration-300">
      <NavTop />
      
      <main className="flex-grow flex items-center justify-center px-4 py-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-slate-50 to-slate-100 dark:from-primary/20 dark:via-slate-955 dark:to-slate-950">
        <div className="w-full max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-650 dark:from-white dark:via-slate-100 dark:to-slate-400">
              Create Your Account
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Choose your account type below to get started on the RentEase platform.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tenant Card */}
            <div 
              onClick={() => navigate('/register/tenant')}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(53,37,205,0.08)] dark:hover:shadow-[0_0_50px_rgba(53,37,205,0.15)] flex flex-col justify-between p-8 md:p-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 dark:from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-3xl">person_add</span>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    Tenant Account
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Sign up as a guest to browse properties, message hosts, schedule dates, and complete secure reservations.
                  </p>
                </div>
              </div>

              <div className="relative mt-8 flex items-center gap-2 text-primary font-bold text-sm">
                <span>Register as Tenant</span>
                <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-2">arrow_forward</span>
              </div>
            </div>

            {/* Landlord Card */}
            <div 
              onClick={() => navigate('/register/landlord')}
              className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(16,185,129,0.08)] dark:hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col justify-between p-8 md:p-10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 dark:from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-3xl">domain_add</span>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                    Host/Landlord Account
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Create a host portfolio. Gain access to listing forms, earnings metrics dashboards, and a legal agreement vault.
                  </p>
                </div>
              </div>

              <div className="relative mt-8 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <span>Register as Landlord</span>
                <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-2">arrow_forward</span>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-800/60">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-bold underline transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;