# High-Level Design (HLD) - RentEase

## 1. System Architecture
RentEase follows a decoupled client-server architecture model. The client layer runs as a Single Page Application (SPA) inside the user's browser, communicating with the server layer through asynchronous RESTful HTTP calls.

```mermaid
graph TD
    User([User Browser])
    
    subgraph Frontend [React SPA Client]
        UI[Tailwind & CSS UI Components]
        Router[React Router DOM]
        AuthCtx[Auth Context LocalStorage]
        Leaflet[Leaflet Maps CDN Wrapper]
    end
    
    subgraph Backend [Express API Gateway]
        Server[Express Server]
        AuthMid[Auth & JWT Middleware]
        Limiter[Auth Rate Limiter]
        Winston[Winston Logging Daemon]
    end
    
    subgraph DatabaseLayer [Data Store]
        pgPool[node-pg Client Pool]
        Postgres[(PostgreSQL Database)]
    end
    
    User <--> UI
    UI <--> Router
    UI <--> Leaflet
    
    UI -- HTTPS REST API --o Server
    Server --> AuthMid
    Server --> Limiter
    Server --> Winston
    
    Server --> pgPool
    pgPool --> Postgres
```

---

## 2. Technology Stack & Key Layers

### 2.1. Client Layer (Presentation)
- Serves compile-built HTML static assets via Nginx.
- Manages routing paths on the client using React Router.
- Manages map visuals dynamically using Leaflet, injecting unpkg stylesheet nodes onto the head element.

### 2.2. Gateway Server Layer (Application API)
- Serves endpoints mapping REST actions (GET, POST, PUT, DELETE).
- Encrypts user credentials using standard salt rounds (bcrypt).
- Generates base-64 signed authorization tokens (JSON Web Tokens) with a 7-day duration flag.

### 2.3. Data Persistence Layer (Database)
- Stores transactions in PostgreSQL.
- Database connections are pooled via `node-pg` client pool to limit socket overhead and handle connection drops.

---

## 3. Core Data Flow & Workflows

### 3.1. Authentication Flow
```mermaid
sequenceDiagram
    participant Tenant as Tenant Client
    participant API as Express API Server
    participant DB as PostgreSQL DB
    
    Tenant->>API: POST /api/auth/login { email, password }
    API->>DB: Query User by Email
    DB-->>API: Return User Row & Hashed Password
    API->>API: Verify Password via bcrypt
    API->>API: Sign JWT Token (7-day duration)
    API-->>Tenant: JSON { token, user: { name, role, ... } }
    Tenant->>Tenant: Store JWT in LocalStorage
```

### 3.2. Booking and PayPal Redirection Flow
```mermaid
sequenceDiagram
    participant Tenant as Tenant Client
    participant PayPal as PayPal Checkout Portal (/paypal-checkout)
    participant API as Express API Server
    participant DB as PostgreSQL DB

    Tenant->>Tenant: Fill guest details & select PayPal
    Tenant->>PayPal: Redirect (state: booking parameters)
    PayPal->>PayPal: Sandbox Login & invoice confirmation
    PayPal->>API: POST /api/bookings { payload, Auth: Bearer JWT }
    API->>DB: INSERT INTO bookings, paymentStatus: 'Completed'
    DB-->>API: Return Booking Row
    API-->>PayPal: Return JSON response
    PayPal->>Tenant: Redirect to /tenant (Dashboard) with toast
```

### 3.3. Landlord Add Listing Map Coordinate Picker Flow
```mermaid
sequenceDiagram
    participant Host as Landlord Client
    participant Nominatim as OSM Nominatim Geocoding API
    participant Leaflet as Leaflet Map Picker
    
    Host->>Host: Enter Address / Location
    Host->>Nominatim: Query Location geocoding (Locate button)
    Nominatim-->>Host: Coordinates (lat, lon)
    Host->>Leaflet: Center view & place marker pin
    
    Note over Host, Leaflet: Alternate Flow: User clicks Map directly
    Host->>Leaflet: Click Map or drag marker pin
    Leaflet->>Host: Capture coordinates & update text inputs
    Host->>Nominatim: Reverse geocode coordinates
    Nominatim-->>Host: Return address string & update location input
```
