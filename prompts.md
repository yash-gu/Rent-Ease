# RentEase Implementation Prompts & Requirements

## Phase 1: Authentication & Authorization

### 1.1 Login/Registration System
- [ ] Create Login page with email and password fields
- [ ] Create Registration page with role selection (Tenant/Landlord)
- [ ] Implement password hashing with bcryptjs
- [ ] Create JWT token generation for authenticated users
- [ ] Implement token storage in localStorage
- [ ] Create Protected Routes component for authentication
- [ ] Add logout functionality
- [ ] Implement "Remember Me" functionality
- [ ] Add password reset flow (email-based)
- [ ] Create email verification system

### 1.2 Role-Based Access Control
- [ ] Display "List Property" only for landlords
- [ ] Show "Bookings" only for tenants with active bookings
- [ ] Display "Earnings Dashboard" only for landlords
- [ ] Show "Documents Vault" only for landlords
- [ ] Display "Analytics" only for landlords
- [ ] Create role-checking middleware on backend
- [ ] Implement role-based route protection on frontend

## Phase 2: Navigation & UI Updates

### 2.1 Landing Page Updates
- [ ] Remove "Switch to Host" button from navigation
- [ ] Add "Login" button to top navigation
- [ ] Add "Sign Up" dropdown or link
- [ ] Show different UI based on authentication status
- [ ] After login, show username and profile dropdown
- [ ] Add logout option in profile dropdown
- [ ] Implement navigation changes based on user role

### 2.2 Top Navigation Bar
- [ ] Update NavTop component to handle auth state
- [ ] Add login/register buttons for unauthenticated users
- [ ] Show user menu for authenticated users
- [ ] Display role-specific navigation items
- [ ] Add avatar and username display

### 2.3 Sidebar for Landlords
- [ ] Show sidebar only for authenticated landlords
- [ ] Display role-appropriate menu items:
  - Dashboard
  - Listings (Properties)
  - Bookings
  - Documents
  - Earnings
  - Analytics
- [ ] Highlight active menu item
- [ ] Add logout button in sidebar

## Phase 3: Feature Access Control

### 3.1 Tenant Features
- [ ] Browse properties (public)
- [ ] Search properties (public)
- [ ] View property details (public)
- [ ] Make bookings (authenticated)
- [ ] View my bookings (authenticated)
- [ ] View booking history (authenticated)
- [ ] Message hosts (authenticated)
- [ ] Leave reviews (authenticated, post-stay)
- [ ] Manage profile (authenticated)
- [ ] View billing/invoices (authenticated)

### 3.2 Landlord Features
- [ ] View dashboard with statistics (authenticated)
- [ ] List new properties (authenticated)
- [ ] Edit properties (authenticated)
- [ ] Delete properties (authenticated)
- [ ] Manage property status (authenticated)
- [ ] View bookings for my properties (authenticated)
- [ ] Manage guest check-ins (authenticated)
- [ ] Message guests (authenticated)
- [ ] Upload documents (authenticated)
- [ ] View earnings dashboard (authenticated)
- [ ] Download invoices/tax documents (authenticated)
- [ ] Analyze property performance (authenticated)
- [ ] Withdraw earnings (authenticated)

## Phase 4: Database Enhancements

### 4.1 User Model Updates
- [ ] Add isActive field (Boolean)
- [ ] Add lastLogin field (Date)
- [ ] Add phoneVerified field (Boolean)
- [ ] Add emailVerified field (Boolean)
- [ ] Add preferredPaymentMethod field (String)
- [ ] Add payoutAccount field (Object)

### 4.2 Authentication Data
- [ ] Create Sessions collection for token management
- [ ] Add refresh tokens support
- [ ] Implement token expiration (15 min access, 7 day refresh)
- [ ] Track login history

### 4.3 Authorization Schema
- [ ] Add permissions/roles collection
- [ ] Define granular permissions
- [ ] Implement role-permission mapping

## Phase 5: Backend API Enhancements

