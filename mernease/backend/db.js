const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rentease';

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase.co') || connectionString.includes('render.com') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client:', err);
});

// Format helpers to match Mongoose structures
const mapUser = (row) => {
  if (!row) return null;
  const user = {
    ...row,
    _id: row.id,
    verificationStatus: row.verification_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
  delete user.verification_status;
  delete user.created_at;
  delete user.updated_at;
  return user;
};

const mapProperty = (row) => {
  if (!row) return null;
  const prop = {
    ...row,
    _id: row.id,
    propertyType: row.property_type,
    hostId: row.host_id,
    occupancyRate: row.occupancy_rate ? parseFloat(row.occupancy_rate) : 0,
    monthlyRevenue: row.monthly_revenue ? parseFloat(row.monthly_revenue) : 0,
    price: row.price ? parseFloat(row.price) : 0,
    rating: row.rating ? parseFloat(row.rating) : 0,
    coordinates: {
      latitude: row.latitude ? parseFloat(row.latitude) : null,
      longitude: row.longitude ? parseFloat(row.longitude) : null
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  // If host details are joined, format as a populated sub-object
  if (row.host_name) {
    prop.hostId = {
      _id: row.host_id,
      name: row.host_name,
      email: row.host_email,
      avatar: row.host_avatar,
      bio: row.host_bio
    };
  }

  delete prop.property_type;
  delete prop.host_id;
  delete prop.occupancy_rate;
  delete prop.monthly_revenue;
  delete prop.latitude;
  delete prop.longitude;
  delete prop.host_name;
  delete prop.host_email;
  delete prop.host_avatar;
  delete prop.host_bio;
  delete prop.created_at;
  delete prop.updated_at;
  return prop;
};

const mapBooking = (row) => {
  if (!row) return null;
  const booking = {
    ...row,
    _id: row.id,
    propertyId: row.property_id,
    userId: row.user_id,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    checkIn: row.check_in,
    checkOut: row.check_out,
    totalPrice: row.total_price ? parseFloat(row.total_price) : 0,
    serviceFee: row.service_fee ? parseFloat(row.service_fee) : 0,
    taxAmount: row.tax_amount ? parseFloat(row.tax_amount) : 0,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    specialRequests: row.special_requests,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };

  // Populate property detail if joined
  if (row.property_title) {
    booking.propertyId = {
      _id: row.property_id,
      title: row.property_title,
      location: row.property_location,
      price: row.property_price ? parseFloat(row.property_price) : 0,
      images: row.property_images
    };
  }

  // Populate user detail if joined
  if (row.user_name) {
    booking.userId = {
      _id: row.user_id,
      name: row.user_name,
      email: row.user_email,
      avatar: row.user_avatar
    };
  }

  delete booking.property_id;
  delete booking.user_id;
  delete booking.guest_name;
  delete booking.guest_email;
  delete booking.check_in;
  delete booking.check_out;
  delete booking.total_price;
  delete booking.service_fee;
  delete booking.tax_amount;
  delete booking.payment_method;
  delete booking.payment_status;
  delete booking.special_requests;
  delete booking.property_title;
  delete booking.property_location;
  delete booking.property_price;
  delete booking.property_images;
  delete booking.user_name;
  delete booking.user_email;
  delete booking.user_avatar;
  delete booking.created_at;
  delete booking.updated_at;
  return booking;
};

const mapMessage = (row) => {
  if (!row) return null;
  const msg = {
    ...row,
    _id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    propertyId: row.property_id,
    bookingId: row.booking_id,
    isRead: row.is_read,
    createdAt: row.created_at
  };

  // Populate sender
  if (row.sender_name) {
    msg.senderId = {
      _id: row.sender_id,
      name: row.sender_name,
      avatar: row.sender_avatar
    };
  }

  // Populate receiver
  if (row.receiver_name) {
    msg.receiverId = {
      _id: row.receiver_id,
      name: row.receiver_name,
      avatar: row.receiver_avatar
    };
  }

  // Populate property
  if (row.property_title) {
    msg.propertyId = {
      _id: row.property_id,
      title: row.property_title
    };
  }

  delete msg.sender_id;
  delete msg.receiver_id;
  delete msg.property_id;
  delete msg.booking_id;
  delete msg.is_read;
  delete msg.sender_name;
  delete msg.sender_avatar;
  delete msg.receiver_name;
  delete msg.receiver_avatar;
  delete msg.property_title;
  delete msg.created_at;
  return msg;
};

const mapReview = (row) => {
  if (!row) return null;
  const review = {
    ...row,
    _id: row.id,
    propertyId: row.property_id,
    userId: row.user_id,
    createdAt: row.created_at
  };

  // Populate user
  if (row.user_name) {
    review.userId = {
      _id: row.user_id,
      name: row.user_name,
      avatar: row.user_avatar
    };
  }

  delete review.property_id;
  delete review.user_id;
  delete review.user_name;
  delete review.user_avatar;
  delete review.created_at;
  return review;
};

const mapEarnings = (row) => {
  if (!row) return null;
  const earnings = {
    ...row,
    _id: row.id,
    hostId: row.host_id,
    revenue: row.revenue ? parseFloat(row.revenue) : 0,
    occupancyRate: row.occupancy_rate ? parseFloat(row.occupancy_rate) : 0,
    averageDailyRate: row.average_daily_rate ? parseFloat(row.average_daily_rate) : 0,
    createdAt: row.created_at
  };
  delete earnings.host_id;
  delete earnings.occupancy_rate;
  delete earnings.average_daily_rate;
  delete earnings.created_at;
  return earnings;
};

const mapDocument = (row) => {
  if (!row) return null;
  const doc = {
    ...row,
    _id: row.id,
    hostId: row.host_id,
    propertyId: row.property_id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    documentType: row.document_type,
    uploadedAt: row.uploaded_at
  };
  delete doc.host_id;
  delete doc.property_id;
  delete doc.file_name;
  delete doc.file_url;
  delete doc.document_type;
  delete doc.uploaded_at;
  return doc;
};

// Database Initialization SQL
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'tenant',
  avatar TEXT DEFAULT 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhUS5LsRz4vJXm8dXqoP56KLDKNLYq_R2uTta_iUf31SEvvHsr6ZD7B3DjlsWbwclOIabcBos0WS5Yz3CjbMhudQkLzHTUbDujCWq4z1Sl52T0m_OjThrJis_3DOkf2i5Wty_syIr2fykvDlDfJ6X1weye-6eTZ_zgFqSWnsq55Cixn80STAHpH4ij_E1EQCOHbbVB-HfJCmaL_TFpwfSjbPBOVkI7ag-7lvaf2Jjby_bcUwAOVPBRgc8qriE8k3Bn0TyU7yKX7mE',
  bio TEXT,
  verification_status BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  price NUMERIC NOT NULL,
  property_type TEXT DEFAULT 'Apartment',
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  guests INTEGER NOT NULL,
  amenities TEXT[],
  images TEXT[],
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  host_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Active',
  occupancy_rate NUMERIC DEFAULT 0,
  monthly_revenue NUMERIC DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ NOT NULL,
  guests INTEGER NOT NULL,
  total_price NUMERIC NOT NULL,
  service_fee NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'Pending',
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  booking_id TEXT REFERENCES bookings(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  title TEXT,
  comment TEXT,
  cleanliness INTEGER,
  communication INTEGER,
  location INTEGER,
  value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS earnings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  host_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  month TEXT,
  year INTEGER,
  revenue NUMERIC DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  occupancy_rate NUMERIC DEFAULT 0,
  average_daily_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  host_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  file_name TEXT,
  file_url TEXT,
  document_type TEXT,
  status TEXT DEFAULT 'Unsigned',
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes for foreign keys and queries
CREATE INDEX IF NOT EXISTS idx_properties_host_id ON properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_earnings_host_id ON earnings(host_id);
CREATE INDEX IF NOT EXISTS idx_documents_host_id ON documents(host_id);
`;


const initDatabase = async () => {
  try {
    await pool.query(createTablesSQL);
    console.log('✅ PostgreSQL schemas initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing database schemas:', err);
    throw err;
  }
};

// ============ REPOSITORY ACTIONS ============

// --- Users ---
const getUserByEmail = async (email) => {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return mapUser(res.rows[0]);
};

const getUserById = async (id) => {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return mapUser(res.rows[0]);
};

const getAllUsers = async () => {
  const res = await pool.query('SELECT * FROM users ORDER BY name ASC');
  return res.rows.map(mapUser);
};

const createUser = async (userData) => {
  const { name, email, password, phone, role, avatar, bio } = userData;
  const res = await pool.query(
    `INSERT INTO users (name, email, password, phone, role, avatar, bio, verification_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      name,
      email,
      password,
      phone || null,
      role || 'tenant',
      avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhUS5LsRz4vJXm8dXqoP56KLDKNLYq_R2uTta_iUf31SEvvHsr6ZD7B3DjlsWbwclOIabcBos0WS5Yz3CjbMhudQkLzHTUbDujCWq4z1Sl52T0m_OjThrJis_3DOkf2i5Wty_syIr2fykvDlDfJ6X1weye-6eTZ_zgFqSWnsq55Cixn80STAHpH4ij_E1EQCOHbbVB-HfJCmaL_TFpwfSjbPBOVkI7ag-7lvaf2Jjby_bcUwAOVPBRgc8qriE8k3Bn0TyU7yKX7mE',
      bio || null,
      false
    ]
  );
  return mapUser(res.rows[0]);
};

const updateUserLastLogin = async (id) => {
  await pool.query('UPDATE users SET updated_at = NOW() WHERE id = $1', [id]);
};

// --- Properties ---
const getAllProperties = async () => {
  const res = await pool.query(
    `SELECT p.*, 
            u.name AS host_name, 
            u.email AS host_email, 
            u.avatar AS host_avatar, 
            u.bio AS host_bio
     FROM properties p
     LEFT JOIN users u ON p.host_id = u.id
     ORDER BY p.created_at DESC`
  );
  return res.rows.map(mapProperty);
};

const getPropertyById = async (id) => {
  const res = await pool.query(
    `SELECT p.*, 
            u.name AS host_name, 
            u.email AS host_email, 
            u.avatar AS host_avatar, 
            u.bio AS host_bio
     FROM properties p
     LEFT JOIN users u ON p.host_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  return mapProperty(res.rows[0]);
};

const createProperty = async (propData) => {
  const {
    title, description, location, price, propertyType,
    bedrooms, bathrooms, guests, amenities, images,
    rating, reviews, hostId, status, occupancyRate,
    monthlyRevenue, coordinates
  } = propData;

  const lat = coordinates ? coordinates.latitude : null;
  const lon = coordinates ? coordinates.longitude : null;

  const res = await pool.query(
    `INSERT INTO properties (
       title, description, location, price, property_type,
       bedrooms, bathrooms, guests, amenities, images,
       rating, reviews, host_id, status, occupancy_rate,
       monthly_revenue, latitude, longitude
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     RETURNING *`,
    [
      title, description, location, price, propertyType || 'Apartment',
      bedrooms, bathrooms, guests, amenities || [], images || [],
      rating || 0, reviews || 0, hostId, status || 'Active', occupancyRate || 0,
      monthlyRevenue || 0, lat, lon
    ]
  );
  return mapProperty(res.rows[0]);
};

const updateProperty = async (id, propData) => {
  // Simple update builder
  const fields = [];
  const values = [];
  let index = 1;

  const mapping = {
    title: 'title',
    description: 'description',
    location: 'location',
    price: 'price',
    propertyType: 'property_type',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    guests: 'guests',
    amenities: 'amenities',
    images: 'images',
    rating: 'rating',
    reviews: 'reviews',
    status: 'status',
    occupancyRate: 'occupancy_rate',
    monthlyRevenue: 'monthly_revenue'
  };

  for (const [key, col] of Object.entries(mapping)) {
    if (propData[key] !== undefined) {
      fields.push(`${col} = $${index++}`);
      values.push(propData[key]);
    }
  }

  if (propData.coordinates) {
    if (propData.coordinates.latitude !== undefined) {
      fields.push(`latitude = $${index++}`);
      values.push(propData.coordinates.latitude);
    }
    if (propData.coordinates.longitude !== undefined) {
      fields.push(`longitude = $${index++}`);
      values.push(propData.coordinates.longitude);
    }
  }

  if (fields.length === 0) {
    return getPropertyById(id);
  }

  values.push(id);
  const query = `UPDATE properties SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING *`;
  const res = await pool.query(query, values);
  return mapProperty(res.rows[0]);
};

const getPropertiesByHostId = async (hostId) => {
  const res = await pool.query('SELECT * FROM properties WHERE host_id = $1 ORDER BY created_at DESC', [hostId]);
  return res.rows.map(mapProperty);
};

// --- Bookings ---
const getBookingsByUserId = async (userId) => {
  const res = await pool.query(
    `SELECT b.*, 
            p.title AS property_title, 
            p.location AS property_location, 
            p.price AS property_price, 
            p.images AS property_images
     FROM bookings b
     LEFT JOIN properties p ON b.property_id = p.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return res.rows.map(mapBooking);
};

const getHostBookings = async (hostId) => {
  const res = await pool.query(
    `SELECT b.*, 
            p.title AS property_title, 
            p.location AS property_location, 
            p.images AS property_images,
            u.name AS user_name,
            u.email AS user_email,
            u.avatar AS user_avatar
     FROM bookings b
     INNER JOIN properties p ON b.property_id = p.id
     LEFT JOIN users u ON b.user_id = u.id
     WHERE p.host_id = $1
     ORDER BY b.created_at DESC`,
    [hostId]
  );
  return res.rows.map(mapBooking);
};

const createBooking = async (bookingData) => {
  const {
    propertyId, userId, guestName, guestEmail, checkIn, checkOut,
    guests, totalPrice, serviceFee, taxAmount, status, paymentMethod,
    paymentStatus, specialRequests
  } = bookingData;

  const res = await pool.query(
    `INSERT INTO bookings (
       property_id, user_id, guest_name, guest_email, check_in, check_out,
       guests, total_price, service_fee, tax_amount, status, payment_method,
       payment_status, special_requests
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      propertyId, userId, guestName, guestEmail, checkIn, checkOut,
      guests, totalPrice, serviceFee || 0, taxAmount || 0, status || 'Pending',
      paymentMethod || null, paymentStatus || 'Pending', specialRequests || null
    ]
  );
  return mapBooking(res.rows[0]);
};

const updateBooking = async (id, bookingData) => {
  const fields = [];
  const values = [];
  let index = 1;

  const mapping = {
    status: 'status',
    paymentStatus: 'payment_status',
    paymentMethod: 'payment_method'
  };

  for (const [key, col] of Object.entries(mapping)) {
    if (bookingData[key] !== undefined) {
      fields.push(`${col} = $${index++}`);
      values.push(bookingData[key]);
    }
  }

  if (fields.length === 0) {
    const res = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    return mapBooking(res.rows[0]);
  }

  values.push(id);
  const query = `UPDATE bookings SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING *`;
  const res = await pool.query(query, values);
  return mapBooking(res.rows[0]);
};

// --- Messages ---
const getMessagesByUserId = async (userId) => {
  const res = await pool.query(
    `SELECT m.*,
            s.name AS sender_name, s.avatar AS sender_avatar,
            r.name AS receiver_name, r.avatar AS receiver_avatar,
            p.title AS property_title
     FROM messages m
     LEFT JOIN users s ON m.sender_id = s.id
     LEFT JOIN users r ON m.receiver_id = r.id
     LEFT JOIN properties p ON m.property_id = p.id
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY m.created_at DESC`,
    [userId]
  );
  return res.rows.map(mapMessage);
};

const createMessage = async (msgData) => {
  const { senderId, receiverId, propertyId, bookingId, text, attachments, isRead } = msgData;
  const res = await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, property_id, booking_id, text, attachments, is_read)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [senderId, receiverId, propertyId || null, bookingId || null, text, attachments || [], isRead || false]
  );

  // Return formatted message with basic populated details (for immediate socket/UI update)
  const saved = res.rows[0];
  const senderDetails = await pool.query('SELECT name, avatar FROM users WHERE id = $1', [senderId]);
  
  return mapMessage({
    ...saved,
    sender_name: senderDetails.rows[0]?.name,
    sender_avatar: senderDetails.rows[0]?.avatar
  });
};

const getUnreadMessagesCount = async (userId) => {
  const res = await pool.query(
    'SELECT COUNT(*)::integer AS count FROM messages WHERE receiver_id = $1 AND is_read = false',
    [userId]
  );
  return res.rows[0].count;
};

// --- Reviews ---
const getReviewsByPropertyId = async (propertyId) => {
  const res = await pool.query(
    `SELECT r.*, 
            u.name AS user_name, 
            u.avatar AS user_avatar
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.property_id = $1
     ORDER BY r.created_at DESC`,
    [propertyId]
  );
  return res.rows.map(mapReview);
};

const createReview = async (reviewData) => {
  const { propertyId, userId, rating, title, comment, cleanliness, communication, location, value } = reviewData;
  const res = await pool.query(
    `INSERT INTO reviews (property_id, user_id, rating, title, comment, cleanliness, communication, location, value)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [propertyId, userId, rating, title || null, comment || null, cleanliness || 0, communication || 0, location || 0, value || 0]
  );
  return mapReview(res.rows[0]);
};

const getPropertyStats = async (propertyId) => {
  const res = await pool.query(
    'SELECT AVG(rating)::numeric AS avg_rating, COUNT(*)::integer AS reviews_count FROM reviews WHERE property_id = $1',
    [propertyId]
  );
  return {
    avgRating: parseFloat(res.rows[0].avg_rating || 0),
    reviewsCount: res.rows[0].reviews_count || 0
  };
};

// --- Earnings ---
const getEarningsByHostId = async (hostId) => {
  const res = await pool.query(
    'SELECT * FROM earnings WHERE host_id = $1 ORDER BY year DESC, month DESC LIMIT 6',
    [hostId]
  );
  return res.rows.map(mapEarnings);
};

// --- Dashboard Stats ---
const getDashboardStats = async (hostId) => {
  const propertiesRes = await pool.query('SELECT id, occupancy_rate FROM properties WHERE host_id = $1', [hostId]);
  const propertyIds = propertiesRes.rows.map(p => p.id);

  if (propertyIds.length === 0) {
    return {
      totalEarnings: 0,
      activeListings: 0,
      occupancyRate: 0,
      newMessages: 0,
      totalBookings: 0,
      totalProperties: 0
    };
  }

  const bookingsCountRes = await pool.query(
    `SELECT COUNT(*)::integer AS count 
     FROM bookings 
     WHERE property_id = ANY($1) AND status IN ('Confirmed', 'Completed')`,
    [propertyIds]
  );

  const totalRevenueRes = await pool.query(
    `SELECT SUM(total_price)::numeric AS total 
     FROM bookings 
     WHERE property_id = ANY($1) AND status IN ('Confirmed', 'Completed')`,
    [propertyIds]
  );

  const activeListingsRes = await pool.query(
    `SELECT COUNT(*)::integer AS count 
     FROM properties 
     WHERE host_id = $1 AND status = 'Active'`,
    [hostId]
  );

  const unreadMessagesRes = await pool.query(
    `SELECT COUNT(*)::integer AS count 
     FROM messages 
     WHERE receiver_id = $1 AND is_read = false`,
    [hostId]
  );

  const avgOccupancy = Math.round(
    propertiesRes.rows.reduce((sum, p) => sum + parseFloat(p.occupancy_rate || 0), 0) / propertiesRes.rows.length
  );

  return {
    totalEarnings: parseFloat(totalRevenueRes.rows[0].total || 0),
    activeListings: activeListingsRes.rows[0].count,
    occupancyRate: avgOccupancy,
    newMessages: unreadMessagesRes.rows[0].count,
    totalBookings: bookingsCountRes.rows[0].count,
    totalProperties: propertiesRes.rows.length
  };
};

// --- Documents ---
const getDocumentsByHostId = async (hostId) => {
  const res = await pool.query('SELECT * FROM documents WHERE host_id = $1 ORDER BY uploaded_at DESC', [hostId]);
  return res.rows.map(mapDocument);
};

const createDocument = async (docData) => {
  const { hostId, propertyId, fileName, fileUrl, documentType, status } = docData;
  const res = await pool.query(
    `INSERT INTO documents (host_id, property_id, file_name, file_url, document_type, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [hostId, propertyId || null, fileName, fileUrl, documentType, status || 'Unsigned']
  );
  return mapDocument(res.rows[0]);
};

const deleteDocument = async (id) => {
  const res = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [id]);
  return mapDocument(res.rows[0]);
};

// --- Search ---
const searchProperties = async (queryStr, type) => {
  let queryText = `
    SELECT p.*, 
           u.name AS host_name, 
           u.avatar AS host_avatar
    FROM properties p
    LEFT JOIN users u ON p.host_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (queryStr) {
    queryText += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.location ILIKE $${paramIndex})`;
    params.push(`%${queryStr}%`);
    paramIndex++;
  }

  if (type) {
    queryText += ` AND p.property_type = $${paramIndex}`;
    params.push(type);
    paramIndex++;
  }

  queryText += ' ORDER BY p.created_at DESC LIMIT 20';

  const res = await pool.query(queryText, params);
  return res.rows.map(mapProperty);
};

const deleteProperty = async (id) => {
  const res = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING *', [id]);
  return mapProperty(res.rows[0]);
};

const deleteUser = async (id) => {
  const res = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return mapUser(res.rows[0]);
};

const getAllBookings = async () => {
  const res = await pool.query(
    `SELECT b.*, 
            p.title AS property_title, 
            p.location AS property_location, 
            p.price AS property_price, 
            p.images AS property_images,
            u.name AS user_name,
            u.email AS user_email,
            u.avatar AS user_avatar
     FROM bookings b
     LEFT JOIN properties p ON b.property_id = p.id
     LEFT JOIN users u ON b.user_id = u.id
     ORDER BY b.created_at DESC`
  );
  return res.rows.map(mapBooking);
};

module.exports = {
  pool,
  initDatabase,
  getUserByEmail,
  getUserById,
  getAllUsers,
  createUser,
  updateUserLastLogin,
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  getPropertiesByHostId,
  getBookingsByUserId,
  getHostBookings,
  createBooking,
  updateBooking,
  getMessagesByUserId,
  createMessage,
  getUnreadMessagesCount,
  getReviewsByPropertyId,
  createReview,
  getPropertyStats,
  getEarningsByHostId,
  getDashboardStats,
  getDocumentsByHostId,
  createDocument,
  deleteDocument,
  searchProperties,
  deleteProperty,
  deleteUser,
  getAllBookings
};

