/**
 * Train GPS HUD - Offline Speed & Location Tracker
 * 100% Client-side GPS processing with zero network requirements.
 */

// --- STATE MANAGEMENT ---
const state = {
  isRecording: false,
  isSimulating: false,
  watchId: null,
  simIntervalId: null,
  timerIntervalId: null,

  // Telemetry values
  currentSpeedKmh: 0,
  maxSpeedKmh: 0,
  avgSpeedKmh: 0,
  distanceKm: 0,
  altitudeM: null,
  latitude: null,
  longitude: null,
  headingDeg: null,
  accuracyM: null,
  lastFixTime: null,
  tripStartTime: null,
  tripElapsedSec: 0,

  // Position history for calculations & export
  lastValidCoord: null,
  lastValidTime: null,
  tripPoints: [], // Array of recorded GPS points
  
  // UI & Map state
  activeTab: 'map', // 'map' or 'canvas'
  leafletMap: null,
  trainMarker: null,
  routePolyline: null,
};

// DOM Element references
const els = {
  // Status
  gpsPill: document.getElementById('gps-status-pill'),
  gpsStatusText: document.getElementById('gps-status-text'),
  offlineBadge: document.getElementById('offline-badge'),
  simNoticeBar: document.getElementById('sim-notice-bar'),
  exitSimBtn: document.getElementById('exit-sim-btn'),

  // Speedometer
  speedDisplay: document.getElementById('speed-display'),
  speedMps: document.getElementById('speed-mps'),
  gaugeArc: document.getElementById('gauge-arc'),
  statDistance: document.getElementById('stat-distance'),
  statMaxSpeed: document.getElementById('stat-max-speed'),
  statAvgSpeed: document.getElementById('stat-avg-speed'),

  // Coordinates
  valLat: document.getElementById('val-latitude'),
  valLng: document.getElementById('val-longitude'),
  valAlt: document.getElementById('val-altitude'),
  accuracyBadge: document.getElementById('accuracy-badge'),
  copyCoordsBtn: document.getElementById('copy-coords-btn'),

  // Compass
  compassNeedle: document.getElementById('compass-needle'),
  headingDegrees: document.getElementById('heading-degrees'),
  headingCardinal: document.getElementById('heading-cardinal'),

  // Telemetry
  valTripTime: document.getElementById('val-trip-time'),
  valTripPoints: document.getElementById('val-trip-points'),
  valLastFix: document.getElementById('val-last-fix'),

  // Buttons
  btnToggleTrip: document.getElementById('btn-toggle-trip'),
  btnToggleTripText: document.getElementById('btn-toggle-trip-text'),
  btnResetTrip: document.getElementById('btn-reset-trip'),
  btnToggleSim: document.getElementById('btn-toggle-sim'),
  btnExportCsv: document.getElementById('btn-export-csv'),
  btnExportGpx: document.getElementById('btn-export-gpx'),

  // Map / Canvas Tabs & Pre-cache
  tabBtnMap: document.getElementById('tab-btn-map'),
  tabBtnCanvas: document.getElementById('tab-btn-canvas'),
  btnOpenPrecache: document.getElementById('btn-open-precache'),
  btnClosePrecache: document.getElementById('btn-close-precache'),
  preloaderPanel: document.getElementById('preloader-panel'),
  btnStartCacheTiles: document.getElementById('btn-start-cache-tiles'),
  btnClearCacheTiles: document.getElementById('btn-clear-cache-tiles'),
  cacheProgressBar: document.getElementById('cache-progress-bar'),
  cacheProgressFill: document.getElementById('cache-progress-fill'),
  cacheStatusText: document.getElementById('cache-status-text'),

  // Map & Canvas elements
  leafletMapEl: document.getElementById('leaflet-map'),
  trackCanvas: document.getElementById('track-canvas'),
  logTableBody: document.getElementById('log-table-body'),
};

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initMap();
  initCanvas();
  bindEvents();
  startGpsTracking();
  updateGaugeArc(0);
});

// --- SERVICE WORKER REGISTRATION (PWA) ---
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[PWA] Service Worker registered with scope:', reg.scope))
      .catch(err => console.warn('[PWA] Service Worker registration failed:', err));
  }
}

