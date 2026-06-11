import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavTop from '../components/NavTop';
import Footer from '../components/Footer';
import DatePicker from '../components/DatePicker';

const LandingPage = () => {
  const [selectedDates, setSelectedDates] = useState({ checkIn: null, checkOut: null });

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
    console.log('Selected dates:', dates);
  };

  const features = [
    { icon: 'star', title: 'Premium Selection', desc: 'Only the top 1% of properties make it through our rigorous vetting process.' },
    { icon: 'verified_user', title: 'Secure Payments', desc: 'Enterprise-grade encryption and fraud protection for every transaction.' },
    { icon: 'verified', title: 'Verified Hosts', desc: 'Every landlord is identity-checked and background-vetted.' }
  ];

  return (
    <div className="pt-20">
      <NavTop role="tenant" />
      <section className="relative min-h-[870px] flex items-center justify-center overflow-hidden px-margin-mobile md:px-margin-desktop">
        <div className="absolute inset-0 z-0">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuABeUkB-jNeF7UZ2TBPdzla6oP5707jTFmCLeiEzjlW_k7BkQLwTwcQpBsmaN8s3NTOfKCGCiZYjvwLxjoQURAxOSxCFia_DCDsCJkM4CZcsXOeAJzputI242-K84K7wy4DOTOVTbYx8JYdlUUOfEOg6zuTCgXn4amJvmu7tnvqmTDd4wnzikAiXPvV7o1iOTsW5bFQl_kKqTViSIUCzl3DvSWUNEGhVDkIZbqGlvxbk5oeB5ItZOT6rbybf49XSTcOf2QeOoN5CXY" className="w-full h-full object-cover" alt="Hero background" />
          <div className="absolute inset-0 bg-gradient-to-b from-on-background/30 via-on-background/20 to-background"></div>
        </div>
        <div className="relative z-10 w-full max-w-container-max text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-lg leading-tight">
              Find your next sanctuary <br className="hidden md:block" /> with RentEase.
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto"> Gold standard in premium hospitality and property management. </p>
          </div>
          <div className="w-full max-w-4xl mx-auto glass-panel p-4 md:p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2">
            <div className="flex-1 w-full flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <div className="text-left">
                <label className="text-xs text-secondary font-bold">Location</label>
                <input className="bg-transparent border-none p-0 focus:ring-0 text-on-surface font-medium w-full" placeholder="Where are you going?" />
              </div>
            </div>
            <div className="flex-1 w-full flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-outline-variant/30">
              <span className="material-symbols-outlined text-primary">calendar_month</span>
              <div className="text-left w-full">
                <label className="text-xs text-secondary font-bold">Dates</label>
                <DatePicker 
                  placeholder="Add dates" 
                  onDateChange={handleDateChange}
                  checkIn={selectedDates.checkIn}
                  checkOut={selectedDates.checkOut}
                />
              </div>
            </div>
            <Link to="/discovery" className="w-full md:w-auto px-8 py-4 rounded-full bg-primary text-white font-bold hover:scale-[1.05] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">search</span> Search
            </Link>
          </div>
        </div>
      </section>
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {features.map(feat => (
          <div key={feat.title} className="glass-panel p-8 rounded-xl space-y-4 hover:scale-[1.02] transition-transform duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{feat.icon}</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm">{feat.title}</h3>
            <p className="text-secondary dark:text-outline">{feat.desc}</p>
          </div>
        ))}
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;