# AeroPulse APCS — Modern Industrial Air Pollution Control System

A high-performance, real-time industrial **Air Pollution Control System (APCS)** simulation engine and SCADA emission monitoring dashboard. Designed to help manufacturing plants, power generation stations, chemical facilities, and industrial boilers monitor and abate hazardous flue gas emissions before exhaust gases discharge into the atmosphere.

---

## 📌 Critical System Boundary & Physics Notice

> **IMPORTANT ARCHITECTURAL NOTICE:**
> This system is an **Industrial Flue Gas / Exhaust Stack Treatment System** (point-source abatement). It cleans high-concentration exhaust streams moving through enclosed ductwork and chimney flues at a calibrated volumetric flow rate ($8,000 - 20,000\text{ m}^3/\text{h}$).
>
> In accordance with standard environmental chemical engineering principles, this prototype **does not claim to magically clean open ambient atmospheric air over a 10-km radius instantly**. Outdoor ambient air cannot be forced into a single machine without millions of cubic meters of ambient displacement; true industrial pollution abatement focuses on containing and treating dirty flue emissions at the source before they can pollute the troposphere.

---

## 🏗️ System Workflow & Multi-Stage Architecture

Flue gas generated from factory combustion, smelting, or manufacturing processes passes through a 5-stage sequential physical and chemical abatement train:

```
Factory Flue Exhaust
       │
       ▼
[Stage 1: Cyclone Separator]         ──► Centrifugal separation of coarse dust & PM10 (>10 µm)
       │
       ▼
[Stage 2: ESP / Bag Filter]          ──► Electrostatic corona ionization & Teflon pulse-jet bags (PM2.5)
       │
       ▼
[Stage 3: Wet Gas Scrubber]          ──► Counter-current alkaline spray neutralizing SO₂ & NOx
       │
       ▼
[Stage 4: Activated Carbon Bed]      ──► Microporous carbon adsorption trapping VOCs & odors
       │
       ▼
[Stage 5: ID Fan & CEMS Stack]       ──► Negative draft VFD blower & Continuous Emission Monitoring
       │
       ▼
Clean Atmospheric Discharge (Compliant with EPA / NAAQS Limits)
```

---

## 🔬 Scientific Working Principles by Stage

### Stage 1: Cyclone Separator (Centrifugal Mechanical Separation)
* **Target Pollutants:** Coarse dust, abrasive fly ash, mineral grit, PM10 ($>10\ \mu\text{m}$).
* **Working Principle:** Raw exhaust enters tangentially at velocities between $15\text{ m/s}$ and $22\text{ m/s}$, establishing a high-velocity downward helical vortex inside the conical cyclone body. Centrifugal forces fling dense particles outward against the cyclone wall, where frictional drag slows them down, allowing gravity to deposit them into the bottom dust collection hopper. The cleaned central gas stream reverses and exits upward through the vortex finder pipe.
* **Removal Efficiency:** $75\% - 85\%$ of coarse particulate matter without electrical power consumption.

### Stage 2: Electrostatic Precipitator (ESP) & Pulse-Jet Baghouse
* **Target Pollutants:** Respirable fine particulates (PM2.5), submicron soot, fly ash.
* **Working Principle:** 
  1. **Corona Ionization:** Discharge wire electrodes energized at $45 - 65\text{ kV}$ create a high-gradient electrical field that ionizes flue gas molecules, generating a negative corona. Passing dust particles become negatively charged and migrate toward grounded collector plates under Coulombic forces.
  2. **Pulse-Jet Baghouse Filtration:** Downstream woven PTFE/fiberglass filter bags capture submicron particles through inertial impaction and Brownian diffusion.
  3. **Automated Reverse-Pulse Jet Cleaning:** Piezoresistive differential pressure ($\Delta P$) transmitters monitor dust cake buildup. When $\Delta P > 1.85\text{ kPa}$, short bursts ($100\text{ ms}$) of high-pressure compressed air ($5 - 7\text{ bar}$) pulse back through the venturi nozzles, dislodging the dust cake into the collection hopper.
* **Removal Efficiency:** $98.5\% - 99.4\%$ PM2.5 and PM10 capture efficiency.

### Stage 3: Wet Chemical Gas Scrubber (Absorption & Neutralization)
* **Target Pollutants:** Acidic combustion gases: Sulfur Dioxide ($\text{SO}_2$), Nitrogen Oxides ($\text{NO}_x$), and acid mists ($\text{HCl}, \text{HF}$).
* **Working Principle:** Flue gas flows upward through a packed bed filled with high-surface-area polypropylene packing rings, counter-current to downward atomized sprays of alkaline scrubbing liquor (dilute sodium hydroxide $\text{NaOH}$ or hydrated lime $\text{Ca(OH)}_2$). Acidic gases dissolve and react irreversibly:
  $$\text{SO}_2 + 2\text{NaOH} \rightarrow \text{Na}_2\text{SO}_3 + \text{H}_2\text{O}$$
  $$\text{Na}_2\text{SO}_3 + \frac{1}{2}\text{O}_2 \rightarrow \text{Na}_2\text{SO}_4$$
