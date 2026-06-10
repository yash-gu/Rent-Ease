# API Documentation - RentEase REST API

All API requests expect JSON payloads and respond with JSON. Protected routes require the client to supply an HTTP Authorization Header:
`Authorization: Bearer <JSON_WEB_TOKEN>`

---

## 1. Authentication Endpoints

### 1.1. User Registration
- **Route**: `POST /api/auth/register`
- **Rate Limited**: Yes (Max 100 requests per 15 mins)
- **Request Body**:
  ```json
  {
    "name": "Sarah Miller",
    "email": "sarah@example.com",
    "password": "password123",
    "phone": "+1-555-0124",
    "role": "tenant"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "user": {
      "_id": "uuid-string",
      "name": "Sarah Miller",
      "email": "sarah@example.com",
      "phone": "+1-555-0124",
      "role": "tenant",
      "avatar": "url-link",
      "bio": null,
      "verificationStatus": false,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    },
    "token": "jwt-token-string",
    "message": "Registration successful"
  }
  ```

### 1.2. User Login
- **Route**: `POST /api/auth/login`
- **Rate Limited**: Yes
- **Request Body**:
  ```json
  {
    "email": "alex@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "_id": "uuid-string",
      "name": "Alex Johnson",
      "email": "alex@example.com",
      "role": "tenant",
      "verificationStatus": true
    },
    "token": "jwt-token-string",
    "message": "Login successful"
  }
  ```

### 1.3. Get Authenticated User Profile
- **Route**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "_id": "uuid-string",
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "role": "tenant"
  }
  ```

---

## 2. Properties Endpoints

### 2.1. List All Properties
- **Route**: `GET /api/properties`
- **Response (200 OK)**: Array of property listing objects.

### 2.2. Get Property Details
- **Route**: `GET /api/properties/:id`
- **Response (200 OK)**: Property listing object populated with host detail records.

### 2.3. Create Property Listing
- **Route**: `POST /api/properties`
- **Request Body**:
  ```json
  {
    "title": "Skyline Penthouse",
    "description": "Luxurious stay in Manhattan",
    "location": "Manhattan, NY",
    "price": 850,
    "propertyType": "Apartment",
    "bedrooms": 3,
    "bathrooms": 2,
    "guests": 6,
    "amenities": ["City View", "Gym"],
    "images": ["url-link"],
    "hostId": "host-user-id",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }
  ```
- **Response (201 Created)**: Created property object.

---

## 3. Bookings & Reservations Endpoints

### 3.1. Create Booking
- **Route**: `POST /api/bookings`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "propertyId": "property-id",
    "guestName": "Alex Johnson",
    "guestEmail": "alex@example.com",
    "checkIn": "2026-06-12T00:00:00.000Z",
    "checkOut": "2026-06-15T00:00:00.000Z",
    "guests": 2,
    "totalPrice": 2500.00,
    "serviceFee": 250.00,
    "taxAmount": 125.00,
    "status": "Confirmed",
    "paymentMethod": "PayPal",
    "paymentStatus": "Completed"
  }
  ```
- **Response (201 Created)**: Recorded booking details record.

### 3.2. List Host Reservations
- **Route**: `GET /api/host/bookings/:hostId`
- **Response (200 OK)**: Array of reservations booked on properties owned by the host.

### 3.3. Update Booking Status
- **Route**: `PUT /api/bookings/:id`
- **Request Body**: `{ "status": "Confirmed" }` or `{ "status": "Cancelled" }`
- **Response (200 OK)**: Updated booking object.

---

## 4. In-App Messaging Endpoints

### 4.1. Get Message Conversations
- **Route**: `GET /api/messages/:userId`
- **Response (200 OK)**: Array of all messages sent or received by the user, newest first.

### 4.2. Send Message
- **Route**: `POST /api/messages`
- **Request Body**:
  ```json
  {
    "senderId": "sender-user-id",
    "receiverId": "receiver-user-id",
    "text": "Hello! Confirming check-in details."
  }
  ```
- **Response (201 Created)**: Sent message object.

---

## 5. Administration Endpoints (Admin Role Only)

### 5.1. List All Platform Bookings
- **Route**: `GET /api/admin/bookings`
- **Response (200 OK)**: Array of all platform bookings.

### 5.2. Delete Listing
- **Route**: `DELETE /api/properties/:id`
- **Response (200 OK)**: `{ "message": "Property deleted successfully" }`

### 5.3. Delete User Account
- **Route**: `DELETE /api/users/:id`
- **Response (200 OK)**: `{ "message": "User deleted successfully" }`
