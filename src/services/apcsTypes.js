/**
 * Industrial Air Pollution Control System (APCS) - Types & Specifications
 * Defines standard regulatory emission limits (EPA / NAAQS Industrial Flue Standards),
 * equipment physical bounds, pollutant definitions, and simulation scenario presets.
 */

export const POLLUTANTS = {
  pm25: {
    id: "pm25",
    name: "PM2.5",
    fullName: "Fine Particulate Matter (≤ 2.5 µm)",
    unit: "µg/m³",
    epaLimit: 35.0, // Clean stack target
    criticalLimit: 150.0,
    inletNominal: 480.0, // Typical raw flue gas concentration
    inletMax: 2200.0,
    primaryStage: "ESP / Bag Filter",
    color: "#06b6d4", // Cyan
    description: "Deep-lung respirable aerosols from combustion and metallurgical processes."
  },
  pm10: {
    id: "pm10",
    name: "PM10",
    fullName: "Coarse Particulate Matter (≤ 10 µm)",
    unit: "µg/m³",
    epaLimit: 100.0,
    criticalLimit: 350.0,
    inletNominal: 920.0,
    inletMax: 4500.0,
    primaryStage: "Cyclone + ESP",
    color: "#3b82f6", // Blue
    description: "Inhalable coarse fly ash, mineral grit, and combustion char."
  },
  dust: {
    id: "dust",
    name: "Dust / TPM",
    fullName: "Total Particulate Matter (TSP/TPM)",
    unit: "mg/m³",
    epaLimit: 30.0,
    criticalLimit: 100.0,
    inletNominal: 280.0,
    inletMax: 1200.0,
    primaryStage: "Cyclone Separator",
    color: "#8b5cf6", // Purple
    description: "Bulk particulate and fugitive fly ash from kiln/boiler exhaust."
  },
  so2: {
    id: "so2",
    name: "SO₂",
    fullName: "Sulfur Dioxide",
    unit: "ppm",
    epaLimit: 50.0,
    criticalLimit: 180.0,
    inletNominal: 340.0,
    inletMax: 1200.0,
    primaryStage: "Wet Gas Scrubber",
    color: "#f59e0b", // Amber
    description: "Acidic combustion gas from sulfur-bearing coal, heavy fuel oil, or sulfide ores."
  },
  nox: {
    id: "nox",
    name: "NOx",
    fullName: "Nitrogen Oxides (NO + NO₂)",
    unit: "ppm",
    epaLimit: 75.0,
    criticalLimit: 220.0,
    inletNominal: 260.0,
    inletMax: 900.0,
    primaryStage: "Scrubber / Selective Neutralizer",
    color: "#ec4899", // Pink
    description: "Thermal and prompt NOx generated at high flame temperatures in furnaces."
  },
  co: {
    id: "co",
    name: "CO",
    fullName: "Carbon Monoxide",
    unit: "ppm",
    epaLimit: 50.0,
    criticalLimit: 200.0,
    inletNominal: 110.0,
    inletMax: 600.0,
    primaryStage: "Thermal / Carbon Polishing",
    color: "#f97316", // Orange
    description: "Toxic by-product of fuel-rich, incomplete combustion or low-oxygen furnace zones."
  },
  voc: {
    id: "voc",
    name: "VOCs",
    fullName: "Volatile Organic Compounds",
    unit: "ppm",
    epaLimit: 25.0,
    criticalLimit: 100.0,
    inletNominal: 160.0,
    inletMax: 650.0,
    primaryStage: "Activated Carbon Bed",
    color: "#10b981", // Emerald
    description: "Solvent vapors, benzene, toluene, and unburned volatile hydrocarbons."
  }
};

