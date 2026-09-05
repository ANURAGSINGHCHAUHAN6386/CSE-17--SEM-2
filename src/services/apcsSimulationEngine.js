/**
 * Industrial Air Pollution Control System (APCS) Simulation Engine
 * Models industrial flue gas mass transfer, multi-stage removal efficiencies,
 * filter cake differential pressure dynamics, chemical neutralization stoichiometry,
 * and closed-loop SCADA control logic.
 */

import { POLLUTANTS, AIR_QUALITY_STATUS, SIMULATION_SCENARIOS } from "./apcsTypes";

export class APCSSimulationEngine {
  constructor() {
    this.controlMode = "AUTO"; // 'AUTO' or 'MANUAL'
    this.activeScenario = "baseline";
    this.safetyInterlockArmed = true;
    this.emergencyStop = false;
    this.pulseJetActive = false;

    // Operating Equipment Actuator States
    this.equipment = {
      cyclone: {
        status: "RUNNING",
        hopperLevel: 32.5, // 0 - 100%
        inletVelocity: 18.5, // m/s (15-25 m/s optimal for centrifugal separation)
        diffPressure: 0.42 // kPa
      },
      espBaghouse: {
        status: "RUNNING",
        voltageKV: 52.0, // 40 - 65 kV
        currentMA: 320.0, // 100 - 500 mA
        diffPressure: 1.15, // kPa (Safe < 1.8 kPa, Alarm > 2.0 kPa)
        pulseIntervalSec: 45, // seconds between reverse jet cleaning
        pulseCountdown: 45,
        bagWearPercent: 18.0
      },
      scrubber: {
        status: "RUNNING",
        recircFlowLMin: 180.0, // 100 - 300 L/min
        sumpPH: 7.4, // Optimum 7.2 - 8.2 for acid gas absorption
        reagentDosingLHr: 14.5, // L/hr NaOH solution
        reagentTankPercent: 78.0,
        diffPressure: 0.35 // kPa
      },
      carbonBed: {
        status: "RUNNING",
        bedSaturationPercent: 24.5, // 0 - 100%
        contactTempC: 38.5, // °C
        breakthroughIndex: 0.08, // 0.0 - 1.0
        diffPressure: 0.52 // kPa
      },
      fanStack: {
        status: "RUNNING",
        airflowM3H: 14500, // 8,000 - 20,000 m³/h
        fanRPM: 1420,
        motorCurrentA: 42.5,
        ductDraftPa: -280 // Pa (Negative pressure keeps exhaust inside duct)
      }
    };

    // Telemetry storage: current inlet, outlet, and abatement efficiencies
    this.telemetry = this.calculateInitialTelemetry();

    // Alarm log
    this.alarms = [];

    // Historical records for graphing (last 60 seconds rolling)
    this.history = [];
    this.initHistory();

    // Cumulative stats for reports
    this.cumulative = {
      totalVolumeM3: 435000,
      treatedHours: 28.5,
      totalMassRemovedKg: {
        pm25: 186.4,
        pm10: 382.1,
        dust: 512.6,
        so2: 428.9,
        nox: 215.3,
        co: 41.2,
        voc: 182.7
      },
      exceedanceSeconds: 120,
      totalSeconds: 102600
    };
  }

  // Gaussian-like noise generator
  randomJitter(amplitude = 0.03) {
    return 1 + (Math.random() * 2 - 1) * amplitude;
  }

  calculateInitialTelemetry() {
    const rawInlet = {};
    const treatedOutlet = {};
    const reductionPercent = {};

    Object.keys(POLLUTANTS).forEach((key) => {
      const pol = POLLUTANTS[key];
      rawInlet[key] = pol.inletNominal;
      treatedOutlet[key] = pol.inletNominal * 0.04; // ~96% reduction initial
      reductionPercent[key] = 96.0;
    });

    return {
      inlet: rawInlet,
      outlet: treatedOutlet,
      reduction: reductionPercent,
      overallEfficiency: 95.8,
      airQualityStatus: AIR_QUALITY_STATUS.GOOD,
      timestamp: new Date().toISOString()
    };
  }

