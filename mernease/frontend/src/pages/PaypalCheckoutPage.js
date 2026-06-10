import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const PaypalCheckoutPage = () => {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract payment metadata from navigation state
  const checkoutData = location.state || null;
  const { property, bookingDetails, guestName, guestEmail, guestsCount, specialRequests } = checkoutData || {};

  const [email, setEmail] = useState(guestEmail || '');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Login, 2: Review Order & Pay, 3: Processing, 4: Success, 5: Error
  const [errorMessage, setErrorMessage] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');

  useEffect(() => {
    if (!checkoutData || !property || !bookingDetails) {
      setStep(5);
      setErrorMessage('Invalid transaction checkout context. Missing property or invoice parameters.');
    }
  }, [checkoutData, property, bookingDetails]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your PayPal account email address.');
      return;
    }
    setErrorMessage('');
    setStep(2); // Go to review and pay
  };

  const handleCompletePayment = async () => {
    setStep(3);
    setProcessingStatus('Contacting merchant server...');

    const payload = {
      propertyId: property._id || property.id,
      guestName,
      guestEmail,
      checkIn: new Date(bookingDetails.checkIn).toISOString(),
      checkOut: new Date(bookingDetails.checkOut).toISOString(),
      guests: Number(guestsCount || 1),
      totalPrice: bookingDetails.totalPrice,
      serviceFee: bookingDetails.serviceFee,
      taxAmount: bookingDetails.taxAmount,
      status: 'Confirmed',
      paymentMethod: 'PayPal',
      paymentStatus: 'Completed',
      specialRequests: specialRequests || null
    };

    try {
      // Step-by-step progress text for visual wow factor
      setTimeout(() => setProcessingStatus('Authenticating secure transaction token...'), 800);
      setTimeout(() => setProcessingStatus('Authorizing deposit of $' + bookingDetails.totalPrice.toLocaleString() + '...'), 1600);

      // Hit API endpoint to write booking to database
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
        throw new Error(errData.error || 'Database rejected booking registration.');
      }

      setTimeout(() => {
        setStep(4); // Payment success
        // Auto redirect to tenant dashboard after 3.5 seconds
        setTimeout(() => {
          navigate('/tenant', { state: { bookingSuccess: true } });
        }, 3500);
      }, 2400);

    } catch (err) {
      console.error(err);
      setStep(5);
      setErrorMessage(err.message || 'An unexpected connection error occurred during payment capture.');
    }
  };

  if (step === 5) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] font-sans flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-red-100 text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">PayPal Error</h2>
          <p className="text-slate-500 text-sm leading-relaxed">{errorMessage}</p>
          <button
            onClick={() => navigate('/checkout', { state: checkoutData })}
            className="w-full py-3 bg-[#0079C1] hover:bg-[#005c93] text-white font-bold rounded-xl text-sm transition-all"
          >
            Return to RentEase Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] font-sans flex flex-col justify-between text-slate-700">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-5 px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <span className="font-sans italic font-black text-2xl text-[#003087]">
            Pay<span className="text-[#0079C1]">Pal</span>
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="material-symbols-outlined text-sm text-emerald-500">lock</span>
            <span>Secure 256-bit Sandbox Session</span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-10 border border-slate-100 text-center space-y-6">
            <div className="w-16 h-16 border-4 border-[#003087]/20 border-t-[#003087] rounded-full animate-spin mx-auto"></div>
            <h2 className="text-lg font-bold text-slate-800">Processing Your Payment</h2>
            <p className="text-xs text-slate-400">{processingStatus}</p>
            <p className="text-[10px] text-slate-400 italic">Please do not close this window or click refresh.</p>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-10 border border-slate-100 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Payment Completed!</h2>
            <p className="text-sm text-slate-500">
              Deposit authorization approved. We are registering your RentEase reservation logs.
            </p>
            <p className="text-xs text-slate-400">
              Redirecting you back to your RentEase dashboard shortly...
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Login Card */}
            <div className="md:col-span-7 bg-white rounded-2xl shadow-md border border-slate-100 p-8 space-y-6">
              <h2 className="text-xl font-medium text-slate-850">Pay with PayPal</h2>
              <p className="text-xs text-slate-500 -mt-3">Log in to your sandbox account to complete the deposit payment.</p>

              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs flex gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:border-[#0079C1] focus:ring-1 focus:ring-[#0079C1] outline-none"
                    placeholder="Email or mobile number"
                  />
                </div>
                <div className="space-y-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:border-[#0079C1] focus:ring-1 focus:ring-[#0079C1] outline-none"
                    placeholder="Password"
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <a href="#forgot" className="text-[#0079C1] font-bold hover:underline">Forgot email or password?</a>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0079C1] hover:bg-[#005c93] text-white font-bold rounded-xl text-sm transition-all"
                >
                  Log In
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-xs uppercase font-semibold">or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-[#f4f4f4] hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all border border-slate-200"
              >
                Pay with Debit or Credit Card
              </button>
            </div>

            {/* Right Summary Panel */}
            <div className="md:col-span-5 bg-white rounded-2xl shadow-md border border-slate-100 p-6 space-y-6">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 uppercase tracking-wider">Order Details</h3>
              
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0">
                  <img src={property?.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-800 truncate">{property?.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{property?.location}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-500 border-t border-b border-slate-100 py-4">
                <div className="flex justify-between">
                  <span>Stay Duration</span>
                  <span className="text-slate-800 font-medium">{bookingDetails?.nights} nights</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-In</span>
                  <span className="text-slate-800 font-medium">{bookingDetails?.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guest</span>
                  <span className="text-slate-800 font-medium">{guestName}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                <span>Total Due</span>
                <span className="text-lg text-[#003087]">${bookingDetails?.totalPrice?.toLocaleString()} USD</span>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-md border border-slate-100 p-8 space-y-6">
            <h2 className="text-xl font-bold text-slate-850">Review Your Payment</h2>
            
            <div className="bg-[#f0f4f7] rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500">Authorized Merchant</p>
                <p className="text-sm font-bold text-slate-800">RentEase Luxury Rentals Portal</p>
              </div>
              <span className="font-sans italic font-black text-lg text-[#003087]">
                Pay<span className="text-[#0079C1]">Pal</span>
              </span>
            </div>

            <div className="space-y-4 border-b border-slate-100 pb-5">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Payment Method</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-500 text-2xl">account_balance_wallet</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">PayPal Balance</p>
                    <p className="text-[10px] text-slate-400">Default Sandbox Profile Account</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">Primary</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Order Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>RentEase Stay Fee</span>
                  <span>${(property?.price * bookingDetails?.nights)?.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Taxes & Service Fees</span>
                  <span>${(bookingDetails?.serviceFee + bookingDetails?.taxAmount)?.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-800 pt-2 border-t border-slate-100">
                  <span>Total Payment</span>
                  <span>${bookingDetails?.totalPrice?.toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCompletePayment}
                className="flex-1 py-3.5 bg-[#FFC439] hover:bg-[#F2B224] text-[#003087] font-black rounded-xl text-sm transition-all shadow-md active:scale-[0.98]"
              >
                Complete Purchase
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center leading-relaxed mt-2">
              By clicking "Complete Purchase", you authorize PayPal to securely transfer the deposit funds to RentEase.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-[10px] text-slate-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Copyright © 2026 PayPal. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:underline">Privacy Policy</a>
            <a href="#legal" className="hover:underline">Legal Agreements</a>
            <a href="#feedback" className="hover:underline">Provide Feedback</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PaypalCheckoutPage;
