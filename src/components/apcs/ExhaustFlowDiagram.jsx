import React, { useState } from "react";
import { Info, Activity, Zap } from "lucide-react";

export default function ExhaustFlowDiagram({ equipment, telemetry, pulseJetActive }) {
  const [selectedStage, setSelectedStage] = useState(null);

  const stageData = {
    cyclone: {
      metrics: [
        { label: "Differential Pressure", val: `${equipment.cyclone.diffPressure.toFixed(2)} kPa` },
        { label: "Hopper Dust Level", val: `${equipment.cyclone.hopperLevel.toFixed(1)}%` },
        { label: "Inlet Vortex Velocity", val: `${equipment.cyclone.inletVelocity.toFixed(1)} m/s` }
      ],
      description: "Centrifugal mechanical dust separation for coarse particles (>10 µm) before high-efficiency stages."
    },
    esp: {
      metrics: [
        { label: "Corona Ionization Voltage", val: `${equipment.espBaghouse.voltageKV.toFixed(1)} kV` },
        { label: "Corona Current", val: `${equipment.espBaghouse.currentMA.toFixed(0)} mA` },
        { label: "Baghouse Filter ΔP", val: `${equipment.espBaghouse.diffPressure.toFixed(2)} kPa` },
        { label: "Reverse-Pulse Timer", val: `${equipment.espBaghouse.pulseCountdown}s` }
      ],
      description: "High-voltage electrostatic precipitation charging fine PM2.5 + Teflon-membrane bag filter capture."
    },
    scrubber: {
      metrics: [
        { label: "Sump Liquor pH", val: `${equipment.scrubber.sumpPH.toFixed(2)}` },
        { label: "Recirculation Spray Flow", val: `${equipment.scrubber.recircFlowLMin.toFixed(0)} L/min` },
        { label: "NaOH Reagent Dosing", val: `${equipment.scrubber.reagentDosingLHr.toFixed(1)} L/h` },
        { label: "Chemical Tank Level", val: `${equipment.scrubber.reagentTankPercent.toFixed(1)}%` }
      ],
      description: "Counter-current wet absorption tower neutralizing acidic SO₂ and NOx gases into soluble harmless salts."
    },
    carbon: {
      metrics: [
        { label: "Carbon Bed Saturation", val: `${equipment.carbonBed.bedSaturationPercent.toFixed(1)}%` },
        { label: "VOC Breakthrough Index", val: `${equipment.carbonBed.breakthroughIndex.toFixed(3)}` },
        { label: "Bed Differential Pressure", val: `${equipment.carbonBed.diffPressure.toFixed(2)} kPa` },
        { label: "Bed Temperature", val: `${equipment.carbonBed.contactTempC.toFixed(1)} °C` }
      ],
      description: "Porous micro-crystalline activated carbon bed adsorbing VOCs and trace hydrocarbon vapors."
    },
    outlet: {
      metrics: [
        { label: "Volumetric Airflow", val: `${equipment.fanStack.airflowM3H.toLocaleString()} m³/h` },
        { label: "ID Fan VFD Speed", val: `${equipment.fanStack.fanRPM} RPM` },
        { label: "Negative Duct Draft", val: `${equipment.fanStack.ductDraftPa} Pa` },
        { label: "CEMS Emission Compliance", val: `${telemetry.overallEfficiency.toFixed(1)}%` }
      ],
      description: "Variable frequency Induced Draft fan creating negative draft and clean CEMS stack discharge."
    }
  };

  return (
    <div className="apcs-flow-box">
      <div className="apcs-section-header">
        <div>
          <h3 className="apcs-section-title">
            <Activity size={20} color="var(--apcs-cyan)" />
            Industrial Exhaust Treatment Workflow
          </h3>
          <span className="apcs-section-subtitle">
            Flue Gas Route: Factory Exhaust → Cyclone → ESP / Baghouse → Scrubber → Carbon Bed → ID Fan Stack
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {pulseJetActive && (
            <span className="apcs-badge-status warning" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Zap size={12} /> REVERSE-PULSE JET PURGING
            </span>
          )}
          <span className="apcs-badge-status active">
            ● CLOSED DUCT STREAM ACTIVE
          </span>
        </div>
      </div>

      {/* SVG Industrial Process Flow Diagram */}
      <div className="apcs-flow-svg-container">
        <svg viewBox="0 0 1100 280" className="apcs-flow-svg">
          <defs>
            {/* Gradients */}
            <linearGradient id="pipeGradientInlet" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            <linearGradient id="pipeGradientClean" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <filter id="glowGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND DUCT PIPELINES */}
          {/* Main interconnected flue duct line */}
          <path d="M 60 140 L 980 140" className="apcs-pipe-line" />
          <path d="M 60 140 L 980 140" className="apcs-pipe-flow" />

          {/* STAGE 0: Factory Chimney Inlet */}
          <g transform="translate(30, 80)" className="apcs-flow-node">
            <rect x="0" y="30" width="45" height="100" rx="4" fill="#334155" stroke="#475569" strokeWidth="2" />
            <path d="M 0 30 L 45 30 L 38 10 L 7 10 Z" fill="#475569" />
            {/* Animated dirty smoke puffs */}
            <circle cx="22" cy="0" r="10" fill="rgba(180, 83, 9, 0.45)">
              <animate attributeName="cy" values="0;-25" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="r" values="8;16" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <text x="22" y="150" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="700">FACTORY</text>
            <text x="22" y="164" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="600">RAW EXHAUST</text>
          </g>

          {/* STAGE 1: Cyclone Separator */}
          <g
            transform="translate(160, 60)"
            className="apcs-flow-node"
            onClick={() => setSelectedStage("cyclone")}
          >
            {/* Cyclone Upper Cylinder */}
            <rect x="10" y="20" width="70" height="50" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            {/* Cyclone Conical Lower Body */}
            <polygon points="10,70 80,70 55,125 35,125" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            {/* Dust Hopper Box */}
            <rect x="30" y="125" width="30" height="24" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
            <rect
              x="32"
              y={147 - (equipment.cyclone.hopperLevel / 100) * 20}
              width="26"
              height={(equipment.cyclone.hopperLevel / 100) * 20}
              fill="#f59e0b"
              opacity="0.8"
            />
            {/* Cyclone Vortex Animated Arrows */}
            <path d="M 45 40 Q 65 48 45 56 Q 25 64 45 72" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 3">
              <animate attributeName="stroke-dashoffset" values="14;0" dur="0.8s" repeatCount="indefinite" />
            </path>
            {/* Label */}
            <text x="45" y="170" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">1. CYCLONE</text>
            <text x="45" y="184" textAnchor="middle" fill="#38bdf8" fontSize="10">Dust & PM10</text>
            <text x="45" y="196" textAnchor="middle" fill="#64748b" fontSize="9">Centrifugal</text>
          </g>

          {/* STAGE 2: ESP / Bag Filter */}
          <g
            transform="translate(350, 50)"
            className="apcs-flow-node"
            onClick={() => setSelectedStage("esp")}
          >
            {/* ESP Housing Box */}
            <rect x="0" y="20" width="100" height="115" rx="8" fill="#1e293b" stroke={pulseJetActive ? "#f59e0b" : "#a855f7"} strokeWidth="2.5" />
            {/* High Voltage Corona Insulator Bushing */}
            <rect x="35" y="5" width="30" height="15" rx="3" fill="#7e22ce" />
            {/* Internal Baghouse Filter Tubes / Corona Plates */}
            <line x1="25" y1="35" x2="25" y2="120" stroke="#c084fc" strokeWidth="4" strokeDasharray="3 3" />
            <line x1="50" y1="35" x2="50" y2="120" stroke="#c084fc" strokeWidth="4" strokeDasharray="3 3" />
            <line x1="75" y1="35" x2="75" y2="120" stroke="#c084fc" strokeWidth="4" strokeDasharray="3 3" />
            {/* Corona Spark Symbol */}
            <path d="M 45 22 L 55 22 L 48 30 L 56 30 L 42 42 L 46 32 L 40 32 Z" fill="#fbbf24">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="0.6s" repeatCount="indefinite" />
            </path>
            {/* Pulse Jet Manifold Header */}
            <rect x="10" y="22" width="80" height="5" fill="#f59e0b" opacity={pulseJetActive ? 1 : 0.4} />
            {/* Labels */}
            <text x="50" y="170" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">2. ESP / BAGHOUSE</text>
            <text x="50" y="184" textAnchor="middle" fill="#c084fc" fontSize="10">PM2.5 Capture</text>
            <text x="50" y="196" textAnchor="middle" fill="#64748b" fontSize="9">{equipment.espBaghouse.voltageKV.toFixed(0)} kV | ΔP: {equipment.espBaghouse.diffPressure.toFixed(2)}k</text>
          </g>

          {/* STAGE 3: Wet Gas Scrubber */}
          <g
            transform="translate(550, 45)"
            className="apcs-flow-node"
            onClick={() => setSelectedStage("scrubber")}
          >
            {/* Column Vessel */}
            <rect x="10" y="15" width="75" height="125" rx="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5" />
            {/* Packed Bed Area */}
            <rect x="18" y="65" width="59" height="40" fill="#0f172a" stroke="#1d4ed8" strokeWidth="1" strokeDasharray="2 2" />
            {/* Spray Nozzles */}
            <circle cx="35" cy="45" r="4" fill="#60a5fa" />
            <circle cx="60" cy="45" r="4" fill="#60a5fa" />
            {/* Liquid Droplets Falling */}
            <path d="M 35 48 L 30 62 M 35 48 L 40 62 M 60 48 L 55 62 M 60 48 L 65 62" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3">
              <animate attributeName="stroke-dashoffset" values="0;12" dur="0.7s" repeatCount="indefinite" />
            </path>
            {/* Sump Liquid Bottom */}
            <rect x="12" y="120" width="71" height="18" rx="4" fill="#2563eb" opacity="0.6" />
            {/* Labels */}
            <text x="47" y="170" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">3. GAS SCRUBBER</text>
            <text x="47" y="184" textAnchor="middle" fill="#60a5fa" fontSize="10">SO₂ & NOx Absorb</text>
            <text x="47" y="196" textAnchor="middle" fill="#64748b" fontSize="9">pH {equipment.scrubber.sumpPH.toFixed(1)} | {equipment.scrubber.recircFlowLMin.toFixed(0)} L/m</text>
          </g>

          {/* STAGE 4: Activated Carbon Bed */}
          <g
            transform="translate(730, 55)"
            className="apcs-flow-node"
            onClick={() => setSelectedStage("carbon")}
          >
            {/* Adsorption Vessel */}
            <rect x="10" y="20" width="75" height="105" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="2.5" />
            {/* Carbon Granules Texture */}
            <rect x="18" y="40" width="59" height="65" fill="#091410" stroke="#059669" strokeWidth="1" />
            {/* Carbon Granule dots */}
            <circle cx="28" cy="52" r="2.5" fill="#10b981" opacity="0.6" />
            <circle cx="45" cy="55" r="2.5" fill="#10b981" opacity="0.7" />
            <circle cx="62" cy="50" r="2.5" fill="#10b981" opacity="0.5" />
            <circle cx="34" cy="72" r="2.5" fill="#10b981" opacity="0.8" />
            <circle cx="55" cy="76" r="2.5" fill="#10b981" opacity="0.7" />
            <circle cx="42" cy="90" r="2.5" fill="#10b981" opacity="0.6" />
            {/* Labels */}
            <text x="47" y="170" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">4. CARBON BED</text>
            <text x="47" y="184" textAnchor="middle" fill="#34d399" fontSize="10">VOCs & Odors</text>
            <text x="47" y="196" textAnchor="middle" fill="#64748b" fontSize="9">Sat: {equipment.carbonBed.bedSaturationPercent.toFixed(0)}%</text>
          </g>

          {/* STAGE 5: ID Fan & Clean Emission Stack */}
          <g
            transform="translate(900, 30)"
            className="apcs-flow-node"
            onClick={() => setSelectedStage("outlet")}
          >
            {/* ID Fan Blower Housing */}
            <circle cx="30" cy="110" r="25" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            {/* Fan Impeller Blades Animated */}
            <g transform="translate(30, 110)">
              <circle cx="0" cy="0" r="5" fill="#38bdf8" />
              <line x1="-16" y1="0" x2="16" y2="0" stroke="#38bdf8" strokeWidth="3" />
              <line x1="0" y1="-16" x2="0" y2="16" stroke="#38bdf8" strokeWidth="3" />
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="360"
                dur="1s"
                repeatCount="indefinite"
              />
            </g>
            {/* Tall Discharge Stack */}
            <path d="M 50 110 L 65 110 L 62 15 L 53 15 Z" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            {/* CEMS Sensor Probe on Stack */}
            <circle cx="57" cy="55" r="4" fill="#10b981" />
            <line x1="57" y1="55" x2="80" y2="55" stroke="#10b981" strokeWidth="1" strokeDasharray="2 1" />
            <text x="83" y="58" fill="#10b981" fontSize="9" fontWeight="700">CEMS</text>
            {/* Clean scrubbed plume (Transparent light cyan) */}
            <circle cx="57" cy="5" r="8" fill="rgba(16, 185, 129, 0.4)">
              <animate attributeName="cy" values="5;-25" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="r" values="8;18" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="1.8s" repeatCount="indefinite" />
            </circle>
            {/* Labels */}
            <text x="57" y="170" textAnchor="middle" fill="#f8fafc" fontSize="12" fontWeight="700">5. ID FAN / STACK</text>
            <text x="57" y="184" textAnchor="middle" fill="#10b981" fontSize="10">CLEANED OUTLET</text>
            <text x="57" y="196" textAnchor="middle" fill="#64748b" fontSize="9">{equipment.fanStack.airflowM3H.toLocaleString()} m³/h</text>
          </g>
        </svg>
      </div>

      {/* Stage Detail Drawer / Modal if clicked */}
      {selectedStage && (
        <div style={{
          marginTop: "1rem",
          background: "var(--apcs-bg-card)",
          border: "1px solid var(--apcs-border-glow)",
          borderRadius: "var(--apcs-radius-md)",
          padding: "1rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
              <Info size={16} color="var(--apcs-cyan)" />
              <strong style={{ color: "var(--apcs-text-bright)", textTransform: "uppercase" }}>
                {selectedStage.toUpperCase()} SUB-SYSTEM SPECIFICATIONS
              </strong>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--apcs-text-muted)" }}>
              {stageData[selectedStage].description}
            </div>
          </div>
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            {stageData[selectedStage].metrics.map((m, idx) => (
              <div key={idx} style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--apcs-text-dim)" }}>{m.label}</div>
                <div style={{ fontFamily: "var(--apcs-font-mono)", fontWeight: "800", color: "var(--apcs-text-bright)" }}>
                  {m.val}
                </div>
              </div>
            ))}
            <button
              className="apcs-btn apcs-btn-outline apcs-btn-sm"
              onClick={() => setSelectedStage(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
