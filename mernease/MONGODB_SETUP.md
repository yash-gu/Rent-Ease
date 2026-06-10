# MongoDB Setup Guide for RentEase

## Option 1: Local MongoDB Installation (Recommended for Development)

### macOS
```bash
# Install MongoDB using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
mongosh
# If connected, you'll see > prompt
```

### Windows
1. Download MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Run the installer
3. MongoDB will start as a service automatically

### Linux (Ubuntu)
```bash
# Add MongoDB repository
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create a MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account
   - Create a new project

2. **Create a Cluster**
   - Click "Create" on the dashboard
   - Choose the free tier (M0)
   - Select your preferred region
   - Click "Create Cluster"

3. **Create a Database User**
   - Go to Database Access
   - Click "Add New Database User"
   - Choose password authentication
   - Set username and password
   - Click "Add User"

4. **Allow Network Access**
   - Go to Network Access
   - Click "Add IP Address"
   - Either add your IP or allow access from anywhere (0.0.0.0/0)

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Update your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rentease?retryWrites=true&w=majority
   ```

## Seeding the Database

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Ensure MongoDB is Running
```bash
# Local MongoDB - should be running as a service
# Or for manual start:
mongod
```

### Step 3: Run the Seed Script
```bash
npm run seed
```

This will:
- Connect to MongoDB
- Clear any existing data
- Create 5 sample users (2 landlords, 3 tenants)
- Create 5 sample properties
- Create 3 sample bookings
- Create 2 sample reviews
- Create 3 sample messages
- Create 2 sample earnings records

### Step 4: Verify Data
```bash
# Open MongoDB shell
mongosh

# Use the rentease database
use rentease

# Check collections
show collections

# View sample documents
db.users.findOne()
db.properties.findOne()
db.bookings.findOne()
```

## Sample Data Credentials

After seeding, you can use these test accounts:

### Tenant Accounts
- Email: `alex@example.com`
- Email: `sarah@example.com`
- Email: `david@example.com`
- Password: `password123` (for all accounts)

### Landlord Accounts
- Email: `eleni@example.com` (Host of Azure Heights Villa, Eiffel Sky Garden)
- Email: `marcus@example.com` (Host of Skyline Penthouse)
- Password: `password123` (for all accounts)

## Database Schema

### Collections Created

#### Users
- name: String
- email: String (unique)
- password: String (hashed)
- phone: String
- role: String (tenant, landlord, admin)
- avatar: String (URL)
- verificationStatus: Boolean
- createdAt: Date

#### Properties
- title: String
- description: String
- location: String
- price: Number
- propertyType: String
- bedrooms: Number
- bathrooms: Number
- guests: Number
- amenities: Array
- images: Array
- rating: Number
- reviews: Number
- hostId: ObjectId (User reference)
- status: String (Active, Occupied, Maintenance, Inactive)
- occupancyRate: Number
- monthlyRevenue: Number
- coordinates: Object { latitude, longitude }

#### Bookings
- propertyId: ObjectId (Property reference)
- userId: ObjectId (User reference)
- guestName: String
- checkIn: Date
- checkOut: Date
- guests: Number
- totalPrice: Number
- serviceFee: Number
- taxAmount: Number
- status: String (Pending, Confirmed, Cancelled, Completed)
- paymentStatus: String

#### Messages
- senderId: ObjectId (User reference)
- receiverId: ObjectId (User reference)
- propertyId: ObjectId (Property reference)
- text: String
- isRead: Boolean
- attachments: Array
- createdAt: Date

#### Reviews
- propertyId: ObjectId (Property reference)
- userId: ObjectId (User reference)
- rating: Number (1-5)
- cleanliness: Number
- communication: Number
- location: Number
- value: Number
- createdAt: Date

#### Earnings
- hostId: ObjectId (User reference)
- month: String
- year: Number
- revenue: Number
- bookings: Number
- occupancyRate: Number
- averageDailyRate: Number

## Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running. Start it with:
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Check Services app for MongoDB service
```

### Connection String Issues
```
Error: Invalid URI
```
**Solution**: Check your `.env` file format:
- Local: `mongodb://localhost:27017/rentease`
- Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/rentease?retryWrites=true&w=majority`

### Seed Script Fails
```
Error: E11000 duplicate key error
```
**Solution**: Run `npm run seed` again - it clears data before seeding.

## Backup and Restore

### Local MongoDB Backup
```bash
# Backup
mongodump --db rentease --out ./backup

# Restore
mongorestore --db rentease ./backup/rentease
```

### MongoDB Atlas Backup
- Go to Clusters → Backups
- Atlas automatically backs up your data
- Click "Restore" to recover data
