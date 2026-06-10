# Prompt Tracker & Change Log - RentEase

This document tracks the prompts, requirements, and change logs processed during the production engineering lifecycle of the RentEase application.

---

## Prompt 1: Production Readiness Implementation
- **Prompt**: *"make it full productional"*
- **Resolution**:
  - Implemented db queries optimization indexes inside [db.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/db.js).
  - Configured pg pool error handlers to capture unexpected DB client drops.
  - Built Winston logger service inside [logger.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/logger.js) with console formats and daily log file writers.
  - Configured Helmet headers, dynamic CORS, API limiters, and environment check middleware inside [server.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/server.js).
  - Seeded platform administrator `admin@example.com` / `password123` inside [seed.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/seed.js).

---

## Prompt 2: Dynamic Stays Booking & Invoice Calculation
- **Prompt**: *"interactive calendar for availability tracking and reservations"*
- **Resolution**:
  - Updated [PropertyDetails.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/PropertyDetails.js) stay sidebar with date picker controls.
  - Implemented real-time check-in/out invoice calculations (Nights * Rate + 10% Service Fee + 5% Tax).
  - Hooked Reserve button to forward pricing variables to the checkout portal.

---

## Prompt 3: Vercel SPA Routing Configuration
- **Prompt**: *"tell me how to deploy the app to vercel"*
- **Resolution**:
  - Configured SPA rewrite redirection rules in [vercel.json](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/vercel.json) to prevent 404 reload errors on client routing.

---

## Prompt 4: Light Mode Theme Visual Bugs
- **Prompt**: *"this is comming dark even in light mode"*
- **Resolution**:
  - Identified hardcoded slate background classes on page containers.
  - Created CSS global theme overrides using `:root:not(.dark)` selectors in [index.css](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/index.css) to shift backgrounds and text values dynamically.

---

## Prompt 5: Secure Payments Redirection (PayPal Integration)
- **Prompt**: *"the conirm payment is not redirecting to paypal or something"*
- **Resolution**:
  - Created a new secure PayPal sandbox simulator route `/paypal-checkout` mapped to [PaypalCheckoutPage.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/PaypalCheckoutPage.js).
  - Connected PayPal tab checkout submit in [CheckoutPage.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/CheckoutPage.js) to redirect clients to `/paypal-checkout`.
  - Authorizing payment calls the backend API and commits booking details to Postgres database.

---

## Prompt 6: Interactive Landlord Location Marker Pinning
- **Prompt**: *"also add some google maps to all the existing properties and add a pointtion to ppoint the address when adding a property by land loard"*
- **Resolution**:
  - Swapped Google Maps in explorer pages with dark CARTO Leaflet maps, resolving restricted API key console errors.
  - Embedded Leaflet map pin selector inside [LandlordAddListing.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/LandlordAddListing.js).
  - Added Nominatim search geocoding (centering map pins from address inputs) and click-to-pin reverse geocoding (writing address strings from map pin locations).

---

## Prompt 7: Host Messaging Integration & UI Readability
- **Prompt**: *"connect the host portal to the messeges so that they can intract to the tenent... the messages are not visible properly correct it"*
- **Resolution**:
  - Linked host portal sidebar [SidebarHost.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/components/SidebarHost.js) to the chat portal.
  - Added message shortcut buttons to reservation ledger rows in [HostBookings.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/HostBookings.js) to auto-open messages pre-selected.
  - Restored `.text-white` behavior in [index.css](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/index.css) and updated received bubbles to `.text-slate-100` for clear dark-slate text contrast inside light-themed chat screens.

---

## Prompt 8: Landlord Legal Vault File Uploads & S3 Roadmap
- **Prompt**: *"implement the upload and all to the database for now then add that secure amaxzon s3 feature comming soon"*
- **Resolution**:
  - Replaced the manual file URL text input with a high-fidelity drag-and-drop file uploader area in [LandlordDocuments.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/LandlordDocuments.js).
  - Implemented `FileReader` base64 translation to save local documents directly to the PostgreSQL database `file_url` TEXT column.
  - Set Express JSON and URL-encoded request body size limits to `10mb` in [server.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/server.js) to support larger files.
  - Implemented secure data-URI decoding helpers (`handleViewDocument`, `handleDownloadDocument`) to create local Blobs and bypass browser data navigation restrictions.
  - Added a glassmorphic roadmapped alert card highlighting that **"Amazon S3 Secure Cloud Storage is coming soon"**.

---

## Prompt 9: Disable 3D Street View Option
- **Prompt**: *"Oops! Something went wrong. This page didn't load Google Maps correctly. See the JavaScript console for technical details. remove the 3d street view option if it is not working"*
- **Resolution**:
  - Removed the "3D View" navigation button from the property interactive markers card in [DiscoverMap.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/DiscoverMap.js).
  - Removed the "Explore neighborhood in 3D" Street View widget banner in [PropertyDetails.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/PropertyDetails.js).

---

## Prompt 10: Admin Dashboard User Elevation
- **Prompt**: *"make an admin panel where I can change users roles"*
- **Resolution**:
  - Added [AdminDashboard.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/AdminDashboard.js) panel tracking metrics and listing user profiles.
  - Created role editing toggles hitting backend endpoint `PUT /api/users/:id/role` to promote or demote accounts.

---

## Prompt 11: Dark/Light Theme System Toggler
- **Prompt**: *"can we add a dark mode toggle button on the navigation bar"*
- **Resolution**:
  - Implemented theme toggle switch inside [NavTop.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/components/NavTop.js).
  - Saved chosen theme preference dynamically to `localStorage` and configured React useEffect hooks to add/remove the `.dark` class from document root.

---

