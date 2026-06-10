const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['tenant', 'landlord', 'admin'], default: 'tenant' },
  avatar: { type: String, default: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhUS5LsRz4vJXm8dXqoP56KLDKNLYq_R2uTta_iUf31SEvvHsr6ZD7B3DjlsWbwclOIabcBos0WS5Yz3CjbMhudQkLzHTUbDujCWq4z1Sl52T0m_OjThrJis_3DOkf2i5Wty_syIr2fykvDlDfJ6X1weye-6eTZ_zgFqSWnsq55Cixn80STAHpH4ij_E1EQCOHbbVB-HfJCmaL_TFpwfSjbPBOVkI7ag-7lvaf2Jjby_bcUwAOVPBRgc8qriE8k3Bn0TyU7yKX7mE' },
  bio: { type: String },
  verificationStatus: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Property Schema
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  propertyType: { type: String, enum: ['Apartment', 'Villa', 'Cabin', 'Loft', 'House', 'Cottage', 'Bungalow'], default: 'Apartment' },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  guests: { type: Number, required: true },
  amenities: [String],
  images: [String],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Active', 'Occupied', 'Maintenance', 'Inactive'], default: 'Active' },
  occupancyRate: { type: Number, default: 0 },
  monthlyRevenue: { type: Number, default: 0 },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Booking Schema
const bookingSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  serviceFee: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
  paymentMethod: String,
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  specialRequests: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Message Schema
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  text: { type: String, required: true },
  attachments: [String],
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: String,
  cleanliness: Number,
  communication: Number,
  location: Number,
  value: Number,
  createdAt: { type: Date, default: Date.now }
});

// Earnings Schema
const earningsSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: String,
  year: Number,
  revenue: { type: Number, default: 0 },
  bookings: { type: Number, default: 0 },
  occupancyRate: { type: Number, default: 0 },
  averageDailyRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Document Schema
const documentSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  fileName: String,
  fileUrl: String,
  documentType: { type: String, enum: ['LeaseAgreement', 'Insurance', 'PropertyDeed', 'TaxDocument', 'Other'] },
  status: { type: String, enum: ['Unsigned', 'Signed', 'Expired'], default: 'Unsigned' },
  uploadedAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Property = mongoose.model('Property', propertySchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Message = mongoose.model('Message', messageSchema);
const Review = mongoose.model('Review', reviewSchema);
const Earnings = mongoose.model('Earnings', earningsSchema);
const Document = mongoose.model('Document', documentSchema);

module.exports = {
  User,
  Property,
  Booking,
  Message,
  Review,
  Earnings,
  Document
};