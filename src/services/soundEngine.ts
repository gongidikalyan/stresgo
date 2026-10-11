/**
 * Stress Go Calming Audio Engine
 * Lightweight, zero-latency Web Audio API synthesizer for:
 * - Low-frequency Brown Noise generator (procedural Brownian acoustic rumble)
 * - Bilateral auditory tapping pacer (alternating left/right stereo chimes)
 * - Tibetan Singing Bowl resonance
 * - Soothing 432Hz harmonic tone generator
 * - Calming stone tactile hum
 * - Gentle breath pacing chimes
 */

type StateSubscriber = (state: AudioEngineState) => void;

export interface AudioEngineState {
  isPlayingTone: boolean;
  isPlayingBrownNoise: boolean;
  brownNoiseVolume: number;
  masterVolume: number;
}

class SanctuaryAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Active tone generator nodes
  private toneStopFn: (() => void) | null = null;
  // Active stone hum nodes
  private stoneStopFn: (() => void) | null = null;
  // Active brown noise nodes & gain
  private brownNoiseStopFn: (() => void) | null = null;
  private brownNoiseGain: GainNode | null = null;
  private brownNoiseSleepTimeout: number | null = null;

  private state: AudioEngineState = {
    isPlayingTone: false,
    isPlayingBrownNoise: false,
    brownNoiseVolume: 0.7,
    masterVolume: 0.9,
  };

  private subscribers: Set<StateSubscriber> = new Set();

  public subscribe(subscriber: StateSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.getState());
    return () => this.subscribers.delete(subscriber);
  }

  public getState(): AudioEngineState {
    return { ...this.state };
  }

  private notify() {
    const s = this.getState();
    this.subscribers.forEach((fn) => fn(s));
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.state.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMasterVolume(vol: number) {
    this.state.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.state.masterVolume, this.ctx.currentTime);
    }
    this.notify();
  }

  // ==========================================
  // 1. PROCEDURAL BROWN NOISE GENERATOR
  // ==========================================

  public setBrownNoiseVolume(vol: number) {
    const v = Math.max(0, Math.min(1, vol));
    this.state.brownNoiseVolume = v;
    if (this.brownNoiseGain && this.ctx) {
      this.brownNoiseGain.gain.setTargetAtTime(v * 0.45, this.ctx.currentTime, 0.1);
    }
    this.notify();
  }

  public toggleBrownNoise(sleepMinutes?: number | null): boolean {
    if (this.state.isPlayingBrownNoise) {
      this.stopBrownNoise();
      return false;
    } else {
      this.startBrownNoise(sleepMinutes);
      return true;
    }
  }

  public startBrownNoise(sleepMinutes?: number | null) {
    this.stopBrownNoise();
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;

      // 4-second looping Brownian (red) noise buffer with smooth loop boundaries
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      const dataL = buffer.getChannelData(0);
      const dataR = buffer.getChannelData(1);

      let lastOutL = 0.0;
      let lastOutR = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1;
        const whiteR = Math.random() * 2 - 1;
        // Brownian noise integration formula
        lastOutL = (lastOutL + 0.02 * whiteL) / 1.02;
        lastOutR = (lastOutR + 0.02 * whiteR) / 1.02;
        dataL[i] = lastOutL * 3.2;
        dataR[i] = lastOutR * 3.2;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Deep velvety low-pass filter (320Hz cutoff, warm gentle rolloff)
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(320, now);
      lowpass.Q.setValueAtTime(0.8, now);

      // Second gentle sub-bass shelf for extra warm acoustic rumble
      const subShelf = ctx.createBiquadFilter();
      subShelf.type = 'lowshelf';
      subShelf.frequency.setValueAtTime(160, now);
      subShelf.gain.setValueAtTime(3.5, now);

      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(0.001, now);
      bGain.gain.linearRampToValueAtTime(this.state.brownNoiseVolume * 0.45, now + 1.2);

      noiseSource.connect(lowpass);
      lowpass.connect(subShelf);
      subShelf.connect(bGain);
      bGain.connect(this.masterGain || ctx.destination);

      noiseSource.start(now);
      this.brownNoiseGain = bGain;

      this.brownNoiseStopFn = () => {
        try {
          const stopNow = ctx.currentTime;
          bGain.gain.linearRampToValueAtTime(0.0001, stopNow + 0.8);
          setTimeout(() => {
            try {
              noiseSource.stop();
              noiseSource.disconnect();
              lowpass.disconnect();
              subShelf.disconnect();
              bGain.disconnect();
            } catch (_) {}
          }, 850);
        } catch (_) {}
      };

      if (sleepMinutes && sleepMinutes > 0) {
        if (this.brownNoiseSleepTimeout) clearTimeout(this.brownNoiseSleepTimeout);
        this.brownNoiseSleepTimeout = window.setTimeout(() => {
          this.stopBrownNoise();
        }, sleepMinutes * 60 * 1000);
      }

      this.state.isPlayingBrownNoise = true;
      this.notify();
    } catch (e) {
      console.warn('Failed to start brown noise', e);
    }
  }

  public stopBrownNoise() {
    if (this.brownNoiseSleepTimeout) {
      clearTimeout(this.brownNoiseSleepTimeout);
      this.brownNoiseSleepTimeout = null;
    }
    if (this.brownNoiseStopFn) {
      try {
        this.brownNoiseStopFn();
      } catch (_) {}
      this.brownNoiseStopFn = null;
    }
    this.brownNoiseGain = null;
    this.state.isPlayingBrownNoise = false;
    this.notify();
  }

  // ==========================================
  // 2. BILATERAL TAPPING CHIME (STEREO PACER)
  // ==========================================

  public playBilateralTapChime(side: 'left' | 'right') {
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      // Gentle pitch: left is ~330Hz (E4), right is ~370Hz (F#4) for subtle harmonic distinction
      const freq = side === 'left' ? 329.63 : 369.99;
      osc.frequency.setValueAtTime(freq, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      // Stereo pan if supported
      const targetDest: AudioNode = this.masterGain || ctx.destination;
      if (typeof (ctx as unknown as { createStereoPanner?: () => StereoPannerNode }).createStereoPanner === 'function') {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(side === 'left' ? -0.85 : 0.85, now);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(targetDest);
      } else {
        osc.connect(gain);
        gain.connect(targetDest);
      }

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (_) {}
  }

  /**
   * Playful soft squeak / bop sound for Teddy Bear stress buster
   */
  public playTeddyBop() {
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;

      // Gentle pitch variation for playful feedback
      const baseFreq = 440 + Math.random() * 120;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.85, now + 0.12);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (_) {}
  }

  // ==========================================
  // 3. TIBETAN SINGING BOWL BELL
  // ==========================================

  public playSingingBowlChime(pitch: number = 216) {
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;

      const chimeGain = ctx.createGain();
      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
      chimeGain.connect(this.masterGain || ctx.destination);

      const partials = [
        { f: pitch, g: 0.5 },
        { f: pitch * 2.01, g: 0.22 },
        { f: pitch * 3.02, g: 0.12 },
        { f: pitch * 4.76, g: 0.06 },
      ];

      partials.forEach((p) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(p.f, now);

        const pGain = ctx.createGain();
        pGain.gain.setValueAtTime(p.g, now);
        osc.connect(pGain);
        pGain.connect(chimeGain);

        osc.start(now);
        osc.stop(now + 4.6);
      });
    } catch (_) {}
  }

  /**
   * Subtle soft chime for breath phase transitions
   */
  public playBreathChime(isExhale: boolean = false) {
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;

      const freq = isExhale ? 392 : 523.25; // G4 or C5
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch (_) {}
  }

  /**
   * Haptic click / subtle sensory feedback
   */
  public playTapFeedback() {
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (_) {}
  }

  /**
   * Continuous 432Hz Calm Frequency Drone with warm sub-harmonics
   */
  public toggle432HzTone(): boolean {
    if (this.state.isPlayingTone) {
      this.stopTone();
      return false;
    } else {
      this.start432HzTone();
      return true;
    }
  }

  public start432HzTone() {
    this.stopTone();
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.001, now);
      droneGain.gain.linearRampToValueAtTime(0.22, now + 1.5);
      droneGain.connect(this.masterGain || ctx.destination);

      const freqs = [
        { f: 432, g: 0.16, type: 'sine' as OscillatorType },
        { f: 216, g: 0.12, type: 'sine' as OscillatorType },
        { f: 108, g: 0.08, type: 'sine' as OscillatorType },
        { f: 648, g: 0.03, type: 'sine' as OscillatorType },
      ];

      const oscs: OscillatorNode[] = [];

      freqs.forEach((spec) => {
        const osc = ctx.createOscillator();
        osc.type = spec.type;
        osc.frequency.setValueAtTime(spec.f, now);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, now);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.6, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(now);

        const partGain = ctx.createGain();
        partGain.gain.setValueAtTime(spec.g, now);
        osc.connect(partGain);
        partGain.connect(droneGain);

        osc.start(now);
        oscs.push(osc);
      });

      this.toneStopFn = () => {
        try {
          const stopTime = ctx.currentTime;
          droneGain.gain.linearRampToValueAtTime(0.001, stopTime + 0.8);
          setTimeout(() => {
            oscs.forEach((o) => {
              try {
                o.stop();
                o.disconnect();
              } catch (_) {}
            });
            droneGain.disconnect();
          }, 900);
        } catch (_) {}
      };

      this.state.isPlayingTone = true;
      this.notify();
    } catch (_) {}
  }

  public stopTone() {
    if (this.toneStopFn) {
      try {
        this.toneStopFn();
      } catch (_) {}
      this.toneStopFn = null;
    }
    this.state.isPlayingTone = false;
    this.notify();
  }

  /**
   * Calming Stone Touch Hum
   */
  public startStoneHum(): () => void {
    try {
      const ctx = this.ensureContext();
      const now = ctx.currentTime;

      const humGain = ctx.createGain();
      humGain.gain.setValueAtTime(0.001, now);
      humGain.gain.linearRampToValueAtTime(0.18, now + 0.3);
      humGain.connect(this.masterGain || ctx.destination);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, now);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(165, now);

      osc1.connect(humGain);
      osc2.connect(humGain);

      osc1.start(now);
      osc2.start(now);

      const stop = () => {
        try {
          const stopNow = ctx.currentTime;
          humGain.gain.linearRampToValueAtTime(0.001, stopNow + 0.2);
          setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
              osc1.disconnect();
              osc2.disconnect();
              humGain.disconnect();
            } catch (_) {}
          }, 250);
        } catch (_) {}
      };

      this.stoneStopFn = stop;
      return stop;
    } catch (_) {
      return () => {};
    }
  }

  public stopStoneHum() {
    if (this.stoneStopFn) {
      try {
        this.stoneStopFn();
      } catch (_) {}
      this.stoneStopFn = null;
    }
  }

  public stopAll() {
    this.stopTone();
    this.stopStoneHum();
    this.stopBrownNoise();
  }
}

export const soundEngine = new SanctuaryAudioEngine();