  initHistory() {
    const now = Date.now();
    for (let i = 60; i >= 0; i--) {
      const ts = new Date(now - i * 1000).toLocaleTimeString();
      this.history.push({
        timestamp: ts,
        pm25In: 480 + Math.sin(i / 5) * 20,
        pm25Out: 8.5 + Math.sin(i / 5) * 1.2,
        pm10In: 920 + Math.cos(i / 6) * 30,
        pm10Out: 18.2 + Math.cos(i / 6) * 2,
        so2In: 340 + Math.sin(i / 4) * 15,
        so2Out: 12.4 + Math.sin(i / 4) * 1.5,
        noxIn: 260 + Math.cos(i / 7) * 12,
        noxOut: 24.1 + Math.cos(i / 7) * 2.0,
        vocIn: 160 + Math.sin(i / 6) * 10,
        vocOut: 4.8 + Math.sin(i / 6) * 0.8,
        diffPressure: 1.15 + (60 - i) * 0.002,
        overallEfficiency: 96.2 - Math.random() * 0.5
      });
    }
  }

  setScenario(scenarioId) {
    if (SIMULATION_SCENARIOS[scenarioId]) {
      this.activeScenario = scenarioId;
      const scenario = SIMULATION_SCENARIOS[scenarioId];
      if (scenario.filterDPOffset) {
        this.equipment.espBaghouse.diffPressure = Math.min(2.8, 1.15 + scenario.filterDPOffset);
      } else {
        this.equipment.espBaghouse.diffPressure = 1.15;
      }
      this.addAlarm("INFO", "SCENARIO_CHANGE", `Simulation scenario set to: ${scenario.name}`);
    }
  }

  setControlMode(mode) {
    this.controlMode = mode;
    this.addAlarm("INFO", "CONTROL_MODE", `System switched to ${mode} mode.`);
  }

  toggleEmergencyStop() {
    this.emergencyStop = !this.emergencyStop;
    if (this.emergencyStop) {
      this.equipment.espBaghouse.voltageKV = 0;
      this.equipment.fanStack.fanRPM = 0;
      this.equipment.fanStack.airflowM3H = 0;
      this.equipment.scrubber.recircFlowLMin = 0;
      this.addAlarm("CRITICAL", "SAFETY_ESTOP", "EMERGENCY STOP TRIGGERED! All active drives shut down into fail-safe mode.");
    } else {
      this.equipment.espBaghouse.voltageKV = 52.0;
      this.equipment.fanStack.fanRPM = 1420;
      this.equipment.fanStack.airflowM3H = 14500;
      this.equipment.scrubber.recircFlowLMin = 180.0;
      this.addAlarm("INFO", "SAFETY_RESET", "Emergency Stop cleared. Automatic subsystems restoring to baseline.");
    }
  }

  triggerManualPulseJet() {
    this.pulseJetActive = true;
    this.equipment.espBaghouse.diffPressure = Math.max(0.75, this.equipment.espBaghouse.diffPressure - 0.45);
    this.equipment.cyclone.hopperLevel = Math.min(95, this.equipment.cyclone.hopperLevel + 4.5);
    this.addAlarm("INFO", "PULSE_JET", "Manual Pulse-Jet reverse air purge executed. Filter cake dislodged.");
    setTimeout(() => {
      this.pulseJetActive = false;
    }, 1200);
  }

  emptyCycloneHopper() {
    this.equipment.cyclone.hopperLevel = 4.0;
    this.addAlarm("INFO", "CYCLONE_HOPPER", "Cyclone dust collection hopper emptied by maintenance protocol.");
  }

  replenishReagentTank() {
    this.equipment.scrubber.reagentTankPercent = 100.0;
    this.addAlarm("INFO", "REAGENT_REFILL", "Alkaline neutralization chemical reservoir refilled to 100%.");
  }

  regenerateCarbonBed() {
    this.equipment.carbonBed.bedSaturationPercent = 2.0;
    this.equipment.carbonBed.breakthroughIndex = 0.02;
    this.addAlarm("INFO", "CARBON_REGEN", "Activated carbon bed thermal desorbed / renewed with fresh granular carbon.");
  }

  addAlarm(severity, code, message) {
    const existing = this.alarms.find(a => a.code === code && !a.acknowledged);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      existing.lastTime = new Date().toLocaleTimeString();
      return;
    }

