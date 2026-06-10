# Technical Documentation - RentEase

## 1. Technology Stack
- **Frontend**: React (v18.2.0), React Router DOM (v6.8.0), Tailwind CSS (v3.2.0), Axios.
- **Backend**: Node.js, Express, PostgreSQL (client connection via `pg` Pool).
- **Database**: PostgreSQL (Supabase / local Docker instance).
- **Styling**: Tailwind CSS classes with Vanilla CSS theme overrides in `index.css`.
- **Mapping Services**: Leaflet API (loaded dynamically from unpkg CDN).

---

## 2. Directory Structure

```text
RentEase/
├── docker-compose.yml           # Runs DB, backend API, and frontend Nginx in containers
└── mernease/
    ├── backend/
    │   ├── db.js                # pg Client Pool queries and schemas
    │   ├── logger.js            # Winston daily rotating file logger
    │   ├── models.js            # SQL database table definitions
    │   ├── package.json         # Node scripts & server packages
    │   ├── seed.js              # Database drop, create, and insert seed data script
    │   └── server.js            # Express API routing and security middleware
    │
    └── frontend/
        ├── Dockerfile           # Multi-stage production Nginx frontend container
        ├── nginx.conf           # SPA fallback rewrite rules
        ├── package.json         # React client dependencies & scripts
        ├── tailwind.config.js   # Tailwinds theme specifications
        ├── vercel.json          # Vercel client deployment redirect configuration
        ├── public/
        │   └── index.html       # HTML root shell
        └── src/
            ├── App.js           # React Router mappings
            ├── index.css        # Theme CSS overrides
            ├── components/
            │   ├── NavTop.js    # Global navigation panel
            │   └── SidebarHost.js # Landlord portal side menu
            └── pages/
                ├── AdminDashboard.js # Admin oversight board
                ├── CheckoutPage.js   # Booking guest billing forms
                ├── DiscoverMap.js    # Properties interactive split explorer
                ├── HostBookings.js   # Landlord reservations ledger
                ├── MessagingPortal.js # Poll-based chat dashboard
                ├── PaypalCheckoutPage.js # PayPal Express simulator
                └── PropertyDetails.js # Dynamic invoice picker & property specs
```

---

## 3. Configuration Profiles

### 3.1. Vercel Configuration (`vercel.json`)
Allows Single Page App (SPA) routers (React Router DOM) to reload paths without throwing 404s:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 3.2. Docker Multi-Stage Configuration (`frontend/Dockerfile`)
Compiles React build artifacts and serves them through an Nginx proxy:
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 4. Security & Performance Best Practices

### 4.1. Security Headers (Helmet)
Express server is wrapped with Helmet middleware to set HTTP headers protecting against Cross-Site Scripting (XSS), clickjacking, and mime-type sniffing.

### 4.2. API Rate Limiting
Authentication registration and login endpoints are limited using `express-rate-limit` to prevent brute-force attacks:
- Window: 15 minutes
- Limit: 100 requests per IP address.

### 4.3. Winston Logger Service
A professional Winston service with two transports:
- Console: formatted with clean color codes for development.
- Daily rotate stream: writes log audits automatically to file streams inside `logs/` directory.

---

## 5. Development & Deployment Procedures

### 5.1. Database Initialization & Seeding
1. Edit `.env` in the backend directory. Set your `DATABASE_URL` and `JWT_SECRET`.
2. Seed the tables:
   ```bash
   cd mernease/backend
   npm run seed
   ```

### 5.2. Running Locally
- **Backend API**:
  ```bash
  cd mernease/backend
  npm start
  ```
  Runs server on port `5001`.
- **Frontend Client**:
  ```bash
  cd mernease/frontend
  npm start
  ```
  Runs client on port `3000`.

### 5.3. Docker Compose Build
To run the entire multi-container stack locally (Postgres DB, API Service, and Nginx Client):
```bash
docker compose up --build
```