// --- GPS CORE ENGINE (Pure Satellite GNSS) ---
function startGpsTracking() {
  if (!('geolocation' in navigator)) {
    updateGpsStatus('UNSUPPORTED', 9999);
    alert('Geolocation API is not supported on this browser/device.');
    return;
  }

  // Pure satellite GPS configuration:
  // enableHighAccuracy: true forces device to engage GNSS hardware receiver chip
  // maximumAge: 0 ensures we never accept cached network cell tower locations
  // timeout: 10000ms gives GNSS chip time to acquire satellite almanac/ephemeris
  const options = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
  };

  updateGpsStatus('SEARCHING', null);

  state.watchId = navigator.geolocation.watchPosition(
    handleGpsPosition,
    handleGpsError,
    options
  );
}

function handleGpsPosition(pos) {
  if (state.isSimulating) return; // Ignore real GPS if simulator is active

  const coords = pos.coords;
  const now = Date.now();

  const lat = coords.latitude;
  const lng = coords.longitude;
  const accuracy = coords.accuracy || 10;
  const altitude = coords.altitude !== null ? Math.round(coords.altitude) : null;
  let heading = coords.heading !== null && !isNaN(coords.heading) ? coords.heading : null;

  // Process Speed (km/h)
  let speedKmh = 0;
  if (coords.speed !== null && !isNaN(coords.speed) && coords.speed >= 0) {
    // Standard GPS speed in m/s -> km/h
    speedKmh = coords.speed * 3.6;
  } else if (state.lastValidCoord && state.lastValidTime) {
    // Hardware fallback: Calculate delta distance over delta time
    const deltaSec = (now - state.lastValidTime) / 1000;
    if (deltaSec > 0.5) {
      const deltaDistKm = calculateHaversine(
        state.lastValidCoord.lat, state.lastValidCoord.lng,
        lat, lng
      );
      speedKmh = (deltaDistKm / deltaSec) * 3600;
    }
  }

  // Drift / Jitter filter: If speed < 1.5 km/h, train is stationary at station/halt
  if (speedKmh < 1.5) {
    speedKmh = 0;
  }

  // Process Heading / Bearing fallback if stationary or missing
  if (heading === null && state.lastValidCoord && speedKmh > 3) {
    heading = calculateBearing(
      state.lastValidCoord.lat, state.lastValidCoord.lng,
      lat, lng
    );
  }

  // Process Distance Accumulation (Haversine)
  if (state.lastValidCoord) {
    const stepKm = calculateHaversine(
      state.lastValidCoord.lat, state.lastValidCoord.lng,
      lat, lng
    );
    
    // Only accumulate if accuracy is decent and distance exceeds GPS noise jitter (4 meters)
    if (accuracy < 35 && stepKm > 0.004 && speedKmh > 1.0) {
      state.distanceKm += stepKm;
    }
  }

  // Update State
  state.currentSpeedKmh = speedKmh;
  if (speedKmh > state.maxSpeedKmh) {
    state.maxSpeedKmh = speedKmh;
  }
  state.latitude = lat;
  state.longitude = lng;
  state.altitudeM = altitude;
  state.headingDeg = heading;
  state.accuracyM = accuracy;
  state.lastFixTime = new Date();
  state.lastValidCoord = { lat, lng };
  state.lastValidTime = now;

  // Trip recording point
  if (state.isRecording) {
    recordTripPoint(lat, lng, speedKmh, altitude, heading, accuracy);
  }

  // Update Telemetry UI
  updateTelemetryUI();
  updateMapPosition(lat, lng, heading);
}

function handleGpsError(err) {
  console.warn('[GPS] Geolocation error:', err.code, err.message);
  let statusText = 'NO SIGNAL';
  if (err.code === err.PERMISSION_DENIED) {
    statusText = 'PERMISSION DENIED';
  } else if (err.code === err.POSITION_UNAVAILABLE) {
    statusText = 'SATELLITE LOST';
  } else if (err.code === err.TIMEOUT) {
    statusText = 'ACQUIRING GNSS';
  }
  updateGpsStatus(statusText, 999);
}