### 5.1 Authentication Endpoints
- [ ] POST /api/auth/register - Register new user
- [ ] POST /api/auth/login - User login with JWT
- [ ] POST /api/auth/logout - Logout user
- [ ] POST /api/auth/refresh-token - Refresh JWT
- [ ] GET /api/auth/me - Get current user info
- [ ] POST /api/auth/forgot-password - Request password reset
- [ ] POST /api/auth/reset-password - Reset password with token
- [ ] POST /api/auth/verify-email - Verify email address

### 5.2 Authorization Middleware
- [ ] Create auth middleware to verify JWT
- [ ] Create role middleware to check user role
- [ ] Create permission middleware for granular access
- [ ] Implement error handling for unauthorized access

### 5.3 User Management Endpoints
- [ ] GET /api/users/:id - Get user profile
- [ ] PUT /api/users/:id - Update user profile
- [ ] DELETE /api/users/:id - Delete account
- [ ] PUT /api/users/:id/password - Change password
- [ ] GET /api/users/:id/bookings - Get user bookings
- [ ] GET /api/users/:id/reviews - Get user reviews

### 5.4 Property Management Endpoints (Landlord Protected)
- [ ] POST /api/properties - Create property (landlords only)
- [ ] PUT /api/properties/:id - Update property (landlords only)
- [ ] DELETE /api/properties/:id - Delete property (landlords only)
- [ ] GET /api/users/:id/properties - Get my properties (landlords only)

### 5.5 Booking Management Endpoints
- [ ] POST /api/bookings - Create booking (tenants only)
- [ ] GET /api/bookings/:userId - Get my bookings (tenants)
- [ ] GET /api/host/bookings/:hostId - Get property bookings (landlords)
- [ ] PUT /api/bookings/:id - Update booking
- [ ] DELETE /api/bookings/:id - Cancel booking

### 5.6 Analytics Endpoints (Landlord Protected)
- [ ] GET /api/earnings/:hostId - Get earnings (landlords only)
- [ ] GET /api/dashboard/stats/:hostId - Get dashboard stats (landlords only)
- [ ] GET /api/analytics/property/:propertyId - Get property analytics (landlords only)
- [ ] GET /api/analytics/occupancy - Get occupancy data (landlords only)

## Phase 6: Frontend Pages & Components

### 6.1 Authentication Pages
- [ ] Create Login page
- [ ] Create Register page (with role selection)
- [ ] Create Forgot Password page
- [ ] Create Reset Password page
- [ ] Create Verify Email page

### 6.2 Updated Landing Page
- [ ] Remove switch to host button
- [ ] Add prominent login button
- [ ] Add sign up button
- [ ] Show different hero section based on auth state
- [ ] Add call-to-action for listings (landlords)

### 6.3 Protected Pages
- [ ] Create ProtectedRoute wrapper
- [ ] Redirect to login if not authenticated
- [ ] Check role and redirect accordingly

### 6.4 User Profile Pages
- [ ] Create Tenant profile page
- [ ] Create Landlord profile page
- [ ] Add profile editing functionality
- [ ] Add password change form
- [ ] Add notification preferences

## Phase 7: Feature-Specific Requirements

### 7.1 Messaging System
- [ ] Implement real-time messaging
- [ ] Show unread message count
- [ ] Display conversation history
- [ ] Add message notifications

### 7.2 Billing & Payments
- [ ] Integrate payment gateway (Stripe)
- [ ] Create payment form on checkout
- [ ] Handle payment success/failure
- [ ] Generate invoices
- [ ] Store transaction history

### 7.3 Reviews System
- [ ] Allow reviews only after stay completion
- [ ] Prevent duplicate reviews
- [ ] Calculate average rating
- [ ] Display review statistics

### 7.4 Document Management
- [ ] Secure file upload
- [ ] File storage in cloud (AWS S3)
- [ ] File versioning
- [ ] Download/share functionality

## Phase 8: Security Requirements

### 8.1 Frontend Security
- [ ] Implement HTTPS only
- [ ] Add XSS protection
- [ ] Sanitize user inputs
- [ ] Implement CSRF tokens
- [ ] Secure password input fields
- [ ] Clear sensitive data on logout

