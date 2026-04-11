/**
 * AudioEngine — Web Audio API sound engine for Rush Race
 * All sounds are synthesised procedurally; no audio files are needed.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private bgGain: GainNode | null = null;
  private bgActive = false;
  private bgOscillators: OscillatorNode[] = [];
  private bgCancelToken = { active: false };
  private bgMusicEnabled = true; // Track if background music is enabled by user

  // ─── Context helpers ───────────────────────────────────────────────────────

  private getCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
    }
    return this.ctx;
  }

  /** Call this inside a user-gesture handler so the browser allows audio. */
  async resumeContext(): Promise<void> {
    const ctx = this.getCtx();
    if (ctx && ctx.state === "suspended") {
      await ctx.resume();
    }
  }

  private isReady(): boolean {
    const ctx = this.getCtx();
    return !!ctx && ctx.state === "running";
  }

  // ─── UI Sounds ─────────────────────────────────────────────────────────────

  /** Very subtle soft tick — plays when hovering over interactive elements */
  playHover(): void {
    if (!this.isReady()) return;
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // Higher frequency for better clarity
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.085, ctx.currentTime); // Increased from 0.032 to 0.085
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  /** Soft punchy click — plays on every button/link press */
  playClick(): void {
    if (!this.isReady()) return;
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime); // Changed from 370 to 440 for better presence
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.19, ctx.currentTime); // Increased from 0.09 to 0.19
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);
  }

  // ─── Game Sounds ───────────────────────────────────────────────────────────

  /** Cheerful ascending C-E-G arpeggio — correct answer */
  playCorrect(): void {
    if (!this.isReady()) return;
    const ctx = this.ctx!;
    const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.1;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02); // Increased from 0.12 to 0.22
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  /** Descending sawtooth beeps — wrong answer */
  playWrong(): void {
    if (!this.isReady()) return;
    const ctx = this.ctx!;
    const notes = [
      { freq: 340, delay: 0, dur: 0.12 },
      { freq: 255, delay: 0.14, dur: 0.18 },
    ];
    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      const t = ctx.currentTime + delay;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.16, t); // Increased from 0.09 to 0.16
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    });
  }

  /** Three descending sine tones — time's-up game over */
  playGameOver(): void {
    if (!this.isReady()) return;
    const ctx = this.ctx!;
    const notes = [
      { freq: 220, delay: 0, dur: 0.4 },
      { freq: 185, delay: 0.28, dur: 0.4 },
      { freq: 147, delay: 0.56, dur: 0.7 },
    ];
    notes.forEach(({ freq, delay, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const t = ctx.currentTime + delay;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.24, t); // Increased from 0.15 to 0.24
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur);
    });
  }

  /** Sharp high tick — countdown warning at 3 / 2 / 1 seconds */
  playTimeWarning(): void {
    if (!this.isReady()) return;
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(1100, ctx.currentTime); // Increased from 920 for better clarity
    gain.gain.setValueAtTime(0.11, ctx.currentTime); // Increased from 0.055 to 0.11
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.085);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.085);
  }

  /** Triumphant 5-note ascending jingle — stage progression */
  playStageUp(): void {
    if (!this.isReady()) return;
    const ctx = this.ctx!;
    const freqs = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.11;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02); // Increased from 0.15 to 0.28
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  /** Rising sine sweep — skip puzzle */
  playSkip(): void {
    if (!this.isReady()) return;
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(275, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(870, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.16, ctx.currentTime); // Increased from 0.085 to 0.16
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.14);
  }

  // ─── Background Music ──────────────────────────────────────────────────────

  /**
   * Starts a soft ambient loop:
   *  • C-major pad built from 6 gently-detuned sine oscillators
   *  • Slow LFO "breathing" effect on the master gain
   *  • Repeating pentatonic melody at low volume
   */
  startBgMusic(): void {
    if (this.bgActive) return;
    if (!this.isReady()) return;
    if (!this.bgMusicEnabled) return; // Don't start if music is disabled

    this.bgActive = true;
    this.bgCancelToken = { active: true };
    const token = this.bgCancelToken;
    const ctx = this.ctx!;

    // Master gain → compressor → destination (gives the EDM pumping feel)
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.035, ctx.currentTime); // Reduced from 0.065 to 0.035 for better SFX clarity
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, ctx.currentTime);
    compressor.knee.setValueAtTime(6,  ctx.currentTime);
    compressor.ratio.setValueAtTime(8,  ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.18, ctx.currentTime);
    masterGain.connect(compressor);
    compressor.connect(ctx.destination);
    this.bgGain = masterGain;

    // Pre-generate a shared noise buffer (reused by all drum hits)
    const noiseLen = Math.floor(ctx.sampleRate * 0.18);
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1;

    // ── Drum & synth helpers ───────────────────────────────────────────────

    const kick = (t: number) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(170, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      gain.gain.setValueAtTime(0.55, t); // Reduced from 1.1 to 0.55
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + 0.32);
    };

    const snare = (t: number) => {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const bp    = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1400;
      bp.Q.value = 0.6;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.22, t); // Reduced from 0.45 to 0.22
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      noise.connect(bp); bp.connect(nGain); nGain.connect(masterGain);
      noise.start(t); noise.stop(t + 0.14);

      const body  = ctx.createOscillator();
      const bGain = ctx.createGain();
      body.type = "sine";
      body.frequency.setValueAtTime(240, t);
      body.frequency.exponentialRampToValueAtTime(100, t + 0.08);
      bGain.gain.setValueAtTime(0.18, t); // Reduced from 0.35 to 0.18
      bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      body.connect(bGain); bGain.connect(masterGain);
      body.start(t); body.stop(t + 0.08);
    };

    const hihat = (t: number, vol: number, dur = 0.035) => {
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const hp    = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 10000;
      const hGain = ctx.createGain();
      hGain.gain.setValueAtTime(vol * 0.6, t); // Reduced volume
      hGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      noise.connect(hp); hp.connect(hGain); hGain.connect(masterGain);
      noise.start(t); noise.stop(t + dur);
    };

    const bass = (t: number, freq: number, dur: number) => {
      const osc  = ctx.createOscillator();
      const lp   = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);
      lp.type = "lowpass"; lp.frequency.value = 480; lp.Q.value = 5;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.008); // Reduced from 0.7 to 0.35
      gain.gain.setValueAtTime(0.35, Math.max(t + 0.009, t + dur - 0.015));
      gain.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(lp); lp.connect(gain); gain.connect(masterGain);
      osc.start(t); osc.stop(t + dur);
    };

    const lead = (t: number, freq: number, dur: number) => {
      const osc  = ctx.createOscillator();
      const lp   = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t);
      lp.type = "lowpass"; lp.frequency.value = 2800;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.004); // Reduced from 0.18 to 0.09
      gain.gain.setValueAtTime(0.09, Math.max(t + 0.005, t + dur * 0.72));
      gain.gain.linearRampToValueAtTime(0, t + dur);
      osc.connect(lp); lp.connect(gain); gain.connect(masterGain);
      osc.start(t); osc.stop(t + dur);
    };

    // ── Timing constants (128 BPM) ────────────────────────────────────────
    const beat    = 60 / 128;          // 0.46875 s
    const bar     = beat * 4;          // 1.875 s
    const s8      = beat / 2;          // 8th note  0.234 s
    const s16     = beat / 4;          // 16th note 0.117 s
    const loopLen = bar * 2;           // 2-bar loop = 3.75 s

    // Am pentatonic arpeggios — 16 steps per bar (16th notes)
    // Bar 1: low energy, builds up
    const arpB1 = [
      220, 261.63, 329.63, 440,
      329.63, 261.63, 220, 293.66,
      329.63, 440, 523.25, 440,
      329.63, 261.63, 329.63, 440,
    ];
    // Bar 2: high energy, pushes upper octave
    const arpB2 = [
      440, 523.25, 659.25, 523.25,
      440, 392, 329.63, 261.63,
      293.66, 329.63, 440, 523.25,
      440, 329.63, 220, 261.63,
    ];

    // Bass line per bar — syncopated A-minor root / fifth
    // A2=110  E2=82.41  D2=73.42  G2=98
    const bassBar = [
      { freq: 110,   off: 0,           dur: s8 * 0.88 },
      { freq: 110,   off: s8,          dur: s8 * 0.45 },
      { freq: 82.41, off: beat,        dur: s8 * 0.88 },
      { freq: 110,   off: beat + s8,   dur: s8 * 0.45 },
      { freq: 110,   off: beat * 2,    dur: s8 * 0.88 },
      { freq: 73.42, off: beat*2 + s8, dur: s8 * 0.45 },
      { freq: 82.41, off: beat * 3,    dur: s8 * 0.88 },
      { freq: 98,    off: beat*3 + s8, dur: s8 * 0.45 },
    ];

    // ── Main scheduler ────────────────────────────────────────────────────
    const scheduleLoop = (start: number): void => {
      if (!token.active || !this.bgMusicEnabled) return;
      const now = ctx.currentTime;

      for (let b = 0; b < 2; b++) {
        const bs = start + b * bar;

        // Kick — four-on-the-floor
        for (let k = 0; k < 4; k++) {
          const t = bs + k * beat;
          if (t >= now - 0.01) kick(t);
        }

        // Snare — beats 2 and 4
        [1, 3].forEach(k => {
          const t = bs + k * beat;
          if (t >= now - 0.01) snare(t);
        });

        // Hi-hat — 8th notes; on-beats slightly louder
        for (let h = 0; h < 8; h++) {
          const t = bs + h * s8;
          if (t >= now - 0.01) hihat(t, h % 2 === 0 ? 0.1 : 0.065);
        }

        // Bass
        bassBar.forEach(({ freq, off, dur }) => {
          const t = bs + off;
          if (t >= now - 0.01) bass(t, freq, dur);
        });

        // Lead arp — 16th notes, bar 2 goes an octave higher
        const arpNotes = b === 0 ? arpB1 : arpB2;
        arpNotes.forEach((freq, i) => {
          const t = bs + i * s16;
          if (t >= now - 0.01) lead(t, freq, s16 * 0.82);
        });
      }

      const ms = (start + loopLen - ctx.currentTime) * 1000 - 80;
      setTimeout(() => scheduleLoop(start + loopLen), Math.max(0, ms));
    };

    scheduleLoop(ctx.currentTime + 0.05);
  }

  /** Fades out and stops all background music nodes */
  stopBgMusic(): void {
    this.bgActive = false;
    this.bgCancelToken.active = false;

    if (this.bgGain && this.ctx) {
      try {
        this.bgGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
      } catch { /* ignore */ }
    }

    const oscsToStop = this.bgOscillators;
    this.bgOscillators = [];
    setTimeout(() => {
      oscsToStop.forEach((osc) => {
        try { osc.stop(); } catch { /* already stopped */ }
      });
      if (this.bgGain) {
        this.bgGain.disconnect();
        this.bgGain = null;
      }
    }, 1500);
  }

  // ─── Music Toggle Control ──────────────────────────────────────────────────

  /** Toggle background music on/off */
  toggleBgMusic(): boolean {
    this.bgMusicEnabled = !this.bgMusicEnabled;
    
    if (this.bgMusicEnabled) {
      // If turning on, restart the music
      this.startBgMusic();
    } else {
      // If turning off, stop the music
      this.stopBgMusic();
    }
    
    return this.bgMusicEnabled;
  }

  /** Check if background music is currently enabled */
  isBgMusicEnabled(): boolean {
    return this.bgMusicEnabled;
  }
}

// Export a single lazily-initialised instance
export const audioEngine = new AudioEngine();