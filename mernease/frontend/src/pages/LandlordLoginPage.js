import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavTop from '../components/NavTop';

const LandlordLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role !== 'landlord') {
        // If not a landlord, sign out and show error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('This account is registered as a Tenant. Please log in through the Tenant Portal.');
      }
      navigate('/landlord');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify host credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
      <NavTop />
      
      <main className="flex-grow flex items-center justify-center relative px-4 py-24 overflow-hidden">
        {/* Background Image with Dark Professional Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80" 
            className="w-full h-full object-cover filter brightness-[0.5] dark:brightness-[0.2] contrast-[1.1]" 
            alt="Commercial Real Estate Skyline" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent dark:from-slate-955 dark:via-slate-950/60 dark:to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-md">
          <div className="glass-panel p-8 md:p-10 rounded-3xl border border-slate-200/50 dark:border-emerald-500/10 bg-white/85 dark:bg-slate-955/75 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-8">
            <div className="text-center space-y-2">
              <span className="text-emerald-500 dark:text-emerald-400 text-xs font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                Host Portal
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">Portfolio Manager</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Sign in to manage listings and track yields</p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 text-red-400 text-sm items-start">
                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">error</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Host Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="eleni@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>Opening Vault...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                    <span>Host Access</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800/40 text-xs text-slate-500 dark:text-slate-400">
              <p>
                Looking for rentals?{' '}
                <Link to="/login/tenant" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
                  Go to Tenant Login
                </Link>
              </p>
              <p className="mt-2">
                Want to list properties?{' '}
                <Link to="/register/landlord" className="text-slate-800 dark:text-white hover:underline font-bold">
                  Join as Host
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandlordLoginPage;
