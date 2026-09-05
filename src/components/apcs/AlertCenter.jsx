import React, { useState } from "react";
import { AlertTriangle, Check, Trash2, Volume2, VolumeX } from "lucide-react";

export default function AlertCenter({ alarms, onAcknowledge, onClearAcknowledged }) {
  const [filterSeverity, setFilterSeverity] = useState("ALL");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const filtered = alarms.filter((a) => {
    if (filterSeverity === "ALL") return true;
    return a.severity === filterSeverity;
  });

  const unacknowledgedCount = alarms.filter((a) => !a.acknowledged).length;

  return (
    <div className="apcs-alarm-panel">
      <div className="apcs-section-header">
        <div>
          <h3 className="apcs-section-title">
            <AlertTriangle size={20} color="var(--apcs-amber)" />
            Real-Time Industrial Annunciator & Alarm Center
          </h3>
          <span className="apcs-section-subtitle">
            {unacknowledgedCount} unacknowledged active alarm{unacknowledgedCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Sound Toggle */}
          <button
            className="apcs-btn apcs-btn-outline apcs-btn-sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle Annunciator Buzzer"
          >
            {soundEnabled ? <Volume2 size={14} color="var(--apcs-cyan)" /> : <VolumeX size={14} color="var(--apcs-text-dim)" />}
            {soundEnabled ? "Buzzer On" : "Muted"}
          </button>

          {/* Severity Filters */}
          <div className="apcs-nav-tabs" style={{ padding: "0.2rem" }}>
            <button
              className={`apcs-tab-btn ${filterSeverity === "ALL" ? "active" : ""}`}
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
              onClick={() => setFilterSeverity("ALL")}
            >
              All ({alarms.length})
            </button>
            <button
              className={`apcs-tab-btn ${filterSeverity === "CRITICAL" ? "active" : ""}`}
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
              onClick={() => setFilterSeverity("CRITICAL")}
            >
              Critical
            </button>
            <button
              className={`apcs-tab-btn ${filterSeverity === "WARNING" ? "active" : ""}`}
              style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
              onClick={() => setFilterSeverity("WARNING")}
            >
              Warning
            </button>
          </div>

          {/* Clear Button */}
          <button
            className="apcs-btn apcs-btn-outline apcs-btn-sm"
            onClick={onClearAcknowledged}
          >
            <Trash2 size={13} /> Clear Acked
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "var(--apcs-text-dim)", fontSize: "0.85rem" }}>
          No active alarms matching current criteria. All systems normal.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="apcs-alarm-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Time</th>
                <th>Alarm Code</th>
                <th>Message Description</th>
                <th>Count</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((al) => {
                const isCrit = al.severity === "CRITICAL";
                const isWarn = al.severity === "WARNING";
                const sevColor = isCrit ? "var(--apcs-red)" : isWarn ? "var(--apcs-amber)" : "var(--apcs-cyan)";

                return (
                  <tr
                    key={al.id}
                    className={`apcs-alarm-row ${isCrit ? "critical" : isWarn ? "warning" : ""}`}
                    style={{ opacity: al.acknowledged ? 0.6 : 1 }}
                  >
                    <td>
                      <span
                        className="apcs-badge-status"
                        style={{
                          background: isCrit ? "var(--apcs-red-glow)" : isWarn ? "var(--apcs-amber-glow)" : "var(--apcs-cyan-glow)",
                          color: sevColor,
                          border: `1px solid ${sevColor}`
                        }}
                      >
                        {al.severity}
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--apcs-font-mono)", fontSize: "0.8rem" }}>
                      {al.time}
                    </td>
                    <td>
                      <code style={{ fontFamily: "var(--apcs-font-mono)", fontWeight: "700", color: "var(--apcs-text-bright)" }}>
                        {al.code}
                      </code>
                    </td>
                    <td>{al.message}</td>
                    <td>
                      <span className="apcs-sensor-stage-tag">{al.count}x</span>
                    </td>
                    <td>
                      {!al.acknowledged ? (
                        <button
                          className="apcs-btn apcs-btn-outline apcs-btn-sm"
                          style={{ padding: "0.25rem 0.6rem" }}
                          onClick={() => onAcknowledge(al.id)}
                        >
                          <Check size={12} /> Ack
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.75rem", color: "var(--apcs-text-dim)" }}>
                          Acknowledged
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
