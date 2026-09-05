import React, { useEffect, useRef, useState } from "react";

const CHANNELS = [
  { name: "FP1", region: "Prefrontal (Left)", color: "#00f0ff" },
  { name: "FP2", region: "Prefrontal (Right)", color: "#00f0ff" },
  { name: "F3",  region: "Frontal (Left)",    color: "#39ff14" },
  { name: "F4",  region: "Frontal (Right)",   color: "#39ff14" },
  { name: "C3",  region: "Central (Motor L)", color: "#f59e0b" },
  { name: "C4",  region: "Central (Motor R)", color: "#f59e0b" },
  { name: "P3",  region: "Parietal (Left)",   color: "#a855f7" },
  { name: "P4",  region: "Parietal (Right)",  color: "#a855f7" },
];

export default function EegOscilloscope({ mentalState = "focus", isRunning = true }) {
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);

  const [notchFilter, setNotchFilter] = useState(true);
  const [artifactType, setArtifactType] = useState("none"); // none, blink, jaw
  const [psdPowers, setPsdPowers] = useState({ delta: 15, theta: 20, alpha: 45, beta: 30, gamma: 12 });

  // Phase and time tracker
  const phaseRef = useRef(0);
  const artifactDecay = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = 420);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 420;
    };
    window.addEventListener("resize", handleResize);

    // Channel history ring buffers
    const bufferLen = Math.floor(width);
    const buffers = CHANNELS.map(() => new Float32Array(bufferLen));

    const render = () => {
      if (!isRunning) {
        animFrameId.current = requestAnimationFrame(render);
        return;
      }

      phaseRef.current += 0.06;
      const t = phaseRef.current;

      // Determine frequency component weights based on current mental state
      let wDelta = 0.8, wTheta = 1.0, wAlpha = 2.2, wBeta = 1.2, wGamma = 0.5;
      if (mentalState === "focus") {
        wAlpha = 3.5; wBeta = 2.0; wTheta = 0.6; wDelta = 0.3; wGamma = 1.5;
      } else if (mentalState === "meditation") {
        wTheta = 3.8; wAlpha = 2.8; wBeta = 0.5; wDelta = 1.2; wGamma = 0.2;
      } else if (mentalState === "stress") {
        wBeta = 4.2; wGamma = 2.8; wAlpha = 0.4; wTheta = 0.8; wDelta = 0.4;
      } else if (mentalState === "drowsy") {
        wDelta = 4.5; wTheta = 3.0; wAlpha = 1.0; wBeta = 0.4; wGamma = 0.1;
      }

      // Update PSD states for UI display
      const total = wDelta + wTheta + wAlpha + wBeta + wGamma;
      setPsdPowers({
        delta: Math.round((wDelta / total) * 100),
        theta: Math.round((wTheta / total) * 100),
        alpha: Math.round((wAlpha / total) * 100),
        beta: Math.round((wBeta / total) * 100),
        gamma: Math.round((wGamma / total) * 100),
      });

      // Artifact decay
      if (artifactDecay.current > 0) {
        artifactDecay.current -= 0.05;
      }

      // Compute new values for each channel
      CHANNELS.forEach((ch, idx) => {
        const buf = buffers[idx];
        // Shift left
        for (let x = 0; x < bufferLen - 1; x++) {
          buf[x] = buf[x + 1];
        }

        // Generate synthetic bio-potential: sum of sine waves + 1/f pink noise
        const chOffset = idx * 0.45;
        let v = 0;
        v += Math.sin(t * 1.5 + chOffset) * (wDelta * 8);   // Delta ~2 Hz
        v += Math.sin(t * 4.2 + chOffset) * (wTheta * 6);   // Theta ~6 Hz
        v += Math.sin(t * 7.5 + chOffset) * (wAlpha * 10);  // Alpha ~10 Hz
        v += Math.sin(t * 16.0 + chOffset) * (wBeta * 5);   // Beta ~20 Hz
        v += Math.sin(t * 32.0 + chOffset) * (wGamma * 3);  // Gamma ~40 Hz

        // Add sensor microvolt noise
        v += (Math.random() * 2 - 1) * 3;

        // 50Hz electrical mains hum if notch filter disabled
        if (!notchFilter) {
          v += Math.sin(t * 45.0) * 14;
        }

        // Eye Blink artifact (massive high-amplitude spike in frontal channels FP1/FP2)
        if (artifactType === "blink" && (idx === 0 || idx === 1) && artifactDecay.current > 0) {
          v += Math.sin(artifactDecay.current * Math.PI) * 45;
        }

        // Muscle clench (high-frequency EMG burst in all channels)
        if (artifactType === "jaw" && artifactDecay.current > 0) {
          v += (Math.random() * 2 - 1) * 35 * artifactDecay.current;
        }

        buf[bufferLen - 1] = v;
      });

      // Clear dark canvas
      ctx.fillStyle = "#070b13";
      ctx.fillRect(0, 0, width, height);

      // Draw Oscilloscope Grid Lines (100ms and 50uV lines)
      ctx.strokeStyle = "#101a2b";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      const numChannels = CHANNELS.length;
      const channelHeight = height / numChannels;

      // Draw Channel baselines and waveforms
      CHANNELS.forEach((ch, idx) => {
        const yCenter = channelHeight * idx + channelHeight / 2;
        const buf = buffers[idx];

        // Horizontal baseline
        ctx.strokeStyle = "#152033";
        ctx.beginPath();
        ctx.moveTo(0, yCenter);
        ctx.lineTo(width, yCenter);
        ctx.stroke();

        // Channel Label
        ctx.fillStyle = ch.color;
        ctx.font = "bold 11px monospace";
        ctx.fillText(`${ch.name} [${ch.region}]`, 12, yCenter - 8);

        // Draw waveform trace
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();

        for (let x = 0; x < bufferLen; x++) {
          const y = yCenter - buf[x] * 0.8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Sweep Line (Phosphor persistence effect)
      const sweepX = (phaseRef.current * 40) % width;
      const grad = ctx.createLinearGradient(sweepX - 25, 0, sweepX, 0);
      grad.addColorStop(0, "rgba(0, 240, 255, 0)");
      grad.addColorStop(1, "rgba(0, 240, 255, 0.4)");
      ctx.fillStyle = grad;
      ctx.fillRect(sweepX - 25, 0, 25, height);

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [isRunning, mentalState, notchFilter, artifactType]);

  const triggerArtifact = (type) => {
    setArtifactType(type);
    artifactDecay.current = 1.0;
    setTimeout(() => setArtifactType("none"), 1200);
  };

  return (
    <div style={{
      backgroundColor: "#0a0f1d",
      border: "1px solid #1a273e",
      borderRadius: "16px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "14px"
    }}>
      {/* Oscilloscope Header Controls */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        borderBottom: "1px solid #162438",
        paddingBottom: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: isRunning ? "#39ff14" : "#ef4444",
            boxShadow: isRunning ? "0 0 10px #39ff14" : "none"
          }} />
          <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#f8fafc", letterSpacing: "1px" }}>
            16-CHANNEL SYNCHRONIZED EEG OSCILLOSCOPE
          </span>
          <span style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace" }}>
            250 S/s • 24-bit ADC • ±50μV Scale
          </span>
        </div>

        {/* DSP Filter & Artifact Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setNotchFilter(!notchFilter)}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: notchFilter ? "rgba(0, 240, 255, 0.15)" : "#162033",
              color: notchFilter ? "#00f0ff" : "#64748b",
              border: `1px solid ${notchFilter ? "#00f0ff" : "#24344d"}`
            }}
          >
            50Hz Notch: {notchFilter ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => triggerArtifact("blink")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: "#162033",
              color: "#fbbf24",
              border: "1px solid #f59e0b"
            }}
            title="Simulate ocular eye blink potential on FP1/FP2"
          >
            Simulate Blink (FP1/2)
          </button>

          <button
            onClick={() => triggerArtifact("jaw")}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.72rem",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: "#162033",
              color: "#f87171",
              border: "1px solid #ef4444"
            }}
            title="Simulate high-frequency EMG jaw clench artifact"
          >
            Simulate Jaw Clench (EMG)
          </button>
        </div>
      </div>

      {/* Main Canvas Oscilloscope */}
      <div style={{ position: "relative", width: "100%", height: "420px", borderRadius: "10px", overflow: "hidden", border: "1px solid #162438" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {/* Power Spectral Density (PSD) Bands Bar Display */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "8px",
        backgroundColor: "#070b13",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #142033"
      }}>
        <PsdBandCard name="Delta (δ)" range="0.5-4 Hz" power={psdPowers.delta} color="#a855f7" desc="Deep Sleep / Regeneration" />
        <PsdBandCard name="Theta (θ)" range="4-8 Hz" power={psdPowers.theta} color="#3b82f6" desc="Meditation / Creativity" />
        <PsdBandCard name="Alpha (α)" range="8-12 Hz" power={psdPowers.alpha} color="#39ff14" desc="Relaxed Focus / Flow" />
        <PsdBandCard name="Beta (β)" range="13-30 Hz" power={psdPowers.beta} color="#f59e0b" desc="Alertness / Problem Solving" />
        <PsdBandCard name="Gamma (γ)" range="30-100 Hz" power={psdPowers.gamma} color="#ef4444" desc="Peak Memory / Binding" />
      </div>
    </div>
  );
}

function PsdBandCard({ name, range, power, color, desc }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: "800", color }}>{name}</span>
        <span style={{ fontSize: "0.85rem", fontWeight: "900", fontFamily: "monospace", color: "#f8fafc" }}>
          {power}%
        </span>
      </div>
      <div style={{ width: "100%", height: "6px", backgroundColor: "#162033", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${power}%`, height: "100%", backgroundColor: color, transition: "width 0.3s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "#64748b" }}>
        <span>{range}</span>
        <span>{desc}</span>
      </div>
    </div>
  );
}