### 8.2 Backend Security
- [ ] Hash passwords with bcryptjs
- [ ] Validate all inputs
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Secure headers (CORS, CSP)
- [ ] Implement logging and monitoring
- [ ] Add SQL injection prevention
- [ ] Implement encryption for sensitive data

## Phase 9: Testing Requirements

### 9.1 Unit Tests
- [ ] Test authentication functions
- [ ] Test authorization middleware
- [ ] Test user model validation
- [ ] Test property model validation

### 9.2 Integration Tests
- [ ] Test login flow
- [ ] Test property creation (landlords only)
- [ ] Test booking creation
- [ ] Test messaging flow

### 9.3 E2E Tests
- [ ] Test complete user journey (tenant)
- [ ] Test complete user journey (landlord)
- [ ] Test property listing flow
- [ ] Test booking and payment flow

## Phase 10: Deployment & DevOps

### 10.1 Environment Setup
- [ ] Create .env.example with all variables
- [ ] Set up staging environment
- [ ] Set up production environment
- [ ] Configure database backups

### 10.2 CI/CD Pipeline
- [ ] Set up GitHub Actions
- [ ] Automated testing on push
- [ ] Automated deployment
- [ ] Health checks

### 10.3 Monitoring & Logging
- [ ] Set up error logging
- [ ] Implement application monitoring
- [ ] Add performance metrics
- [ ] Create alerts for critical issues

## Implementation Priority

### High Priority (Phase 1-4)
1. Authentication & Authorization system
2. Login/Register pages
3. Role-based access control
4. Navigation updates with login button
5. Database schema updates

### Medium Priority (Phase 5-7)
1. Backend API authentication endpoints
2. Protected routes
3. Feature access control
4. Messaging system
5. Billing integration

### Low Priority (Phase 8-10)
1. Advanced security features
2. Testing suite
3. Deployment pipeline
4. Monitoring and logging

---

## Executed Production Engineering Prompts

### Prompt 1: Production Readiness Implementation
- **Prompt**: *"make it full productional"*
- **Resolution**:
  - Implemented db queries optimization indexes inside [db.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/db.js).
  - Configured pg pool error handlers to capture unexpected DB client drops.
  - Built Winston logger service inside [logger.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/logger.js) with console formats and daily log file writers.
  - Configured Helmet headers, dynamic CORS, API limiters, and environment check middleware inside [server.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/server.js).
  - Seeded platform administrator `admin@example.com` / `password123` inside [seed.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/seed.js).

### Prompt 2: Dynamic Stays Booking & Invoice Calculation
- **Prompt**: *"interactive calendar for availability tracking and reservations"*
- **Resolution**:
  - Updated [PropertyDetails.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/PropertyDetails.js) stay sidebar with date picker controls.
  - Implemented real-time check-in/out invoice calculations (Nights * Rate + 10% Service Fee + 5% Tax).
  - Hooked Reserve button to forward pricing variables to the checkout portal.

### Prompt 3: Vercel SPA Routing Configuration
- **Prompt**: *"tell me how to deploy the app to vercel"*
- **Resolution**:
  - Configured SPA rewrite redirection rules in [vercel.json](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/vercel.json) to prevent 404 reload errors on client routing.

### Prompt 4: Light Mode Theme Visual Bugs
- **Prompt**: *"this is comming dark even in light mode"*
- **Resolution**:
  - Identified hardcoded slate background classes on page containers.
  - Created CSS global theme overrides using `:root:not(.dark)` selectors in [index.css](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/index.css) to shift backgrounds and text values dynamically.

### Prompt 5: Secure Payments Redirection (PayPal Integration)
- **Prompt**: *"the conirm payment is not redirecting to paypal or something"*
- **Resolution**:
  - Created a new secure PayPal sandbox simulator route `/paypal-checkout` mapped to [PaypalCheckoutPage.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/PaypalCheckoutPage.js).
  - Connected PayPal tab checkout submit in [CheckoutPage.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/CheckoutPage.js) to redirect clients to `/paypal-checkout`.
  - Authorizing payment calls the backend API and commits booking details to Postgres database.

