import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavTop from '../components/NavTop';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const CheckoutPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe', 'paypal', or 'razorpay'

  // Razorpay states
  const [isRzpModalOpen, setIsRzpModalOpen] = useState(false);
  const [rzpOrderDetails, setRzpOrderDetails] = useState(null);
  const [rzpPhone, setRzpPhone] = useState(user?.phone || '9999999999');
  const [rzpCardNumber, setRzpCardNumber] = useState('4111 1111 1111 1111');
  const [rzpCardExpiry, setRzpCardExpiry] = useState('12/29');
  const [rzpCardCvv, setRzpCardCvv] = useState('123');

  // Extract property and booking details from state or fall back to seeded default
  const { property, bookingDetails } = location.state || {
    property: {
      _id: 'default',
      title: 'Azure Heights Villa',
      location: 'Santorini, Greece',
      price: 1250,
      rating: 4.98,
      reviews: 128,
      images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDEgt8S2zyz8WwkVKqhQ-vdM-gVlgt2lOVjlUsedlB-mamFIIfMF9IHKLpEODNM4KLVT2e1niCVvS0l-aTOvp7YDPorCS2liVlDNbsNTIV8LdfU-nsvdmiOrSD4lXtwIMHuYu_ZlOoLpObADq0x78CO3euGNEaZO_GnRxi4HcOgxE9rDv7XrRQOrR5t3Yqrzeb4Kmgt0zCvME2lQJNkHMgYvajnX442ANlq4cARkeTBRKfy8nTjoyAbKWSPNRBhhm6duvIGs2KXITU']
    },
    bookingDetails: {
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      nights: 5,
      serviceFee: 625.00,
      taxAmount: 312.50,
      totalPrice: 7187.50
    }
  };

  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestsCount, setGuestsCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const completeBooking = async (paymentDetails) => {
    setProcessing(true);
    setError('');

    const payload = {
      propertyId: property._id || property.id,
      userId: user?._id,
      guestName,
      guestEmail,
      checkIn: new Date(bookingDetails.checkIn).toISOString(),
      checkOut: new Date(bookingDetails.checkOut).toISOString(),
      guests: Number(guestsCount),
      totalPrice: bookingDetails.totalPrice,
      serviceFee: bookingDetails.serviceFee,
      taxAmount: bookingDetails.taxAmount,
      status: 'Confirmed',
      paymentMethod: paymentDetails.paymentMethod,
      paymentStatus: paymentDetails.paymentStatus,
      specialRequests: specialRequests || null
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit booking');
      }

      setProcessing(false);
      setSuccess(true);
      setTimeout(() => navigate('/tenant'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to record booking details');
      setProcessing(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!guestName || !guestEmail) {
      setError('Please fill in Guest Name and Email');
      return;
    }
    await completeBooking({
      paymentMethod: 'Credit Card (Stripe)',
      paymentStatus: 'Completed'
    });
  };

  const handlePaypalCheckout = () => {
    if (!guestName || !guestEmail) {
      setError('Please fill in Guest Name and Email before proceeding');
      return;
    }
    setError('');

    // Redirect to paypal checkout simulator route with state
    navigate('/paypal-checkout', {
      state: {
        property,
        bookingDetails,
        guestName,
        guestEmail,
        guestsCount,
        specialRequests
      }
    });
  };

  const handleRazorpayCheckout = async () => {
    if (!guestName || !guestEmail) {
      setError('Please fill in Guest Name and Email before proceeding');
      return;
    }
    setError('');
    setProcessing(true);

    try {
      // Convert price from USD to INR at rate of 83 for realistic Razorpay integration
      const inrAmount = Math.round(bookingDetails.totalPrice * 83);
      
      const orderRes = await fetch(`${API_BASE_URL}/api/razorpay/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: bookingDetails.totalPrice,
          currency: 'INR'
        })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const orderData = await orderRes.json();
      
      if (orderData.mock) {
        // Open simulator modal
        setRzpOrderDetails(orderData);
        setIsRzpModalOpen(true);
        setProcessing(false);
      } else {
        // Load real Razorpay checkout script
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'RentEase Premium Rentals',
          description: `Booking for ${property.title}`,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhUS5LsRz4vJXm8dXqoP56KLDKNLYq_R2uTta_iUf31SEvvHsr6ZD7B3DjlsWbwclOIabcBos0WS5Yz3CjbMhudQkLzHTUbDujCWq4z1Sl52T0m_OjThrJis_3DOkf2i5Wty_syIr2fykvDlDfJ6X1weye-6eTZ_zgFqSWnsq55Cixn80STAHpH4ij_E1EQCOHbbVB-HfJCmaL_TFpwfSjbPBOVkI7ag-7lvaf2Jjby_bcUwAOVPBRgc8qriE8k3Bn0TyU7yKX7mE',
          order_id: orderData.id,
          handler: async function (response) {
            await completeBooking({
              paymentMethod: 'Razorpay',
              paymentStatus: 'Completed',
              transactionId: response.razorpay_payment_id
            });
          },
          prefill: {
            name: guestName,
            email: guestEmail,
            contact: rzpPhone
          },
          theme: {
            color: '#10b981'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setProcessing(false);
      }
    } catch (err) {
      setError(err.message || 'Razorpay checkout failed');
      setProcessing(false);
    }
  };

  return (
    <div className="bg-slate-955 text-slate-100 min-h-screen pt-20">
      <NavTop role="tenant" />
      <main className="pt-12 pb-20 px-4 md:px-12 max-w-7xl mx-auto space-y-10">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Confirm and Pay</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Summary Panel */}
          <div className="lg:col-span-5 glass-card bg-slate-900/30 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex gap-4">
              <div className="w-32 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                <img 
                  src={property.images && property.images[0] ? property.images[0] : "https://via.placeholder.com/150"} 
                  className="w-full h-full object-cover" 
                  alt={property.title}
                />
              </div>
              <div className="flex flex-col justify-center space-y-1">
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{property.propertyType || 'Apartment'}</p>
                <h2 className="font-bold text-lg text-white leading-tight">{property.title}</h2>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings: "'FILL' 1"}}>star</span> 
                  {property.rating || '5.0'} <span className="text-slate-500">({property.reviews || '0'} reviews)</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-6 space-y-3">
              <h3 className="font-bold text-base text-white">Booking Duration</h3>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Check-In</span>
                <span className="text-white font-medium">{new Date(bookingDetails.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Check-Out</span>
                <span className="text-white font-medium">{new Date(bookingDetails.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Stay</span>
                <span className="text-white font-medium">{bookingDetails.nights} nights</span>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-6 space-y-3">
              <h3 className="font-bold text-base text-white">Price Details</h3>
              <div className="flex justify-between text-xs text-slate-400">
                <span>${property.price?.toLocaleString()} x {bookingDetails.nights} nights</span>
                <span className="text-slate-200">${(property.price * bookingDetails.nights)?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Vault Service fee</span>
                <span className="text-slate-200">${bookingDetails.serviceFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tax</span>
                <span className="text-slate-200">${bookingDetails.taxAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-white pt-4 border-t border-slate-850">
                <span>Total (USD)</span>
                <span className="text-primary">${bookingDetails.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-7 glass-panel bg-slate-900/30 border border-slate-850 rounded-2xl p-8 shadow-xl">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                <span>{error}</span>
              </div>
            )}
            
            <h2 className="text-2xl font-bold mb-6 text-white">Booking Details & Payment</h2>

            {/* Payment Method Selector */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'stripe'
                    ? 'bg-primary/10 border-primary text-primary font-black animate-pulse-subtle'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-base">credit_card</span>
                <span>Stripe / Card</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'paypal'
                    ? 'bg-[#FFC439]/10 border-[#FFC439] text-[#FFC439] font-black'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-base">payments</span>
                <span>PayPal Express</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-black'
                    : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                <span>Razorpay INR</span>
              </button>
            </div>
            
            <form onSubmit={handlePay} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guest Full Name *</label>
                  <input 
                    required 
                    value={guestName} 
                    onChange={e => setGuestName(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-white outline-none focus:border-primary text-xs" 
                    placeholder="e.g. Alex Johnson" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guest Email Address *</label>
                  <input 
                    required 
                    type="email" 
                    value={guestEmail} 
                    onChange={e => setGuestEmail(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-white outline-none focus:border-primary text-xs" 
                    placeholder="e.g. alex@example.com" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Number of Guests</label>
                  <input 
                    required 
                    type="number" 
                    min="1" 
                    max={property.guests || 10} 
                    value={guestsCount} 
                    onChange={e => setGuestsCount(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-955 border border-slate-850 rounded-xl text-white outline-none focus:border-primary text-xs" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Special Requests</label>
                  <input 
                    value={specialRequests} 
                    onChange={e => setSpecialRequests(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-955 border border-slate-850 rounded-xl text-white outline-none focus:border-primary text-xs" 
                    placeholder="e.g. Late arrival, extra pillows" 
                  />
                </div>
              </div>

              <div className="border-t border-slate-850 my-6"></div>

              {paymentMethod === 'stripe' ? (
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Card Information (Stripe Secure Sandbox)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">credit_card</span>
                      <input 
                        required={paymentMethod === 'stripe'}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-950 border border-slate-850 rounded-xl focus:border-primary text-white outline-none text-xs" 
                        placeholder="Card number" 
                        defaultValue="4242 4242 4242 4242" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        required={paymentMethod === 'stripe'}
                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-850 rounded-xl text-white outline-none focus:border-primary text-xs" 
                        placeholder="MM / YY" 
                        defaultValue="12/28" 
                      />
                      <input 
                        required={paymentMethod === 'stripe'}
                        className="w-full px-4 py-3.5 bg-slate-950 border border-slate-850 rounded-xl text-white outline-none focus:border-primary text-xs" 
                        placeholder="CVV" 
                        defaultValue="123" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={processing} 
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-3 mt-8 ${
                      success 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-primary hover:bg-primary/95 text-white active:scale-[0.98]'
                    }`}
                  >
                    {processing ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : success ? (
                      "Payment Confirmed"
                    ) : (
                      <>
                        <span>Confirm & Pay ${bookingDetails.totalPrice?.toLocaleString()}</span>
                        <span className="material-symbols-outlined text-sm">lock</span>
                      </>
                    )}
                  </button>
                </>
              ) : paymentMethod === 'paypal' ? (
                <div className="space-y-6 pt-2">
                  <div className="p-4 bg-[#FFC439]/5 border border-[#FFC439]/20 rounded-2xl text-xs text-slate-300 leading-relaxed flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#FFC439] text-base shrink-0">info</span>
                    <p>
                      Clicking the PayPal button below will launch the PayPal secure verification portal. Once approved, the booking will be verified and stored on your account logs.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handlePaypalCheckout}
                    className="w-full py-4 bg-[#FFC439] hover:bg-[#F2B224] text-[#003087] font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all"
                  >
                    <span className="font-sans italic font-black text-lg">Pay<span className="text-[#0079C1]">Pal</span></span>
                    <span className="font-bold text-xs">Express Checkout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6 pt-2">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-xs text-slate-300 leading-relaxed flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-400 text-base shrink-0">info</span>
                    <p>
                      Clicking the Razorpay button below will initialize a secure transaction in Indian Rupees (INR) at an exchange rate of ₹83 per USD. You can complete the checkout using simulated Razorpay test methods.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleRazorpayCheckout}
                    disabled={processing}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {processing ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                        <span>Pay with Razorpay (₹{Math.round(bookingDetails.totalPrice * 83).toLocaleString()})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Razorpay In-App Sandbox Simulator */}
      {isRzpModalOpen && rzpOrderDetails && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-[#0b1220] border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Merchant Header */}
            <div className="bg-[#0b1e36] border-b border-slate-850 p-6 flex justify-between items-center relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <span className="material-symbols-outlined text-xl">payments</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">RentEase Premium Rentals</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Order ID: {rzpOrderDetails.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRzpModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Amount Display */}
            <div className="bg-slate-950/40 p-6 flex justify-between items-center border-b border-slate-900">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount Payable</span>
              <span className="text-xl font-black text-emerald-400">
                {(rzpOrderDetails.amount / 100).toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR'
                })}
              </span>
            </div>

            {/* Simulator Inputs Form */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] text-emerald-400 flex items-start gap-2">
                <span className="material-symbols-outlined text-sm shrink-0">verified_user</span>
                <p>
                  You are operating in Razorpay Sandbox (Test Mode). No real funds will be charged.
                </p>
              </div>

              {/* Contact info prefill */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prefill & Contact Info</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">Email</span>
                    <input 
                      disabled
                      value={guestEmail} 
                      className="px-3 py-2 bg-slate-950 border border-slate-900 text-xs text-slate-400 rounded-lg outline-none" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">Contact Number</span>
                    <input 
                      type="text" 
                      value={rzpPhone} 
                      onChange={e => setRzpPhone(e.target.value)} 
                      className="px-3 py-2 bg-slate-950 border border-slate-850 focus:border-emerald-500 text-xs text-white rounded-lg outline-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-3 pt-2">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Simulate Card Transaction</h5>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">Card Number</span>
                  <input 
                    type="text" 
                    value={rzpCardNumber} 
                    onChange={e => setRzpCardNumber(e.target.value)} 
                    className="px-3 py-2 bg-slate-950 border border-slate-850 focus:border-emerald-500 text-xs text-white rounded-lg outline-none" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">Expiry</span>
                    <input 
                      type="text" 
                      value={rzpCardExpiry} 
                      onChange={e => setRzpCardExpiry(e.target.value)} 
                      className="px-3 py-2 bg-slate-950 border border-slate-850 focus:border-emerald-500 text-xs text-white rounded-lg outline-none" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400">CVV</span>
                    <input 
                      type="password" 
                      value={rzpCardCvv} 
                      onChange={e => setRzpCardCvv(e.target.value)} 
                      className="px-3 py-2 bg-slate-950 border border-slate-850 focus:border-emerald-500 text-xs text-white rounded-lg outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Simulator Actions */}
            <div className="bg-slate-950/60 p-6 border-t border-slate-900 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setIsRzpModalOpen(false);
                    await completeBooking({
                      paymentMethod: 'Razorpay (Simulated)',
                      paymentStatus: 'Completed',
                      transactionId: `pay_rzp_mock_${Math.random().toString(36).substring(2, 10)}`
                    });
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all animate-none"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Simulate Success</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsRzpModalOpen(false);
                    setError('Razorpay payment authorization rejected by user.');
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  <span>Simulate Failure</span>
                </button>
              </div>

              {/* Razorpay Brand Footer */}
              <div className="flex justify-center items-center gap-1 text-[9px] text-slate-500 pt-2 font-medium">
                <span className="material-symbols-outlined text-[10px] text-emerald-500">verified</span>
                <span>Secured by Razorpay. Test API Gateway active.</span>
              </div>
            </div>

          </div>
        </div>
      )}

      <div className={`success-toast fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${
        success ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}>
        <div className="glass-card bg-slate-900 border-emerald-500/30 px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <span className="material-symbols-outlined">check</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm">Success! Deposit Secured</p>
            <p className="text-xs text-slate-400">A reservation receipt has been logged to your bookings list.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;