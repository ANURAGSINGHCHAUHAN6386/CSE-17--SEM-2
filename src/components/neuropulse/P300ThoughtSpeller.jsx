import React, { useState, useEffect, useRef } from "react";

const MATRIX_CHARS = [
  ["A", "B", "C", "D", "E", "F"],
  ["G", "H", "I", "J", "K", "L"],
  ["M", "N", "O", "P", "Q", "R"],
  ["S", "T", "U", "V", "W", "X"],
  ["Y", "Z", "1", "2", "3", "4"],
  ["5", "6", "7", "8", "9", " "],
];

export default function P300ThoughtSpeller() {
  const [activeHighlight, setActiveHighlight] = useState({ type: null, index: -1 }); // type: 'row'|'col', index: 0-5
  const [isFlashing, setIsFlashing] = useState(false);
  const [targetChar, setTargetChar] = useState("N");
  const [typedText, setTypedText] = useState("NEURO");
  const [lastDetectedChar, setLastDetectedChar] = useState("O");
  const [confidence, setConfidence] = useState(96.4);
  const [erpPeakLatency, setErpPeakLatency] = useState(315); // ms

  const erpCanvasRef = useRef(null);
  const flashTimerRef = useRef(null);
  const flashCountRef = useRef(0);
  const targetRowRef = useRef(2);
  const targetColRef = useRef(1);

  // Update target row and col index when targetChar changes
  useEffect(() => {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (MATRIX_CHARS[r][c] === targetChar) {
          targetRowRef.current = r;
          targetColRef.current = c;
          return;
        }
      }
    }
  }, [targetChar]);

  // Flash sequencer loop
  useEffect(() => {
    if (!isFlashing) {
      clearInterval(flashTimerRef.current);
      setActiveHighlight({ type: null, index: -1 });
      return;
    }

    flashCountRef.current = 0;
    const sequence = [];
    // Create random shuffled sequence of 6 rows and 6 columns
    for (let round = 0; round < 4; round++) {
      const rows = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
      const cols = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
      rows.forEach((r) => sequence.push({ type: "row", index: r }));
      cols.forEach((c) => sequence.push({ type: "col", index: c }));
    }

    let seqIdx = 0;
    flashTimerRef.current = setInterval(() => {
      if (seqIdx >= sequence.length) {
        // Sequence completed: Decode letter!
        setIsFlashing(false);
        setActiveHighlight({ type: null, index: -1 });
        setTypedText((prev) => prev + targetChar);
        setLastDetectedChar(targetChar);
        setConfidence(Number((94 + Math.random() * 5.5).toFixed(1)));
        setErpPeakLatency(Math.round(300 + Math.random() * 30));
        drawErpWaveform(true);
        return;
      }

      const currentItem = sequence[seqIdx];
      setActiveHighlight(currentItem);

      // Check if target was flashed
      const isTargetFlashed =
        (currentItem.type === "row" && currentItem.index === targetRowRef.current) ||
        (currentItem.type === "col" && currentItem.index === targetColRef.current);

      if (isTargetFlashed) {
        drawErpWaveform(true);
      }

      seqIdx++;
    }, 140); // 140ms per flash (standard clinical BCI P300 timing)

    return () => clearInterval(flashTimerRef.current);
  }, [isFlashing, targetChar]);

  // Draw P300 Event-Related Potential (ERP) Canvas Waveform
  const drawErpWaveform = (hasTarget = true) => {
    const canvas = erpCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#070b13";
    ctx.fillRect(0, 0, w, h);

    // Draw baseline and axes
    ctx.strokeStyle = "#162438";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // Stimulus onset vertical line (t = 0ms)
    const onsetX = 60;
    ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(onsetX, 0);
    ctx.lineTo(onsetX, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#64748b";
    ctx.font = "10px monospace";
    ctx.fillText("Stimulus (0ms)", onsetX + 4, 14);
    ctx.fillText("+300ms (P300 Peak)", onsetX + 130, 14);

    // 1. Non-target waveform (flat noise, grey)
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const noise = (Math.sin(x * 0.1) + Math.cos(x * 0.25)) * 4;
      const y = h / 2 + noise;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2. Target P300 Waveform (prominent positive peak at ~300ms)
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let x = 0; x < w; x++) {
      const relX = x - onsetX;
      // Gaussian curve centered at 300ms peak
      const peakX = 140; // represents 300ms
      const p300Deflection = Math.exp(-Math.pow(relX - peakX, 2) / 1200) * -38; // Negative in canvas Y is UP (positive voltage in EEG)
      const n100Deflection = Math.exp(-Math.pow(relX - 45, 2) / 300) * 15;
      const noise = (Math.sin(x * 0.08)) * 2;

      const y = h / 2 + p300Deflection + n100Deflection + noise;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Marker on peak
    const peakCanvasX = onsetX + 140;
    ctx.fillStyle = "#39ff14";
    ctx.beginPath();
    ctx.arc(peakCanvasX, h / 2 - 38, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#39ff14";
    ctx.fillText("P300 (+12.4 μV)", peakCanvasX - 25, h / 2 - 46);
  };

  useEffect(() => {
    drawErpWaveform(true);
  }, []);

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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #162438", paddingBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>⚡</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "#f8fafc", letterSpacing: "1px" }}>
              P300 VISUAL EVOKED POTENTIAL (VEP) THOUGHT SPELLER
            </h3>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
              Farwell-Donchin BCI Matrix paradigm: Decodes intentional focus via event-related EEG voltage deflections
            </div>
          </div>
        </div>

        <div style={{
          padding: "4px 10px",
          borderRadius: "8px",
          backgroundColor: isFlashing ? "rgba(57, 255, 20, 0.15)" : "#162033",
          border: `1px solid ${isFlashing ? "#39ff14" : "#24344d"}`,
          color: isFlashing ? "#39ff14" : "#94a3b8",
          fontSize: "0.75rem",
          fontWeight: "bold",
          fontFamily: "monospace"
        }}>
          {isFlashing ? "SCANNING ERP POTENTIALS..." : "SYSTEM READY"}
        </div>
      </div>

      {/* Main Speller Content: Matrix Grid + ERP Waveform Display */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px"
      }}>
        {/* 6x6 P300 Matrix */}
        <div style={{
          backgroundColor: "#070b13",
          border: "1px solid #162438",
          borderRadius: "12px",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Target Focus Character:</span>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span style={{
                fontSize: "1.1rem",
                fontWeight: "900",
                color: "#39ff14",
                fontFamily: "monospace",
                backgroundColor: "#162033",
                padding: "2px 8px",
                borderRadius: "4px"
              }}>
                {targetChar === " " ? "[SPACE]" : targetChar}
              </span>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateRows: "repeat(6, 1fr)",
            gap: "6px",
            aspectRatio: "1/1",
            maxWidth: "340px",
            margin: "0 auto",
            width: "100%"
          }}>
            {MATRIX_CHARS.map((row, rIdx) => (
              <div key={rIdx} style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px" }}>
                {row.map((char, cIdx) => {
                  const isHighlighted =
                    (activeHighlight.type === "row" && activeHighlight.index === rIdx) ||
                    (activeHighlight.type === "col" && activeHighlight.index === cIdx);

                  const isTarget = char === targetChar;

                  return (
                    <button
                      key={cIdx}
                      onClick={() => setTargetChar(char)}
                      style={{
                        backgroundColor: isHighlighted ? "#ffffff" : isTarget ? "#152a42" : "#0d1424",
                        color: isHighlighted ? "#05080f" : isTarget ? "#39ff14" : "#94a3b8",
                        border: isTarget ? "1px solid #39ff14" : "1px solid #1a273e",
                        borderRadius: "8px",
                        fontSize: "1.2rem",
                        fontWeight: "900",
                        fontFamily: "monospace",
                        cursor: "pointer",
                        boxShadow: isHighlighted ? "0 0 20px #ffffff, 0 0 35px #00f0ff" : "none",
                        transform: isHighlighted ? "scale(1.06)" : "scale(1)",
                        transition: "all 0.05s ease"
                      }}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ fontSize: "0.68rem", color: "#64748b", textAlign: "center", marginTop: "4px" }}>
            Click any character to set as focus target, then click "Start Thought Scan"
          </div>
        </div>

        {/* Real-time ERP Waveform & Decoded Buffer */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Decoded Word Buffer */}
          <div style={{
            backgroundColor: "#070b13",
            border: "1px solid #162438",
            borderRadius: "12px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>BCI Output Text Buffer:</span>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => setTypedText((prev) => prev.slice(0, -1))}
                  style={{ backgroundColor: "#162033", border: "none", color: "#f87171", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" }}
                >
                  Backspace
                </button>
                <button
                  onClick={() => setTypedText("")}
                  style={{ backgroundColor: "#162033", border: "none", color: "#94a3b8", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div style={{
              backgroundColor: "#0b1220",
              border: "1px solid #20304a",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "1.4rem",
              fontFamily: "monospace",
              color: "#00f0ff",
              letterSpacing: "2px",
              minHeight: "45px"
            }}>
              {typedText}
              <span style={{ animation: "pulse 1s infinite" }}>|</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace" }}>
              <span>Last Decoded: <strong style={{ color: "#39ff14" }}>'{lastDetectedChar}'</strong></span>
              <span>Decoder Confidence: <strong style={{ color: "#00f0ff" }}>{confidence}%</strong></span>
              <span>Latency: <strong style={{ color: "#f59e0b" }}>{erpPeakLatency}ms</strong></span>
            </div>
          </div>

          {/* P300 ERP Waveform Canvas */}
          <div style={{
            backgroundColor: "#070b13",
            border: "1px solid #162438",
            borderRadius: "12px",
            padding: "12px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>P300 Event-Related Potential (ERP) Profile (Cz/Pz)</span>
              <span style={{ fontSize: "0.68rem", color: "#00f0ff" }}>Target ERP vs Non-Target</span>
            </div>

            <div style={{ width: "100%", height: "130px", borderRadius: "8px", overflow: "hidden" }}>
              <canvas ref={erpCanvasRef} width={400} height={130} style={{ width: "100%", height: "100%", display: "block" }} />
            </div>

            <button
              onClick={() => setIsFlashing(!isFlashing)}
              style={{
                marginTop: "auto",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: isFlashing ? "#ef4444" : "#00f0ff",
                color: isFlashing ? "#ffffff" : "#06090f",
                fontWeight: "900",
                fontSize: "0.88rem",
                cursor: "pointer",
                boxShadow: isFlashing ? "0 0 15px rgba(239, 68, 68, 0.4)" : "0 0 15px rgba(0, 240, 255, 0.4)"
              }}
            >
              {isFlashing ? "⏹ Abort Thought Scan" : "▶ Start P300 Thought Scan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
