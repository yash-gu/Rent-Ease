# RentEase - Quick Start Guide

## 🎯 Get Started in 5 Minutes

### Step 1: Start MongoDB

**macOS:**
```bash
brew services start mongodb-community
```

**Windows:**
- MongoDB runs automatically as a service

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 2: Start Backend Server

```bash
cd /Users/yashgupta/Downloads/RentEase/mernease/backend
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
✅ Server running on port 5001
```

### Step 3: Start Frontend Server

In a new terminal:
```bash
cd /Users/yashgupta/Downloads/RentEase/mernease/frontend
npm start
```

Expected output:
```
Compiled with warnings.
webpack compiled with 1 warning
```

### Step 4: Open Application

Visit: **http://localhost:3000**

### Step 5: Login with Demo Account

**Tenant Account:**
- Email: `alex@example.com`
- Password: `password123`

**Landlord Account:**
- Email: `eleni@example.com`
- Password: `password123`

---

## 🔧 Troubleshooting

### Issue: "MongoDB connection error"

**Solution:**
```bash
# Check if MongoDB is running
brew services list

# Start if not running
brew services start mongodb-community

# Or run manually
mongod
```

### Issue: "Port 5001 already in use"

**Solution:**
```bash
# Kill process using port 5001
lsof -i :5001
kill -9 <PID>

# Or use different port
PORT=5002 npm run dev
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Issue: Frontend shows blank page

**Solution:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
3. Check browser console for errors: `F12`
4. Check that backend is running on port 5001

### Issue: Cannot login - "Invalid credentials"

**Solution:**
1. Run seed script to populate database:
```bash
cd /Users/yashgupta/Downloads/RentEase/mernease/backend
npm run seed
```

2. Use correct credentials:
   - Tenant: `alex@example.com` / `password123`
   - Landlord: `eleni@example.com` / `password123`

### Issue: CORS error in browser console

**Solution:**
1. Backend might not be running
2. Check backend is on port 5001
3. Restart both servers

### Issue: "Cannot find module" error

**Solution:**
```bash
# Reinstall dependencies
cd mernease/frontend
rm -rf node_modules
npm install

# Or backend
cd ../backend
rm -rf node_modules
npm install
```

---

## 📊 Feature Access by Role

### Tenant (alex@example.com)
✅ Browse properties  
✅ View property details  
✅ Make bookings  
✅ View my bookings  
✅ Send messages to hosts  
✅ Leave reviews  
❌ Create listings  
❌ View earnings  
❌ Manage documents  

### Landlord (eleni@example.com)
✅ Create property listings  
✅ Manage properties  
✅ View my bookings  
✅ Send messages to guests  
✅ View earnings dashboard  
✅ Upload documents  
✅ View analytics  
❌ Browse other properties as tenant  

---

## 📁 Project Structure

```
RentEase/
├── mernease/
│   ├── backend/
│   │   ├── models.js          # Database schemas
│   │   ├── seed.js            # Sample data
│   │   ├── server.js          # Express server & API
│   │   ├── package.json       # Dependencies
│   │   └── .env               # Environment variables
│   └── frontend/
│       ├── src/
│       │   ├── pages/         # Page components
│       │   ├── components/    # Reusable components
│       │   ├── context/       # AuthContext
│       │   ├── App.js         # Main app with routes
│       │   └── index.js       # Entry point
│       ├── public/            # Static files
│       ├── package.json       # Dependencies
│       └── tailwind.config.js # Tailwind config
├── prd.md                     # Product requirements
├── prompts.md                 # Implementation checklist
└── MONGODB_SETUP.md           # MongoDB guide
```

---

## 🚀 Key URLs

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Frontend application |
| http://localhost:3000/login | Login page |
| http://localhost:3000/register | Registration page |
| http://localhost:5001/api | Backend API base |
| http://localhost:5001/api/properties | Get all properties |
| http://localhost:5001/api/users | Get all users |

---

## 💡 Tips

1. **First time using?** Start with Login using the demo account
2. **Want to see landlord features?** Login as eleni@example.com
3. **Want to create new listings?** You must login as a landlord
4. **Messages feature:** Works between logged-in users
5. **Dark mode:** Click the moon/sun icon in top navigation

---

## 🎓 Learning Path

1. **Explore as Tenant**
   - Browse properties
   - View property details
   - Look at messaging interface

2. **Explore as Landlord**
   - View dashboard with statistics
   - Check property management
   - View earnings and bookings

3. **Test Features**
   - Try booking flow
   - Try messaging
   - Check role-based access

---

## 📝 Common Tasks

### How to reset database?
```bash
cd mernease/backend
npm run seed
```

### How to add new users?
```bash
cd mernease/backend
npm run seed
# Then register new users through frontend
```

### How to see debug logs?
Open browser DevTools: `F12` → Console tab

### How to check API responses?
Open browser DevTools: `F12` → Network tab

---

## 🆘 Need Help?

1. **Check Documentation**
   - prd.md - Product requirements
   - prompts.md - Implementation details
   - MONGODB_SETUP.md - Database setup

2. **Check Logs**
   - Backend terminal for server errors
   - Browser console (F12) for frontend errors
   - Check Network tab for API issues

3. **Common Fixes**
   - Restart both servers
   - Clear browser cache
   - Run `npm install` to ensure dependencies
   - Check MongoDB is running

---

## 🎯 What's Next?

After exploring the app:
1. Read the PRD to understand features
2. Check prompts.md for implementation roadmap
3. Try adding new properties (as landlord)
4. Test the messaging system
5. Explore different user roles

---

**Enjoy using RentEase! 🎉**

For more details, see:
- `IMPLEMENTATION_SUMMARY.md` - Full feature summary
- `RUNNING.md` - Detailed running instructions
- `prd.md` - Complete product requirements