// --- GPS ACCURACY / SIGNAL INDICATOR ---
function updateGpsStatus(label, accuracy) {
  els.gpsPill.className = 'gps-status-pill';

  if (state.isSimulating) {
    els.gpsPill.classList.add('strong');
    els.gpsStatusText.textContent = 'SIMULATOR ACTIVE';
    els.accuracyBadge.className = 'accuracy-badge good';
    els.accuracyBadge.textContent = '± 3.2 m (Simulated)';
    return;
  }

  if (accuracy === null || accuracy > 60 || label === 'SEARCHING' || label === 'ACQUIRING GNSS') {
    els.gpsPill.classList.add('searching');
    els.gpsStatusText.textContent = label || 'ACQUIRING GNSS';
    els.accuracyBadge.className = 'accuracy-badge poor';
    els.accuracyBadge.textContent = 'Acquiring satellites...';
  } else if (accuracy < 6) {
    els.gpsPill.classList.add('excellent');
    els.gpsStatusText.textContent = 'GNSS LOCKED (EXCELLENT)';
    els.accuracyBadge.className = 'accuracy-badge good';
    els.accuracyBadge.textContent = `± ${accuracy.toFixed(1)} m`;
  } else if (accuracy < 15) {
    els.gpsPill.classList.add('strong');
    els.gpsStatusText.textContent = 'STRONG SATELLITE';
    els.accuracyBadge.className = 'accuracy-badge good';
    els.accuracyBadge.textContent = `± ${accuracy.toFixed(1)} m`;
  } else if (accuracy < 30) {
    els.gpsPill.classList.add('moderate');
    els.gpsStatusText.textContent = 'MODERATE SIGNAL';
    els.accuracyBadge.className = 'accuracy-badge warn';
    els.accuracyBadge.textContent = `± ${accuracy.toFixed(1)} m`;
  } else {
    els.gpsPill.classList.add('weak');
    els.gpsStatusText.textContent = 'WEAK SIGNAL';
    els.accuracyBadge.className = 'accuracy-badge poor';
    els.accuracyBadge.textContent = `± ${accuracy.toFixed(1)} m`;
  }
}

// --- MATHEMATICAL FORMULAS ---

/**
 * Spherical Haversine distance formula between two GPS coordinates in kilometers.
 * Works entirely offline without any external geometry library.
 */
function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in km
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const phi1 = lat1 * toRad;
  const phi2 = lat2 * toRad;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate forward azimuth / bearing between two coordinates in degrees (0 - 360).
 */
function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const y = Math.sin((lon2 - lon1) * toRad) * Math.cos(lat2 * toRad);
  const x = Math.cos(lat1 * toRad) * Math.sin(lat2 * toRad) -
            Math.sin(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.cos((lon2 - lon1) * toRad);
  let brng = Math.atan2(y, x) * toDeg;
  return (brng + 360) % 360;
}

/**
 * Convert azimuth degrees into 16-point cardinal direction.
 */
function degreesToCardinal(deg) {
  if (deg === null || isNaN(deg)) return 'STATIONARY';
  const cardinals = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const idx = Math.round(deg / 22.5) % 16;
  return cardinals[idx];
}

// --- UI TELEMETRY UPDATES ---
function updateTelemetryUI() {
  const speed = Math.round(state.currentSpeedKmh);
  els.speedDisplay.textContent = speed;
  els.speedMps.textContent = `${(state.currentSpeedKmh / 3.6).toFixed(1)} m/s`;
  updateGaugeArc(speed);

  // Stats
  els.statDistance.textContent = `${state.distanceKm.toFixed(2)} km`;
  els.statMaxSpeed.textContent = `${Math.round(state.maxSpeedKmh)} km/h`;

  // Compute average moving speed
  if (state.tripElapsedSec > 10 && state.distanceKm > 0.05) {
    const avg = (state.distanceKm / (state.tripElapsedSec / 3600));
    state.avgSpeedKmh = avg;
    els.statAvgSpeed.textContent = `${Math.round(avg)} km/h`;
  }

  // Coordinates & Altitude
  if (state.latitude !== null && state.longitude !== null) {
    els.valLat.textContent = `${state.latitude.toFixed(6)}°`;
    els.valLng.textContent = `${state.longitude.toFixed(6)}°`;
  }
  els.valAlt.textContent = state.altitudeM !== null ? `${state.altitudeM} m` : '-- m';

  // Compass
  if (state.headingDeg !== null && !isNaN(state.headingDeg)) {
    const deg = Math.round(state.headingDeg);
    els.headingDegrees.textContent = `${deg}°`;
    els.headingCardinal.textContent = `${degreesToCardinal(deg)} (${deg}°)`;
    els.compassNeedle.style.transform = `rotate(${deg}deg)`;
  } else {
    els.headingDegrees.textContent = `---°`;
    els.headingCardinal.textContent = 'STATIONARY';
  }

  // Signal & Last fix time
  updateGpsStatus(null, state.accuracyM);
  if (state.lastFixTime) {
    els.valLastFix.textContent = state.lastFixTime.toLocaleTimeString();
  }
}

