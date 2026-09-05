# Train GPS HUD - Native Android Offline GPS Speedometer (Kotlin)

A native Android app in Kotlin designed to track train speed, location, altitude, and trajectory completely offline without needing cellular data, SIM card, or Wi-Fi.

---

## Technical Highlights

1. **Hardware Satellite GPS Provider**:
   - Uses `LocationManager.GPS_PROVIDER` directly to read signals directly from orbiting GNSS satellites (GPS, GLONASS, Galileo, BeiDou).
   - High-rate 1 Hz updates (`1000ms`, `0m` delta).
   - Works in **Airplane Mode** (zero cell signal required).
2. **Foreground Location Service with WakeLock**:
   - Implements `GpsService` with `FOREGROUND_SERVICE_TYPE_LOCATION`.
   - Acquires `PARTIAL_WAKE_LOCK` so the CPU does not sleep the GPS receiver when the user turns off the screen or puts the phone in their pocket while traveling.
   - Ongoing notification displays real-time speed (`Speed: 114 km/h | Dist: 42.6 km`) right on the lockscreen.
3. **Trip Analytics & Haversine Distance**:
   - Distance accumulated using the spherical Haversine formula.
   - Stationary jitter filter: Ignores GPS multipath drift (< 1.5 km/h) when the train is waiting at a station.
   - Computes max speed, moving average speed, and trip duration.
4. **Offline Vector Track View**:
   - `OfflineMapView` is a custom Android `View` that plots the train's trajectory directly on an Android Canvas with speed-colored line segments (Green, Cyan, Amber, Red). No internet or map tile downloads needed.
5. **Local CSV Export**:
   - Generates an RFC 4180 CSV file containing timestamps, lat/long, speed in km/h, altitude, and accumulated distance.
   - Integrates with Android `FileProvider` and the Android Share Sheet for offline saving.

---

## Required Android Permissions

| Permission | Purpose |
|---|---|
| `ACCESS_FINE_LOCATION` | Grants access to raw satellite GPS chip data. |
| `FOREGROUND_SERVICE` | Keeps the background service alive during long trips. |
| `FOREGROUND_SERVICE_LOCATION` | Required on Android 14+ for location background services. |
| `POST_NOTIFICATIONS` | Required on Android 13+ to display the ongoing lockscreen speed notification. |
| `WAKE_LOCK` | Prevents the CPU from suspending the GNSS chip when the phone screen turns off. |

---

## How to Build & Run

### 1. Open in Android Studio
1. Launch **Android Studio** (Hedgehog, Iguana, or Jellyfish).
2. Select **File -> Open...** and choose the `android-gps-tracker` directory.
3. Allow Gradle to sync dependencies.
4. Connect an Android phone via USB (with Developer Options & USB Debugging enabled) or use an Android Emulator.
5. Click **Run (`Shift + F10`)**.

### 2. Testing Without Internet (Airplane Mode)
1. Install and open the app on your physical Android device.
2. Grant **"Precise location"** permission when prompted.
3. Turn **ON Airplane Mode** (this turns off mobile network and Wi-Fi).
4. Verify in Android Quick Settings that **Location / GPS is ON** (Android allows GPS in Airplane mode).
5. Stand near a window or outdoors. Within 15–45 seconds, the phone will lock onto GPS satellites and the status will turn to **GNSS LOCKED (EXCELLENT)**.
6. Click **START TRIP** to record your journey.

### 3. Testing on Android Emulator with Mock Routes
1. Open the Android Emulator.
2. In the emulator sidebar, click the three dots (`...`) to open **Extended Controls**.
3. Go to the **Location** tab.
4. Select **Route** or load a `.gpx` / `.kml` railway track file.
5. Set the playback speed to **100 km/h** and click **Play Route**.
6. The app will immediately track the simulated train route, display the speedometer, and draw the offline track.
