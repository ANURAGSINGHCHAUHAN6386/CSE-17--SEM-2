import React from "react";

export default function CognitiveMetricsRadar({
  engagement = 78,
  workload = 64,
  flowState = 82,
  fatigue = 22,
  stress = 35,
}) {
  // SVG Radar Polygon coordinates computation
  // 5 axes arranged evenly around circle: 0°, 72°, 144°, 216°, 288°
  const metrics = [
    { label: "Engagement (β/(α+θ))", val: engagement, color: "#00f0ff" },
    { label: "Cognitive Workload",   val: workload,   color: "#39ff14" },
    { label: "Flow State Index",     val: flowState,  color: "#f59e0b" },
    { label: "Mental Fatigue",       val: fatigue,    color: "#ef4444" },
    { label: "Stress / Arousal",     val: stress,     color: "#a855f7" },
  ];

  const cx = 150;
  const cy = 130;
  const radius = 95;
  const numAxes = 5;

  // Compute vertices for value polygon
  const points = metrics.map((m, i) => {
    const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
    const r = (m.val / 100) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  // Grid concentric rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  const isOverload = workload > 85 || fatigue > 75;

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
          <span style={{ fontSize: "1.2rem" }}>🕸️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "#f8fafc", letterSpacing: "1px" }}>
              NEURO-COGNITIVE RADAR & MENTAL STATE INDEX
            </h3>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
              Real-time multi-dimensional spectral assessment & NASA TLX engagement decomposition
            </div>
          </div>
        </div>

        <div style={{
          padding: "4px 10px",
          borderRadius: "8px",
          backgroundColor: isOverload ? "rgba(239, 68, 68, 0.15)" : "rgba(57, 255, 20, 0.15)",
          border: `1px solid ${isOverload ? "#ef4444" : "#39ff14"}`,
          color: isOverload ? "#ef4444" : "#39ff14",
          fontSize: "0.72rem",
          fontWeight: "bold",
          fontFamily: "monospace"
        }}>
          {isOverload ? "⚠️ COGNITIVE OVERLOAD" : "✓ OPTIMAL FLOW STATE"}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px",
        alignItems: "center"
      }}>
        {/* SVG Radar Spider Chart */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg width="300" height="260" viewBox="0 0 300 260">
            {/* Concentric pentagons */}
            {rings.map((factor, rIdx) => {
              const polyPoints = Array.from({ length: numAxes }).map((_, i) => {
                const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
                const r = factor * radius;
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
              }).join(" ");

              return (
                <polygon
                  key={rIdx}
                  points={polyPoints}
                  fill="none"
                  stroke="#162438"
                  strokeWidth="1"
                />
              );
            })}

            {/* Axis spokes from center */}
            {Array.from({ length: numAxes }).map((_, i) => {
              const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
              const x2 = cx + radius * Math.cos(angle);
              const y2 = cy + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x2}
                  y2={y2}
                  stroke="#1b2a44"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled data polygon */}
            <polygon
              points={points}
              fill="rgba(0, 240, 255, 0.25)"
              stroke="#00f0ff"
              strokeWidth="2.5"
              style={{ transition: "all 0.5s ease" }}
            />

            {/* Vertex points */}
            {metrics.map((m, i) => {
              const angle = (i * 2 * Math.PI) / numAxes - Math.PI / 2;
              const r = (m.val / 100) * radius;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);

              // Label position slightly outside radius
              const lx = cx + (radius + 22) * Math.cos(angle);
              const ly = cy + (radius + 14) * Math.sin(angle);

              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill={m.color} />
                  <text
                    x={lx}
                    y={ly}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {m.val}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detailed Metrics Breakdown Bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {metrics.map((m, idx) => (
            <div key={idx} style={{ backgroundColor: "#070b13", padding: "8px 12px", borderRadius: "8px", border: "1px solid #142033" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{m.label}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: "900", fontFamily: "monospace", color: m.color }}>
                  {m.val}%
                </span>
              </div>
              <div style={{ width: "100%", height: "6px", backgroundColor: "#162033", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${m.val}%`, height: "100%", backgroundColor: m.color, transition: "width 0.4s ease" }} />
              </div>
            </div>
          ))}

          {/* Diagnostic status recommendation */}
          <div style={{
            marginTop: "4px",
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 240, 255, 0.08)",
            border: "1px solid rgba(0, 240, 255, 0.2)",
            fontSize: "0.72rem",
            color: "#94a3b8"
          }}>
            🧠 <strong>Neuro-Diagnostic:</strong> High Alpha-Beta coherence indicates sustained productive coding flow. Fatigue levels are low; optimal time for deep technical problem solving.
          </div>
        </div>
      </div>
    </div>
  );
}
