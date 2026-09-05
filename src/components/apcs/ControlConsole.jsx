import React from "react";
import { SIMULATION_SCENARIOS } from "../../services/apcsTypes";
import { Sliders, Shield, Flame, Power } from "lucide-react";

export default function ControlConsole({
  controlMode,
  onSetControlMode,
  activeScenario,
  onSetScenario,
  emergencyStop,
  onToggleEStop,
  equipment,
  onUpdateManualParam
}) {
  return (
    <div className="apcs-control-console">
      <div className="apcs-section-header">
        <div>
          <h3 className="apcs-section-title">
            <Sliders size={20} color="var(--apcs-cyan)" />
            SCADA Control Station & Automated Closed-Loop Logic
          </h3>
          <span className="apcs-section-subtitle">
            Autonomous Proportional-Integral Response Engine & Safety Interlock Gateway
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Mode Switcher */}
          <div style={{ display: "flex", background: "var(--apcs-bg-card)", padding: "0.25rem", borderRadius: "var(--apcs-radius-sm)", border: "1px solid var(--apcs-border)" }}>
            <button
              className={`apcs-btn apcs-btn-sm ${controlMode === "AUTO" ? "apcs-btn-primary" : "apcs-btn-outline"}`}
              style={{ border: "none" }}
              onClick={() => onSetControlMode("AUTO")}
            >
              AUTO LOOP
            </button>
            <button
              className={`apcs-btn apcs-btn-sm ${controlMode === "MANUAL" ? "apcs-btn-primary" : "apcs-btn-outline"}`}
              style={{ border: "none" }}
              onClick={() => onSetControlMode("MANUAL")}
            >
              MANUAL OVERRIDE
            </button>
          </div>

          {/* Master Emergency Stop Button */}
          <button
            className={`apcs-btn ${emergencyStop ? "apcs-btn-primary" : "apcs-btn-danger"}`}
            onClick={onToggleEStop}
            style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Power size={16} />
            {emergencyStop ? "SYSTEM TRIPPED (RESET E-STOP)" : "EMERGENCY STOP (E-STOP)"}
          </button>
        </div>
      </div>

      {emergencyStop && (
        <div className="apcs-boundary-callout" style={{ borderColor: "var(--apcs-red)", background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5" }}>
          <strong>⚠️ SAFETY LOCKOUT ENGAGED:</strong> High voltage power supplies, scrubber pumps, and draft blowers have been halted in fail-safe state. Press Reset E-Stop above to resume normal operations.
        </div>
      )}

      <div className="apcs-console-grid">
        {/* Box 1: Automatic Logic Feedback Rules */}
        <div className="apcs-control-group">
          <h4 className="apcs-control-title">
            <Shield size={16} />
            Closed-Loop Control Matrix
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.8rem", color: "var(--apcs-text-muted)" }}>
            <div style={{ padding: "0.5rem", background: "var(--apcs-bg-panel)", borderRadius: "4px", borderLeft: "3px solid var(--apcs-cyan)" }}>
              <strong style={{ color: "var(--apcs-text-bright)" }}>1. Particulate Surge Response:</strong>
              <div>If PM2.5 / PM10 increases, SCADA automatically ramps ESP ionization (up to 65 kV) and shortens reverse-pulse jet interval for accelerated cleaning.</div>
            </div>

            <div style={{ padding: "0.5rem", background: "var(--apcs-bg-panel)", borderRadius: "4px", borderLeft: "3px solid var(--apcs-blue)" }}>
              <strong style={{ color: "var(--apcs-text-bright)" }}>2. Acid Gas Neutralizer:</strong>
              <div>If SO₂ or NOx surges, SCADA automatically ramps scrubber counter-flow spray pumps (up to 290 L/min) and increases NaOH dosing to prevent acid emission.</div>
            </div>

            <div style={{ padding: "0.5rem", background: "var(--apcs-bg-panel)", borderRadius: "4px", borderLeft: "3px solid var(--apcs-amber)" }}>
              <strong style={{ color: "var(--apcs-text-bright)" }}>3. Filter Cake Overload Protection:</strong>
              <div>If baghouse ΔP exceeds 1.85 kPa, automated pulse-jet purges dislodge dust cake. If ΔP &gt; 2.5 kPa, maintenance alert trips without bypassing containment.</div>
            </div>

            <div style={{ padding: "0.5rem", background: "var(--apcs-bg-panel)", borderRadius: "4px", borderLeft: "3px solid var(--apcs-red)" }}>
              <strong style={{ color: "var(--apcs-text-bright)" }}>4. Inviolable Safety Interlocks:</strong>
              <div>Induced Draft fan automatically trips if scrubber liquid circulation drops to 0, preventing hot gas bypass and corrosion damage.</div>
            </div>
          </div>
        </div>

        {/* Box 2: Simulation Scenario Presets */}
        <div className="apcs-control-group">
          <h4 className="apcs-control-title">
            <Flame size={16} />
            Test Scenario Injector
          </h4>
          <div className="apcs-scenario-list">
            {Object.keys(SIMULATION_SCENARIOS).map((key) => {
              const sc = SIMULATION_SCENARIOS[key];
              const isActive = activeScenario === key;
              return (
                <button
                  key={key}
                  className={`apcs-scenario-btn ${isActive ? "active" : ""}`}
                  onClick={() => onSetScenario(key)}
                >
                  <div className="apcs-scenario-name">{sc.name}</div>
                  <div className="apcs-scenario-desc">{sc.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Box 3: Manual Actuator Sliders (Interactive in MANUAL mode) */}
        <div className="apcs-control-group">
          <h4 className="apcs-control-title">
            <Sliders size={16} />
            Actuator Tuning {controlMode === "AUTO" ? "(Locked by SCADA Auto)" : "(Live Manual Control)"}
          </h4>

          {/* Slider 1: ESP Voltage */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
              <span>ESP Corona Voltage:</span>
              <strong style={{ fontFamily: "var(--apcs-font-mono)", color: "var(--apcs-cyan)" }}>
                {equipment.espBaghouse.voltageKV.toFixed(1)} kV
              </strong>
            </div>
            <input
              type="range"
              min="35"
              max="65"
              step="0.5"
              value={equipment.espBaghouse.voltageKV}
              disabled={controlMode === "AUTO" || emergencyStop}
              onChange={(e) => onUpdateManualParam("espVoltage", parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--apcs-cyan)" }}
            />
          </div>

          {/* Slider 2: Scrubber Liquid Flow */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
              <span>Scrubber Spray Rate:</span>
              <strong style={{ fontFamily: "var(--apcs-font-mono)", color: "var(--apcs-blue)" }}>
                {equipment.scrubber.recircFlowLMin.toFixed(0)} L/min
              </strong>
            </div>
            <input
              type="range"
              min="80"
              max="300"
              step="5"
              value={equipment.scrubber.recircFlowLMin}
              disabled={controlMode === "AUTO" || emergencyStop}
              onChange={(e) => onUpdateManualParam("scrubberFlow", parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--apcs-blue)" }}
            />
          </div>

          {/* Slider 3: ID Fan Airflow */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
              <span>ID Fan Airflow Volume:</span>
              <strong style={{ fontFamily: "var(--apcs-font-mono)", color: "var(--apcs-emerald)" }}>
                {equipment.fanStack.airflowM3H.toLocaleString()} m³/h
              </strong>
            </div>
            <input
              type="range"
              min="8000"
              max="22000"
              step="500"
              value={equipment.fanStack.airflowM3H}
              disabled={controlMode === "AUTO" || emergencyStop}
              onChange={(e) => onUpdateManualParam("fanAirflow", parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--apcs-emerald)" }}
            />
          </div>

          <div style={{ fontSize: "0.72rem", color: "var(--apcs-text-dim)", marginTop: "0.5rem" }}>
            * Note: In AUTO mode, the SCADA controller autonomously modulates these actuators according to continuous inlet gas analyzers. Switch to MANUAL OVERRIDE to test manual adjustments.
          </div>
        </div>
      </div>
    </div>
  );
}
