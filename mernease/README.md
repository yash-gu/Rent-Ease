# RentEase - Premium Property Management MERN Stack

A modern property rental and management platform built with MERN stack (MongoDB, Express, React, Node.js).

## Project Structure

```
mernease/
├── backend/           # Node.js/Express backend
│   ├── server.js     # Main server file
│   ├── package.json  # Backend dependencies
│   └── .env.example  # Environment variables template
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── App.js       # Main app component
│   │   └── index.js     # Entry point
│   ├── package.json     # Frontend dependencies
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── postcss.config.js  # PostCSS configuration
└── setup.sh          # Setup script
```

## Features

### Frontend Features
- **Responsive UI** with Tailwind CSS and glassmorphism effects
- **Multiple User Roles**: Tenant and Landlord interfaces
- **Property Discovery** with interactive map view
- **Booking System** with checkout flow
- **Messaging Portal** for host-guest communication
- **Dashboard Analytics** for landlords
- **Document Management** with secure vault
- **Earnings Tracking** with revenue analytics
- **Dark/Light Mode** toggle

### Backend Features
- **RESTful API** with Express.js
- **MongoDB Database** with Mongoose ODM
- **User Authentication** (ready for implementation)
- **Property Management** CRUD operations
- **Booking System** with status tracking
- **Message System** for communication
- **Earnings Analytics** API endpoints
- **CORS Enabled** for frontend-backend communication

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)

### Quick Setup

1. **Run the setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   Or manually:

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

4. **Set up environment variables**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

### Running the Application

1. **Start MongoDB** (if using local MongoDB):
   ```bash
   # Make sure MongoDB is running on localhost:27017
   mongod
   ```

2. **Start the backend server** (in one terminal):
   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

3. **Start the frontend development server** (in another terminal):
   ```bash
   cd frontend
   npm start
   # Frontend runs on http://localhost:3000
   ```

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property

### Users
- `GET /api/users` - Get all users

### Bookings
- `GET /api/bookings/:userId` - Get user bookings
- `GET /api/host/bookings/:hostId` - Get host bookings

### Messages
- `GET /api/messages/:userId` - Get user messages

### Earnings & Analytics
- `GET /api/earnings/:hostId` - Get host earnings
- `GET /api/dashboard/stats/:hostId` - Get dashboard statistics

## Pages & Routes

- `/` - Landing page
- `/tenant` - Tenant dashboard
- `/landlord` - Landlord dashboard
- `/details` or `/property-details` - Property details
- `/discover` or `/discovery` - Property discovery
- `/messages` - Messaging portal
- `/checkout` - Checkout page
- `/landlord/add` - Add new listing
- `/landlord/documents` - Document management
- `/landlord/earnings` - Earnings dashboard
- `/landlord/bookings` - Booking management

## Notion Integration

This project includes Notion MCP server configuration for enhanced documentation and project management. See `README_NOTION_INTEGRATION.md` for setup instructions.

## Technologies Used

### Frontend
- **React 18** - UI library
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling framework
- **Material Symbols** - Icons
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Development Notes

- The UI is designed to match the exact look from the provided HTML files
- The application uses a consistent color scheme and design system
- All components are fully responsive
- Backend is ready for authentication implementation
- Database schemas are defined for properties, users, bookings, and messages

## Future Enhancements

1. **User Authentication** with JWT
2. **Payment Integration** with Stripe/PayPal
3. **Real-time Chat** with Socket.io
4. **Image Upload** for property listings
5. **Email Notifications** for bookings
6. **Review System** for properties
7. **Advanced Search Filters**
8. **Calendar Integration** for availability

## License

Proprietary - RentEase Premium Property Management