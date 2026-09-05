import React, { useState } from "react";
import { TrendingUp } from "lucide-react";

export default function HistoricalCharts({ history }) {
  const [chartMode, setChartMode] = useState("pm"); // 'pm' | 'gases' | 'dp' | 'efficiency'

  if (!history || history.length === 0) {
    return <div>Loading historical chart telemetry...</div>;
  }

  // Determine series to display based on mode
  let series = [];
  let title = "";
  let unit = "";

  if (chartMode === "pm") {
    title = "Particulate Matter: Raw Inlet vs. Cleaned Stack Outlet";
    unit = "µg/m³";
    series = [
      { name: "Inlet PM10", key: "pm10In", color: "#60a5fa", strokeWidth: 2, isDashed: true },
      { name: "Inlet PM2.5", key: "pm25In", color: "#38bdf8", strokeWidth: 2, isDashed: true },
      { name: "Stack PM10", key: "pm10Out", color: "#3b82f6", strokeWidth: 3 },
      { name: "Stack PM2.5", key: "pm25Out", color: "#06b6d4", strokeWidth: 3 }
    ];
  } else if (chartMode === "gases") {
    title = "Combustion Acid Gases: SO₂ and NOx Abatement";
    unit = "ppm";
    series = [
      { name: "Inlet SO₂", key: "so2In", color: "#fbbf24", strokeWidth: 2, isDashed: true },
      { name: "Inlet NOx", key: "noxIn", color: "#f472b6", strokeWidth: 2, isDashed: true },
      { name: "Stack SO₂", key: "so2Out", color: "#f59e0b", strokeWidth: 3 },
      { name: "Stack NOx", key: "noxOut", color: "#ec4899", strokeWidth: 3 }
    ];
  } else if (chartMode === "dp") {
    title = "Baghouse Filter Differential Pressure (ΔP Clogging Risk)";
    unit = "kPa";
    series = [
      { name: "Filter ΔP", key: "diffPressure", color: "#ef4444", strokeWidth: 3 }
    ];
  } else if (chartMode === "efficiency") {
    title = "Total System Flue Gas Abatement Efficiency (%)";
    unit = "%";
    series = [
      { name: "Abatement Efficiency", key: "overallEfficiency", color: "#10b981", strokeWidth: 3 }
    ];
  }

  // Find max and min values for dynamic scale
  let maxVal = 0;
  let minVal = Infinity;

  series.forEach((s) => {
    history.forEach((h) => {
      const v = h[s.key] ?? 0;
      if (v > maxVal) maxVal = v;
      if (v < minVal) minVal = v;
    });
  });

  // Margins & SVG Dimensions
  if (chartMode === "efficiency") {
    minVal = 85;
    maxVal = 100;
  } else if (chartMode === "dp") {
    minVal = 0.5;
    maxVal = 3.0;
  } else {
    minVal = 0;
    maxVal = Math.ceil(maxVal * 1.15) || 100;
  }

  const width = 850;
  const height = 240;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const pointsCount = history.length;
  const getX = (idx) => padLeft + (idx / (pointsCount - 1 || 1)) * chartW;
  const getY = (val) => padTop + chartH - ((val - minVal) / (maxVal - minVal || 1)) * chartH;

  return (
    <div className="apcs-flow-box">
      <div className="apcs-section-header">
        <div>
          <h3 className="apcs-section-title">
            <TrendingUp size={20} color="var(--apcs-cyan)" />
            Real-Time Historical Trends (60-Second Rolling Window)
          </h3>
          <span className="apcs-section-subtitle">{title}</span>
        </div>

        {/* Chart View Toggles */}
        <div className="apcs-nav-tabs" style={{ padding: "0.2rem" }}>
          <button
            className={`apcs-tab-btn ${chartMode === "pm" ? "active" : ""}`}
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
            onClick={() => setChartMode("pm")}
          >
            PM2.5 & PM10
          </button>
          <button
            className={`apcs-tab-btn ${chartMode === "gases" ? "active" : ""}`}
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
            onClick={() => setChartMode("gases")}
          >
            SO₂ & NOx
          </button>
          <button
            className={`apcs-tab-btn ${chartMode === "dp" ? "active" : ""}`}
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
            onClick={() => setChartMode("dp")}
          >
            Filter ΔP (kPa)
          </button>
          <button
            className={`apcs-tab-btn ${chartMode === "efficiency" ? "active" : ""}`}
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.78rem" }}
            onClick={() => setChartMode("efficiency")}
          >
            Efficiency %
          </button>
        </div>
      </div>

      {/* SVG Responsive Polyline Chart */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", minWidth: "600px", height: "auto" }}>
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padTop + chartH * ratio;
            const gridVal = maxVal - ratio * (maxVal - minVal);
            return (
              <g key={i}>
                <line x1={padLeft} y1={y} x2={width - padRight} y2={y} stroke="var(--apcs-border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                <text x={padLeft - 8} y={y + 4} textAnchor="end" fill="var(--apcs-text-dim)" fontSize="10" fontFamily="var(--apcs-font-mono)">
                  {gridVal.toFixed(chartMode === "dp" ? 1 : 0)}
                </text>
              </g>
            );
          })}

          {/* Critical limit line for differential pressure if applicable */}
          {chartMode === "dp" && (
            <g>
              <line x1={padLeft} y1={getY(2.0)} x2={width - padRight} y2={getY(2.0)} stroke="var(--apcs-red)" strokeWidth="1.5" strokeDasharray="5 3" />
              <text x={width - padRight - 5} y={getY(2.0) - 4} textAnchor="end" fill="var(--apcs-red)" fontSize="10" fontWeight="700">
                CRITICAL BLINDING LIMIT (2.0 kPa)
              </text>
            </g>
          )}

          {/* Polyline Series */}
          {series.map((s, sIdx) => {
            const pointsStr = history
              .map((h, i) => `${getX(i)},${getY(h[s.key] ?? 0)}`)
              .join(" ");

            const lastPoint = history[history.length - 1];
            const lastX = getX(history.length - 1);
            const lastY = getY(lastPoint[s.key] ?? 0);

            return (
              <g key={sIdx}>
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.strokeWidth}
                  strokeDasharray={s.isDashed ? "5 4" : "none"}
                  opacity={s.isDashed ? 0.75 : 1}
                />
                {/* Last point glowing marker */}
                <circle cx={lastX} cy={lastY} r="4" fill={s.color} />
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          <text x={padLeft} y={height - 8} fill="var(--apcs-text-dim)" fontSize="10">
            -60s ago
          </text>
          <text x={padLeft + chartW / 2} y={height - 8} textAnchor="middle" fill="var(--apcs-text-dim)" fontSize="10">
            -30s ago
          </text>
          <text x={width - padRight} y={height - 8} textAnchor="end" fill="var(--apcs-text-dim)" fontSize="10">
            Current Live
          </text>
        </svg>
      </div>

      {/* Series Legend */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "0.85rem", justifyContent: "center" }}>
        {series.map((s, idx) => {
          const currentVal = history[history.length - 1]?.[s.key] ?? 0;
          return (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem" }}>
              <div
                style={{
                  width: "14px",
                  height: "4px",
                  backgroundColor: s.color,
                  borderRadius: "2px",
                  borderStyle: s.isDashed ? "dashed" : "solid"
                }}
              />
              <span style={{ color: "var(--apcs-text-muted)" }}>{s.name}:</span>
              <strong style={{ fontFamily: "var(--apcs-font-mono)", color: "var(--apcs-text-bright)" }}>
                {Number(currentVal).toFixed(chartMode === "dp" ? 2 : 1)} {unit}
              </strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
