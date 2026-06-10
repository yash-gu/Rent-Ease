# Product Requirements Document (PRD) - RentEase

## 1. Document Control
- **Product Name**: RentEase
- **Status**: Complete & Production Ready
- **Target Audience**: Real Estate Hosts (Landlords), Tenants (Travelers/Renters), and Platform Administrators

---

## 2. Executive Summary & Objective
RentEase is a full-featured, premium property rental marketplace designed to streamline interactions between property owners (hosts) and renters (tenants). The platform addresses common real estate search friction by providing:
- High-fidelity visual property listings.
- Keyless, interactive dark-theme map exploration.
- Calendar availability reservations and dynamic pricing tools.
- Dual gateway payment structures (Stripe and PayPal Express).
- Instant in-app messaging communication.
- Administrator oversight dashboard to prune users and remove listings.

---

## 3. User Personas
### 3.1. Tenant (Renter / Traveler)
- **Goal**: Browse luxury listings, filter stays, view location proximity interactively, pay securely, and message the host.
### 3.2. Host (Landlord / Property Owner)
- **Goal**: List properties, manage coordinates, upload photos, review bookings, calculate payouts/earnings, sign lease documents, and chat with guests.
### 3.3. Administrator (Admin)
- **Goal**: Audit users, purge inactive/fraudulent listings, examine bookings, and oversee platform performance.

---

## 4. Key Functional Features

### 4.1. Authentication & Onboarding
- **Requirements**:
  - Separate registration/login portals for tenants, landlords, and administrators.
  - Form validation with client-side error handling and rate-limiting security middleware on server.
  - Session security enforced using JSON Web Tokens (JWT) stored in LocalStorage.

### 4.2. Property Discovery & Maps
- **Requirements**:
  - A split-screen explorer interface featuring listing cards on the left and a live dark-mode map on the right.
  - Interactive map integration displaying custom brand-colored dot pins.
  - Hover highlights, coordinates auto-zoom, and detail popups containing listing summary and pricing.
  - **Zero Key Dependency**: Integrated using Leaflet maps to avoid Google Maps billing key error alerts.

### 4.3. Property Details & Reservations
- **Requirements**:
  - Photo gallery showcasing the accommodation asset.
  - Host details, bedroom/bathroom specifications, and amenity tags.
  - Interactive calendar block allowing check-in and check-out selections.
  - Dynamic invoice calculation (Nights * Rate + 10% Service Fee + 5% Tax) updated in real-time.
  - Proximity Street View panorama links.

### 4.4. Payment & Booking Submission
- **Requirements**:
  - **Stripe Integration**: Sandbox card input validation form.
  - **PayPal Express**: Sandbox authorization redirection flow that redirects the user to a secure payment portal at `/paypal-checkout`, processes sandbox credentials, and returns them to RentEase.
  - Write transaction details directly to PostgreSQL to register confirmed bookings.

### 4.5. In-App Real-time Chat
- **Requirements**:
  - Chat list containing conversation streams grouped by partner, ordered by newest.
  - Background polling mechanism fetching updates every 4 seconds for immediate sync.
  - Fully responsive theme color adaptation (dark text on light background in light theme).
  - Quick-action redirection buttons inside landlord reservation ledger to initiate message streams directly.

### 4.6. Admin Control Board
- **Requirements**:
  - Statistical display of users, listings, reservations, and total revenue.
  - User auditing panel enabling role inspection and deletion of accounts.
  - Listing control panel allowing removal of properties.
  - Universal log registry recording all booking files.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1. Security & Compliance
- Security headers enforced via Express Helmet.
- Dynamic CORS mapping limiting operations to validated clients.
- Winston log storage capturing console streams and daily file logs.
- Password hashing utilizing bcrypt.

### 5.2. Design & Aesthetics
- Fluid transition between dark and light themes using CSS root variable mapping classes.
- Responsive layout scaling across desktop, tablet, and mobile.
- Use of premium Google Fonts (Inter) and custom CSS scrollbars.

---

## 6. Implementation & Release Roadmap
- **Phase 1**: Database schema creation & seeding
- **Phase 2**: JWT Authentication & onboarding forms
- **Phase 3**: Listings explorer map & details
- **Phase 4**: Bookings, invoice calculations, and payment gateways
- **Phase 5**: Real-time polling messaging portal
- **Phase 6**: Admin dashboard integrations
- **Phase 7**: Light theme visual alignment & verification check
