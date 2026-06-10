# Google Maps Setup & Installation Guide

## ✅ What's Been Added

The RentEase application now includes complete Google Maps integration with:

1. **Interactive Map View** (`/discover`) - 2D map showing all properties
2. **Property Details Map** (`/details`) - Embedded map at property location
3. **3D Street View** (`/street-view`) - Immersive 360° panorama exploration

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd /Users/yashgupta/Downloads/RentEase/mernease/frontend
npm install
```

This will install:
- `@react-google-maps/api` - For 2D maps
- `google-map-react` - Alternative map library (already compatible)

### Step 2: Verify Installation
```bash
npm list @react-google-maps/api google-map-react
```

Expected output:
```
├── @react-google-maps/api@2.19.0
└── google-map-react@2.2.0
```

### Step 3: Start the Application
```bash
# Terminal 1 - Backend
cd /Users/yashgupta/Downloads/RentEase/mernease/backend
npm run dev

# Terminal 2 - Frontend
cd /Users/yashgupta/Downloads/RentEase/mernease/frontend
npm start
```

### Step 4: Access Features
Open browser and visit:
- **Maps**: http://localhost:3000/discover
- **Property Details**: http://localhost:3000/details
- **Street View**: http://localhost:3000/street-view

---

## 📍 Features Overview

### Map View (`/discover`)
```
✅ Interactive 2D map with property markers
✅ Left sidebar showing property list
✅ Click property to center map
✅ Custom purple markers
✅ Info windows with property details
✅ Responsive design
✅ Search and filter integration
```

### Property Details Map (`/details`)
```
✅ Embedded map showing property location
✅ Single custom marker
✅ Info card with property name and location
✅ "View in Street View" button
✅ Loading spinner while initializing
✅ Beautiful property gallery
```

### Street View (`/street-view`)
```
✅ Full-screen 360° panorama
✅ Interactive rotation (left/right)
✅ Pitch control (up/down)
✅ Real-time angle display
✅ Zoom controls
✅ Fullscreen capability
✅ Navigation buttons (back, details)
✅ Helpful tips overlay
```

---

## 🔧 Configuration

### Google Maps API Key
Currently embedded in code:
```javascript
AIzaSyDxRbV-GKkJEqy75V5k5P-6L-KZYLwpX7c
```

**For Production**, create `.env` file:
```bash
REACT_APP_GOOGLE_MAPS_KEY=your_key_here
```

Then update scripts:
```javascript
// DiscoverMap.js, PropertyDetails.js, StreetViewPage.js
script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&libraries=marker`;
```

### Get Your Own API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable APIs:
   - Maps JavaScript API
   - Street View Static API
4. Create API key (restrict to your domain)
5. Copy and paste into `.env`

---

## 📁 Modified Files

### New Files
```
src/pages/StreetViewPage.js
```

### Updated Files
```
src/pages/DiscoverMap.js         (Complete rewrite with maps)
src/pages/PropertyDetails.js     (Added embedded map + Street View)
src/App.js                       (Added /street-view route)
package.json                     (Added dependencies)
```

---

## 🎯 Testing

### Test Checklist

#### Map View (`/discover`)
```javascript
1. ✅ Navigate to http://localhost:3000/discover
2. ✅ Verify map loads on right side
3. ✅ See 3 property markers (Paris x2, Santorini x1)
4. ✅ Left sidebar shows property list
5. ✅ Click property card → map centers on it
6. ✅ Click marker → info window shows
7. ✅ Hover property → marker highlights
8. ✅ "3D Street View" button visible
9. ✅ Search input filters properties
10. ✅ Responsive on mobile (map hidden)
```

#### Property Details (`/details`)
```javascript
1. ✅ Navigate to http://localhost:3000/details
2. ✅ See property gallery
3. ✅ Scroll down to see embedded map
4. ✅ Map shows property location
5. ✅ Purple marker on property location
6. ✅ Map loading spinner visible initially
7. ✅ "View in Street View" button visible
8. ✅ Click button → navigates to street view
```

#### Street View (`/street-view`)
```javascript
1. ✅ Navigate to http://localhost:3000/street-view
2. ✅ Full-screen panorama loads
3. ✅ Drag mouse to rotate view
4. ✅ Scroll to zoom in/out
5. ✅ Left rotate button works
6. ✅ Right rotate button works
7. ✅ Up arrow (look up) works
8. ✅ Down arrow (look down) works
9. ✅ Heading angle updates (0-360)
10. ✅ Pitch angle updates (-90 to 90)
11. ✅ Zoom level updates
12. ✅ "Back to Map" button works
13. ✅ "View Details" button works
14. ✅ Fullscreen button works
15. ✅ Tips overlay displays correctly
```

---

## 🐛 Troubleshooting

### Issue: Map doesn't appear
**Cause**: Script not loading or API key invalid
**Fix**:
```bash
# Clear browser cache
cmd + shift + r (Mac)
ctrl + shift + r (Windows)

# Check console for errors
F12 → Console tab → Look for errors
```

### Issue: Markers not visible
**Cause**: Coordinates missing or invalid
**Fix**:
```javascript
// Verify coordinates in component
console.log('Property coordinates:', property.lat, property.lng);

// Should output: 48.8597 2.3644
```

### Issue: Street View shows gray area
**Cause**: Location has no Street View coverage
**Fix**:
```javascript
// Try different coordinates
// Paris: 48.8584, 2.2945 (has coverage)
// Santorini: 36.3932, 25.4615 (has coverage)
```

