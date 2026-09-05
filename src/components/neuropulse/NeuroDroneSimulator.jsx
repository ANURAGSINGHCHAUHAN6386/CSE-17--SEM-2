import React, { useState, useEffect, useRef } from "react";

export default function NeuroDroneSimulator({ mentalFocus = 65 }) {
  const canvasRef = useRef(null);
  const [focusInput, setFocusInput] = useState(65);
  const [isAutoBiofeedback, setIsAutoBiofeedback] = useState(true);
  const [altitude, setAltitude] = useState(12.4);
  const [thrustPct, setThrustPct] = useState(68);
  const [c3Power, setC3Power] = useState(34);
  const [c4Power, setC4Power] = useState(28);

  const droneYRef = useRef(160);
  const droneVyRef = useRef(0);
  const ringsRef = useRef([
    { x: 300, y: 120, passed: false },
    { x: 500, y: 180, passed: false },
    { x: 700, y: 90, passed: false },
  ]);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (isAutoBiofeedback) {
      setFocusInput(mentalFocus);
    }
  }, [mentalFocus, isAutoBiofeedback]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 280);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 280;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      // Clear sky
      ctx.fillStyle = "#070b13";
      ctx.fillRect(0, 0, width, height);

      // Draw futuristic grid background
      ctx.strokeStyle = "#101a2b";
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Physics: Target height is proportional to focus
      // Focus 100% -> top (y = 40), Focus 0% -> bottom (y = height - 40)
      const targetY = (height - 50) - (focusInput / 100) * (height - 90);
      droneVyRef.current += (targetY - droneYRef.current) * 0.05;
      droneVyRef.current *= 0.85; // drag damping
      droneYRef.current += droneVyRef.current;

      const currentY = droneYRef.current;
      const droneX = 120;

      // Update telemetry
      const altM = ((height - currentY) / 10).toFixed(1);
      setAltitude(altM);
      const thrust = Math.min(100, Math.max(0, Math.round(focusInput + (Math.random() * 4 - 2))));
      setThrustPct(thrust);
      setC3Power(Math.round(45 - focusInput * 0.25));
      setC4Power(Math.round(42 - focusInput * 0.22));

      // Draw Obstacle Energy Rings
      ringsRef.current.forEach((ring) => {
        ring.x -= 2.5;
        if (ring.x < -40) {
          ring.x = width + 50;
          ring.y = 60 + Math.random() * (height - 120);
          ring.passed = false;
        }

        // Draw glowing ring
        ctx.strokeStyle = ring.passed ? "#39ff14" : "#00f0ff";
        ctx.lineWidth = 4;
        ctx.shadowColor = ring.passed ? "#39ff14" : "#00f0ff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(ring.x, ring.y, 16, 45, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Check collision / pass
        if (!ring.passed && Math.abs(ring.x - droneX) < 15) {
          if (Math.abs(ring.y - currentY) < 45) {
            ring.passed = true;
            scoreRef.current += 100;
          }
        }
      });

      // Draw Drone Exhaust Particles
      ctx.fillStyle = "rgba(0, 240, 255, 0.6)";
      for (let p = 0; p < 4; p++) {
        const px = droneX - 15 + (Math.random() * 30);
        const py = currentY + 12 + Math.random() * 15;
        ctx.beginPath();
        ctx.arc(px, py, 2 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Quadcopter Drone
      ctx.save();
      ctx.translate(droneX, currentY);

      // Chassis
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#00f0ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-22, -6, 44, 12, 4);
      ctx.fill();
      ctx.stroke();

      // Central Brain Sphere
      ctx.fillStyle = "#39ff14";
      ctx.shadowColor = "#39ff14";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Rotors
      const rotorAngle = Date.now() * 0.05 * (thrust / 50);
      const rotorOffset = 24;

      // Left Rotor
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-rotorOffset - 12, -10);
      ctx.lineTo(-rotorOffset + 12, -10);
      ctx.stroke();

      // Right Rotor
      ctx.beginPath();
      ctx.moveTo(rotorOffset - 12, -10);
      ctx.lineTo(rotorOffset + 12, -10);
      ctx.stroke();

      ctx.restore();

      // Draw HUD Alt scale on left
      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.fillText("MAX ALT 25m", 10, 25);
      ctx.fillText("PAD 0m", 10, height - 10);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [focusInput]);

  return (
    <div style={{
      backgroundColor: "#0a0f1d",
      border: "1px solid #1a273e",
      borderRadius: "16px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #162438", paddingBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>🛸</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "#f8fafc", letterSpacing: "1px" }}>
              TELEKINETIC NEURO-DRONE FLIGHT SIMULATOR
            </h3>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
              Motor Imagery (ERD/ERS) & Sensory-Motor Rhythm (SMR) Thrust Controller
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAutoBiofeedback(!isAutoBiofeedback)}
          style={{
            padding: "4px 10px",
            borderRadius: "8px",
            backgroundColor: isAutoBiofeedback ? "rgba(57, 255, 20, 0.15)" : "#162033",
            border: `1px solid ${isAutoBiofeedback ? "#39ff14" : "#24344d"}`,
            color: isAutoBiofeedback ? "#39ff14" : "#94a3b8",
            fontSize: "0.75rem",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          {isAutoBiofeedback ? "● Linked to Live EEG" : "○ Manual Slider"}
        </button>
      </div>

      {/* Main Drone Flight Canvas */}
      <div style={{ position: "relative", width: "100%", height: "280px", borderRadius: "10px", overflow: "hidden", border: "1px solid #162438" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {/* Telemetry & Cortex Desynchronization Meters */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "10px"
      }}>
        <div style={{ backgroundColor: "#070b13", padding: "10px", borderRadius: "8px", border: "1px solid #162438" }}>
          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>NEURAL FOCUS LEVEL</div>
          <div style={{ fontSize: "1.3rem", fontWeight: "900", fontFamily: "monospace", color: "#00f0ff" }}>
            {focusInput}%
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={focusInput}
            disabled={isAutoBiofeedback}
            onChange={(e) => setFocusInput(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "#00f0ff", marginTop: "4px" }}
          />
        </div>

        <div style={{ backgroundColor: "#070b13", padding: "10px", borderRadius: "8px", border: "1px solid #162438" }}>
          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>DRONE ALTITUDE</div>
          <div style={{ fontSize: "1.3rem", fontWeight: "900", fontFamily: "monospace", color: "#39ff14" }}>
            {altitude} m
          </div>
          <div style={{ fontSize: "0.68rem", color: "#64748b" }}>Thrust: {thrustPct}%</div>
        </div>

        <div style={{ backgroundColor: "#070b13", padding: "10px", borderRadius: "8px", border: "1px solid #162438" }}>
          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>C3 (LEFT MOTOR CORTEX)</div>
          <div style={{ fontSize: "1.3rem", fontWeight: "900", fontFamily: "monospace", color: "#f59e0b" }}>
            {c3Power} μV²
          </div>
          <div style={{ fontSize: "0.68rem", color: "#64748b" }}>Mu-Rhythm Suppression</div>
        </div>

        <div style={{ backgroundColor: "#070b13", padding: "10px", borderRadius: "8px", border: "1px solid #162438" }}>
          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>C4 (RIGHT MOTOR CORTEX)</div>
          <div style={{ fontSize: "1.3rem", fontWeight: "900", fontFamily: "monospace", color: "#a855f7" }}>
            {c4Power} μV²
          </div>
          <div style={{ fontSize: "0.68rem", color: "#64748b" }}>Event-Related Desync (ERD)</div>
        </div>
      </div>
    </div>
  );
}
