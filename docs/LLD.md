# Low-Level Design (LLD) - RentEase

## 1. Database Schema Specifications (PostgreSQL)

### 1.1. `users` Table
Stores authentication and profile assets:
- `id` (TEXT, PK): Unique UUID.
- `name` (TEXT): Full name.
- `email` (TEXT): Unique email.
- `password` (TEXT): Hashed password (bcrypt).
- `phone` (TEXT): Contact number.
- `role` (TEXT): User level (`tenant`, `landlord`, `admin`).
- `avatar` (TEXT): Profile photo link.
- `bio` (TEXT): Summary.
- `verification_status` (BOOLEAN): Status badge indicator.

### 1.2. `properties` Table
Stores accommodation inventory details:
- `id` (TEXT, PK): Unique UUID.
- `title` (TEXT): Listing title.
- `description` (TEXT): Listing description details.
- `location` (TEXT): Text representation of the address.
- `price` (NUMERIC): Nightly cost.
- `property_type` (TEXT): Apartment, Villa, Cabin etc.
- `bedrooms` / `bathrooms` / `guests` (INTEGER): Stay specifications.
- `amenities` (TEXT[]): List of amenity strings.
- `images` (TEXT[]): List of gallery links.
- `rating` / `reviews` (NUMERIC/INTEGER): Aggregate rating scores.
- `host_id` (TEXT, FK): Links to `users(id)`.
- `latitude` / `longitude` (NUMERIC): Map coordinates.

### 1.3. `bookings` Table
Tracks reservations:
- `id` (TEXT, PK): Unique UUID.
- `property_id` (TEXT, FK): Links to `properties(id)`.
- `user_id` (TEXT, FK): Links to `users(id)`.
- `guest_name` / `guest_email` (TEXT): Contact details.
- `check_in` / `check_out` (TIMESTAMPTZ): Start/End dates.
- `guests` (INTEGER): Number of occupants.
- `total_price` / `service_fee` / `tax_amount` (NUMERIC): Cost structures.
- `status` (TEXT): `Pending`, `Confirmed`, `Cancelled`.
- `payment_method` (TEXT): Credit Card, PayPal.
- `payment_status` (TEXT): `Pending`, `Completed`.

---

## 2. Component Design & State Machine Models

### 2.1. PayPal Express Simulator (`PaypalCheckoutPage.js`)

#### State Variables:
- `step` (number): Tracks workflow phase.
  - `1`: Login Credentials Screen.
  - `2`: Invoice Review & Pay screen.
  - `3`: Processing spinner ("Authorizing secure transaction token...").
  - `4`: Success Splash Screen (autonext to `/tenant` dashboard after 3.5s).
  - `5`: Error Page (displaying failure explanation).
- `processingStatus` (string): Text display of step 3 authorization phases.

```text
[Step 1: Login] --(Form Submit)--> [Step 2: Review Invoice] 
                                            |
                                      (Click Pay Now)
                                            |
                                            v
[Step 4: Success] <--(DB Insert Ok)-- [Step 3: Processing] --(DB Insert Fail)--> [Step 5: Error]
```

### 2.2. Interactive Landlord Map Selector (`LandlordAddListing.js`)

#### Map Initialization Algorithm:
1. Mount hook checks if `window.L` is loaded. If missing, dynamically creates `<link>` and `<script>` script tags pointing to Leaflet CDN.
2. Once scripts load, instantiates `window.L.map` inside container div `#landlord-picker-map`.
3. Loads CARTO dark matter tile layer.
4. Places draggable marker pin `L.marker` at default coordinates (NY: 40.7128, -74.0060).
5. Registers click trigger on Map, and drag trigger on Marker.

#### Coordinate Mapping & Geocoding Methods:
- **Map Click / Marker Drag**:
  When trigger fires, calls `updateCoordinates(lat, lng)`.
  - Sets `formData.latitude` and `formData.longitude`.
  - Shifts marker location: `marker.setLatLng([lat, lng])`.
  - Invokes OpenStreetMap Nominatim reverse geocode search:
    ```javascript
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
    ```
  - Writes data description text `display_name` back to `formData.location` input.
- **Geocode Locate Input Search**:
  When landlord clicks "Locate" next to address:
  - Invokes Nominatim coordinate search:
    ```javascript
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
    ```
  - Parses return payload for `[lat, lon]`.
  - Updates form state coordinates, moves marker, and pans map view:
    ```javascript
    map.setView([targetLat, targetLng], 14);
    ```

---

## 3. Light / Dark Mode Styling Logic (`index.css`)

CSS custom variable tokens are declared under `:root` and overridden under class `.dark` toggle triggers. In light mode:
- Background and panel colors resolve to clean white `#ffffff` and soft blue `#f8f9ff`.
- Titles and text colors shift to dark slate `#0b1c30`.
- Override rule `!important` binds text color to components using `.text-slate-100`.
- Buttons and bubbles preserve white text by utilizing standard `.text-white` without override mappings.