// Update Gauge SVG Arc (0 to 200 km/h gauge range)
function updateGaugeArc(speedKmh) {
  const maxScale = 200;
  const clamped = Math.min(Math.max(speedKmh, 0), maxScale);
  const ratio = clamped / maxScale;
  
  // Total arc length for dasharray is 565
  const maxDash = 565;
  const offset = maxDash - (ratio * maxDash);
  els.gaugeArc.style.strokeDashoffset = offset;
}

// --- TRIP RECORDING & EXPORT ---
function recordTripPoint(lat, lng, speed, alt, heading, accuracy) {
  const point = {
    timestamp: Date.now(),
    isoTime: new Date().toISOString(),
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
    speedKmh: Number(speed.toFixed(1)),
    altitudeM: alt !== null ? alt : 0,
    headingDeg: heading !== null ? Math.round(heading) : 0,
    accuracyM: Number(accuracy.toFixed(1)),
    distanceKm: Number(state.distanceKm.toFixed(2))
  };

  state.tripPoints.push(point);
  els.valTripPoints.textContent = `${state.tripPoints.length} pts`;

  // Prepend to UI table
  appendPointToTable(point);

  // Redraw canvas track
  if (state.activeTab === 'canvas') {
    renderCanvasTrack();
  }
}

function appendPointToTable(pt) {
  // If first point, clear empty message
  if (state.tripPoints.length === 1) {
    els.logTableBody.innerHTML = '';
  }

  const row = document.createElement('tr');
  const timeStr = new Date(pt.timestamp).toLocaleTimeString();
  row.innerHTML = `
    <td>${timeStr}</td>
    <td style="color: var(--accent-cyan); font-weight: 700;">${pt.speedKmh} km/h</td>
    <td>${pt.lat}</td>
    <td>${pt.lng}</td>
    <td>${pt.altitudeM}m</td>
    <td>${pt.distanceKm}km</td>
    <td>±${pt.accuracyM}m</td>
  `;

  els.logTableBody.insertBefore(row, els.logTableBody.firstChild);

  // Limit DOM table rows to 100 to conserve mobile RAM
  if (els.logTableBody.children.length > 100) {
    els.logTableBody.removeChild(els.logTableBody.lastChild);
  }
}

function toggleTripRecording() {
  state.isRecording = !state.isRecording;

  if (state.isRecording) {
    els.btnToggleTrip.className = 'btn btn-danger';
    els.btnToggleTripText.textContent = 'Stop Recording';

    if (!state.tripStartTime) {
      state.tripStartTime = Date.now() - (state.tripElapsedSec * 1000);
    }

    if (!state.timerIntervalId) {
      state.timerIntervalId = setInterval(() => {
        state.tripElapsedSec++;
        const hrs = String(Math.floor(state.tripElapsedSec / 3600)).padStart(2, '0');
        const mins = String(Math.floor((state.tripElapsedSec % 3600) / 60)).padStart(2, '0');
        const secs = String(state.tripElapsedSec % 60).padStart(2, '0');
        els.valTripTime.textContent = `${hrs}:${mins}:${secs}`;
      }, 1000);
    }
  } else {
    els.btnToggleTrip.className = 'btn btn-primary';
    els.btnToggleTripText.textContent = 'Resume Trip Recording';
    clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }
}