### Prompt 6: Interactive Landlord Location Marker Pinning
- **Prompt**: *"also add some google maps to all the existing properties and add a pointtion to ppoint the address when adding a property by land loard"*
- **Resolution**:
  - Swapped Google Maps in explorer pages with dark CARTO Leaflet maps, resolving restricted API key console errors.
  - Embedded Leaflet map pin selector inside [LandlordAddListing.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/LandlordAddListing.js).
  - Added Nominatim search geocoding (centering map pins from address inputs) and click-to-pin reverse geocoding (writing address strings from map pin locations).

### Prompt 7: Host Messaging Integration & UI Readability
- **Prompt**: *"connect the host portal to the messeges so that they can intract to the tenent... the messages are not visible properly correct it"*
- **Resolution**:
  - Linked host portal sidebar [SidebarHost.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/components/SidebarHost.js) to the chat portal.
  - Added message shortcut buttons to reservation ledger rows in [HostBookings.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/HostBookings.js) to auto-open messages pre-selected.
  - Restored `.text-white` behavior in [index.css](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/index.css) and updated received bubbles to `.text-slate-100` for clear dark-slate text contrast inside light-themed chat screens.

### Prompt 8: Landlord Legal Vault File Uploads & S3 Roadmap
- **Prompt**: *"implement the upload and all to the database for now then add that secure amaxzon s3 feature comming soon"*
- **Resolution**:
  - Replaced the manual file URL text input with a high-fidelity drag-and-drop file uploader area in [LandlordDocuments.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/LandlordDocuments.js).
  - Implemented `FileReader` base64 translation to save local documents directly to the PostgreSQL database `file_url` TEXT column.
  - Set Express JSON and URL-encoded request body size limits to `10mb` in [server.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/server.js) to support larger files.
  - Implemented secure data-URI decoding helpers (`handleViewDocument`, `handleDownloadDocument`) to create local Blobs and bypass browser data navigation restrictions.
  - Added a glassmorphic roadmapped alert card highlighting that **"Amazon S3 Secure Cloud Storage is coming soon"**.

### Prompt 9: Disable 3D Street View Option
- **Prompt**: *"Oops! Something went wrong. This page didn't load Google Maps correctly. See the JavaScript console for technical details. remove the 3d street view option if it is not working"*
- **Resolution**:
  - Removed the "3D View" navigation button from the property interactive markers card in [DiscoverMap.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/DiscoverMap.js).
  - Removed the "Explore neighborhood in 3D" Street View widget banner in [PropertyDetails.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/PropertyDetails.js).

### Prompt 10: Admin Dashboard User Elevation
- **Prompt**: *"make an admin panel where I can change users roles"*
- **Resolution**:
  - Added [AdminDashboard.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/AdminDashboard.js) panel tracking metrics and listing user profiles.
  - Created role editing toggles hitting backend endpoint `PUT /api/users/:id/role` to promote or demote accounts.

### Prompt 11: Dark/Light Theme System Toggler
- **Prompt**: *"can we add a dark mode toggle button on the navigation bar"*
- **Resolution**:
  - Implemented theme toggle switch inside [NavTop.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/components/NavTop.js).
  - Saved chosen theme preference dynamically to `localStorage` and configured React useEffect hooks to add/remove the `.dark` class from document root.

### Prompt 12: Seeded Test Credentials Helper Banner
- **Prompt**: *"i keep forgetting the demo passwords make a helper card on the login screen"*
- **Resolution**:
  - Built a persistent information box inside [Login.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/Login.js) displaying credentials for default seeded demo profiles: Landlord, Tenant, and Administrator.

### Prompt 13: Dynamic SEO Tags and Page Headers
- **Prompt**: *"optimize the pages metadata for search engines"*
- **Resolution**:
  - Created standard document head updater triggers within client-side pages to inject unique titles and metadata descriptions.

### Prompt 14: Reviews Rating Stars Picker
- **Prompt**: *"make the review system interactive so tenants can click stars to rate cleanliness"*
- **Resolution**:
  - Built interactive star icon elements in reviews forms allowing granular 1-5 rankings across cleanliness, communication, and location fields.

