/**
 * NeuroPulse BCI - Web Audio API Binaural Beat & Neuro-Entrainment Engine
 * Uses stereo panning and dual oscillator frequency offsets to induce brainwave entrainment.
 */

class BinauralAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.leftOsc = null;
    this.rightOsc = null;
    this.leftGain = null;
    this.rightGain = null;
    this.masterGain = null;
    this.noiseNode = null;
    this.noiseGain = null;

    // Default settings: 10 Hz Alpha for relaxed focus
    this.carrierFreq = 200; // Hz
    this.beatFreq = 10.0;   // Hz
    this.volume = 0.4;
    this.noiseVolume = 0.05;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
  }

  start(preset = 'alpha') {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stop(); // Stop any existing nodes

    // Apply preset
    switch (preset) {
      case 'delta':
        this.carrierFreq = 140;
        this.beatFreq = 2.5; // Deep sleep / regeneration
        break;
      case 'theta':
        this.carrierFreq = 180;
        this.beatFreq = 6.0; // Meditation / insight
        break;
      case 'alpha':
        this.carrierFreq = 200;
        this.beatFreq = 10.0; // Relaxed flow / study
        break;
      case 'beta':
        this.carrierFreq = 220;
        this.beatFreq = 18.0; // High alertness / problem solving
        break;
      case 'gamma':
        this.carrierFreq = 250;
        this.beatFreq = 40.0; // Peak cognition / memory binding
        break;
      default:
        break;
    }

    const t = this.ctx.currentTime;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, t);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, t + 0.5);
    this.masterGain.connect(this.ctx.destination);

    // Left Channel: Carrier Frequency
    const leftPanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (leftPanner) leftPanner.pan.value = -1.0;

    this.leftOsc = this.ctx.createOscillator();
    this.leftOsc.type = 'sine';
    this.leftOsc.frequency.setValueAtTime(this.carrierFreq, t);

    this.leftGain = this.ctx.createGain();
    this.leftGain.gain.value = 0.5;

    this.leftOsc.connect(this.leftGain);
    if (leftPanner) {
      this.leftGain.connect(leftPanner);
      leftPanner.connect(this.masterGain);
    } else {
      this.leftGain.connect(this.masterGain);
    }

    // Right Channel: Carrier + Beat Frequency
    const rightPanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (rightPanner) rightPanner.pan.value = 1.0;

    this.rightOsc = this.ctx.createOscillator();
    this.rightOsc.type = 'sine';
    this.rightOsc.frequency.setValueAtTime(this.carrierFreq + this.beatFreq, t);

    this.rightGain = this.ctx.createGain();
    this.rightGain.gain.value = 0.5;

    this.rightOsc.connect(this.rightGain);
    if (rightPanner) {
      this.rightGain.connect(rightPanner);
      rightPanner.connect(this.masterGain);
    } else {
      this.rightGain.connect(this.masterGain);
    }

    // Start Sine Waves
    this.leftOsc.start(t);
    this.rightOsc.start(t);

    // Add gentle Pink Noise in the background for sensory masking
    this.startPinkNoise();

    this.isPlaying = true;
  }

  startPinkNoise() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Pink noise filter approximation (Paul Kellet's algorithm)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(this.noiseVolume, this.ctx.currentTime);

    this.noiseNode.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);
    this.noiseNode.start();
  }

  setVolume(val) {
    this.volume = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  setNoiseVolume(val) {
    this.noiseVolume = val;
    if (this.noiseGain && this.ctx) {
      this.noiseGain.gain.setValueAtTime(val, this.ctx.currentTime);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    const t = this.ctx ? this.ctx.currentTime : 0;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(0.001, t + 0.2);
    }

    setTimeout(() => {
      try {
        if (this.leftOsc) { this.leftOsc.stop(); this.leftOsc.disconnect(); }
        if (this.rightOsc) { this.rightOsc.stop(); this.rightOsc.disconnect(); }
        if (this.noiseNode) { this.noiseNode.stop(); this.noiseNode.disconnect(); }
      } catch (e) {
        // Node already stopped
      }
      this.isPlaying = false;
    }, 200);
  }
}

export const bciAudio = new BinauralAudioEngine();