* **Closed-Loop pH Control:** An in-line glass pH electrode continuously measures the sump liquor ($6.8 - 8.2\text{ pH}$). When acidity drops below $7.2\text{ pH}$, variable-speed dosing pumps inject concentrated alkaline reagent to maintain optimal absorption stoichiometry.
* **Removal Efficiency:** $92\% - 98.5\%$ $\text{SO}_2$ reduction, $65\% - 82\%$ $\text{NO}_x$ reduction.

### Stage 4: Activated Carbon Adsorption Bed
* **Target Pollutants:** Volatile Organic Compounds (VOCs), aromatic solvents (benzene, toluene, xylene), and trace hydrocarbons.
* **Working Principle:** Granular activated carbon (GAC) derived from bituminous coal or coconut shells provides a specific internal surface area of $900 - 1100\text{ m}^2/\text{g}$. Non-polar organic vapors passing through the fixed bed enter sub-nanometer micropores and adhere via London dispersion and Van der Waals forces.
* **Removal Efficiency:** $90\% - 97\%$ VOC removal until bed breakthrough saturation is approached.

### Stage 5: Variable Frequency Induced Draft (ID) Fan & CEMS Stack
* **Working Principle:** A backward-curved industrial centrifugal blower driven by a Variable Frequency Drive (VFD) maintains negative pressure ($-200\text{ to } -350\text{ Pa}$) across all upstream ductwork. Negative draft guarantees that no hazardous or toxic fumes can escape through duct seams or inspection hatches into the facility. Scrubbed air is exhausted through an industrial chimney fitted with Continuous Emission Monitoring System (CEMS) instrumentation.

---

## 📊 Monitored Pollutants & Regulatory Standards

| Pollutant | Full Identification | Raw Inlet Range | Clean Stack Target (EPA / NAAQS) | Primary Control Stage |
| :--- | :--- | :--- | :--- | :--- |
| **PM2.5** | Fine Respirable Particles ($\le 2.5\ \mu\text{m}$) | $400 - 2,200\ \mu\text{g/m}^3$ | $\le 35.0\ \mu\text{g/m}^3$ | ESP / Pulse-Jet Baghouse |
| **PM10** | Coarse Inhalable Particulates ($\le 10\ \mu\text{m}$) | $800 - 4,500\ \mu\text{g/m}^3$ | $\le 100.0\ \mu\text{g/m}^3$ | Cyclone + ESP |
| **Dust / TPM** | Total Suspended Particulate Matter | $200 - 1,200\ \text{mg/m}^3$ | $\le 30.0\ \text{mg/m}^3$ | Cyclone Separator |
| **SO₂** | Sulfur Dioxide | $250 - 1,200\ \text{ppm}$ | $\le 50.0\ \text{ppm}$ | Wet Alkaline Gas Scrubber |
| **NOx** | Nitrogen Oxides ($\text{NO} + \text{NO}_2$) | $180 - 900\ \text{ppm}$ | $\le 75.0\ \text{ppm}$ | Chemical Scrubber / Selective Reducer |
| **CO** | Carbon Monoxide | $80 - 600\ \text{ppm}$ | $\le 50.0\ \text{ppm}$ | Combustion Trim / Carbon Polishing |
| **VOCs** | Volatile Organic Compounds | $100 - 650\ \text{ppm}$ | $\le 25.0\ \text{ppm}$ | Activated Carbon Adsorption Bed |

---

## ⚙️ Closed-Loop SCADA Control System & Safety Interlocks

### Autonomous Proportional Feedback Rules
1. **Particulate Surge Auto-Ramping:**
   If raw PM2.5 or PM10 rises above baseline, the SCADA controller automatically escalates ESP ionization voltage from $48\text{ kV}$ up to $64.5\text{ kV}$ and decreases the pulse-jet cleaning interval from $60\text{s}$ down to $15\text{s}$ to prevent bag blinding.
2. **Acid Gas Neutralization Control:**
   If inlet $\text{SO}_2$ or $\text{NO}_x$ spikes, the system ramps counter-current spray pumps (up to $290\text{ L/min}$) and increases $\text{NaOH}$ reagent feed rate to maintain neutral sump liquor ($\text{pH } 7.2 - 8.0$).
3. **Filter Overload Protection:**
   Continuous differential pressure sensors ($\Delta P$) measure resistance across the filter bags. If $\Delta P > 1.85\text{ kPa}$, emergency pulse-jet blasts are executed automatically. If $\Delta P > 2.2\text{ kPa}$, a visual/acoustic maintenance alarm is generated while safely throttling ID fan draft to prevent structural bag rupture.