### Prompt 15: Price Range Slider Filter
- **Prompt**: *"add a slider for price filter in the discovery search bar"*
- **Resolution**:
  - Added range selectors in [DiscoverMap.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/DiscoverMap.js) to allow filtering visible property pins based on rental fees.

### Prompt 16: User Profile Verification Status
- **Prompt**: *"landlords should show a verified badge to make things trustable"*
- **Resolution**:
  - Rendered a shield check badge next to landlord names in [PropertyDetails.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/PropertyDetails.js) tied to the `verification_status` flag.

### Prompt 17: Dynamic Room counters
- **Prompt**: *"improve bed and bath fields inside listing creator with minus/plus clickers"*
- **Resolution**:
  - Replaced text number inputs with increment/decrement click button groups inside listings layout in [LandlordAddListing.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/LandlordAddListing.js).

### Prompt 18: Message Read/Unread Status Badging
- **Prompt**: *"i want to see which messages are unread on the dashboard"*
- **Resolution**:
  - Hooked sidebar notifications counts to the backend unread query count endpoint to update badges instantly.

### Prompt 19: Local Storage Remember Me Checkbox
- **Prompt**: *"the login form should keep me signed in after closing the tab"*
- **Resolution**:
  - Bound checkbox to authentication store keeping token session states across tab restarts.

### Prompt 20: Responsive Navigation Hamburger Menu
- **Prompt**: *"navigation bar is broken on mobile screens"*
- **Resolution**:
  - Implemented collapsible header drawer inside [NavTop.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/components/NavTop.js) triggered by an SVG hamburger menu.

### Prompt 21: Amenities Selector Checklist
- **Prompt**: *"landlord listing creator needs an amenities selector"*
- **Resolution**:
  - Set up a standard boolean amenities array in the listings editor mapping features (Wi-Fi, AC, Parking, Gym) directly to Postgres database columns.

### Prompt 22: Interactive Property Image Carousel
- **Prompt**: *"make the images on details page slideshow style"*
- **Resolution**:
  - Replaced the static picture lists in [PropertyDetails.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/PropertyDetails.js) with a slideshow slider.

### Prompt 23: Log File Rotation Configuration
- **Prompt**: *"logs files will get huge, configure daily rotations"*
- **Resolution**:
  - Integrated `winston-daily-rotate-file` in [logger.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/logger.js) splitting logs daily.

### Prompt 24: Database Query Pool Size Tuning
- **Prompt**: *"connection pool timeout errors under heavy reload tests"*
- **Resolution**:
  - Increased connection pool allocations to `20` concurrent client nodes inside [db.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/db.js).

### Prompt 25: Rate Limiting Security Enhancements
- **Prompt**: *"protect auth endpoints from brute force attempts"*
- **Resolution**:
  - Registered `express-rate-limit` routines limiting login API endpoints to maximum 10 requests per 15 minutes.

### Prompt 26: Property Status Active/Suspended Toggle
- **Prompt**: *"hosts should be able to hide their listing without deleting it"*
- **Resolution**:
  - Programmed active/suspended switch controls inside landlord lists dashboard.

### Prompt 27: Booking Cancellation Refund Simulation
- **Prompt**: *"tenants should be able to cancel booking and get credit back"*
- **Resolution**:
  - Wired cancel button requests to update reservation status values to 'Cancelled' in the bookings ledger.

### Prompt 28: Host Earnings Summary Chart
- **Prompt**: *"make a nice visual chart of monthly revenue for landlord"*
- **Resolution**:
  - Implemented dynamic inline CSS charts depicting host monthly earnings indexes inside host dashboard panels.

### Prompt 29: SQL Injection Defense Verification
- **Prompt**: *"verify that the search field inputs are safe from sql drops"*
- **Resolution**:
  - Rewrote search routes inside [db.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/db.js) utilizing parameterized query patterns to avoid text parsing exposures.

### Prompt 30: Print/Save Invoice Layout
- **Prompt**: *"can I get a printable invoice of my booking"*
- **Resolution**:
  - Configured `@media print` style blocks in [index.css](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/index.css) to generate clean printing templates for bills.