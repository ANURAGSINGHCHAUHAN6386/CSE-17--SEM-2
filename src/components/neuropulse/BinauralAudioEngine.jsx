import React, { useState, useEffect } from "react";
import { bciAudio } from "./bciAudioEngine";

export default function BinauralAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPreset, setCurrentPreset] = useState("alpha");
  const [volume, setVolume] = useState(0.4);
  const [noiseVolume, setNoiseVolume] = useState(0.06);

  useEffect(() => {
    return () => {
      bciAudio.stop();
    };
  }, []);

  const togglePlay = (preset = currentPreset) => {
    if (isPlaying && preset === currentPreset) {
      bciAudio.stop();
      setIsPlaying(false);
    } else {
      setCurrentPreset(preset);
      bciAudio.setVolume(volume);
      bciAudio.setNoiseVolume(noiseVolume);
      bciAudio.start(preset);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    bciAudio.setVolume(v);
  };

  const handleNoiseChange = (e) => {
    const nv = parseFloat(e.target.value);
    setNoiseVolume(nv);
    bciAudio.setNoiseVolume(nv);
  };

  const PRESETS = [
    { id: "alpha", name: "Alpha Focus", freq: "10.0 Hz", carrier: "200 Hz", color: "#39ff14", desc: "Study, Deep Coding & Flow State" },
    { id: "gamma", name: "Gamma Super-Learning", freq: "40.0 Hz", carrier: "250 Hz", color: "#ef4444", desc: "High-Cognition, Problem Solving" },
    { id: "theta", name: "Theta Meditation", freq: "6.0 Hz", carrier: "180 Hz", color: "#3b82f6", desc: "Stress Relief, Intuition & Calm" },
    { id: "delta", name: "Delta Sleep", freq: "2.5 Hz", carrier: "140 Hz", color: "#a855f7", desc: "Deep Physical Recovery & REM" },
  ];

  return (
    <div style={{
      backgroundColor: "#0a0f1d",
      border: "1px solid #1a273e",
      borderRadius: "16px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "14px"
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #162438", paddingBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem" }}>🎧</span>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "#f8fafc", letterSpacing: "1px" }}>
              BINAURAL NEURAL ENTRAINMENT SYNTHESIZER
            </h3>
            <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
              Real-time Web Audio API stereo frequency interference (Superior Olivary Complex stimulation)
            </div>
          </div>
        </div>

        {/* Headphone notice */}
        <div style={{
          padding: "4px 10px",
          borderRadius: "8px",
          backgroundColor: "rgba(0, 240, 255, 0.1)",
          border: "1px solid rgba(0, 240, 255, 0.3)",
          fontSize: "0.72rem",
          color: "#00f0ff",
          fontWeight: "700"
        }}>
          Stereo Headphones Required
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "10px"
      }}>
        {PRESETS.map((p) => {
          const isThisActive = isPlaying && currentPreset === p.id;
          return (
            <div
              key={p.id}
              onClick={() => togglePlay(p.id)}
              style={{
                backgroundColor: isThisActive ? "rgba(0, 240, 255, 0.15)" : "#070b13",
                border: `1px solid ${isThisActive ? p.color : "#162438"}`,
                borderRadius: "12px",
                padding: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "800", color: p.color }}>{p.name}</span>
                <span style={{
                  fontSize: "0.7rem",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  backgroundColor: isThisActive ? p.color : "#162033",
                  color: isThisActive ? "#06090f" : "#94a3b8",
                  fontWeight: "bold"
                }}>
                  {isThisActive ? "PLAYING" : "SELECT"}
                </span>
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: "900", fontFamily: "monospace", color: "#f8fafc" }}>
                Δ {p.freq}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                Carrier: {p.carrier} • {p.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Audio Sliders & Play/Stop Button */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#070b13",
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid #142033",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <button
          onClick={() => togglePlay(currentPreset)}
          style={{
            padding: "10px 24px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: isPlaying ? "#ef4444" : "#00f0ff",
            color: isPlaying ? "#ffffff" : "#06090f",
            fontWeight: "900",
            fontSize: "0.85rem",
            cursor: "pointer",
            boxShadow: isPlaying ? "0 0 15px rgba(239, 68, 68, 0.4)" : "0 0 15px rgba(0, 240, 255, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          {isPlaying ? "⏹ Stop Sound" : "▶ Start Neural Audio"}
        </button>

        {/* Tone Volume Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Binaural Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={handleVolumeChange}
            style={{ width: "110px", accentColor: "#00f0ff" }}
          />
          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#00f0ff" }}>
            {Math.round(volume * 100)}%
          </span>
        </div>

        {/* Pink Noise Masking Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Pink Noise Mask:</span>
          <input
            type="range"
            min="0"
            max="0.2"
            step="0.01"
            value={noiseVolume}
            onChange={handleNoiseChange}
            style={{ width: "110px", accentColor: "#39ff14" }}
          />
          <span style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#39ff14" }}>
            {Math.round(noiseVolume * 500)}%
          </span>
        </div>
      </div>
    </div>
  );
}