### Issue: Performance issues / slow maps
**Cause**: Multiple map initializations
**Fix**:
```javascript
// Already implemented:
// - Ref memoization with useRef
// - Script loading check: if (window.google)
// - Cleanup in useEffect

// Additional optimization:
// - Reduce number of markers
// - Use clustering for large datasets
// - Implement map caching
```

---

## 🔐 Security Notes

### Current Implementation
```javascript
// ⚠️ API key visible in browser source
script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDxRbV-GKkJEqy75V5k5P-6L-KZYLwpX7c`;
```

### For Production (Required)
```javascript
// ✅ Create backend proxy
// Backend (server.js)
app.get('/api/maps/script', (req, res) => {
  res.json({
    url: `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_KEY}`
  });
});

// Frontend (DiscoverMap.js)
const mapsUrl = await fetch('/api/maps/script').then(r => r.json());
script.src = mapsUrl.url;
```

### API Key Restrictions
Set in Google Cloud Console:
1. ✅ HTTP referrers: `localhost:3000`, `yourdomain.com`
2. ✅ Restrict to APIs: Maps JavaScript, Street View Static
3. ✅ Enable API: Geocoding (for address lookup)
4. ✅ Monitor usage: Set daily quote limits

---

## 📊 API Usage & Costs

### Monthly Estimates (1000 daily users)
```
Maps JavaScript API:
  - 2000 loads/day × 30 = 60,000 loads/month
  - First 28,000 loads free
  - 32,000 × $7/$1000 = $224/month

Street View API:
  - 500 views/day × 30 = 15,000 views/month
  - First 25,000 views free
  - 0 cost (within free tier)

Total: ~$200-250/month at scale
```

### Optimization Tips
```javascript
1. Cache map tiles locally
2. Batch geocoding requests
3. Use server-side caching
4. Implement rate limiting
5. Load maps only when needed
6. Use lower zoom levels
7. Cluster nearby markers
8. Lazy load Street View
```

---

## 🌐 Environment Variables

### Create `.env` file in frontend directory
```bash
cd /Users/yashgupta/Downloads/RentEase/mernease/frontend
touch .env
```

### Add to `.env`
```
REACT_APP_GOOGLE_MAPS_KEY=your_api_key_here
REACT_APP_API_URL=http://localhost:5001
```

### Update scripts
```javascript
// In DiscoverMap.js, PropertyDetails.js, StreetViewPage.js
script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&libraries=marker`;
```

### Restart frontend
```bash
# CTRL + C to stop
npm start
```

---

## 🎨 Customization

### Change Map Style
```javascript
// DiscoverMap.js, PropertyDetails.js
const styles = [
  {
    featureType: 'all',
    elementType: 'geometry.fill',
    stylers: [{ color: '#f8f9ff' }]  // Light background
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#e6f2ff' }]  // Light blue water
  }
];

const map = new window.google.maps.Map(mapRef.current, {
  center: { lat, lng },
  zoom: 14,
  styles: styles  // Apply custom styles
});
```

### Change Marker Colors
```javascript
// StreetViewPage.js, line ~80
icon: {
  path: window.google.maps.SymbolPath.CIRCLE,
  scale: 12,
  fillColor: '#3525cd',  // Change this color
  fillOpacity: 1,
  strokeColor: '#fff',
  strokeWeight: 3
}
```

### Change Zoom Levels
```javascript
// DiscoverMap.js initial zoom
zoom: 6  // Default: Shows all properties (zoom out)

// PropertyDetails.js
zoom: 14  // Property level: Close-up view

// When user clicks property
map.setZoom(12)  // Medium zoom
```

---

## 📚 Resources

### Google Maps Documentation
- [JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Street View API](https://developers.google.com/maps/documentation/javascript/streetview)
- [Markers & Infowindows](https://developers.google.com/maps/documentation/javascript/markers)
- [Map Styling](https://mapstyle.withgoogle.com)

### React Integration
- [React Google Maps Docs](https://react-google-maps-api-docs.netlify.app/)
- [Google Map React](https://www.npmjs.com/package/google-map-react)

### Support
- [Stack Overflow - google-maps tag](https://stackoverflow.com/questions/tagged/google-maps)
- [Google Maps Support](https://support.google.com/maps)

---

## 🚢 Deployment

### Before Deploying to Production

1. **Secure API Key**
   ```bash
   # Create backend proxy endpoint
   # Set API key restrictions in Google Cloud Console
   # Use environment variables
   ```

2. **Enable APIs**
   - Maps JavaScript API ✅
   - Street View Static API ✅
   - Geocoding API (optional)
   - Places API (optional)

3. **Set Domain Restrictions**
   - HTTP referrers: your domain
   - Only allow specific endpoints

4. **Monitor Usage**
   - Set daily quotas
   - Enable billing alerts
   - Track API calls

5. **Performance**
   - Enable map caching
   - Compress images
   - Lazy load maps
   - Use CDN for assets

---

## ✨ Next Steps

### Short Term
- [ ] Customize map colors to match brand
- [ ] Add more properties with real coordinates
- [ ] Implement address search (Geocoding API)
- [ ] Add property filters on map

### Medium Term
- [ ] Real estate data overlay
- [ ] Heat map of pricing
- [ ] Transit/walking score
- [ ] POI (Points of Interest)

### Long Term
- [ ] 360° property tours
- [ ] AR property visualization
- [ ] Booking availability heatmap
- [ ] Neighborhood comparison

---

## 📞 Support

For issues or questions:
1. Check console errors (F12)
2. Review GOOGLE_MAPS_INTEGRATION.md
3. Check Google Maps documentation
4. Test in different browser
5. Contact support team

---

**Created**: June 5, 2026
**Version**: 1.0.0
**Status**: ✅ Ready for Testing
