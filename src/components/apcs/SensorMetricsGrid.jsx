import React from "react";
import { POLLUTANTS } from "../../services/apcsTypes";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function SensorMetricsGrid({ telemetry }) {
  const { inlet, outlet, reduction } = telemetry;

  return (
    <div className="apcs-sensor-grid">
      {Object.keys(POLLUTANTS).map((key) => {
        const pol = POLLUTANTS[key];
        const inVal = inlet[key] ?? 0;
        const outVal = outlet[key] ?? 0;
        const redPct = reduction[key] ?? 0;

        const isCritical = outVal >= pol.criticalLimit;
        const isWarning = outVal >= pol.epaLimit && !isCritical;
        const isCompliant = !isCritical && !isWarning;

        const statusColor = isCritical
          ? "var(--apcs-red)"
          : isWarning
          ? "var(--apcs-amber)"
          : "var(--apcs-emerald)";

        const statusText = isCritical
          ? "BREACHED"
          : isWarning
          ? "ELEVATED"
          : "COMPLIANT";

        return (
          <div
            key={key}
            className="apcs-sensor-card"
            style={{ "--card-color": pol.color }}
          >
            {/* Sensor Card Header */}
            <div className="apcs-sensor-header">
              <div className="apcs-sensor-name-box">
                <div className="apcs-sensor-dot" style={{ backgroundColor: pol.color }} />
                <div>
                  <span className="apcs-sensor-symbol">{pol.name}</span>
                  <div className="apcs-sensor-desc">{pol.fullName}</div>
                </div>
              </div>
              <span className="apcs-sensor-stage-tag">{pol.primaryStage}</span>
            </div>

            {/* In-Line Dual Readings (Raw Flue Inlet vs Cleaned Outlet) */}
            <div className="apcs-readings-row">
              <div className="apcs-reading-col">
                <span className="apcs-reading-tag">Raw Flue Inlet</span>
                <span className="apcs-reading-val inlet">
                  {inVal.toFixed(1)}
                  <span className="apcs-reading-unit">{pol.unit}</span>
                </span>
              </div>
              <div className="apcs-reading-col">
                <span className="apcs-reading-tag">Treated Stack</span>
                <span className="apcs-reading-val outlet">
                  {outVal.toFixed(1)}
                  <span className="apcs-reading-unit">{pol.unit}</span>
                </span>
              </div>
            </div>

            {/* Reduction Meter Bar */}
            <div className="apcs-reduction-meter">
              <div className="apcs-reduction-labels">
                <span>Abatement Efficiency</span>
                <span className="apcs-reduction-percent" style={{ color: pol.color }}>
                  {redPct.toFixed(1)}%
                </span>
              </div>
              <div className="apcs-progress-track">
                <div
                  className="apcs-progress-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, redPct))}%`,
                    background: `linear-gradient(90deg, #10b981, ${pol.color})`
                  }}
                />
              </div>
            </div>

            {/* Regulatory Threshold & Safe Compliance Indicator */}
            <div className="apcs-limit-reference">
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                {isCompliant ? (
                  <ShieldCheck size={14} color="var(--apcs-emerald)" />
                ) : (
                  <AlertTriangle size={14} color={statusColor} />
                )}
                <span style={{ color: statusColor, fontWeight: "700" }}>
                  {statusText}
                </span>
              </div>
              <span>
                EPA Limit: <strong style={{ color: "var(--apcs-text-main)" }}>{pol.epaLimit} {pol.unit}</strong>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
