import React, { useState, useEffect } from "react";
import { apcsEngineInstance } from "../../services/apcsSimulationEngine";
import ExhaustFlowDiagram from "./ExhaustFlowDiagram";
import SensorMetricsGrid from "./SensorMetricsGrid";
import EquipmentStatusPanel from "./EquipmentStatusPanel";
import ControlConsole from "./ControlConsole";
import HistoricalCharts from "./HistoricalCharts";
import ComplianceReports from "./ComplianceReports";
import AlertCenter from "./AlertCenter";
import SystemArchitectureModal from "./SystemArchitectureModal";
import "../../styles/apcs.css";

import {
  Activity,
  Wind,
  Shield,
  Gauge,
  TrendingUp,
  FileText,
  AlertTriangle,
  BookOpen,
  Sun,
  Moon,
  Zap
} from "lucide-react";

export default function AirPollutionControlSystem({ currentTheme, onToggleTheme }) {
  // Pull initial state from singleton engine
  const [telemetry, setTelemetry] = useState(() => apcsEngineInstance.telemetry);
  const [equipment, setEquipment] = useState(() => ({ ...apcsEngineInstance.equipment }));
  const [alarms, setAlarms] = useState(() => [...apcsEngineInstance.alarms]);
  const [history, setHistory] = useState(() => [...apcsEngineInstance.history]);
  const [controlMode, setControlMode] = useState(apcsEngineInstance.controlMode);
  const [activeScenario, setActiveScenario] = useState(apcsEngineInstance.activeScenario);
  const [emergencyStop, setEmergencyStop] = useState(apcsEngineInstance.emergencyStop);
  const [pulseJetActive, setPulseJetActive] = useState(apcsEngineInstance.pulseJetActive);

  // Active View Tab: 'scada' | 'charts' | 'reports' | 'alarms'
  const [activeTab, setActiveTab] = useState("scada");
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  // Continuous 1-second industrial SCADA polling loop
  useEffect(() => {
    const timer = setInterval(() => {
      const newTelemetry = apcsEngineInstance.tick();
      setTelemetry({ ...newTelemetry });
      setEquipment({
        cyclone: { ...apcsEngineInstance.equipment.cyclone },
        espBaghouse: { ...apcsEngineInstance.equipment.espBaghouse },
        scrubber: { ...apcsEngineInstance.equipment.scrubber },
        carbonBed: { ...apcsEngineInstance.equipment.carbonBed },
        fanStack: { ...apcsEngineInstance.equipment.fanStack }
      });
      setAlarms([...apcsEngineInstance.alarms]);
      setHistory([...apcsEngineInstance.history]);
      setPulseJetActive(apcsEngineInstance.pulseJetActive);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handler functions
  const handleSetControlMode = (mode) => {
    apcsEngineInstance.setControlMode(mode);
    setControlMode(mode);
  };

  const handleSetScenario = (scenarioId) => {
    apcsEngineInstance.setScenario(scenarioId);
    setActiveScenario(scenarioId);
    setEquipment({
      cyclone: { ...apcsEngineInstance.equipment.cyclone },
      espBaghouse: { ...apcsEngineInstance.equipment.espBaghouse },
      scrubber: { ...apcsEngineInstance.equipment.scrubber },
      carbonBed: { ...apcsEngineInstance.equipment.carbonBed },
      fanStack: { ...apcsEngineInstance.equipment.fanStack }
    });
  };

  const handleToggleEStop = () => {
    apcsEngineInstance.toggleEmergencyStop();
    setEmergencyStop(apcsEngineInstance.emergencyStop);
    setEquipment({
      cyclone: { ...apcsEngineInstance.equipment.cyclone },
      espBaghouse: { ...apcsEngineInstance.equipment.espBaghouse },
      scrubber: { ...apcsEngineInstance.equipment.scrubber },
      carbonBed: { ...apcsEngineInstance.equipment.carbonBed },
      fanStack: { ...apcsEngineInstance.equipment.fanStack }
    });
  };

  const handleTriggerPulseJet = () => {
    apcsEngineInstance.triggerManualPulseJet();
    setPulseJetActive(true);
    setEquipment({
      cyclone: { ...apcsEngineInstance.equipment.cyclone },
      espBaghouse: { ...apcsEngineInstance.equipment.espBaghouse },
      scrubber: { ...apcsEngineInstance.equipment.scrubber },
      carbonBed: { ...apcsEngineInstance.equipment.carbonBed },
      fanStack: { ...apcsEngineInstance.equipment.fanStack }
    });
  };

  const handleEmptyHopper = () => {
    apcsEngineInstance.emptyCycloneHopper();
    setEquipment({
      cyclone: { ...apcsEngineInstance.equipment.cyclone },
      espBaghouse: { ...apcsEngineInstance.equipment.espBaghouse },
      scrubber: { ...apcsEngineInstance.equipment.scrubber },
      carbonBed: { ...apcsEngineInstance.equipment.carbonBed },
      fanStack: { ...apcsEngineInstance.equipment.fanStack }
    });
  };

  const handleRefillReagent = () => {
    apcsEngineInstance.replenishReagentTank();
    setEquipment({
      cyclone: { ...apcsEngineInstance.equipment.cyclone },
      espBaghouse: { ...apcsEngineInstance.equipment.espBaghouse },
      scrubber: { ...apcsEngineInstance.equipment.scrubber },
      carbonBed: { ...apcsEngineInstance.equipment.carbonBed },
      fanStack: { ...apcsEngineInstance.equipment.fanStack }
    });
  };

  const handleRegenerateCarbon = () => {
    apcsEngineInstance.regenerateCarbonBed();
    setEquipment({
      cyclone: { ...apcsEngineInstance.equipment.cyclone },
      espBaghouse: { ...apcsEngineInstance.equipment.espBaghouse },
      scrubber: { ...apcsEngineInstance.equipment.scrubber },
      carbonBed: { ...apcsEngineInstance.equipment.carbonBed },
      fanStack: { ...apcsEngineInstance.equipment.fanStack }
    });
  };

  const handleUpdateManualParam = (param, value) => {
    if (param === "espVoltage") {
      apcsEngineInstance.equipment.espBaghouse.voltageKV = value;
    } else if (param === "scrubberFlow") {
      apcsEngineInstance.equipment.scrubber.recircFlowLMin = value;
    } else if (param === "fanAirflow") {
      apcsEngineInstance.equipment.fanStack.airflowM3H = value;
    }
    setEquipment({
      cyclone: { ...apcsEngineInstance.equipment.cyclone },
      espBaghouse: { ...apcsEngineInstance.equipment.espBaghouse },
      scrubber: { ...apcsEngineInstance.equipment.scrubber },
      carbonBed: { ...apcsEngineInstance.equipment.carbonBed },
      fanStack: { ...apcsEngineInstance.equipment.fanStack }
    });
  };

  const handleAcknowledgeAlarm = (alarmId) => {
    apcsEngineInstance.acknowledgeAlarm(alarmId);
    setAlarms([...apcsEngineInstance.alarms]);
  };

  const handleClearAcknowledged = () => {
    apcsEngineInstance.clearAcknowledgedAlarms();
    setAlarms([...apcsEngineInstance.alarms]);
  };

  const unackAlarmsCount = alarms.filter((a) => !a.acknowledged).length;
  const aq = telemetry.airQualityStatus;

  return (
    <div className="apcs-container" data-theme={currentTheme}>
      {/* Top Header / SCADA Status Strip */}
      <header className="apcs-header">
        <div className="apcs-branding">
          <div className="apcs-brand-icon-box">
            <Activity size={26} />
          </div>
          <div>
            <h1 className="apcs-brand-title">
              AeroPulse APCS
              <span className="apcs-system-badge" style={{ backgroundColor: aq.bg, color: aq.color, border: `1px solid ${aq.color}` }}>
                ● {aq.label}
              </span>
            </h1>
            <p className="apcs-brand-subtitle">
              <span>Industrial Flue Gas Abatement & Continuous Emission Monitoring System</span>
              <span style={{ color: "var(--apcs-border)" }}>|</span>
              <span style={{ color: "var(--apcs-cyan)", fontWeight: "600" }}>SCADA Station #04-ALPHA</span>
            </p>
          </div>
        </div>

        {/* Global Controls & Status Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Mode Pill */}
          <div
            className="apcs-system-badge"
            style={{
              background: controlMode === "AUTO" ? "var(--apcs-cyan-glow)" : "var(--apcs-amber-glow)",
              color: controlMode === "AUTO" ? "var(--apcs-cyan)" : "var(--apcs-amber)",
              border: `1px solid ${controlMode === "AUTO" ? "var(--apcs-cyan)" : "var(--apcs-amber)"}`
            }}
          >
            {controlMode === "AUTO" ? "AUTO CLOSED-LOOP" : "MANUAL OVERRIDE"}
          </div>

          {/* Alarm Bell Button */}
          <button
            className={`apcs-btn apcs-btn-sm ${unackAlarmsCount > 0 ? "apcs-btn-danger" : "apcs-btn-outline"}`}
            onClick={() => setActiveTab("alarms")}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <AlertTriangle size={14} />
            Alarms ({unackAlarmsCount})
          </button>

          {/* Architecture & Physics Documentation Modal Button */}
          <button
            className="apcs-btn apcs-btn-outline apcs-btn-sm"
            onClick={() => setIsArchModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <BookOpen size={14} />
            System Docs
          </button>

          {/* Theme Toggle */}
          <button
            className="apcs-btn apcs-btn-outline apcs-btn-sm"
            onClick={onToggleTheme}
            title="Toggle Light/Dark Theme"
          >
            {currentTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main Navigation Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <nav className="apcs-nav-tabs">
          <button
            className={`apcs-tab-btn ${activeTab === "scada" ? "active" : ""}`}
            onClick={() => setActiveTab("scada")}
          >
            <Activity size={16} /> Live SCADA Dashboard
          </button>
          <button
            className={`apcs-tab-btn ${activeTab === "charts" ? "active" : ""}`}
            onClick={() => setActiveTab("charts")}
          >
            <TrendingUp size={16} /> Historical Graphs
          </button>
          <button
            className={`apcs-tab-btn ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <FileText size={16} /> Compliance Reports
          </button>
          <button
            className={`apcs-tab-btn ${activeTab === "alarms" ? "active" : ""}`}
            onClick={() => setActiveTab("alarms")}
          >
            <AlertTriangle size={16} /> Alert Center {unackAlarmsCount > 0 && `(${unackAlarmsCount})`}
          </button>
        </nav>

        <div style={{ fontSize: "0.8rem", color: "var(--apcs-text-dim)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="apcs-badge-status active" style={{ padding: "0.15rem 0.5rem" }}>
            ● CEMS TELEMETRY SYNCED
          </span>
          <span>Updated: {telemetry.timestamp}</span>
        </div>
      </div>

      {/* System Boundary Notification Banner */}
      <div className="apcs-boundary-callout">
        <strong>⚙️ INDUSTRIAL SYSTEM BOUNDARY NOTICE:</strong> This SCADA control system monitors and abates industrial flue emissions traveling through the facility's enclosed exhaust ducting and stack. It cleans high-concentration process exhaust before release into the atmosphere, ensuring strict compliance with EPA standards.
      </div>

      {/* Key Real-Time Telemetry Strip */}
      <div className="apcs-telemetry-strip">
        <div className="apcs-strip-card" style={{ "--strip-accent": "var(--apcs-cyan)" }}>
          <div>
            <div className="apcs-strip-label">Clean Stack PM2.5</div>
            <div className="apcs-strip-val">
              {telemetry.outlet.pm25?.toFixed(1) || "0.0"} <small>µg/m³</small>
            </div>
          </div>
          <div className="apcs-strip-icon-box">
            <Wind size={20} />
          </div>
        </div>

        <div className="apcs-strip-card" style={{ "--strip-accent": "var(--apcs-blue)" }}>
          <div>
            <div className="apcs-strip-label">Clean Stack PM10</div>
            <div className="apcs-strip-val">
              {telemetry.outlet.pm10?.toFixed(1) || "0.0"} <small>µg/m³</small>
            </div>
          </div>
          <div className="apcs-strip-icon-box">
            <Gauge size={20} />
          </div>
        </div>

        <div className="apcs-strip-card" style={{ "--strip-accent": "var(--apcs-purple)" }}>
          <div>
            <div className="apcs-strip-label">Filter Differential ΔP</div>
            <div className="apcs-strip-val" style={{ color: equipment.espBaghouse.diffPressure > 1.8 ? "var(--apcs-red)" : "inherit" }}>
              {equipment.espBaghouse.diffPressure.toFixed(2)} <small>kPa</small>
            </div>
          </div>
          <div className="apcs-strip-icon-box">
            <Zap size={20} />
          </div>
        </div>

        <div className="apcs-strip-card" style={{ "--strip-accent": "var(--apcs-emerald)" }}>
          <div>
            <div className="apcs-strip-label">Induced Draft Airflow</div>
            <div className="apcs-strip-val">
              {equipment.fanStack.airflowM3H.toLocaleString()} <small>m³/h</small>
            </div>
          </div>
          <div className="apcs-strip-icon-box">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Hero Pollution Reduction Percentage Bar */}
      <div className="apcs-efficiency-hero">
        <div className="apcs-efficiency-info">
          <h2 className="apcs-efficiency-title">
            <Shield size={24} color="var(--apcs-emerald)" />
            Real-Time Flue Gas Abatement Efficiency
          </h2>
          <p className="apcs-efficiency-desc">
            Composite reduction across all 7 monitored industrial pollutants (PM2.5, PM10, Dust, SO₂, NOx, CO, VOCs) measured between factory inlet duct and CEMS emission stack.
          </p>
        </div>
        <div className="apcs-efficiency-stat">
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--apcs-text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Abatement Rate
            </div>
            <div className="apcs-efficiency-number">
              {telemetry.overallEfficiency.toFixed(1)}
              <small>%</small>
            </div>
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: Primary Live SCADA Dashboard */}
      {activeTab === "scada" && (
        <>
          {/* Animated 5-Stage Flue Gas Process Flow */}
          <ExhaustFlowDiagram
            equipment={equipment}
            telemetry={telemetry}
            pulseJetActive={pulseJetActive}
          />

          {/* 7 Large Continuous Telemetry Sensor Cards */}
          <div className="apcs-section-header" style={{ marginTop: "1rem" }}>
            <div>
              <h3 className="apcs-section-title">
                <Gauge size={20} color="var(--apcs-cyan)" />
                Continuous In-Line Flue Gas Analysers
              </h3>
              <span className="apcs-section-subtitle">
                Dual telemetry comparison: Raw Pre-Treatment Inlet vs. Cleaned Post-Treatment Stack
              </span>
            </div>
          </div>
          <SensorMetricsGrid telemetry={telemetry} />

          {/* Stage Equipment Diagnostics & Health */}
          <div className="apcs-section-header" style={{ marginTop: "1.5rem" }}>
            <div>
              <h3 className="apcs-section-title">
                <Zap size={20} color="var(--apcs-purple)" />
                Subsystem Equipment & Filtration Diagnostics
              </h3>
              <span className="apcs-section-subtitle">
                Differential pressures, corona fields, scrubbing liquor chemistry, and adsorption bed health
              </span>
            </div>
          </div>
          <EquipmentStatusPanel
            equipment={equipment}
            onTriggerPulseJet={handleTriggerPulseJet}
            onEmptyHopper={handleEmptyHopper}
            onRefillReagent={handleRefillReagent}
            onRegenerateCarbon={handleRegenerateCarbon}
            pulseJetActive={pulseJetActive}
          />

          {/* SCADA Auto / Manual Control Console & Scenario Presets */}
          <ControlConsole
            controlMode={controlMode}
            onSetControlMode={handleSetControlMode}
            activeScenario={activeScenario}
            onSetScenario={handleSetScenario}
            emergencyStop={emergencyStop}
            onToggleEStop={handleToggleEStop}
            equipment={equipment}
            onUpdateManualParam={handleUpdateManualParam}
          />
        </>
      )}

      {/* TAB CONTENT 2: Historical Charts */}
      {activeTab === "charts" && (
        <HistoricalCharts history={history} />
      )}

      {/* TAB CONTENT 3: Compliance Reports */}
      {activeTab === "reports" && (
        <ComplianceReports getReport={(p) => apcsEngineInstance.getComplianceReport(p)} />
      )}

      {/* TAB CONTENT 4: Alert Center */}
      {activeTab === "alarms" && (
        <AlertCenter
          alarms={alarms}
          onAcknowledge={handleAcknowledgeAlarm}
          onClearAcknowledged={handleClearAcknowledged}
        />
      )}

      {/* System Engineering Architecture & Physics Modal */}
      <SystemArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}
