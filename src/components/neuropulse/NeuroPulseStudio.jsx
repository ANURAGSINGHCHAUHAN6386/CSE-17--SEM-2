import React, { useState } from "react";
import EegOscilloscope from "./EegOscilloscope";
import BinauralAudioEngine from "./BinauralAudioEngine";
import P300ThoughtSpeller from "./P300ThoughtSpeller";
import NeuroDroneSimulator from "./NeuroDroneSimulator";
import CognitiveMetricsRadar from "./CognitiveMetricsRadar";

export default function NeuroPulseStudio() {
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'oscilloscope', 'speller', 'audio', 'drone', 'radar'
  const [mentalPreset, setMentalPreset] = useState("focus"); // 'focus', 'meditation', 'stress', 'drowsy'
  const [isRunning, setIsRunning] = useState(true);

  // Dynamic values based on selected preset
  const presetData = {
    focus: {
      engagement: 84,
      workload: 68,
      flowState: 88,
      fatigue: 18,
      stress: 28,
      droneFocus: 78,
    },
    meditation: {
      engagement: 45,
      workload: 22,
      flowState: 92,
      fatigue: 12,
      stress: 10,
      droneFocus: 40,
    },
    stress: {
      engagement: 94,
      workload: 92,
      flowState: 30,
      fatigue: 78,
      stress: 86,
      droneFocus: 95,
    },
    drowsy: {
      engagement: 18,
      workload: 15,
      flowState: 10,
      fatigue: 88,
      stress: 15,
      droneFocus: 20,
    },
  }[mentalPreset];

  const exportEegDataset = () => {
    let csv = "Timestamp_ms,FP1_uV,FP2_uV,F3_uV,F4_uV,C3_uV,C4_uV,P3_uV,P4_uV,Engagement_Index,Mental_State\r\n";
    const now = Date.now();
    for (let i = 0; i < 150; i++) {
      const t = now + i * 4; // 250 S/s = 4ms step
      const fp1 = (Math.sin(i * 0.15) * 15 + Math.random() * 4).toFixed(2);
      const fp2 = (Math.sin(i * 0.16) * 14 + Math.random() * 4).toFixed(2);
      const f3  = (Math.sin(i * 0.18) * 12 + Math.random() * 3).toFixed(2);
      const f4  = (Math.sin(i * 0.17) * 13 + Math.random() * 3).toFixed(2);
      const c3  = (Math.sin(i * 0.22) * 18 + Math.random() * 4).toFixed(2);
      const c4  = (Math.sin(i * 0.21) * 17 + Math.random() * 4).toFixed(2);
      const p3  = (Math.sin(i * 0.25) * 16 + Math.random() * 3).toFixed(2);
      const p4  = (Math.sin(i * 0.24) * 15 + Math.random() * 3).toFixed(2);
      csv += `${t},${fp1},${fp2},${f3},${f4},${c3},${c4},${p3},${p4},${presetData.engagement},${mentalPreset}\r\n`;
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neuropulse_eeg_dataset_${mentalPreset}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      backgroundColor: "#06090f",
      color: "#f8fafc",
      minHeight: "100%",
      padding: "20px",
      borderRadius: "16px",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Top Cockpit Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "16px",
        borderBottom: "1px solid #1a273e",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            background: "radial-gradient(circle, #00f0ff 0%, #06152b 80%)",
            borderRadius: "12px",
            border: "1px solid #00f0ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            boxShadow: "0 0 20px rgba(0, 240, 255, 0.4)"
          }}>
            🧠
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: "1.45rem",
              fontWeight: "900",
              letterSpacing: "1.5px",
              background: "linear-gradient(90deg, #00f0ff, #39ff14, #f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              NEUROPULSE BCI
            </h1>
            <div style={{ fontSize: "0.72rem", color: "#64748b", letterSpacing: "1.2px", textTransform: "uppercase" }}>
              NEURAL SIGNAL DECODING & BIO-COMPUTING COCKPIT
            </div>
          </div>
        </div>

        {/* Real-time Hardware Telemetry Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{
            padding: "4px 10px",
            borderRadius: "20px",
            backgroundColor: "#0c1322",
            border: "1px solid #39ff14",
            color: "#39ff14",
            fontSize: "0.72rem",
            fontWeight: "bold",
            fontFamily: "monospace"
          }}>
            ● 16/16 ELECTRODES ACTIVE (&lt;5kΩ)
          </span>

          <span style={{
            padding: "4px 10px",
            borderRadius: "20px",
            backgroundColor: "#0c1322",
            border: "1px solid #1e2c45",
            color: "#00f0ff",
            fontSize: "0.72rem",
            fontFamily: "monospace"
          }}>
            ⚡ 250 S/s • 24-bit
          </span>

          <button
            onClick={exportEegDataset}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              backgroundColor: "rgba(57, 255, 20, 0.15)",
              border: "1px solid #39ff14",
              color: "#39ff14",
              fontSize: "0.75rem",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            📥 Export EEG Dataset (CSV)
          </button>
        </div>
      </div>

      {/* Preset State Simulator Toolbar */}
      <div style={{
        marginTop: "14px",
        backgroundColor: "#0a0f1d",
        border: "1px solid #1a273e",
        borderRadius: "14px",
        padding: "10px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#94a3b8" }}>COGNITIVE STATE PRESET:</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              { id: "focus", label: "Alpha Flow (Coding)", color: "#39ff14" },
              { id: "meditation", label: "Theta Zen (Calm)", color: "#3b82f6" },
              { id: "stress", label: "Beta Surge (Stress/Panic)", color: "#f59e0b" },
              { id: "drowsy", label: "Delta Drowsiness (Sleepy)", color: "#a855f7" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setMentalPreset(p.id)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  backgroundColor: mentalPreset === p.id ? p.color : "#121a2c",
                  color: mentalPreset === p.id ? "#06090f" : "#94a3b8",
                  border: `1px solid ${mentalPreset === p.id ? p.color : "#1e2c45"}`,
                  transition: "all 0.15s ease"
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            padding: "4px 12px",
            borderRadius: "8px",
            fontSize: "0.75rem",
            fontWeight: "800",
            cursor: "pointer",
            backgroundColor: isRunning ? "rgba(239, 68, 68, 0.15)" : "rgba(57, 255, 20, 0.15)",
            color: isRunning ? "#f87171" : "#39ff14",
            border: `1px solid ${isRunning ? "#ef4444" : "#39ff14"}`
          }}
        >
          {isRunning ? "⏸ Pause Stream" : "▶ Resume Stream"}
        </button>
      </div>

      {/* Sub-system Navigation Tabs */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginTop: "14px",
        overflowX: "auto",
        paddingBottom: "4px"
      }}>
        {[
          { id: "all", label: "All Systems (Cockpit View)" },
          { id: "oscilloscope", label: "16-Ch EEG Oscilloscope & FFT" },
          { id: "speller", label: "P300 Thought-Speller Matrix" },
          { id: "drone", label: "Telekinetic Neuro-Drone" },
          { id: "audio", label: "Binaural Entrainment Audio" },
          { id: "radar", label: "Cognitive Radar & Diagnostics" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              backgroundColor: activeTab === tab.id ? "#121a2c" : "transparent",
              color: activeTab === tab.id ? "#00f0ff" : "#64748b",
              border: `1px solid ${activeTab === tab.id ? "#00f0ff" : "transparent"}`,
              whiteSpace: "nowrap"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Rendering based on Tab */}
      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {(activeTab === "all" || activeTab === "oscilloscope") && (
          <EegOscilloscope mentalState={mentalPreset} isRunning={isRunning} />
        )}

        {(activeTab === "all" || activeTab === "speller") && (
          <P300ThoughtSpeller />
        )}

        {(activeTab === "all" || activeTab === "drone") && (
          <NeuroDroneSimulator mentalFocus={presetData.droneFocus} />
        )}

        {(activeTab === "all" || activeTab === "audio") && (
          <BinauralAudioEngine />
        )}

        {(activeTab === "all" || activeTab === "radar") && (
          <CognitiveMetricsRadar
            engagement={presetData.engagement}
            workload={presetData.workload}
            flowState={presetData.flowState}
            fatigue={presetData.fatigue}
            stress={presetData.stress}
          />
        )}
      </div>
    </div>
  );
}
