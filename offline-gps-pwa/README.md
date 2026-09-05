# Train GPS HUD - Offline Speed & Location Tracker (Web / PWA)

A high-precision, zero-network satellite GPS speedometer, location tracker, and offline route recorder designed specifically for trains and offline travel.

---

## Key Features

1. **Pure Satellite GNSS Geolocation**:
   - Uses `navigator.geolocation.watchPosition` with `{ enableHighAccuracy: true, maximumAge: 0 }`.
   - Directly engages the device's physical GPS receiver chip.
   - Works with **zero mobile data, zero Wi-Fi, and in Airplane Mode** (as long as Location / GPS is turned ON in system settings).
2. **Train Cockpit HUD Display**:
   - OLED dark mode (`#06090f`) for minimal battery drain and maximum readability on a moving train.
   - Large digital speedometer in km/h with SVG radial gauge arc.
   - Real-time coordinates (lat, long), altitude in meters, and heading compass rose.
   - GPS Satellite Signal Quality Pill:
     - **EXCELLENT**: Accuracy < 6 meters (4 bars, lime green).
     - **STRONG**: Accuracy 6–15 meters (3 bars, cyan).
     - **MODERATE**: Accuracy 15–30 meters (2 bars, yellow).
     - **WEAK**: Accuracy > 30 meters (1 bar, orange).
     - **SEARCHING / INDOORS**: Blinking red.
3. **Haversine Distance Accumulation**:
   - Calculates distance using the spherical Haversine formula between successive GPS fixes.
   - Stationary drift filtering: Ignores GPS sensor jitter (< 1.5 km/h or < 4m) when parked at a train station.
4. **Dual Offline Map & Route Tracking**:
   - **Offline Route Tile Caching**: Click "Pre-Cache Map for Route" while connected to internet before boarding the train. Tiles are stored in the browser's `CacheStorage` via the Service Worker (`sw.js`).
   - **Offline Vector Track Visualizer**: A 100% offline HTML5 Canvas track visualizer that draws the train's path, turns, stops, and a color-coded speed heatmap (Green < 60, Cyan 60–100, Amber 100–130, Red > 130 km/h) even if no map tiles were downloaded!
5. **Trip Telemetry Logger & Export**:
   - Logs timestamp, speed, coordinates, altitude, distance, and accuracy.
   - One-click **Export CSV** (opens in Excel, Google Sheets, or Python pandas).
   - One-click **Export GPX** (standard track file for Google Earth, Strava, QGIS).
6. **Built-in Train Simulator Mode**:
   - Test the app indoors or on desktop without moving! Simulates a 0 → 135 km/h express train journey with realistic track curvature and deceleration.

---

## How to Run & Test

### Option 1: Run with any local HTTP server or Vite

You can serve this folder using Python, Node, or Vite:

```bash
# Using Python
cd offline-gps-pwa
python -m http.server 8080

# Using Node npx http-server
npx http-server offline-gps-pwa -p 8080
```
Open `http://localhost:8080` in Chrome, Edge, or mobile browser.

### Option 2: Install as a PWA on an Android Phone
1. Open the hosted URL or local network IP (`http://192.168.x.x:8080`) on your Android phone using Google Chrome.
2. Grant location permissions when prompted ("While using the app" -> "Precise location").
3. Tap the Chrome menu (`⋮`) -> **Install App** or **Add to Home screen**.
4. The app installs as a native-feeling standalone application icon on your home screen.

### Option 3: Testing 100% Offline in Airplane Mode
1. Ensure you have opened the app at least once with internet so the Service Worker caches the app shell (and click "Pre-Cache Map for Route" if you want map tiles).
2. Turn ON **Airplane Mode** on your phone (this shuts off cellular data and Wi-Fi).
3. Ensure **Location / GPS** toggle is turned **ON** in your Android quick settings (modern Android allows GPS in airplane mode).
4. Sit near a train window (or outdoors with a clear view of the sky).
5. Watch the satellite indicator turn from "ACQUIRING GNSS" to "STRONG" / "EXCELLENT" within 10–30 seconds as satellite signals are acquired.
6. Click **Start Trip Recording**. Watch the live speed gauge update smoothly in km/h!
