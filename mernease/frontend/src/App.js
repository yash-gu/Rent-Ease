import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TenantLoginPage from './pages/TenantLoginPage';
import LandlordLoginPage from './pages/LandlordLoginPage';
import TenantRegisterPage from './pages/TenantRegisterPage';
import LandlordRegisterPage from './pages/LandlordRegisterPage';
import TenantDashboard from './pages/TenantDashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import PropertyDetails from './pages/PropertyDetails';
import DiscoverMap from './pages/DiscoverMap';
import StreetViewPage from './pages/StreetViewPage';
import MessagingPortal from './pages/MessagingPortal';
import CheckoutPage from './pages/CheckoutPage';
import PaypalCheckoutPage from './pages/PaypalCheckoutPage';
import LandlordAddListing from './pages/LandlordAddListing';
import LandlordDocuments from './pages/LandlordDocuments';
import HostEarnings from './pages/HostEarnings';
import HostBookings from './pages/HostBookings';
import AdminDashboard from './pages/AdminDashboard';
import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AIAssistant />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/tenant" element={<TenantLoginPage />} />
          <Route path="/login/landlord" element={<LandlordLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/tenant" element={<TenantRegisterPage />} />
          <Route path="/register/landlord" element={<LandlordRegisterPage />} />

          {/* Protected Routes */}
          <Route path="/discover" element={<ProtectedRoute><DiscoverMap /></ProtectedRoute>} />
          <Route path="/details" element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>} />
          <Route path="/property-details" element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>} />
          <Route path="/street-view" element={<ProtectedRoute><StreetViewPage /></ProtectedRoute>} />
          
          {/* Tenant Routes */}
          <Route path="/bookings" element={<ProtectedRoute requiredRole="tenant"><TenantDashboard /></ProtectedRoute>} />
          <Route path="/tenant" element={<ProtectedRoute requiredRole="tenant"><TenantDashboard /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute requiredRole="tenant"><CheckoutPage /></ProtectedRoute>} />
          <Route path="/paypal-checkout" element={<ProtectedRoute requiredRole="tenant"><PaypalCheckoutPage /></ProtectedRoute>} />
          <Route path="/discovery" element={<ProtectedRoute requiredRole="tenant"><DiscoverMap /></ProtectedRoute>} />
          
          {/* Landlord Routes */}
          <Route path="/landlord" element={<ProtectedRoute requiredRole="landlord"><LandlordDashboard /></ProtectedRoute>} />
          <Route path="/landlord/add" element={<ProtectedRoute requiredRole="landlord"><LandlordAddListing /></ProtectedRoute>} />
          <Route path="/landlord/documents" element={<ProtectedRoute requiredRole="landlord"><LandlordDocuments /></ProtectedRoute>} />
          <Route path="/landlord/earnings" element={<ProtectedRoute requiredRole="landlord"><HostEarnings /></ProtectedRoute>} />
          <Route path="/landlord/bookings" element={<ProtectedRoute requiredRole="landlord"><HostBookings /></ProtectedRoute>} />
          <Route path="/landlord/listings" element={<ProtectedRoute requiredRole="landlord"><LandlordDashboard /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          
          {/* Shared Routes */}
          <Route path="/messages" element={<ProtectedRoute><MessagingPortal /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Navigate to={localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).role === 'landlord' ? '/landlord' : '/bookings'} /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;