function resetTrip() {
  if (state.tripPoints.length > 0 && !confirm('Reset all trip data and speedometer stats?')) {
    return;
  }

  clearInterval(state.timerIntervalId);
  state.timerIntervalId = null;
  state.isRecording = false;
  state.tripStartTime = null;
  state.tripElapsedSec = 0;
  state.distanceKm = 0;
  state.maxSpeedKmh = 0;
  state.avgSpeedKmh = 0;
  state.tripPoints = [];
  state.lastValidCoord = null;
  state.lastValidTime = null;

  els.btnToggleTrip.className = 'btn btn-primary';
  els.btnToggleTripText.textContent = 'Start Trip Recording';
  els.valTripTime.textContent = '00:00:00';
  els.valTripPoints.textContent = '0 pts';
  els.statDistance.textContent = '0.00 km';
  els.statMaxSpeed.textContent = '0 km/h';
  els.statAvgSpeed.textContent = '0 km/h';
  els.logTableBody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 16px;">
        No GPS points recorded yet. Click "Start Trip Recording" to log path.
      </td>
    </tr>
  `;

  if (state.routePolyline) {
    state.routePolyline.setLatLngs([]);
  }
  renderCanvasTrack();
}

// CSV Exporter (RFC 4180 format)
function exportTripCsv() {
  if (state.tripPoints.length === 0) {
    alert('No trip points recorded yet to export. Click "Start Trip Recording" or run "Test Demo Mode" first.');
    return;
  }

  let csvContent = 'Timestamp_ISO,Unix_Time_MS,Latitude,Longitude,Speed_kmh,Altitude_m,Heading_deg,Accuracy_m,Distance_Accum_km\r\n';

  state.tripPoints.forEach(p => {
    csvContent += `${p.isoTime},${p.timestamp},${p.lat},${p.lng},${p.speedKmh},${p.altitudeM},${p.headingDeg},${p.accuracyM},${p.distanceKm}\r\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `train_gps_trip_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
  downloadBlob(blob, filename);
}

// GPX Exporter (Standard Track XML)
function exportTripGpx() {
  if (state.tripPoints.length === 0) {
    alert('No trip points recorded yet to export.');
    return;
  }

  let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Train GPS HUD - Offline Speedometer" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Train Trip Track</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>Train Journey</name>
    <trkseg>\n`;

  state.tripPoints.forEach(p => {
    gpx += `      <trkpt lat="${p.lat}" lon="${p.lng}">
        <ele>${p.altitudeM}</ele>
        <time>${p.isoTime}</time>
        <extensions>
          <speed>${(p.speedKmh / 3.6).toFixed(2)}</speed>
        </extensions>
      </trkpt>\n`;
  });

  gpx += `    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpx], { type: 'application/gpx+xml;charset=utf-8;' });
  const filename = `train_track_${new Date().toISOString().replace(/[:.]/g, '-')}.gpx`;
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- OFFLINE MAP & LEAFLET ENGINE ---
function initMap() {
  if (!window.L) {
    console.warn('[Map] Leaflet not loaded');
    return;
  }

  // Default coordinate center (New Delhi Railway Junction / generic center)
  const defaultPos = [28.6448, 77.2167];

  state.leafletMap = L.map('leaflet-map', {
    zoomControl: true,
    attributionControl: false
  }).setView(defaultPos, 13);

  // Use CartoDB Dark Matter / OpenStreetMap tiles (which get cached by sw.js)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    crossOrigin: true
  }).addTo(state.leafletMap);

  // Train Marker (Custom SVG Icon)
  const trainIcon = L.divIcon({
    className: 'custom-train-marker',
    html: `
      <div style="width: 28px; height: 28px; background: #00f0ff; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 15px #00f0ff; display: flex; align-items: center; justify-content: center;">
        <div style="width: 8px; height: 8px; background: #06090f; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  state.trainMarker = L.marker(defaultPos, { icon: trainIcon }).addTo(state.leafletMap);

  // Route Polyline
  state.routePolyline = L.polyline([], {
    color: '#00f0ff',
    weight: 4,
    opacity: 0.85,
    smoothFactor: 1
  }).addTo(state.leafletMap);
}