export const AIR_QUALITY_STATUS = {
  GOOD: { label: "EXCELLENT / COMPLIANT", code: "GOOD", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)" },
  MODERATE: { label: "MODERATE / ACCEPTABLE", code: "MODERATE", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)" },
  HIGH: { label: "HIGH POLLUTION / WARNING", code: "HIGH", color: "#f97316", bg: "rgba(249, 115, 22, 0.15)" },
  CRITICAL: { label: "CRITICAL / BREACHED LIMIT", code: "CRITICAL", color: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" }
};

export const TREATMENT_STAGES = [
  {
    id: "inlet",
    num: 0,
    name: "Factory Flue Gas Inlet",
    short: "Flue Inlet",
    type: "inlet",
    targetPollutants: ["All Raw Contaminants"],
    keyMetrics: ["Inlet Temp (°C)", "Volumetric Flow (m³/h)", "Static Pressure (Pa)"]
  },
  {
    id: "cyclone",
    num: 1,
    name: "Cyclone Separator",
    short: "Cyclone",
    type: "mechanical",
    targetPollutants: ["Coarse Dust", "PM10"],
    workingPrinciple: "High-velocity tangential gas inlet creates a high-g centrifugal vortex, hurling dense particles (>10 µm) outward to collide with the conical wall and slide into the bottom dust hopper.",
    keyMetrics: ["Differential Pressure (mmH₂O)", "Hopper Fill Level (%)", "Vortex Velocity (m/s)"]
  },
  {
    id: "esp",
    num: 2,
    name: "ESP & Pulse-Jet Baghouse",
    short: "ESP / Baghouse",
    type: "electrostatic_filtration",
    targetPollutants: ["PM2.5", "PM10", "Submicron Ash"],
    workingPrinciple: "Discharge electrodes create a high-voltage corona field (45-65 kV) that negatively charges submicron particles. Particles migrate to grounded collector plates while membrane filter bags capture remaining particles, regularly cleaned via reverse compressed-air pulses.",
    keyMetrics: ["Ionization Voltage (kV)", "Corona Current (mA)", "Baghouse ΔP (kPa)", "Pulse Jet Interval (s)"]
  },
  {
    id: "scrubber",
    num: 3,
    name: "Wet Chemical Gas Scrubber",
    short: "Gas Scrubber",
    type: "chemical_absorption",
    targetPollutants: ["SO₂", "NOx", "Acid Mists"],
    workingPrinciple: "Counter-current packed-bed absorption tower spraying atomized alkaline wash liquid (dilute NaOH / lime slurry) to chemically neutralize acidic SO₂ and NOx gases into non-volatile harmless salts (e.g., sodium sulfite/sulfate).",
    keyMetrics: ["Scrubber Sump pH", "Recirculation Flow (L/min)", "Reagent Dosing Rate (L/h)", "Mist Eliminator ΔP"]
  },
  {
    id: "carbon",
    num: 4,
    name: "Activated Carbon Adsorption Bed",
    short: "Carbon Filter",
    type: "adsorption",
    targetPollutants: ["VOCs", "Trace Odors", "Hydrocarbons"],
    workingPrinciple: "Fixed deep-bed of virgin granular or extruded activated carbon with ultra-high specific surface area (900-1100 m²/g) capturing non-polar volatile organic compounds through Van der Waals physisorption.",
    keyMetrics: ["Bed Saturation (%)", "Contact Bed ΔP (kPa)", "VOC Breakthrough Risk", "Bed Temperature (°C)"]
  },
  {
    id: "outlet",
    num: 5,
    name: "ID Fan & CEMS Emission Stack",
    short: "Clean Air Stack",
    type: "outlet",
    targetPollutants: ["Clean Exhausted Air"],
    workingPrinciple: "Variable Frequency Induced Draft (ID) fan draws flue gas through the entire abatement train under negative pressure and discharges compliant scrubbed air through the continuous emission monitoring system (CEMS) stack.",
    keyMetrics: ["Exhaust Velocity (m/s)", "Stack Opacity (%)", "Compliance Index (%)", "Fan VFD Speed (RPM)"]
  }
];

export const SIMULATION_SCENARIOS = {
  baseline: {
    id: "baseline",
    name: "Normal Factory Operation",
    description: "Standard industrial load with balanced combustion and nominal emissions.",
    multipliers: { pm25: 1.0, pm10: 1.0, dust: 1.0, so2: 1.0, nox: 1.0, co: 1.0, voc: 1.0 },
    filterDPOffset: 0
  },
  particulate_surge: {
    id: "particulate_surge",
    name: "High-Ash / Boiler Soot Spike",
    description: "Soot blower cycle or high-ash coal combustion creating heavy PM2.5, PM10 & dust surge.",
    multipliers: { pm25: 3.8, pm10: 4.2, dust: 4.0, so2: 1.1, nox: 1.2, co: 1.3, voc: 1.0 },
    filterDPOffset: 0.4
  },
  acid_gas_leak: {
    id: "acid_gas_leak",
    name: "High-Sulfur Fuel & NOx Spike",
    description: "Fuel switch to high-sulfur petcoke and excessive burner flame temperature yielding elevated SO₂ and NOx.",
    multipliers: { pm25: 1.1, pm10: 1.0, dust: 1.0, so2: 3.5, nox: 3.2, co: 1.4, voc: 1.1 },
    filterDPOffset: 0.1
  },
  solvent_evap: {
    id: "solvent_evap",
    name: "Solvent Painting & VOC Surge",
    description: "Volatile organic solvent flash-off during batch paint booth and resin curing cycle.",
    multipliers: { pm25: 1.0, pm10: 1.0, dust: 0.9, so2: 1.0, nox: 1.1, co: 1.2, voc: 3.9 },
    filterDPOffset: 0.05
  },
  filter_overload: {
    id: "filter_overload",
    name: "Baghouse Blinding / High ΔP Overload",
    description: "Rapid particulate cake accumulation causing severe differential pressure drop across filter bags.",
    multipliers: { pm25: 2.2, pm10: 2.5, dust: 2.8, so2: 1.0, nox: 1.0, co: 1.1, voc: 1.0 },
    filterDPOffset: 1.6 // Breaches 2.0 kPa warning
  }
};