## Prompt 12: Seeded Test Credentials Helper Banner
- **Prompt**: *"i keep forgetting the demo passwords make a helper card on the login screen"*
- **Resolution**:
  - Built a persistent information box inside [Login.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/Login.js) displaying credentials for default seeded demo profiles: Landlord, Tenant, and Administrator.

---

## Prompt 13: Dynamic SEO Tags and Page Headers
- **Prompt**: *"optimize the pages metadata for search engines"*
- **Resolution**:
  - Created standard document head updater triggers within client-side pages to inject unique titles and metadata descriptions.

---

## Prompt 14: Reviews Rating Stars Picker
- **Prompt**: *"make the review system interactive so tenants can click stars to rate cleanliness"*
- **Resolution**:
  - Built interactive star icon elements in reviews forms allowing granular 1-5 rankings across cleanliness, communication, and location fields.

---

## Prompt 15: Price Range Slider Filter
- **Prompt**: *"add a slider for price filter in the discovery search bar"*
- **Resolution**:
  - Added range selectors in [DiscoverMap.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/DiscoverMap.js) to allow filtering visible property pins based on rental fees.

---

## Prompt 16: User Profile Verification Status
- **Prompt**: *"landlords should show a verified badge to make things trustable"*
- **Resolution**:
  - Rendered a shield check badge next to landlord names in [PropertyDetails.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/PropertyDetails.js) tied to the `verification_status` flag.

---

## Prompt 17: Dynamic Room counters
- **Prompt**: *"improve bed and bath fields inside listing creator with minus/plus clickers"*
- **Resolution**:
  - Replaced text number inputs with increment/decrement click button groups inside listings layout in [LandlordAddListing.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/LandlordAddListing.js).

---

## Prompt 18: Message Read/Unread Status Badging
- **Prompt**: *"i want to see which messages are unread on the dashboard"*
- **Resolution**:
  - Hooked sidebar notifications counts to the backend unread query count endpoint to update badges instantly.

---

## Prompt 19: Local Storage Remember Me Checkbox
- **Prompt**: *"the login form should keep me signed in after closing the tab"*
- **Resolution**:
  - Bound checkbox to authentication store keeping token session states across tab restarts.

---

## Prompt 20: Responsive Navigation Hamburger Menu
- **Prompt**: *"navigation bar is broken on mobile screens"*
- **Resolution**:
  - Implemented collapsible header drawer inside [NavTop.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/components/NavTop.js) triggered by an SVG hamburger menu.

---

## Prompt 21: Amenities Selector Checklist
- **Prompt**: *"landlord listing creator needs an amenities selector"*
- **Resolution**:
  - Set up a standard boolean amenities array in the listings editor mapping features (Wi-Fi, AC, Parking, Gym) directly to Postgres database columns.

---

## Prompt 22: Interactive Property Image Carousel
- **Prompt**: *"make the images on details page slideshow style"*
- **Resolution**:
  - Replaced the static picture lists in [PropertyDetails.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/PropertyDetails.js) with a slideshow slider.

---

## Prompt 23: Log File Rotation Configuration
- **Prompt**: *"logs files will get huge, configure daily rotations"*
- **Resolution**:
  - Integrated `winston-daily-rotate-file` in [logger.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/logger.js) splitting logs daily.

---

## Prompt 24: Database Query Pool Size Tuning
- **Prompt**: *"connection pool timeout errors under heavy reload tests"*
- **Resolution**:
  - Increased connection pool allocations to `20` concurrent client nodes inside [db.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/db.js).

---

## Prompt 25: Rate Limiting Security Enhancements
- **Prompt**: *"protect auth endpoints from brute force attempts"*
- **Resolution**:
  - Registered `express-rate-limit` routines limiting login API endpoints to maximum 10 requests per 15 minutes.

---

## Prompt 26: Property Status Active/Suspended Toggle
- **Prompt**: *"hosts should be able to hide their listing without deleting it"*
- **Resolution**:
  - Programmed active/suspended switch controls inside landlord lists dashboard.

---

## Prompt 27: Booking Cancellation Refund Simulation
- **Prompt**: *"tenants should be able to cancel booking and get credit back"*
- **Resolution**:
  - Wired cancel button requests to update reservation status values to 'Cancelled' in the bookings ledger.

---

## Prompt 28: Host Earnings Summary Chart
- **Prompt**: *"make a nice visual chart of monthly revenue for landlord"*
- **Resolution**:
  - Implemented dynamic inline CSS charts depicting host monthly earnings indexes inside host dashboard panels.

---

## Prompt 29: SQL Injection Defense Verification
- **Prompt**: *"verify that the search field inputs are safe from sql drops"*
- **Resolution**:
  - Rewrote search routes inside [db.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/db.js) utilizing parameterized query patterns to avoid text parsing exposures.

---

## Prompt 30: Print/Save Invoice Layout
- **Prompt**: *"can I get a printable invoice of my booking"*
- **Resolution**:
  - Configured `@media print` style blocks in [index.css](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/index.css) to generate clean printing templates for bills.

---

## Prompt 31: Razorpay Payment Gateway Integration
- **Prompt**: *"connect rozarpay using test api"*
- **Resolution**:
  - Installed `razorpay` package and created API endpoint `POST /api/razorpay/order` in [server.js](file:///Users/yashgupta/Downloads/RentEase/mernease/backend/server.js) with mock order fallback parameters.
  - Added "Razorpay INR" tab option, rupee conversion (1 USD = 83 INR), and script loader in [CheckoutPage.js](file:///Users/yashgupta/Downloads/RentEase/mernease/frontend/src/pages/CheckoutPage.js).
  - Built a simulated in-app Razorpay Sandbox checkout modal popup in React for seamless user testing when API credentials are absent.
  - Linked success handlers to post bookings to the PostgreSQL ledger.