    this.alarms.unshift({
      id: "ALM-" + Date.now().toString(36).toUpperCase(),
      time: new Date().toLocaleTimeString(),
      severity, // 'INFO' | 'WARNING' | 'CRITICAL'
      code,
      message,
      count: 1,
      acknowledged: false
    });

    if (this.alarms.length > 50) {
      this.alarms.pop();
    }
  }

  acknowledgeAlarm(alarmId) {
    const al = this.alarms.find(a => a.id === alarmId);
    if (al) al.acknowledged = true;
  }

  clearAcknowledgedAlarms() {
    this.alarms = this.alarms.filter(a => !a.acknowledged);
  }

  // Master Step Function - called every 1 second
  tick() {
    if (this.emergencyStop) {
      return this.telemetry;
    }

    const scenario = SIMULATION_SCENARIOS[this.activeScenario] || SIMULATION_SCENARIOS.baseline;
    const mults = scenario.multipliers;

    // 1. Generate Raw Inlet Concentrations
    const currentInlet = {};
    Object.keys(POLLUTANTS).forEach((key) => {
      const pol = POLLUTANTS[key];
      const nominal = pol.inletNominal;
      const mult = mults[key] || 1.0;
      const noise = this.randomJitter(0.04);
      currentInlet[key] = Math.max(5.0, nominal * mult * noise);
    });

    // 2. Closed-Loop SCADA Auto Control Logic
    if (this.controlMode === "AUTO") {
      this.executeSCADAFeedbackLoops(currentInlet);
    }

    // 3. Physical Stage-by-Stage Removal Calculation
    const removalEff = this.calculateRemovalEfficiencies();
    const currentOutlet = {};
    const currentReduction = {};

    let totalEfficiencySum = 0;
    let pollutantCount = 0;

    Object.keys(POLLUTANTS).forEach((key) => {
      const raw = currentInlet[key];
      const effFraction = removalEff[key] || 0.95;
      const cleaned = Math.max(0.1, raw * (1 - effFraction));
      const redPercent = Math.min(99.9, Math.max(0, ((raw - cleaned) / raw) * 100));

      currentOutlet[key] = cleaned;
      currentReduction[key] = redPercent;

      totalEfficiencySum += redPercent;
      pollutantCount++;
    });

    const overallEfficiency = totalEfficiencySum / pollutantCount;

    // 4. Equipment Physical Evolution
    this.updateEquipmentEvolution(currentInlet);

    // 5. Air Quality & Compliance Status Assessment
    const aqStatus = this.evaluateAirQualityStatus(currentOutlet);

    // 6. Threshold Alarm Evaluation
    this.evaluateThresholdAlarms(currentOutlet);

    // 7. Update Telemetry
    this.telemetry = {
      inlet: currentInlet,
      outlet: currentOutlet,
      reduction: currentReduction,
      overallEfficiency: Number(overallEfficiency.toFixed(1)),
      airQualityStatus: aqStatus,
      timestamp: new Date().toLocaleTimeString()
    };

    // 8. Update rolling history
    this.updateHistory(currentInlet, currentOutlet, overallEfficiency);

    // 9. Update Cumulative stats for reports
    this.updateCumulativeStats(currentInlet, currentOutlet, aqStatus);

    return this.telemetry;
  }

  executeSCADAFeedbackLoops(inlet) {
    const esp = this.equipment.espBaghouse;
    const scrubber = this.equipment.scrubber;
    const fan = this.equipment.fanStack;

    // A. Particulate Feedback Loop (PM2.5 / PM10 / Dust)
    const pmStress = (inlet.pm25 / POLLUTANTS.pm25.inletNominal + inlet.pm10 / POLLUTANTS.pm10.inletNominal) / 2;
    if (pmStress > 1.3) {
      // Ramp up ESP voltage towards 64 kV
      esp.voltageKV = Math.min(64.5, esp.voltageKV + 0.5);
      esp.currentMA = Math.min(480, esp.currentMA + 8.0);
      esp.pulseIntervalSec = Math.max(15, esp.pulseIntervalSec - 2); // Pulse more frequently
    } else if (pmStress < 0.9) {
      // De-escalate voltage towards energy-saving 48 kV
      esp.voltageKV = Math.max(48.0, esp.voltageKV - 0.3);
      esp.currentMA = Math.max(260, esp.currentMA - 5.0);
      esp.pulseIntervalSec = Math.min(60, esp.pulseIntervalSec + 1);
    }

    // B. Acidic Gas Feedback Loop (SO₂ & NOx)
    const acidStress = (inlet.so2 / POLLUTANTS.so2.inletNominal + inlet.nox / POLLUTANTS.nox.inletNominal) / 2;
    if (acidStress > 1.2) {
      // Ramp up circulation pump and reagent dosing
      scrubber.recircFlowLMin = Math.min(290, scrubber.recircFlowLMin + 4.0);
      scrubber.reagentDosingLHr = Math.min(28.0, scrubber.reagentDosingLHr + 0.6);
      scrubber.sumpPH = Math.max(6.8, scrubber.sumpPH - 0.02); // Acid consumes buffer
    } else {
      // Maintain optimal neutral buffer
      scrubber.recircFlowLMin = Math.max(160, scrubber.recircFlowLMin - 1.5);
      scrubber.reagentDosingLHr = Math.max(10.0, scrubber.reagentDosingLHr - 0.2);
      if (scrubber.sumpPH < 7.4) {
        scrubber.sumpPH = Math.min(7.6, scrubber.sumpPH + 0.03);
      }
    }

    // C. Filter Overload Prevention Loop
    if (esp.diffPressure > 1.85) {
      // Automatic emergency reverse-jet pulse
      this.triggerManualPulseJet();
      this.addAlarm("WARNING", "AUTO_CLEAN_TRIGGERED", "Differential pressure > 1.85 kPa. Automatic SCADA pulse cleaning engaged.");
    }

    // D. Safety Interlock Verification
    if (this.safetyInterlockArmed) {
      // If scrubber flow is zero, ID fan cannot run at high draft to prevent thermal dry run
      if (scrubber.recircFlowLMin < 10 && fan.airflowM3H > 1000) {
        fan.airflowM3H = 800;
        fan.fanRPM = 200;
        this.addAlarm("CRITICAL", "INTERLOCK_SCRUBBER_TRIP", "SAFETY INTERLOCK: ID Fan draft throttled due to zero scrubber circulation.");
      }
    }
  }

  calculateRemovalEfficiencies() {
    const esp = this.equipment.espBaghouse;
    const scrubber = this.equipment.scrubber;
    const carbon = this.equipment.carbonBed;
    const cyclone = this.equipment.cyclone;

    // Cyclone efficiency: high on dust/PM10, low on PM2.5, 0 on gases
    const cycloneDustEff = 0.82 * (cyclone.inletVelocity / 18.5);
    const cyclonePm10Eff = 0.60 * (cyclone.inletVelocity / 18.5);
    const cyclonePm25Eff = 0.18;

    // ESP / Baghouse efficiency: proportional to Voltage (kV) and inverse to bag blinding
    const espFactor = (esp.voltageKV / 52.0);
    const baghousePm25Eff = Math.min(0.994, 0.982 * espFactor);
    const baghousePm10Eff = Math.min(0.998, 0.990 * espFactor);
    const baghouseDustEff = Math.min(0.999, 0.992 * espFactor);

    // Cumulative particulate removal: 1 - (1 - eta1)(1 - eta2)
    const totalPm25Eff = 1 - (1 - cyclonePm25Eff) * (1 - baghousePm25Eff);
    const totalPm10Eff = 1 - (1 - cyclonePm10Eff) * (1 - baghousePm10Eff);
    const totalDustEff = 1 - (1 - cycloneDustEff) * (1 - baghouseDustEff);

    // Wet Scrubber efficiency: based on flow rate and pH
    const phFactor = Math.max(0.6, 1 - Math.abs(scrubber.sumpPH - 7.5) * 0.2);
    const flowFactor = Math.min(1.15, scrubber.recircFlowLMin / 180.0);
    const so2Eff = Math.min(0.985, 0.945 * phFactor * flowFactor);
    const noxEff = Math.min(0.850, 0.720 * phFactor * flowFactor);

    // Activated Carbon Filter: based on bed saturation
    const bedHealth = Math.max(0.4, 1 - (carbon.bedSaturationPercent / 100) * 0.7);
    const vocEff = Math.min(0.978, 0.935 * bedHealth);
    const coEff = Math.min(0.380, 0.250 * bedHealth); // Minor catalytic chemisorption

    return {
      pm25: totalPm25Eff,
      pm10: totalPm10Eff,
      dust: totalDustEff,
      so2: so2Eff,
      nox: noxEff,
      co: coEff,
      voc: vocEff
    };
  }

  updateEquipmentEvolution(inlet) {
    const esp = this.equipment.espBaghouse;
    const cyclone = this.equipment.cyclone;
    const scrubber = this.equipment.scrubber;
    const carbon = this.equipment.carbonBed;

    // A. Dust accumulation on filter bags increases ΔP gradually
    const dustLoad = (inlet.dust / 280) * 0.0025;
    esp.diffPressure = Math.min(2.8, esp.diffPressure + dustLoad);

    // Pulse jet countdown
    esp.pulseCountdown--;
    if (esp.pulseCountdown <= 0) {
      esp.pulseCountdown = esp.pulseIntervalSec;
      if (this.controlMode === "AUTO") {
        this.triggerManualPulseJet();
      }
    }

    // B. Cyclone hopper fills up slowly
    cyclone.hopperLevel = Math.min(99.0, cyclone.hopperLevel + 0.04 * (inlet.dust / 280));
    if (cyclone.hopperLevel > 85.0) {
      this.addAlarm("WARNING", "CYCLONE_HOPPER_HIGH", "Cyclone dust collection hopper at 85% capacity. Emptying required.");
    }

    // C. Reagent tank drains as it neutralizes SO2/NOx
    const reagentUsage = (scrubber.reagentDosingLHr / 3600) * 0.05;
    scrubber.reagentTankPercent = Math.max(0, scrubber.reagentTankPercent - reagentUsage);
    if (scrubber.reagentTankPercent < 20.0) {
      this.addAlarm("WARNING", "LOW_REAGENT", "Neutralizing chemical tank level < 20%. Replenish caustic/lime solution.");
    }

    // D. Carbon bed saturates with VOCs
    carbon.bedSaturationPercent = Math.min(99.0, carbon.bedSaturationPercent + (inlet.voc / 160) * 0.015);
    carbon.breakthroughIndex = Number((carbon.bedSaturationPercent / 100 * 0.85).toFixed(3));
    if (carbon.bedSaturationPercent > 80.0) {
      this.addAlarm("WARNING", "CARBON_SATURATION_HIGH", "Activated carbon adsorption capacity nearly exhausted (>80%).");
    }
  }

  evaluateAirQualityStatus(outlet) {
    let worst = "GOOD";

    Object.keys(POLLUTANTS).forEach((key) => {
      const pol = POLLUTANTS[key];
      const val = outlet[key];

      if (val >= pol.criticalLimit) {
        worst = "CRITICAL";
      } else if (val >= pol.epaLimit * 1.5 && worst !== "CRITICAL") {
        worst = "HIGH";
      } else if (val >= pol.epaLimit && worst === "GOOD") {
        worst = "MODERATE";
      }
    });

    return AIR_QUALITY_STATUS[worst];
  }

  evaluateThresholdAlarms(outlet) {
    Object.keys(POLLUTANTS).forEach((key) => {
      const pol = POLLUTANTS[key];
      const val = outlet[key];

      if (val >= pol.criticalLimit) {
        this.addAlarm("CRITICAL", `EXCEED_${key.toUpperCase()}`, `CRITICAL: ${pol.name} outlet concentration (${val.toFixed(1)} ${pol.unit}) breached safe industrial threshold (${pol.criticalLimit})!`);
      } else if (val >= pol.epaLimit) {
        this.addAlarm("WARNING", `WARN_${key.toUpperCase()}`, `${pol.name} emission (${val.toFixed(1)} ${pol.unit}) exceeds standard target limit (${pol.epaLimit}).`);
      }
    });

    if (this.equipment.espBaghouse.diffPressure >= 2.0) {
      this.addAlarm("CRITICAL", "FILTER_OVERLOAD", `Baghouse differential pressure high: ${this.equipment.espBaghouse.diffPressure.toFixed(2)} kPa! Risk of bag blinding.`);
    }
  }

  updateHistory(inlet, outlet, overallEfficiency) {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      pm25In: inlet.pm25,
      pm25Out: outlet.pm25,
      pm10In: inlet.pm10,
      pm10Out: outlet.pm10,
      so2In: inlet.so2,
      so2Out: outlet.so2,
      noxIn: inlet.nox,
      noxOut: outlet.nox,
      vocIn: inlet.voc,
      vocOut: outlet.voc,
      diffPressure: this.equipment.espBaghouse.diffPressure,
      overallEfficiency: overallEfficiency
    };

    this.history.push(entry);
    if (this.history.length > 60) {
      this.history.shift();
    }
  }

  updateCumulativeStats(inlet, outlet, aqStatus) {
    const fan = this.equipment.fanStack;
    const airTreatedPerSec = fan.airflowM3H / 3600; // m³/s

    this.cumulative.totalVolumeM3 += airTreatedPerSec;
    this.cumulative.totalSeconds += 1;
    this.cumulative.treatedHours = Number((this.cumulative.totalSeconds / 3600).toFixed(1));

    if (aqStatus.code !== "GOOD") {
      this.cumulative.exceedanceSeconds += 1;
    }

    // Mass removed = (Inlet - Outlet) * Volume treated
    Object.keys(POLLUTANTS).forEach((key) => {
      const pol = POLLUTANTS[key];
      const removedConc = Math.max(0, inlet[key] - outlet[key]);
      let massGrams = 0;

      if (pol.unit === "µg/m³") {
        massGrams = (removedConc * airTreatedPerSec) / 1_000_000;
      } else if (pol.unit === "mg/m³") {
        massGrams = (removedConc * airTreatedPerSec) / 1_000;
      } else if (pol.unit === "ppm") {
        // Approximate molecular conversion: 1 ppm ≈ 2.5 mg/m³ for typical flue gas MW
        massGrams = (removedConc * 2.6 * airTreatedPerSec) / 1_000;
      }

      this.cumulative.totalMassRemovedKg[key] += massGrams / 1000;
    });
  }

  getComplianceReport(period = "daily") {
    const complianceRate = (
      ((this.cumulative.totalSeconds - this.cumulative.exceedanceSeconds) / this.cumulative.totalSeconds) *
      100
    ).toFixed(2);

    const multipliers = {
      daily: { volMult: 0.08, hours: 24, label: "Last 24 Hours (Daily Shift Report)" },
      weekly: { volMult: 0.55, hours: 168, label: "Last 7 Days (Weekly Emission Log)" },
      monthly: { volMult: 2.35, hours: 720, label: "Last 30 Days (Monthly Environmental Compliance)" }
    };

    const periodConfig = multipliers[period] || multipliers.daily;

    const massRemoved = {};
    let totalKgRemoved = 0;
    Object.keys(POLLUTANTS).forEach((key) => {
      const kg = this.cumulative.totalMassRemovedKg[key] * periodConfig.volMult;
      massRemoved[key] = Number(kg.toFixed(2));
      totalKgRemoved += kg;
    });

    return {
      period,
      label: periodConfig.label,
      generatedAt: new Date().toLocaleString(),
      treatedVolumeM3: Math.round(this.cumulative.totalVolumeM3 * periodConfig.volMult),
      operatingHours: periodConfig.hours,
      complianceRatePercent: Number(complianceRate),
      totalMassRemovedKg: Number(totalKgRemoved.toFixed(1)),
      breakdownKg: massRemoved,
      totalAlarmsCount: this.alarms.length + (period === "monthly" ? 42 : period === "weekly" ? 14 : 3),
      criticalIncidents: this.alarms.filter(a => a.severity === "CRITICAL").length,
      averageEfficiencyPercent: Number(this.telemetry.overallEfficiency.toFixed(1)),
      cemsValidationHash: "CEMS-" + Math.random().toString(36).substring(2, 9).toUpperCase()
    };
  }
}

// Global Singleton Engine instance for seamless lifecycle across React re-renders
export const apcsEngineInstance = new APCSSimulationEngine();
