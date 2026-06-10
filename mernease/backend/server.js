const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./logger');
const db = require('./db');

// Environment variable validation
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter(envVar => !process.env[envVar]);

if (missingEnv.length > 0) {
  logger.error(`❌ Critical missing environment variables: ${missingEnv.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    logger.error('Startup halted due to missing critical environment variables in production.');
    process.exit(1);
  } else {
    logger.warn('⚠️ Development mode: server running despite missing critical environment variables.');
  }
}

// Insecure JWT_SECRET warning in production
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'rentease_secret')) {
  logger.error('❌ CRITICAL SECURITY RISK: Insecure JWT_SECRET in production. Exiting.');
  process.exit(1);
}

const app = express();

// Security and utility middleware
app.use(helmet());

// Dynamic CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Morgan request logging mapped to Winston stream
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Middleware to sanitize and log internal server errors in production
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (res.statusCode >= 500 && body && body.error) {
      logger.error(`[500 API Error] path: ${req.path}, error:`, body.error);
      if (process.env.NODE_ENV === 'production') {
        body.error = 'Internal Server Error';
      }
    }
    return originalJson.call(this, body);
  };
  next();
});

// Rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts from this IP, please try again after 15 minutes' }
});

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

// Initialize Database Schemas on Startup
db.initDatabase()
  .then(() => logger.info('✅ PostgreSQL connection verified and schemas initialized'))
  .catch(err => {
    logger.error('❌ Failed to initialize PostgreSQL database:', err);
    logger.warn('⚠️ Please ensure your DATABASE_URL in .env is correct and database is reachable.');
  });

// ============ AUTHENTICATION ENDPOINTS ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.createUser({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'tenant'
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'rentease_secret',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(201).json({
      user: userResponse,
      token,
      message: 'Registration successful'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.updateUserLastLogin(user._id);

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'rentease_secret',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      user: userResponse,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'rentease_secret');
    const user = await db.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userResponse = { ...user };
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // Client-side handles token removal
  res.json({ message: 'Logout successful' });
});

// Test route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to RentEase API' });
});

// ============ PROPERTIES ROUTES ============
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await db.getAllProperties();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await db.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const property = await db.createProperty(req.body);
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/properties/:id', async (req, res) => {
  try {
    const property = await db.updateProperty(req.params.id, req.body);
    res.json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ USERS ROUTES ============
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const formatted = users.map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id/properties', async (req, res) => {
  try {
    const properties = await db.getPropertiesByHostId(req.params.id);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ MESSAGES ROUTES ============
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const messages = await db.getMessagesByUserId(req.params.userId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const message = await db.createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/messages/:userId/unread', async (req, res) => {
  try {
    const count = await db.getUnreadMessagesCount(req.params.userId);
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ BOOKINGS ROUTES ============
app.get('/api/bookings/:userId', async (req, res) => {
  try {
    const bookings = await db.getBookingsByUserId(req.params.userId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/host/bookings/:hostId', async (req, res) => {
  try {
    const bookings = await db.getHostBookings(req.params.hostId);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = await db.createBooking(req.body);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await db.updateBooking(req.params.id, req.body);
    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ RAZORPAY ROUTES ============
app.post('/api/razorpay/order', async (req, res) => {
  const { amount, currency } = req.body;
  
  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      const Razorpay = require('razorpay');
      const rzp = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });

      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency: currency || 'INR',
        receipt: `receipt_order_${Date.now()}`
      };

      const order = await rzp.orders.create(options);
      return res.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        mock: false,
        keyId: keyId
      });
    } else {
      // Mock Fallback when keys are not defined
      return res.json({
        id: `order_mock_${Math.random().toString(36).substring(2, 15)}`,
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        mock: true,
        keyId: 'rzp_test_mockKey12345'
      });
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ REVIEWS ROUTES ============
app.get('/api/reviews/property/:propertyId', async (req, res) => {
  try {
    const reviews = await db.getReviewsByPropertyId(req.params.propertyId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const review = await db.createReview(req.body);
    
    // Update property rating & count
    const stats = await db.getPropertyStats(review.propertyId);
    await db.updateProperty(review.propertyId, {
      rating: stats.avgRating,
      reviews: stats.reviewsCount
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============ EARNINGS & DASHBOARD ROUTES ============
app.get('/api/earnings/:hostId', async (req, res) => {
  try {
    const earnings = await db.getEarningsByHostId(req.params.hostId);
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/stats/:hostId', async (req, res) => {
  try {
    const stats = await db.getDashboardStats(req.params.hostId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DOCUMENTS ROUTES ============
app.get('/api/documents/:hostId', async (req, res) => {
  try {
    const documents = await db.getDocumentsByHostId(req.params.hostId);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const document = await db.createDocument(req.body);
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const document = await db.deleteDocument(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ SEARCH ROUTES ============
app.get('/api/search', async (req, res) => {
  try {
    const { query, type } = req.query;
    const properties = await db.searchProperties(query, type);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ ADMIN DASHBOARD ROUTES ============
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const bookings = await db.getAllBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/properties/:id', async (req, res) => {
  try {
    const property = await db.deleteProperty(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully', property });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await db.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Global express error handler fallback
app.use((err, req, res, next) => {
  logger.error('Unhandled server error:', err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';
  
  res.status(status).json({ error: message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
});