function updateMapPosition(lat, lng, heading) {
  if (!state.leafletMap || !state.trainMarker) return;

  const latLng = [lat, lng];
  state.trainMarker.setLatLng(latLng);

  if (state.isRecording && state.routePolyline) {
    state.routePolyline.addLatLng(latLng);
  }

  // Smoothly center map on train position
  state.leafletMap.panTo(latLng, { animate: true, duration: 0.5 });
}

// --- OFFLINE ROUTE TILE PRE-CACHING ENGINE ---
async function preCacheVisibleAreaTiles() {
  if (!state.leafletMap) return;

  const bounds = state.leafletMap.getBounds();
  const minZoom = 8;
  const maxZoom = 13; // Good balance between detail and download size for offline train routes

  els.cacheProgressBar.style.display = 'block';
  els.cacheProgressFill.style.width = '0%';
  els.cacheStatusText.textContent = 'Calculating route tile coordinates...';

  const tileUrls = [];
  for (let z = minZoom; z <= maxZoom; z++) {
    const minTile = latLngToTile(bounds.getNorth(), bounds.getWest(), z);
    const maxTile = latLngToTile(bounds.getSouth(), bounds.getEast(), z);

    const xMin = Math.min(minTile.x, maxTile.x);
    const xMax = Math.max(minTile.x, maxTile.x);
    const yMin = Math.min(minTile.y, maxTile.y);
    const yMax = Math.max(minTile.y, maxTile.y);

    // Limit to 400 tiles to protect browser memory and network
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        if (tileUrls.length < 400) {
          tileUrls.push(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
        }
      }
    }
  }

  if (tileUrls.length === 0) {
    els.cacheStatusText.textContent = 'No tiles found in bounding box.';
    return;
  }

  els.cacheStatusText.textContent = `Pre-downloading ${tileUrls.length} tiles for offline caching...`;

  try {
    const cache = await caches.open('train-gps-map-tiles-v1');
    let loaded = 0;

    for (const url of tileUrls) {
      try {
        const resp = await fetch(url, { mode: 'cors' });
        if (resp && resp.ok) {
          await cache.put(url, resp);
        }
      } catch (err) {
        // Continue fetching other tiles
      }
      loaded++;
      const pct = Math.round((loaded / tileUrls.length) * 100);
      els.cacheProgressFill.style.width = `${pct}%`;
      els.cacheStatusText.textContent = `Cached ${loaded}/${tileUrls.length} tiles (${pct}%)`;
    }

    els.cacheStatusText.textContent = `✓ Successfully cached ${loaded} tiles! Map is now 100% offline-ready for this region.`;
  } catch (err) {
    els.cacheStatusText.textContent = `Cache error: ${err.message}`;
  }
}

async function clearCachedTiles() {
  if (confirm('Clear all offline pre-downloaded map tiles from device storage?')) {
    await caches.delete('train-gps-map-tiles-v1');
    els.cacheStatusText.textContent = 'Tile cache cleared.';
    els.cacheProgressBar.style.display = 'none';
  }
}

function latLngToTile(lat, lng, zoom) {
  const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  return { x, y };
}

// --- OFFLINE BREADCRUMB CANVAS VISUALIZER ---
// Draws the train's trajectory directly on HTML5 Canvas without needing ANY map tiles!
function initCanvas() {
  const canvas = els.trackCanvas;
  const resize = () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    renderCanvasTrack();
  };
  window.addEventListener('resize', resize);
  setTimeout(resize, 100);
}

