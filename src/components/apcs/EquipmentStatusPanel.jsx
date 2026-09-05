import React from "react";
import { Zap, Droplets, Filter, Wind, RefreshCw } from "lucide-react";

export default function EquipmentStatusPanel({
  equipment,
  onTriggerPulseJet,
  onEmptyHopper,
  onRefillReagent,
  onRegenerateCarbon,
  pulseJetActive
}) {
  const { cyclone, espBaghouse, scrubber, carbonBed, fanStack } = equipment;

  // Differential Pressure Alert
  const isDpCritical = espBaghouse.diffPressure >= 2.0;
  const isDpWarning = espBaghouse.diffPressure >= 1.6 && !isDpCritical;

  return (
    <div className="apcs-equipment-grid">
      {/* 1. Cyclone Separator */}
      <div className="apcs-equipment-card">
        <div className="apcs-equipment-title-row">
          <span className="apcs-equipment-name">
            <Filter size={18} color="var(--apcs-cyan)" />
            Cyclone Separator
          </span>
          <span className={`apcs-badge-status ${cyclone.hopperLevel > 80 ? "warning" : "active"}`}>
            {cyclone.hopperLevel > 80 ? "HOPPER FULL" : "OPERATIONAL"}
          </span>
        </div>
        <div className="apcs-param-list">
          <div className="apcs-param-row">
            <span className="apcs-param-name">Hopper Fill Level</span>
            <span className="apcs-param-val" style={{ color: cyclone.hopperLevel > 80 ? "var(--apcs-amber)" : "inherit" }}>
              {cyclone.hopperLevel.toFixed(1)}%
            </span>
          </div>
          <div className="apcs-param-row">
            <span className="apcs-param-name">Vortex Inlet Speed</span>
            <span className="apcs-param-val">{cyclone.inletVelocity.toFixed(1)} m/s</span>
          </div>
          <div className="apcs-param-row">
            <span className="apcs-param-name">Mechanical ΔP</span>
            <span className="apcs-param-val">{cyclone.diffPressure.toFixed(2)} kPa</span>
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button
            className="apcs-btn apcs-btn-outline apcs-btn-sm"
            style={{ width: "100%" }}
            onClick={onEmptyHopper}
          >
            <RefreshCw size={13} /> Empty Ash Hopper
          </button>
        </div>
      </div>

      {/* 2. ESP / Baghouse Filter */}
      <div className="apcs-equipment-card" style={{ borderColor: isDpCritical ? "var(--apcs-red)" : isDpWarning ? "var(--apcs-amber)" : "var(--apcs-border)" }}>
        <div className="apcs-equipment-title-row">
          <span className="apcs-equipment-name">
            <Zap size={18} color="var(--apcs-purple)" />
            ESP & Bag Filter
          </span>
          <span className={`apcs-badge-status ${isDpCritical ? "critical" : isDpWarning ? "warning" : "active"}`}>
            {isDpCritical ? "BLINDING ALARM" : isDpWarning ? "HIGH ΔP" : "NORMAL"}
          </span>
        </div>
        <div className="apcs-param-list">
          <div className="apcs-param-row">
            <span className="apcs-param-name">Differential Pressure (ΔP)</span>
            <span className="apcs-param-val" style={{ color: isDpCritical ? "var(--apcs-red)" : isDpWarning ? "var(--apcs-amber)" : "var(--apcs-emerald)" }}>
              {espBaghouse.diffPressure.toFixed(2)} kPa
            </span>
          </div>
          <div className="apcs-param-row">
            <span className="apcs-param-name">Corona Ionization</span>
            <span className="apcs-param-val">{espBaghouse.voltageKV.toFixed(1)} kV / {espBaghouse.currentMA.toFixed(0)} mA</span>
          </div>
          <div className="apcs-param-row">
            <span className="apcs-param-name">Auto Pulse Timer</span>
            <span className="apcs-param-val">{espBaghouse.pulseCountdown}s</span>
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button
            className={`apcs-btn apcs-btn-sm ${pulseJetActive ? "apcs-btn-primary" : "apcs-btn-outline"}`}
            style={{ width: "100%" }}
            onClick={onTriggerPulseJet}
            disabled={pulseJetActive}
          >
            <Zap size={13} /> {pulseJetActive ? "Purging Reverse Jet..." : "Manual Pulse Jet Clean"}
          </button>
        </div>
      </div>

      {/* 3. Wet Gas Scrubber */}
      <div className="apcs-equipment-card">
        <div className="apcs-equipment-title-row">
          <span className="apcs-equipment-name">
            <Droplets size={18} color="var(--apcs-blue)" />
            Gas Scrubber Tower
          </span>
          <span className={`apcs-badge-status ${scrubber.reagentTankPercent < 20 ? "warning" : "active"}`}>
            {scrubber.reagentTankPercent < 20 ? "LOW REAGENT" : "ACTIVE NEUTRALIZING"}
          </span>
        </div>
        <div className="apcs-param-list">
          <div className="apcs-param-row">
            <span className="apcs-param-name">Circulation Flow</span>
            <span className="apcs-param-val">{scrubber.recircFlowLMin.toFixed(0)} L/min</span>
          </div>
          <div className="apcs-param-row">
            <span className="apcs-param-name">Sump Liquor pH</span>
            <span className="apcs-param-val" style={{ color: scrubber.sumpPH < 6.8 ? "var(--apcs-amber)" : "var(--apcs-emerald)" }}>
              {scrubber.sumpPH.toFixed(2)} pH
            </span>
          </div>
          <div className="apcs-param-row">
            <span className="apcs-param-name">NaOH Reagent Tank</span>
            <span className="apcs-param-val">{scrubber.reagentTankPercent.toFixed(1)}%</span>
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button
            className="apcs-btn apcs-btn-outline apcs-btn-sm"
            style={{ width: "100%" }}
            onClick={onRefillReagent}
          >
            <Droplets size={13} /> Refill Alkaline Tank
          </button>
        </div>
      </div>

      {/* 4. Activated Carbon Bed */}
      <div className="apcs-equipment-card">
        <div className="apcs-equipment-title-row">
          <span className="apcs-equipment-name">
            <Filter size={18} color="var(--apcs-emerald)" />
            Activated Carbon Bed
          </span>
          <span className={`apcs-badge-status ${carbonBed.bedSaturationPercent > 80 ? "warning" : "active"}`}>
            {carbonBed.bedSaturationPercent > 80 ? "BED EXHAUSTED" : "ADSORBING"}
          </span>
        </div>
        <div className="apcs-param-list">
          <div className="apcs-param-row">
            <span className="apcs-param-name">Bed Saturation</span>
            <span className="apcs-param-val" style={{ color: carbonBed.bedSaturationPercent > 80 ? "var(--apcs-amber)" : "inherit" }}>
              {carbonBed.bedSaturationPercent.toFixed(1)}%
            </span>
          </div>
          <div className="apcs-param-row">
            <span className="apcs-param-name">VOC Breakthrough Index</span>
            <span className="apcs-param-val">{carbonBed.breakthroughIndex.toFixed(3)}</span>
          </div>
          <div className="apcs-param-row">
            <span className="apcs-param-name">Contact Temperature</span>
            <span className="apcs-param-val">{carbonBed.contactTempC.toFixed(1)} °C</span>
          </div>
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button
            className="apcs-btn apcs-btn-outline apcs-btn-sm"
            style={{ width: "100%" }}
            onClick={onRegenerateCarbon}
          >
            <RefreshCw size={13} /> Regenerate Carbon Bed
          </button>
        </div>
      </div>

      {/* 5. ID Fan & Draft System */}
      <div className="apcs-equipment-card">
        <div className="apcs-equipment-title-row">
          <span className="apcs-equipment-name">
            <Wind size={18} color="var(--apcs-cyan)" />
            ID Fan & Draft Duct
          </span>
          <span className="apcs-badge-status active">VFD ACTIVE</span>
        </div>
        <div className="apcs-param-list">
          <div className="apcs-param-row">
            <span className="apcs-param-name">Volumetric Airflow</span>
            <span className="apcs-param-val">{fanStack.airflowM3H.toLocaleString()} m³/h</span>
          </div>
          <div className="apcs-param-row">
            <span className="apcs-param-name">Impeller Speed</span>
            <span className="apcs-param-val">{fanStack.fanRPM} RPM</span>
          </div>
          <div className="apcs-param-row">
            <span className="apcs-param-name">Negative Duct Draft</span>
            <span className="apcs-param-val">{fanStack.ductDraftPa} Pa</span>
          </div>
        </div>
        <div style={{ marginTop: "1rem", fontSize: "0.72rem", color: "var(--apcs-text-dim)", textAlign: "center" }}>
          Negative static draft ensures no fugitive flue gas leaks.
        </div>
      </div>
    </div>
  );
}
