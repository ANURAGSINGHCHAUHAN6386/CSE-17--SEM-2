import React from "react";
import { X, BookOpen, Layers, Radio } from "lucide-react";

export default function SystemArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="apcs-modal-backdrop" onClick={onClose}>
      <div className="apcs-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--apcs-border)", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <BookOpen size={24} color="var(--apcs-cyan)" />
            <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "var(--apcs-text-bright)" }}>
              Industrial APCS Engineering & SCADA Architecture
            </h2>
          </div>
          <button className="apcs-btn apcs-btn-outline apcs-btn-sm" onClick={onClose}>
            <X size={16} /> Close
          </button>
        </div>

        {/* System Boundary Callout */}
        <div className="apcs-boundary-callout">
          <strong>CRITICAL SYSTEM BOUNDARY & PHYSICAL REALISM:</strong>
          <br />
          This prototype simulates an <strong>Industrial Flue Gas / Exhaust Duct Abatement Unit</strong>. In environmental chemical engineering, point-source pollution must be contained and treated at the source—inside the factory's sealed ductwork and chimney stack. It is physically impossible for a single stationary machine to instantaneously clean ambient air over a 10-km outdoor radius. Our system calculates continuous mass balances for air flowing through the treatment train at a calibrated volumetric rate (8,000 – 20,000 m³/h).
        </div>

        {/* 5 Treatment Stages */}
        <h3 style={{ fontSize: "1.1rem", color: "var(--apcs-text-bright)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Layers size={18} color="var(--apcs-cyan)" />
          Multi-Stage Treatment Principles
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.85rem", color: "var(--apcs-text-muted)", marginBottom: "1.5rem" }}>
          <div style={{ padding: "0.75rem", background: "var(--apcs-bg-card)", borderRadius: "6px", borderLeft: "3px solid var(--apcs-cyan)" }}>
            <strong style={{ color: "var(--apcs-text-bright)" }}>1. Cyclone Separator (Centrifugal Mechanical Separation):</strong>
            <p style={{ margin: "0.25rem 0 0 0" }}>
              Incoming flue gas enters tangentially at 15–22 m/s, forming a high-acceleration spiral vortex. Dense coarse particles (&gt;10 µm) and bulk fly ash are thrown outward by centrifugal inertia against the conical shell and drop into the dust hopper, removing 75–85% of coarse particulates without any electrical power consumption.
            </p>
          </div>

          <div style={{ padding: "0.75rem", background: "var(--apcs-bg-card)", borderRadius: "6px", borderLeft: "3px solid var(--apcs-purple)" }}>
            <strong style={{ color: "var(--apcs-text-bright)" }}>2. Electrostatic Precipitator (ESP) & Pulse-Jet Baghouse:</strong>
            <p style={{ margin: "0.25rem 0 0 0" }}>
              Discharge wire electrodes create a high-voltage corona discharge (45–65 kV), imparting negative unipolar charges to submicron PM2.5 and PM10 particles. The charged particles migrate to grounded collection plates. Downstream Teflon-membrane needle-felt filter bags capture residual ultra-fines up to 99.4% efficiency. Periodic reverse-air pulse-jet blasts dislodge the accumulated dust cake based on differential pressure (ΔP).
            </p>
          </div>

          <div style={{ padding: "0.75rem", background: "var(--apcs-bg-card)", borderRadius: "6px", borderLeft: "3px solid var(--apcs-blue)" }}>
            <strong style={{ color: "var(--apcs-text-bright)" }}>3. Wet Alkaline Gas Scrubber (Absorption & Neutralization):</strong>
            <p style={{ margin: "0.25rem 0 0 0" }}>
              Counter-current packed-bed absorption column. Atomizing spray headers disperse dilute alkaline wash liquor (dilute NaOH or Ca(OH)₂ lime slurry) across high-surface-area packing. Acidic sulfur dioxide and nitrogen oxides react chemically:
              <br />
              <code style={{ color: "var(--apcs-blue)" }}>SO₂ + 2NaOH → Na₂SO₃ + H₂O</code>
              <br />
              Sump pH is continuously monitored and maintained between 7.2 and 8.0 by automated reagent dosing pumps.
            </p>
          </div>

          <div style={{ padding: "0.75rem", background: "var(--apcs-bg-card)", borderRadius: "6px", borderLeft: "3px solid var(--apcs-emerald)" }}>
            <strong style={{ color: "var(--apcs-text-bright)" }}>4. Activated Carbon Adsorption Bed:</strong>
            <p style={{ margin: "0.25rem 0 0 0" }}>
              Granular activated carbon (GAC) featuring micropores with an enormous specific surface area of 900–1100 m²/g. Volatile Organic Compounds (VOCs), aromatic solvents (benzene, toluene, xylene), and trace toxic odors are trapped via Van der Waals physisorption.
            </p>
          </div>

          <div style={{ padding: "0.75rem", background: "var(--apcs-bg-card)", borderRadius: "6px", borderLeft: "3px solid var(--apcs-amber)" }}>
            <strong style={{ color: "var(--apcs-text-bright)" }}>5. Variable Frequency Induced Draft (ID) Fan & CEMS Stack:</strong>
            <p style={{ margin: "0.25rem 0 0 0" }}>
              A high-efficiency backward-curved centrifugal fan driven by an inverter VFD keeps the entire treatment system under negative static draft (-200 to -350 Pa), preventing any untreated fugitive emissions from leaking into the factory. The final discharge stack houses Continuous Emission Monitoring System (CEMS) optical and electrochemical probes.
            </p>
          </div>
        </div>

        {/* Real Hardware Sensor Interfacing */}
        <h3 style={{ fontSize: "1.1rem", color: "var(--apcs-text-bright)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio size={18} color="var(--apcs-cyan)" />
          Real-World Physical Hardware & Sensor Interfacing
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--apcs-text-muted)", lineHeight: "1.5" }}>
          To transition this prototype into a physical plant deployment, connect the telemetry hooks in <code>apcsSimulationEngine.js</code> to industrial field instruments using:
        </p>
        <ul style={{ fontSize: "0.85rem", color: "var(--apcs-text-muted)", lineHeight: "1.6", paddingLeft: "1.25rem" }}>
          <li>
            <strong style={{ color: "var(--apcs-text-bright)" }}>PM2.5 / PM10:</strong> Industrial forward laser light scatter optical particle counters with heated sample probe lines (prevents condensation).
          </li>
          <li>
            <strong style={{ color: "var(--apcs-text-bright)" }}>SO₂ & CO:</strong> Non-Dispersive Infrared (NDIR) multi-gas analyzers or UV-fluorescence detectors.
          </li>
          <li>
            <strong style={{ color: "var(--apcs-text-bright)" }}>NOx (NO + NO₂):</strong> Chemiluminescence analyzer with upstream catalytic NO₂-to-NO thermal converter.
          </li>
          <li>
            <strong style={{ color: "var(--apcs-text-bright)" }}>VOCs:</strong> Photoionization Detectors (PID) with 10.6 eV UV lamps or Flame Ionization Detectors (FID).
          </li>
          <li>
            <strong style={{ color: "var(--apcs-text-bright)" }}>Differential Pressure (ΔP):</strong> Piezoresistive differential pressure transmitters across the baghouse tube sheet with 4–20 mA current loop output.
          </li>
          <li>
            <strong style={{ color: "var(--apcs-text-bright)" }}>Industrial SCADA Protocols:</strong> Field instruments communicate with PLC (Programmable Logic Controller) via Modbus RTU / RS-485 or PROFINET. The backend streams data to this dashboard via MQTT or OPC-UA over WebSockets.
          </li>
        </ul>
      </div>
    </div>
  );
}