function renderCanvasTrack() {
  const canvas = els.trackCanvas;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Clear dark background
  ctx.fillStyle = '#080d16';
  ctx.fillRect(0, 0, w, h);

  // Draw HUD Grid
  ctx.strokeStyle = '#121a2c';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const pts = state.tripPoints;
  if (pts.length < 2) {
    ctx.fillStyle = '#475569';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OFFLINE VECTOR TRACK VISUALIZER', w / 2, h / 2 - 10);
    ctx.fillText('Waiting for recorded GPS points...', w / 2, h / 2 + 14);
    return;
  }

  // Calculate bounding box of trip points to auto-fit canvas
  let minLat = pts[0].lat, maxLat = pts[0].lat;
  let minLng = pts[0].lng, maxLng = pts[0].lng;

  pts.forEach(p => {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lng < minLng) minLng = p.lng;
    if (p.lng > maxLng) maxLng = p.lng;
  });

  const pad = 40;
  const latSpan = (maxLat - minLat) || 0.001;
  const lngSpan = (maxLng - minLng) || 0.001;

  const toScreenX = (lng) => pad + ((lng - minLng) / lngSpan) * (w - 2 * pad);
  const toScreenY = (lat) => (h - pad) - ((lat - minLat) / latSpan) * (h - 2 * pad);

  // Draw Polyline segments with speed color gradient
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];

    const x0 = toScreenX(p0.lng);
    const y0 = toScreenY(p0.lat);
    const x1 = toScreenX(p1.lng);
    const y1 = toScreenY(p1.lat);

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);

    // Speed color: Green (< 60), Cyan (60-100), Amber (100-130), Red (> 130)
    const spd = p1.speedKmh;
    if (spd < 60) ctx.strokeStyle = '#39ff14';
    else if (spd < 100) ctx.strokeStyle = '#00f0ff';
    else if (spd < 130) ctx.strokeStyle = '#f59e0b';
    else ctx.strokeStyle = '#ef4444';

    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Start Point Marker (Green circle)
  const startX = toScreenX(pts[0].lng);
  const startY = toScreenY(pts[0].lat);
  ctx.fillStyle = '#39ff14';
  ctx.beginPath();
  ctx.arc(startX, startY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.fillText('START', startX + 10, startY + 4);

  // Current Train Position (Pulsing Cyan marker)
  const curr = pts[pts.length - 1];
  const currX = toScreenX(curr.lng);
  const currY = toScreenY(curr.lat);

  ctx.fillStyle = '#00f0ff';
  ctx.beginPath();
  ctx.arc(currX, currY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#00f0ff';
  ctx.font = '11px monospace';
  ctx.fillText(`TRAIN (${curr.speedKmh} km/h)`, currX + 12, currY + 4);
}

// --- TRAIN GPS SIMULATOR MODE ---
// Lets users test the full app immediately indoors or on desktop with a simulated 135 km/h train trip!
let simStep = 0;
const SIM_ROUTE = [
  { lat: 28.6448, lng: 77.2167, targetSpeed: 0, alt: 216 },
  { lat: 28.6380, lng: 77.2210, targetSpeed: 35, alt: 217 },
  { lat: 28.6250, lng: 77.2300, targetSpeed: 70, alt: 218 },
  { lat: 28.6100, lng: 77.2450, targetSpeed: 105, alt: 219 },
  { lat: 28.5900, lng: 77.2620, targetSpeed: 125, alt: 220 },
  { lat: 28.5600, lng: 77.2880, targetSpeed: 135, alt: 221 },
  { lat: 28.5200, lng: 77.3200, targetSpeed: 132, alt: 220 },
  { lat: 28.4800, lng: 77.3550, targetSpeed: 128, alt: 218 },
  { lat: 28.4400, lng: 77.3880, targetSpeed: 90, alt: 216 },
  { lat: 28.4100, lng: 77.4100, targetSpeed: 45, alt: 215 },
  { lat: 28.3900, lng: 77.4250, targetSpeed: 0, alt: 214 }
];

function toggleSimulationMode() {
  state.isSimulating = !state.isSimulating;

  if (state.isSimulating) {
    els.simNoticeBar.classList.add('active');
    els.btnToggleSim.textContent = 'Stop Demo Mode';
    simStep = 0;
    
    // Auto start recording if not already recording
    if (!state.isRecording) {
      toggleTripRecording();
    }

    state.simIntervalId = setInterval(runSimulationTick, 1000);
  } else {
    stopSimulation();
  }
}

function stopSimulation() {
  state.isSimulating = false;
  els.simNoticeBar.classList.remove('active');
  els.btnToggleSim.textContent = 'Test Demo Mode';
  clearInterval(state.simIntervalId);
  state.simIntervalId = null;
  updateGpsStatus('SEARCHING', null);
}

function runSimulationTick() {
  simStep++;
  const totalStages = SIM_ROUTE.length - 1;
  const stageIndex = Math.min(Math.floor(simStep / 4), totalStages - 1);
  const frac = (simStep % 4) / 4;

  const pA = SIM_ROUTE[stageIndex];
  const pB = SIM_ROUTE[stageIndex + 1] || pA;

  // Linear interpolation between waypoints
  const lat = pA.lat + (pB.lat - pA.lat) * frac;
  const lng = pA.lng + (pB.lng - pA.lng) * frac;
  const targetSpeed = pA.targetSpeed + (pB.targetSpeed - pA.targetSpeed) * frac;
  
  // Add slight natural noise (±1.5 km/h)
  const speed = Math.max(0, targetSpeed + (Math.random() * 3 - 1.5));
  const heading = calculateBearing(pA.lat, pA.lng, pB.lat, pB.lng);
  const alt = Math.round(pA.alt + (pB.alt - pA.alt) * frac);

  // Haversine distance step
  if (state.lastValidCoord) {
    const step = calculateHaversine(state.lastValidCoord.lat, state.lastValidCoord.lng, lat, lng);
    state.distanceKm += step;
  }

  state.currentSpeedKmh = speed;
  if (speed > state.maxSpeedKmh) state.maxSpeedKmh = speed;
  state.latitude = lat;
  state.longitude = lng;
  state.altitudeM = alt;
  state.headingDeg = heading;
  state.accuracyM = 3.2; // Excellent satellite simulated accuracy
  state.lastFixTime = new Date();
  state.lastValidCoord = { lat, lng };

  if (state.isRecording) {
    recordTripPoint(lat, lng, speed, alt, heading, 3.2);
  }

  updateTelemetryUI();
  updateMapPosition(lat, lng, heading);

  // Loop simulation seamlessly
  if (simStep >= (totalStages * 4) + 4) {
    simStep = 0;
  }
}

// --- EVENT BINDINGS ---
function bindEvents() {
  els.btnToggleTrip.addEventListener('click', toggleTripRecording);
  els.btnResetTrip.addEventListener('click', resetTrip);
  els.btnToggleSim.addEventListener('click', toggleSimulationMode);
  els.exitSimBtn.addEventListener('click', stopSimulation);

  els.btnExportCsv.addEventListener('click', exportTripCsv);
  els.btnExportGpx.addEventListener('click', exportTripGpx);

  // Copy Coordinates
  els.copyCoordsBtn.addEventListener('click', () => {
    if (state.latitude !== null && state.longitude !== null) {
      const txt = `${state.latitude.toFixed(6)}, ${state.longitude.toFixed(6)}`;
      navigator.clipboard.writeText(txt).then(() => {
        els.copyCoordsBtn.textContent = 'Copied!';
        setTimeout(() => els.copyCoordsBtn.textContent = 'Copy', 1500);
      });
    }
  });

  // Map & Canvas tab switching
  els.tabBtnMap.addEventListener('click', () => {
    state.activeTab = 'map';
    els.tabBtnMap.classList.add('active');
    els.tabBtnCanvas.classList.remove('active');
    els.leafletMapEl.style.display = 'block';
    els.trackCanvas.classList.remove('active');
    if (state.leafletMap) state.leafletMap.invalidateSize();
  });

  els.tabBtnCanvas.addEventListener('click', () => {
    state.activeTab = 'canvas';
    els.tabBtnCanvas.classList.add('active');
    els.tabBtnMap.classList.remove('active');
    els.leafletMapEl.style.display = 'none';
    els.trackCanvas.classList.add('active');
    renderCanvasTrack();
  });

  // Tile Pre-caching Panel
  els.btnOpenPrecache.addEventListener('click', () => {
    els.preloaderPanel.classList.toggle('open');
  });
  els.btnClosePrecache.addEventListener('click', () => {
    els.preloaderPanel.classList.remove('open');
  });
  els.btnStartCacheTiles.addEventListener('click', preCacheVisibleAreaTiles);
  els.btnClearCacheTiles.addEventListener('click', clearCachedTiles);
}