### Inviolable Safety Interlocks ("Never Bypass Safety Controls")
* **Scrubber Circulation Loss Interlock:** If the scrubber recirculation flow drops below $10\text{ L/min}$, the ID fan is immediately throttled down to prevent hot acidic flue gases from bypassing the scrubber and damaging downstream equipment.
* **Explosion / Lower Explosive Limit (LEL) Safeguard:** If unburned hydrocarbons or VOC concentrations exceed volatile safety limits, the system raises an immediate warning to prevent thermal runaway in the carbon bed.
* **Master Emergency Stop (E-STOP):** Shuts down high-voltage power supplies, pumps, and fan blowers instantaneously into a secure, fail-safe state.

---

## 🔌 Real-World Physical Sensor & Hardware Interfacing Guide

To connect this software prototype to physical plant hardware, map the sensor state inputs in `src/services/apcsSimulationEngine.js` to the following industrial instruments:

### 1. In-Line Field Analyzers
* **Particulate Matter (PM2.5 / PM10 / TPM):**
  * *Instrument:* Forward Laser Light Scatter Extractive Particulate Monitor (e.g., SICK Dusthunter or Thermo Scientific 5014i).
  * *Interface:* $4 - 20\text{ mA}$ current loop or Modbus RTU RS-485. Uses heated sample lines to eliminate water vapor droplets before optical measurement.
* **Acid Gases ($\text{SO}_2$, $\text{NO}_x$, $\text{CO}$):**
  * *Instrument:* Multi-gas Non-Dispersive Infrared (NDIR) or Ultraviolet Resonance Absorption Photometer with integrated Peltier gas cooler.
  * *Interface:* Modbus TCP / Ethernet IP streaming to PLC.
* **Volatile Organic Compounds (VOCs):**
  * *Instrument:* Flame Ionization Detector (FID) or Photoionization Detector (PID) equipped with a $10.6\text{ eV}$ krypton UV lamp.
* **Differential Pressure ($\Delta P$):**
  * *Instrument:* Piezoresistive differential pressure transmitter (e.g., Rosemount 3051CD) connected across the clean and dirty baghouse plenums.

### 2. Communication Topology
```
[ Field Sensor Probes (4-20mA / RS-485) ]
                    │
                    ▼
[ Programmable Logic Controller (PLC / PAC) ] ── (Siemens S7-1500 / Allen-Bradley ControlLogix)
                    │
                    ▼  Modbus TCP / OPC-UA
[ Industrial IoT Edge Gateway / MQTT Broker ] ── (Mosquitto / HiveMQ)
                    │
                    ▼  Secure WebSockets / REST API
[ AeroPulse React SCADA Dashboard (Frontend) ]
```

---

## 💻 Tech Stack & Architecture

* **Frontend Framework:** React 19 + Vite 8
* **Styling:** Custom SCADA Industrial Design System (`src/styles/apcs.css`) supporting Dark and Light modes
* **Icons:** Lucide React (`lucide-react`)
* **Simulation Engine:** `src/services/apcsSimulationEngine.js` with mass balance transfer functions, stochastic noise, and PID closed loops
* **Telemetry Visualizations:** Responsive SVG industrial process flow diagram and vector polyline historical charts
* **Reporting:** Instant Daily, Weekly, and Monthly environmental compliance reports with direct CSV and JSON export

---

## 🚀 Running the Project Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Local Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

3. **Run Production Build:**
   ```bash
   npm run build
   ```

4. **Run Code Linting:**
   ```bash
   npm run lint
   ```

---

## 📈 Interactive Features to Test in the Dashboard

1. **Live Process Flow Diagram:** Click on any stage (Cyclone, ESP/Baghouse, Scrubber, Carbon Bed, Stack) to view its engineering metrics and sub-system specifications.
2. **Scenario Injector:** Switch between:
   * *Baseline Normal Factory Operation*
   * *High-Ash / Boiler Soot Spike (Particulate Surge)*
   * *High-Sulfur Fuel & NOx Spike (Acid Gas Surge)*
   * *Solvent Painting & VOC Surge*
   * *Baghouse Blinding / High ΔP Overload*
3. **Closed-Loop vs. Manual Override:** Switch from `AUTO LOOP` to `MANUAL OVERRIDE` to adjust ESP Voltage, Scrubber Spray Rate, and ID Fan Draft via live sliders.
4. **Maintenance Actions:** Click "Manual Pulse Jet Clean", "Empty Ash Hopper", "Refill Alkaline Tank", or "Regenerate Carbon Bed".
5. **Historical Trends:** Toggle between `PM2.5 & PM10`, `SO₂ & NOx`, `Filter ΔP (kPa)`, and `Efficiency %`.
6. **Compliance Reporting:** Switch between Daily Shift, Weekly, and Monthly views, and export official CSV/JSON audit reports.
7. **Emergency Stop (E-STOP):** Trigger the fail-safe emergency stop and observe system lockout enforcement.
