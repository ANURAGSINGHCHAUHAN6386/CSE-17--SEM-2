import React, { useState, useEffect, useRef } from "react";

// Mathematical calculations for offline GPS
function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
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

function calculateBearing(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;
  const y = Math.sin((lon2 - lon1) * toRad) * Math.cos(lat2 * toRad);
  const x = Math.cos(lat1 * toRad) * Math.sin(lat2 * toRad) -
            Math.sin(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.cos((lon2 - lon1) * toRad);
  return ((Math.atan2(y, x) * toDeg) + 360) % 360;
}

function bearingToCardinal(deg) {
  if (deg === null || isNaN(deg)) return "STATIONARY";
  const cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const idx = Math.round(deg / 22.5) % 16;
  return cardinals[idx];
}

const SIM_ROUTE = [
  { lat: 28.6448, lng: 77.2167, targetSpeed: 0, alt: 216 },
  { lat: 28.6380, lng: 77.2210, targetSpeed: 40, alt: 217 },
  { lat: 28.6250, lng: 77.2300, targetSpeed: 75, alt: 218 },
  { lat: 28.6100, lng: 77.2450, targetSpeed: 110, alt: 219 },
  { lat: 28.5900, lng: 77.2620, targetSpeed: 130, alt: 220 },
  { lat: 28.5600, lng: 77.2880, targetSpeed: 138, alt: 221 },
  { lat: 28.5200, lng: 77.3200, targetSpeed: 134, alt: 220 },
  { lat: 28.4800, lng: 77.3550, targetSpeed: 125, alt: 218 },
  { lat: 28.4400, lng: 77.3880, targetSpeed: 85, alt: 216 },
  { lat: 28.4100, lng: 77.4100, targetSpeed: 40, alt: 215 },
  { lat: 28.3900, lng: 77.4250, targetSpeed: 0, alt: 214 }
];

export default function TrainGpsTracker() {
  const [speedKmh, setSpeedKmh] = useState(0);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState(0);
  const [avgSpeedKmh, setAvgSpeedKmh] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [alt, setAlt] = useState(null);
  const [heading, setHeading] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("ACQUIRING GNSS");
  const [isRecording, setIsRecording] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [tripPoints, setTripPoints] = useState([]);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef(null);
  const lastValidCoord = useRef(null);
  const lastValidTime = useRef(null);
  const simStepRef = useRef(0);
  const watchIdRef = useRef(null);

  // Timer for trip duration
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // GPS satellite tracking
  useEffect(() => {
    if (isSimulating) return;

    if (!("geolocation" in navigator)) {
      setGpsStatus("UNSUPPORTED");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    };

    setGpsStatus("ACQUIRING GNSS");

    const onPos = (pos) => {
      const coords = pos.coords;
      const now = Date.now();
      const currentLat = coords.latitude;
      const currentLng = coords.longitude;
      const currentAcc = coords.accuracy || 10;
      const currentAlt = coords.altitude !== null ? Math.round(coords.altitude) : null;
      let currentHeading = coords.heading !== null && !isNaN(coords.heading) ? coords.heading : null;

      // Speed calculation with fallback
      let currentSpd = 0;
      if (coords.speed !== null && !isNaN(coords.speed) && coords.speed >= 0) {
        currentSpd = coords.speed * 3.6;
      } else if (lastValidCoord.current && lastValidTime.current) {
        const deltaSec = (now - lastValidTime.current) / 1000;
        if (deltaSec > 0.5) {
          const deltaDist = calculateHaversine(
            lastValidCoord.current.lat,
            lastValidCoord.current.lng,
            currentLat,
            currentLng
          );
          currentSpd = (deltaDist / deltaSec) * 3600;
        }
      }

      // Filter stationary drift when parked at a train station
      if (currentSpd < 1.5) currentSpd = 0;

      // Heading fallback
      if (currentHeading === null && lastValidCoord.current && currentSpd > 3) {
        currentHeading = calculateBearing(
          lastValidCoord.current.lat,
          lastValidCoord.current.lng,
          currentLat,
          currentLng
        );
      }

      // Distance accumulation
      if (lastValidCoord.current) {
        const step = calculateHaversine(
          lastValidCoord.current.lat,
          lastValidCoord.current.lng,
          currentLat,
          currentLng
        );
        if (currentAcc < 35 && step > 0.004 && currentSpd > 1.0) {
          setDistanceKm((prev) => prev + step);
        }
      }

      setSpeedKmh(currentSpd);
      setMaxSpeedKmh((prev) => Math.max(prev, currentSpd));
      setLat(currentLat);
      setLng(currentLng);
      setAlt(currentAlt);
      setHeading(currentHeading);
      setAccuracy(currentAcc);

      // Signal quality
      if (currentAcc < 6) setGpsStatus("GNSS LOCKED (EXCELLENT)");
      else if (currentAcc < 15) setGpsStatus("STRONG SATELLITE");
      else if (currentAcc < 30) setGpsStatus("MODERATE SIGNAL");
      else setGpsStatus("WEAK SIGNAL");

      lastValidCoord.current = { lat: currentLat, lng: currentLng };
      lastValidTime.current = now;

      // Log point
      if (isRecording) {
        const newPt = {
          time: new Date().toLocaleTimeString(),
          isoTime: new Date().toISOString(),
          timestamp: now,
          lat: Number(currentLat.toFixed(6)),
          lng: Number(currentLng.toFixed(6)),
          speed: Number(currentSpd.toFixed(1)),
          alt: currentAlt || 0,
          dist: Number(distanceKm.toFixed(2)),
          accuracy: Number(currentAcc.toFixed(1)),
        };
        setTripPoints((prev) => [newPt, ...prev.slice(0, 99)]);
      }
    };

    const onErr = (err) => {
      if (err.code === err.PERMISSION_DENIED) setGpsStatus("PERMISSION DENIED");
      else if (err.code === err.POSITION_UNAVAILABLE) setGpsStatus("SATELLITE LOST");
      else setGpsStatus("SEARCHING SATELLITES");
    };

    watchIdRef.current = navigator.geolocation.watchPosition(onPos, onErr, options);

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [isRecording, isSimulating, distanceKm]);

  // Train Simulator Interval
  useEffect(() => {
    let interval = null;
    if (isSimulating) {
      setGpsStatus("SIMULATOR ACTIVE");
      interval = setInterval(() => {
        simStepRef.current += 1;
        const totalStages = SIM_ROUTE.length - 1;
        const stageIndex = Math.min(Math.floor(simStepRef.current / 4), totalStages - 1);
        const frac = (simStepRef.current % 4) / 4;

        const pA = SIM_ROUTE[stageIndex];
        const pB = SIM_ROUTE[stageIndex + 1] || pA;

        const currentLat = pA.lat + (pB.lat - pA.lat) * frac;
        const currentLng = pA.lng + (pB.lng - pA.lng) * frac;
        const targetSpd = pA.targetSpeed + (pB.targetSpeed - pA.targetSpeed) * frac;
        const spd = Math.max(0, targetSpd + (Math.random() * 3 - 1.5));
        const currentAlt = Math.round(pA.alt + (pB.alt - pA.alt) * frac);
        const currentHead = calculateBearing(pA.lat, pA.lng, pB.lat, pB.lng);

        if (lastValidCoord.current) {
          const step = calculateHaversine(
            lastValidCoord.current.lat,
            lastValidCoord.current.lng,
            currentLat,
            currentLng
          );
          setDistanceKm((prev) => prev + step);
        }

        setSpeedKmh(spd);
        setMaxSpeedKmh((prev) => Math.max(prev, spd));
        setLat(currentLat);
        setLng(currentLng);
        setAlt(currentAlt);
        setHeading(currentHead);
        setAccuracy(3.2);

        lastValidCoord.current = { lat: currentLat, lng: currentLng };

        const newPt = {
          time: new Date().toLocaleTimeString(),
          isoTime: new Date().toISOString(),
          timestamp: Date.now(),
          lat: Number(currentLat.toFixed(6)),
          lng: Number(currentLng.toFixed(6)),
          speed: Number(spd.toFixed(1)),
          alt: currentAlt,
          dist: Number(distanceKm.toFixed(2)),
          accuracy: 3.2,
        };
        setTripPoints((prev) => [newPt, ...prev.slice(0, 99)]);

        if (simStepRef.current >= (totalStages * 4) + 4) {
          simStepRef.current = 0;
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, distanceKm]);

  // Average speed calculation
  useEffect(() => {
    if (elapsedSec > 10 && distanceKm > 0.05) {
      setAvgSpeedKmh((distanceKm / (elapsedSec / 3600)));
    }
  }, [elapsedSec, distanceKm]);

  // Render Canvas Track
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#080d16";
    ctx.fillRect(0, 0, w, h);

    // Draw HUD Grid
    ctx.strokeStyle = "#121a2c";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (tripPoints.length < 2) {
      ctx.fillStyle = "#64748b";
      ctx.font = "13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("OFFLINE VECTOR TRACK VISUALIZER", w / 2, h / 2 - 10);
      ctx.fillText("Start trip recording or demo mode to draw track path", w / 2, h / 2 + 15);
      return;
    }

    const pts = [...tripPoints].reverse();
    let minLat = pts[0].lat, maxLat = pts[0].lat;
    let minLng = pts[0].lng, maxLng = pts[0].lng;

    pts.forEach((p) => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    });

    const pad = 35;
    const latSpan = maxLat - minLat || 0.001;
    const lngSpan = maxLng - minLng || 0.001;

    const toX = (lon) => pad + ((lon - minLng) / lngSpan) * (w - 2 * pad);
    const toY = (la) => (h - pad) - ((la - minLat) / latSpan) * (h - 2 * pad);

    // Draw path with speed colors
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      ctx.beginPath();
      ctx.moveTo(toX(p0.lng), toY(p0.lat));
      ctx.lineTo(toX(p1.lng), toY(p1.lat));

      const spd = p1.speed;
      if (spd < 60) ctx.strokeStyle = "#39ff14";
      else if (spd < 100) ctx.strokeStyle = "#00f0ff";
      else if (spd < 130) ctx.strokeStyle = "#f59e0b";
      else ctx.strokeStyle = "#ef4444";

      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Start circle
    ctx.fillStyle = "#39ff14";
    ctx.beginPath();
    ctx.arc(toX(pts[0].lng), toY(pts[0].lat), 5, 0, Math.PI * 2);
    ctx.fill();

    // Current train marker
    const curr = pts[pts.length - 1];
    const cx = toX(curr.lng);
    const cy = toY(curr.lat);
    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#00f0ff";
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`TRAIN ${curr.speed} km/h`, cx + 10, cy + 4);
  }, [tripPoints]);

  const handleReset = () => {
    setSpeedKmh(0);
    setMaxSpeedKmh(0);
    setAvgSpeedKmh(0);
    setDistanceKm(0);
    setTripPoints([]);
    setElapsedSec(0);
    setIsRecording(false);
    lastValidCoord.current = null;
    lastValidTime.current = null;
  };

  const exportCsv = () => {
    if (tripPoints.length === 0) {
      alert("No GPS points recorded yet to export.");
      return;
    }
    let csv = "Timestamp_ISO,Time,Latitude,Longitude,Speed_kmh,Altitude_m,Distance_km,Accuracy_m\r\n";
    tripPoints.forEach((p) => {
      csv += `${p.isoTime},${p.time},${p.lat},${p.lng},${p.speed},${p.alt},${p.dist},${p.accuracy}\r\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `train_trip_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCoords = () => {
    if (lat && lng) {
      navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Speed arc calculation (0 to 200 km/h)
  const arcLength = 565;
  const speedRatio = Math.min(Math.max(speedKmh, 0), 200) / 200;
  const arcOffset = arcLength - (speedRatio * arcLength);

  const formatTimer = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div style={{
      backgroundColor: "#06090f",
      color: "#f8fafc",
      minHeight: "100%",
      padding: "20px",
      borderRadius: "16px",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "16px",
        borderBottom: "1px solid #1e2c45",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "38px",
            height: "38px",
            background: "linear-gradient(135deg, #00f0ff, #39ff14)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px"
          }}>
            🚆
          </div>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: "1.4rem",
              fontWeight: "900",
              letterSpacing: "1px",
              background: "linear-gradient(90deg, #00f0ff, #39ff14)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              OFFLINE TRAIN GPS TRACKER
            </h2>
            <div style={{ fontSize: "0.72rem", color: "#64748b", letterSpacing: "1px" }}>
              PURE HARDWARE GNSS RECEIVER • ZERO NETWORK REQUIRED
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Standalone PWA Link button */}
          <a
            href="./offline-gps-pwa/index.html"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              backgroundColor: "#121a2c",
              border: "1px solid #00f0ff",
              color: "#00f0ff",
              fontSize: "0.78rem",
              fontWeight: "700",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            ↗ Open Fullscreen PWA
          </a>

          {/* GPS Status badge */}
          <div style={{
            padding: "6px 14px",
            borderRadius: "20px",
            backgroundColor: "#121a2c",
            border: `1px solid ${gpsStatus.includes("EXCELLENT") || gpsStatus.includes("LOCKED") ? "#39ff14" : "#f59e0b"}`,
            color: gpsStatus.includes("EXCELLENT") || gpsStatus.includes("LOCKED") ? "#39ff14" : "#f59e0b",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            fontWeight: "800"
          }}>
            ● {gpsStatus}
          </div>
        </div>
      </div>

      {/* Simulator mode banner */}
      {isSimulating && (
        <div style={{
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          border: "1px solid #f59e0b",
          color: "#fbbf24",
          padding: "8px 16px",
          borderRadius: "10px",
          margin: "16px 0",
          fontSize: "0.85rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>⚡ <strong>DEMO MODE ACTIVE:</strong> Simulating 0 → 138 km/h high-speed express train journey with real GPS coordinates.</span>
          <button
            onClick={() => setIsSimulating(false)}
            style={{
              background: "#ef4444",
              border: "none",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.75rem"
            }}
          >
            Exit Demo
          </button>
        </div>
      )}

      {/* Speedometer Cockpit */}
      <div style={{
        marginTop: "16px",
        backgroundColor: "#0c121e",
        border: "1px solid #2d4165",
        borderRadius: "20px",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)"
      }}>
        {/* SVG Radial Gauge */}
        <div style={{ position: "relative", width: "360px", maxWidth: "100%", height: "220px" }}>
          <svg viewBox="0 0 400 240" style={{ width: "100%", height: "100%" }}>
            <defs>
              <linearGradient id="reactSpeedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="65%" stopColor="#39ff14" />
                <stop offset="85%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path
              d="M 60 210 A 150 150 0 1 1 340 210"
              fill="none"
              stroke="#162438"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 60 210 A 150 150 0 1 1 340 210"
              fill="none"
              stroke="url(#reactSpeedGrad)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray="565"
              strokeDashoffset={arcOffset}
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>

          {/* Speed Number HUD */}
          <div style={{
            position: "absolute",
            top: "70px",
            left: "0",
            right: "0",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "4.8rem",
              fontWeight: "900",
              fontFamily: "monospace",
              color: "#ffffff",
              lineHeight: "0.9",
              textShadow: "0 0 25px rgba(0,240,255,0.5)"
            }}>
              {Math.round(speedKmh)}
            </div>
            <div style={{
              fontSize: "1.1rem",
              fontWeight: "800",
              letterSpacing: "3px",
              color: "#00f0ff",
              marginTop: "4px"
            }}>
              KM / H
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>
              {(speedKmh / 3.6).toFixed(1)} m/s
            </div>
          </div>
        </div>

        {/* Quick stats below gauge */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          width: "100%",
          maxWidth: "460px",
          gap: "10px",
          marginTop: "10px",
          paddingTop: "14px",
          borderTop: "1px solid #1e2c45",
          textAlign: "center"
        }}>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase" }}>Distance</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#39ff14", fontFamily: "monospace" }}>
              {distanceKm.toFixed(2)} km
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase" }}>Max Speed</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f59e0b", fontFamily: "monospace" }}>
              {Math.round(maxSpeedKmh)} km/h
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase" }}>Avg Speed</div>
            <div style={{ fontSize: "1.2rem", fontWeight: "800", color: "#00f0ff", fontFamily: "monospace" }}>
              {Math.round(avgSpeedKmh)} km/h
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "14px",
        marginTop: "16px"
      }}>
        {/* Coordinates */}
        <div style={{
          backgroundColor: "#121a2c",
          border: "1px solid #1e2c45",
          borderRadius: "14px",
          padding: "16px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#94a3b8" }}>GPS COORDINATES</span>
            <button
              onClick={copyCoords}
              style={{
                backgroundColor: "#1e293b",
                border: "none",
                color: "#00f0ff",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.7rem",
                cursor: "pointer"
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.92rem", display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Lat:</span>
              <span style={{ color: "#f8fafc", fontWeight: "700" }}>{lat ? `${lat.toFixed(6)}°` : "--.------°"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Lng:</span>
              <span style={{ color: "#f8fafc", fontWeight: "700" }}>{lng ? `${lng.toFixed(6)}°` : "--.------°"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Alt:</span>
              <span style={{ color: "#f8fafc", fontWeight: "700" }}>{alt !== null ? `${alt} m` : "-- m"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Accuracy:</span>
              <span style={{ color: accuracy && accuracy < 10 ? "#39ff14" : "#f59e0b", fontWeight: "700" }}>
                {accuracy ? `±${accuracy.toFixed(1)} m` : "Waiting for satellite fix..."}
              </span>
            </div>
          </div>
        </div>

        {/* Compass */}
        <div style={{
          backgroundColor: "#121a2c",
          border: "1px solid #1e2c45",
          borderRadius: "14px",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          {/* Compass Rose */}
          <div style={{
            position: "relative",
            width: "74px",
            height: "74px",
            borderRadius: "50%",
            border: "2px solid #2d4165",
            backgroundColor: "#080d16",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ position: "absolute", top: "2px", fontSize: "0.6rem", fontWeight: "bold", color: "#ef4444" }}>N</span>
            <span style={{ position: "absolute", bottom: "2px", fontSize: "0.6rem", color: "#64748b" }}>S</span>
            <span style={{ position: "absolute", right: "3px", fontSize: "0.6rem", color: "#64748b" }}>E</span>
            <span style={{ position: "absolute", left: "3px", fontSize: "0.6rem", color: "#64748b" }}>W</span>
            <div style={{
              width: "4px",
              height: "46px",
              backgroundColor: "#cbd5e1",
              borderRadius: "2px",
              transform: `rotate(${heading || 0}deg)`,
              transition: "transform 0.4s ease",
              position: "relative"
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "4px",
                height: "23px",
                backgroundColor: "#ef4444",
                borderRadius: "2px 2px 0 0"
              }} />
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Heading Bearing</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "900", fontFamily: "monospace", color: "#00f0ff" }}>
              {heading !== null ? `${Math.round(heading)}°` : "---°"}
            </div>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#f8fafc" }}>
              {bearingToCardinal(heading)}
            </div>
          </div>
        </div>

        {/* Trip Duration */}
        <div style={{
          backgroundColor: "#121a2c",
          border: "1px solid #1e2c45",
          borderRadius: "14px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#94a3b8" }}>TRIP DURATION</span>
          <div style={{ fontSize: "2.2rem", fontWeight: "900", fontFamily: "monospace", color: "#f8fafc" }}>
            {formatTimer(elapsedSec)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Points Recorded: <strong style={{ color: "#00f0ff" }}>{tripPoints.length}</strong> fixes
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{
        marginTop: "16px",
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <button
          onClick={() => setIsRecording(!isRecording)}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: isRecording ? "#ef4444" : "#00f0ff",
            color: isRecording ? "#ffffff" : "#06090f",
            fontWeight: "800",
            cursor: "pointer",
            fontSize: "0.88rem"
          }}
        >
          {isRecording ? "⏹ Stop Recording" : "▶ Start Trip Recording"}
        </button>

        <button
          onClick={handleReset}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "1px solid #1e2c45",
            backgroundColor: "#121a2c",
            color: "#f8fafc",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.85rem"
          }}
        >
          Reset Stats
        </button>

        <button
          onClick={() => {
            setIsSimulating(!isSimulating);
            if (!isRecording) setIsRecording(true);
          }}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            backgroundColor: "rgba(245, 158, 11, 0.15)",
            color: "#fbbf24",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.85rem"
          }}
        >
          {isSimulating ? "Stop Demo" : "⚡ Test Demo (135 km/h Train)"}
        </button>

        <button
          onClick={exportCsv}
          style={{
            marginLeft: "auto",
            padding: "10px 18px",
            borderRadius: "10px",
            border: "1px solid #39ff14",
            backgroundColor: "rgba(57, 255, 20, 0.1)",
            color: "#39ff14",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "0.85rem"
          }}
        >
          📥 Export CSV Log
        </button>
      </div>

      {/* Offline Vector Track Canvas */}
      <div style={{
        marginTop: "16px",
        backgroundColor: "#0c121e",
        border: "1px solid #1e2c45",
        borderRadius: "16px",
        overflow: "hidden"
      }}>
        <div style={{
          padding: "12px 16px",
          borderBottom: "1px solid #1e2c45",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#00f0ff" }}>
            OFFLINE VECTOR TRACK MAP (WORKS WITH ZERO MAP TILES)
          </span>
          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
            🟢 &lt;60 km/h | 🔵 60-100 | 🟠 100-130 | 🔴 &gt;130 km/h
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={900}
          height={280}
          style={{ width: "100%", height: "280px", display: "block" }}
        />
      </div>
    </div>
  );
}
