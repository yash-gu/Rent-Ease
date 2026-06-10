const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rentease';

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase.co') || connectionString.includes('render.com') || process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

const dropTablesSQL = `
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;
`;

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
`;

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to database to seed...');
    
    // Clear and drop tables
    await pool.query(dropTablesSQL);
    console.log('🗑️  Dropped existing tables');

    // Create tables
    await pool.query(createTablesSQL);
    console.log('📋 Created database schemas');

    // Password setup
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    const users = [
      {
        id: crypto.randomUUID(),
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: hashedPassword,
        phone: '+1-234-567-8900',
        role: 'tenant',
        verification_status: true,
        bio: 'Travel enthusiast and explorer'
      },
      {
        id: crypto.randomUUID(),
        name: 'Eleni Papadopoulos',
        email: 'eleni@example.com',
        password: hashedPassword,
        phone: '+30-210-1234567',
        role: 'landlord',
        verification_status: true,
        bio: 'Premium property host in Santorini'
      },
      {
        id: crypto.randomUUID(),
        name: 'Marcus Thompson',
        email: 'marcus@example.com',
        password: hashedPassword,
        phone: '+1-555-0123',
        role: 'landlord',
        verification_status: true,
        bio: 'New York luxury property owner'
      },
      {
        id: crypto.randomUUID(),
        name: 'Sarah Miller',
        email: 'sarah@example.com',
        password: hashedPassword,
        phone: '+1-555-0124',
        role: 'tenant',
        verification_status: true,
        bio: null
      },
      {
        id: crypto.randomUUID(),
        name: 'David Chen',
        email: 'david@example.com',
        password: hashedPassword,
        phone: '+1-555-0125',
        role: 'tenant',
        verification_status: true,
        bio: null
      },
      {
        id: crypto.randomUUID(),
        name: 'System Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        phone: '+1-555-9999',
        role: 'admin',
        verification_status: true,
        bio: 'RentEase Platform Administrator'
      }
    ];

    for (const u of users) {
      await pool.query(
        `INSERT INTO users (id, name, email, password, phone, role, verification_status, bio)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [u.id, u.name, u.email, u.password, u.phone, u.role, u.verification_status, u.bio]
      );
    }
    console.log(`👤 Seeded ${users.length} users`);

    // Create Properties
    const properties = [
      {
        id: crypto.randomUUID(),
        title: 'Azure Heights Villa',
        description: 'Perched on the highest point of the Santorini cliffs, Azure Heights Villa offers an unparalleled luxury experience with breathtaking views of the Aegean Sea.',
        location: 'Santorini, Greece',
        price: 1250,
        property_type: 'Villa',
        bedrooms: 5,
        bathrooms: 5,
        guests: 10,
        amenities: ['Infinity Pool', 'Private Chef', 'Sea View', 'Air Conditioning', 'WiFi', 'Hot Tub', 'Gym'],
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDEgt8S2zyz8WwkVKqhQ-vdM-gVlgt2lOVjlUsedlB-mamFIIfMF9IHKLpEODNM4KLVT2e1niCVvS0l-aTOvp7YDPorCS2liVlDNbsNTIV8LdfU-nsvdmiOrSD4lXtwIMHuYu_ZlOoLpObADq0x78CO3euGNEaZO_GnRxi4HcOgxE9rDv7XrRQOrR5t3Yqrzeb4Kmgt0zCvME2lQJNkHMgYvajnX442ANlq4cARkeTBRKfy8nTjoyAbKWSPNRBhhm6duvIGs2KXITU'
        ],
        rating: 4.98,
        reviews: 128,
        host_id: users[1].id, // Eleni
        status: 'Active',
        occupancy_rate: 94,
        monthly_revenue: 12500,
        latitude: 36.4069,
        longitude: 25.4615
      },
      {
        id: crypto.randomUUID(),
        title: 'Skyline Penthouse',
        description: 'Modern luxury penthouse in Manhattan with stunning city views, premium amenities, and world-class service.',
        location: 'Manhattan, NY',
        price: 850,
        property_type: 'Apartment',
        bedrooms: 3,
        bathrooms: 2,
        guests: 6,
        amenities: ['City View', 'Rooftop Access', 'Concierge', 'Gym', 'WiFi', 'Air Conditioning'],
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuD825H4zYbfiFogiDivCl5Nh_bjp88YpnyoP-JFiusupceGeTQN5knnLUTuXppGeSFKgLZQ3hkJgHBz-SgRsecilivzxfZGCW0UggTiqqF4smdvjq51-Z2ExUqnC-tkV8x4OaI1LT4Co9Q0gOcL4ohPOxWW9ypQc5b4I5nUy-08KRyCnI7lUQ5Pc-tN3LWH60sbWsSC0NM6IRFYDtpyXiZ2pfNjsid9EPBgkbfd0eFnAFeh6qsAAknVJT3qwVbRnP4u_N-NrHJ-3E8'],
        rating: 4.9,
        reviews: 95,
        host_id: users[2].id, // Marcus
        status: 'Occupied',
        occupancy_rate: 98,
        monthly_revenue: 8500,
        latitude: 40.7128,
        longitude: -74.0060
      },
      {
        id: crypto.randomUUID(),
        title: 'Alpine Glass Cabin',
        description: 'Stunning glass cabin in the Swiss Alps with panoramic mountain views, modern luxury, and complete privacy.',
        location: 'Zermatt, Switzerland',
        price: 580,
        property_type: 'Cabin',
        bedrooms: 4,
        bathrooms: 3,
        guests: 8,
        amenities: ['Mountain View', 'Hot Tub', 'Sauna', 'Fireplace', 'WiFi', 'Kitchen'],
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuB6ydhWH3x1COzMKXRyKb5DL87wweFEavOU0Ej7KqOSAS2rpICU9eRZbV65Cc7fCjVOklxHpTN9jV1-uHraTUgzmt49RHKh0eLUZu0CfhkA1-onOXQq_vcFDPhgrU_6V0RnaTHa3YCgNiDiW1EfvczMlglk6-zjRtWJzqGV1nV7JiP8D3KWp6U9m84wXoECAIxMmTCQQueaHUR5eVebvC49ADM10ftoU6uRlXzsRREgNt8oc40nFCQ08e_M_3MEaklRl9xIko00pGg'],
        rating: 4.85,
        reviews: 76,
        host_id: users[1].id, // Eleni
        status: 'Active',
        occupancy_rate: 87,
        monthly_revenue: 5800,
        latitude: 46.0207,
        longitude: 7.7491
      },
      {
        id: crypto.randomUUID(),
        title: 'L\'Haussmann Prestige',
        description: 'Classic Parisian apartment in the prestigious Le Marais district with elegant design and authentic charm.',
        location: 'Le Marais, Paris',
        price: 450,
        property_type: 'Apartment',
        bedrooms: 2,
        bathrooms: 1,
        guests: 4,
        amenities: ['Historic Building', 'WiFi', 'Air Conditioning', 'Fully Equipped Kitchen'],
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAgbyUY7R8Ogbr1dNO-Zs7dUDewV2zlTs9aC7WZtjKTmw5XnZ8CeTsfwRiuV1rIL3Rh1qtDgp-kwMHCPots5BDHGatlX0jyRZAiwvNX9xEqp1m441HgqY-pjM7KOzrj8fr4WoIVjO9wydYRfRAfxzk5JOv5lzawrfoNMOowEtGJOMMi76JHW9ufbJ67_SLqZMrz1lmulGxUhASiKWKqKTAD1JL-2E65FSFhb7S2APhICGl5JQoAUG5o7Y-oqY5bB3YaGB1VsG2sZH8'],
        rating: 4.7,
        reviews: 54,
        host_id: users[2].id, // Marcus
        status: 'Active',
        occupancy_rate: 80,
        monthly_revenue: 4500,
        latitude: 48.8566,
        longitude: 2.3522
      },
      {
        id: crypto.randomUUID(),
        title: 'Eiffel Sky Garden',
        description: 'Exclusive penthouse with private terrace overlooking the Eiffel Tower and Seine River.',
        location: '7th Arrondissement, Paris',
        price: 820,
        property_type: 'Apartment',
        bedrooms: 3,
        bathrooms: 2,
        guests: 6,
        amenities: ['Eiffel View', 'Private Terrace', 'WiFi', 'Luxury Furnishings', 'Concierge'],
        images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuC0Z6F8K5Bff0ghg29Atc5Z_yIaTRlQM1LnAvCGJMV237416eKnzl499W7DCt5od-QUHj0X1iFvCgigLLifT3RW1zaQ0iTdoCmnPn2g2thwp3bljHV2g2SSCIKqwxZssea53R7FZYDd6ax4BOcPNW085u9iny3263-zokvZEw8GbE5Rb2T9-2ci0MOmgNE0tndmSMhHMP6Qzx8SeoIjf3J0gg_hbvjRr3KPsfYzImrVFzGq-pWeyoYlGB2Bw_040HexgU4133hMKt0'],
        rating: 4.95,
        reviews: 112,
        host_id: users[1].id, // Eleni
        status: 'Active',
        occupancy_rate: 92,
        monthly_revenue: 8200,
        latitude: 48.8566,
        longitude: 2.3522
      }
    ];

    for (const p of properties) {
      await pool.query(
        `INSERT INTO properties (
           id, title, description, location, price, property_type,
           bedrooms, bathrooms, guests, amenities, images,
           rating, reviews, host_id, status, occupancy_rate,
           monthly_revenue, latitude, longitude
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          p.id, p.title, p.description, p.location, p.price, p.property_type,
          p.bedrooms, p.bathrooms, p.guests, p.amenities, p.images,
          p.rating, p.reviews, p.host_id, p.status, p.occupancy_rate,
          p.monthly_revenue, p.latitude, p.longitude
        ]
      );
    }
    console.log(`🏠 Seeded ${properties.length} properties`);

    // Create Bookings
    const bookings = [
      {
        id: crypto.randomUUID(),
        property_id: properties[0].id,
        user_id: users[0].id, // Alex
        guest_name: 'Alex Johnson',
        guest_email: 'alex@example.com',
        check_in: new Date('2024-10-10'),
        check_out: new Date('2024-10-15'),
        guests: 4,
        total_price: 6250,
        service_fee: 890,
        status: 'Confirmed',
        payment_status: 'Completed'
      },
      {
        id: crypto.randomUUID(),
        property_id: properties[1].id,
        user_id: users[3].id, // Sarah
        guest_name: 'Sarah Miller',
        guest_email: 'sarah@example.com',
        check_in: new Date('2024-10-12'),
        check_out: new Date('2024-10-18'),
        guests: 2,
        total_price: 5100,
        service_fee: 700,
        status: 'Pending',
        payment_status: 'Pending'
      },
      {
        id: crypto.randomUUID(),
        property_id: properties[2].id,
        user_id: users[4].id, // David
        guest_name: 'David Chen',
        guest_email: 'david@example.com',
        check_in: new Date('2024-10-15'),
        check_out: new Date('2024-10-22'),
        guests: 6,
        total_price: 3800,
        service_fee: 500,
        status: 'Confirmed',
        payment_status: 'Completed'
      }
    ];

    for (const b of bookings) {
      await pool.query(
        `INSERT INTO bookings (
           id, property_id, user_id, guest_name, guest_email, check_in, check_out,
           guests, total_price, service_fee, status, payment_status
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          b.id, b.property_id, b.user_id, b.guest_name, b.guest_email, b.check_in, b.check_out,
          b.guests, b.total_price, b.service_fee, b.status, b.payment_status
        ]
      );
    }
    console.log(`📅 Seeded ${bookings.length} bookings`);

    // Create Reviews
    const reviews = [
      {
        id: crypto.randomUUID(),
        property_id: properties[0].id,
        user_id: users[0].id,
        rating: 5,
        title: 'Absolutely Stunning!',
        comment: 'The best vacation we\'ve ever had. The views are incredible and the service is impeccable.',
        cleanliness: 5,
        communication: 5,
        location: 5,
        value: 5
      },
      {
        id: crypto.randomUUID(),
        property_id: properties[1].id,
        user_id: users[3].id,
        rating: 4,
        title: 'Great Location, Very Clean',
        comment: 'Perfect penthouse with amazing city views. Would definitely stay again.',
        cleanliness: 5,
        communication: 4,
        location: 5,
        value: 4
      }
    ];

    for (const r of reviews) {
      await pool.query(
        `INSERT INTO reviews (id, property_id, user_id, rating, title, comment, cleanliness, communication, location, value)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [r.id, r.property_id, r.user_id, r.rating, r.title, r.comment, r.cleanliness, r.communication, r.location, r.value]
      );
    }
    console.log(`⭐ Seeded ${reviews.length} reviews`);

    // Create Messages
    const messages = [
      {
        id: crypto.randomUUID(),
        sender_id: users[1].id, // Eleni
        receiver_id: users[0].id, // Alex
        property_id: properties[0].id,
        booking_id: bookings[0].id,
        text: 'Hello! Thank you for booking Azure Heights Villa. I\'m Eleni, your host. I\'ve just received your confirmation.',
        is_read: true
      },
      {
        id: crypto.randomUUID(),
        sender_id: users[0].id, // Alex
        receiver_id: users[1].id, // Eleni
        property_id: properties[0].id,
        booking_id: bookings[0].id,
        text: 'Hi Eleni! We\'re so excited for our stay. I just wanted to confirm if early check-in at 2 PM might be possible?',
        is_read: true
      },
      {
        id: crypto.randomUUID(),
        sender_id: users[1].id, // Eleni
        receiver_id: users[0].id, // Alex
        property_id: properties[0].id,
        booking_id: bookings[0].id,
        text: 'Of course! Early check-in is absolutely possible. I\'ll have everything ready for you by 2 PM.',
        is_read: true
      }
    ];

    for (const m of messages) {
      await pool.query(
        `INSERT INTO messages (id, sender_id, receiver_id, property_id, booking_id, text, is_read)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [m.id, m.sender_id, m.receiver_id, m.property_id, m.booking_id, m.text, m.is_read]
      );
    }
    console.log(`✉️  Seeded ${messages.length} messages`);

    // Create Earnings
    const earnings = [
      {
        id: crypto.randomUUID(),
        host_id: users[1].id, // Eleni
        month: 'June',
        year: 2024,
        revenue: 13200,
        bookings: 42,
        occupancy_rate: 94,
        average_daily_rate: 314
      },
      {
        id: crypto.randomUUID(),
        host_id: users[1].id, // Eleni
        month: 'May',
        year: 2024,
        revenue: 12500,
        bookings: 38,
        occupancy_rate: 89,
        average_daily_rate: 329
      }
    ];

    for (const e of earnings) {
      await pool.query(
        `INSERT INTO earnings (id, host_id, month, year, revenue, bookings, occupancy_rate, average_daily_rate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [e.id, e.host_id, e.month, e.year, e.revenue, e.bookings, e.occupancy_rate, e.average_daily_rate]
      );
    }
    console.log(`📈 Seeded ${earnings.length} earnings records`);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();