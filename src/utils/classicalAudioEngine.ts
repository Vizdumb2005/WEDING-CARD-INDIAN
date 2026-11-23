import { MEDIA_ASSETS } from '../data/weddingData';

interface MelodicNote {
  /** Scale index into RAAG_SCALE */
  degree: number;
  /** Duration in seconds */
  durationSec: number;
  /** Optional smooth legato meend glide from previous pitch */
  glideFromDegree?: number;
  /** Softness multiplier (0.5 - 1.15) */
  expressiveness?: number;
}

interface DuetPhrase {
  instrument: 'shehnai' | 'sitar';
  notes: MelodicNote[];
  /** Breathing pause after phrase before next musical answer (ms) */
  restAfterMs: number;
}

/**
 * Traditional Indian Instrumental Wedding Music Engine (Shehnai + Sitar + Tanpura)
 * -----------------------------------------------------------------------------
 * Zero external network dependencies (100% Web Audio API), starts strictly inside
 * user-gesture callbacks.
 * - Optional external MP3 if MEDIA_ASSETS.backgroundMusicUrl is configured
 * - Warm stereo palace courtyard Convolver reverb for natural acoustic bloom
 * - Velvety 4-string Tanpura drone (Sa–Pa–Sa over C3 tonic with organic LFO breath)
 * - Soothing lyrical Shehnai (dual woodwind formant filters, silky breath attack,
 *   gentle vibrato & authentic Indian meend pitch glides)
 * - Resonant Sitar (jawari bridge harmonic filter sweep, gentle meend bend & sympathetic
 *   taraf overtone shimmer) playing calm Raag Yaman / Pahadi call-and-response phrases
 * - Auspicious brass temple bell (ghanti) chime on ceremonial milestones
 */
class ClassicalAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private dryBus: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private droneNodes: AudioNode[] = [];
  private activeTimers: number[] = [];
  private externalAudio: HTMLAudioElement | null = null;
  private playing = false;
  private phraseCursor = 0;
  private listeners = new Set<(isPlaying: boolean) => void>();

  /**
   * Warm Evening Wedding Raga Scale (Raag Yaman / Pahadi blend over C4 = 261.63Hz Sa)
   * Indices:
   * 0: Mandra Pa (196.00)  1: Mandra Dha (220.00)  2: Mandra Ni (246.94)
   * 3: Sa (261.63)         4: Re (293.66)          5: Ga (329.63)
   * 6: Ma (349.23)         7: Ma# Tivra (369.99)   8: Pa (392.00)
   * 9: Dha (440.00)        10: Ni (493.88)         11: Taar Sa (523.25)
   * 12: Taar Re (587.33)   13: Taar Ga (659.25)
   */
  private readonly raagScale = [
    196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 369.99, 392.0, 440.0, 493.88, 523.25,
    587.33, 659.25,
  ];

  /**
   * Curated serene wedding duet choreography — unhurried Shehnai mangal dhun phrases
   * answered by resonant, cascading Sitar improvisations with tranquil breathing pauses.
   */
  private readonly duetPhrases: DuetPhrase[] = [
    // 1. Opening Auspicious Shehnai Alap (Ni - Re - Ga - Ma# - Pa)
    {
      instrument: 'shehnai',
      notes: [
        { degree: 2, durationSec: 1.35, expressiveness: 0.78 },
        { degree: 4, durationSec: 1.5, glideFromDegree: 2, expressiveness: 0.92 },
        { degree: 5, durationSec: 1.85, glideFromDegree: 4, expressiveness: 1.0 },
        { degree: 7, durationSec: 1.15, glideFromDegree: 5, expressiveness: 0.85 },
        { degree: 8, durationSec: 2.35, glideFromDegree: 7, expressiveness: 0.95 },
      ],
      restAfterMs: 1450,
    },
    // 2. Answering Sitar Jhala / Meend cascade (Pa - Ga - Re - Sa - Pa)
    {
      instrument: 'sitar',
      notes: [
        { degree: 8, durationSec: 0.85, expressiveness: 0.95 },
        { degree: 9, durationSec: 0.65, glideFromDegree: 8, expressiveness: 0.85 },
        { degree: 8, durationSec: 0.95, expressiveness: 0.9 },
        { degree: 5, durationSec: 0.8, glideFromDegree: 7, expressiveness: 0.88 },
        { degree: 4, durationSec: 0.75, expressiveness: 0.82 },
        { degree: 3, durationSec: 1.6, glideFromDegree: 4, expressiveness: 0.96 },
      ],
      restAfterMs: 1650,
    },
    // 3. Lyrical Pahadi-Yaman Shehnai Wedding Melody (Ga - Pa - Dha - Sa' - Dha - Pa)
    {
      instrument: 'shehnai',
      notes: [
        { degree: 5, durationSec: 1.2, expressiveness: 0.85 },
        { degree: 8, durationSec: 1.55, glideFromDegree: 5, expressiveness: 0.98 },
        { degree: 9, durationSec: 1.25, glideFromDegree: 8, expressiveness: 0.92 },
        { degree: 11, durationSec: 1.75, glideFromDegree: 9, expressiveness: 0.94 },
        { degree: 9, durationSec: 1.1, glideFromDegree: 11, expressiveness: 0.84 },
        { degree: 8, durationSec: 2.2, glideFromDegree: 9, expressiveness: 0.9 },
      ],
      restAfterMs: 1500,
    },
    // 4. Sitar Graceful Ascending & Descending Taan (Sa - Ga - Pa - Ni - Sa' - Pa - Ga - Re - Sa)
    {
      instrument: 'sitar',
      notes: [
        { degree: 3, durationSec: 0.7, expressiveness: 0.86 },
        { degree: 5, durationSec: 0.65, expressiveness: 0.9 },
        { degree: 8, durationSec: 0.75, glideFromDegree: 7, expressiveness: 0.94 },
        { degree: 10, durationSec: 0.7, expressiveness: 0.86 },
        { degree: 11, durationSec: 1.15, glideFromDegree: 10, expressiveness: 1.0 },
        { degree: 8, durationSec: 0.75, expressiveness: 0.84 },
        { degree: 5, durationSec: 0.8, expressiveness: 0.8 },
        { degree: 4, durationSec: 0.75, expressiveness: 0.78 },
        { degree: 3, durationSec: 1.8, glideFromDegree: 4, expressiveness: 0.95 },
      ],
      restAfterMs: 1750,
    },
    // 5. Devotional Descending Shehnai Cadence (Pa - Ma# - Ga - Re - Sa)
    {
      instrument: 'shehnai',
      notes: [
        { degree: 8, durationSec: 1.4, expressiveness: 0.88 },
        { degree: 7, durationSec: 1.1, glideFromDegree: 8, expressiveness: 0.82 },
        { degree: 5, durationSec: 1.55, glideFromDegree: 7, expressiveness: 0.92 },
        { degree: 4, durationSec: 1.35, glideFromDegree: 5, expressiveness: 0.84 },
        { degree: 3, durationSec: 2.55, glideFromDegree: 4, expressiveness: 0.92 },
      ],
      restAfterMs: 1600,
    },
    // 6. Soft Sitar Contemplative Echo (Mandra Pa - Dha - Sa - Ga - Re - Sa)
    {
      instrument: 'sitar',
      notes: [
        { degree: 0, durationSec: 0.9, expressiveness: 0.8 },
        { degree: 1, durationSec: 0.8, expressiveness: 0.82 },
        { degree: 3, durationSec: 1.05, glideFromDegree: 2, expressiveness: 0.92 },
        { degree: 5, durationSec: 0.95, glideFromDegree: 4, expressiveness: 0.9 },
        { degree: 4, durationSec: 0.8, expressiveness: 0.82 },
        { degree: 3, durationSec: 1.85, expressiveness: 0.94 },
      ],
      restAfterMs: 1850,
    },
  ];

  public subscribe(fn: (isPlaying: boolean) => void): () => void {
    this.listeners.add(fn);
    fn(this.playing);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private emit(): void {
    this.listeners.forEach((fn) => fn(this.playing));
  }

  public isPlaying(): boolean {
    return this.playing;
  }

  private scheduleTimer(fn: () => void, delayMs: number): void {
    const id = window.setTimeout(() => {
      this.activeTimers = this.activeTimers.filter((t) => t !== id);
      fn();
    }, delayMs);
    this.activeTimers.push(id);
  }

  private clearAllTimers(): void {
    this.activeTimers.forEach((id) => window.clearTimeout(id));
    this.activeTimers = [];
  }

  /**
   * Generates a warm, silky stereo palace-courtyard reverb impulse response (~2.6s)
   * with smooth high-frequency rolloff so Shehnai & Sitar bloom organically.
   */
  private createCourtyardImpulse(ctx: AudioContext): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const durationSec = 2.6;
    const length = Math.floor(sampleRate * durationSec);
    const buffer = ctx.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < length; i++) {
        const t = i / length;
        // Soft early-reflection bloom followed by warm exponential tail
        const env = Math.pow(1 - t, 2.75) * (0.35 + 0.65 * Math.min(1, i / (sampleRate * 0.045)));
        const white = Math.random() * 2 - 1;
        // One-pole lowpass damping for velvety sandstone hall warmth
        prev = prev * 0.72 + white * 0.28;
        data[i] = prev * env * 0.55;
      }
    }
    return buffer;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.0001;
        this.masterGain.connect(this.ctx.destination);

        // Warm dry + stereo courtyard reverb routing
        this.dryBus = this.ctx.createGain();
        this.dryBus.gain.value = 0.72;
        this.dryBus.connect(this.masterGain);

        this.reverbNode = this.ctx.createConvolver();
        this.reverbNode.buffer = this.createCourtyardImpulse(this.ctx);

        const reverbTone = this.ctx.createBiquadFilter();
        reverbTone.type = 'lowpass';
        reverbTone.frequency.value = 2200;

        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.44;

        this.dryBus.connect(this.reverbNode);
        this.reverbNode.connect(reverbTone);
        reverbTone.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private startTanpuraDrone(ctx: AudioContext): void {
    if (this.droneNodes.length > 0 || !this.masterGain) return;

    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.135;

    const warmthFilter = ctx.createBiquadFilter();
    warmthFilter.type = 'lowpass';
    warmthFilter.frequency.value = 430;
    warmthFilter.Q.value = 0.8;

    // Slow meditative breathing LFO modulating Tanpura overtone warmth
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.095;
    lfoGain.gain.value = 95;
    lfo.connect(lfoGain);
    lfoGain.connect(warmthFilter.frequency);
    lfo.start();

    warmthFilter.connect(droneGain);
    droneGain.connect(this.masterGain);

    // Traditional 4-string Tanpura tuning over C tonic: Mandra Pa - Kharaja Sa - Madhya Sa 1 & 2 (jivari)
    const strings: Array<{ freq: number; type: OscillatorType; gain: number }> = [
      { freq: 196.0, type: 'triangle', gain: 0.24 }, // Mandra Pa
      { freq: 130.81, type: 'sine', gain: 0.44 }, // Kharaja Sa
      { freq: 261.63, type: 'triangle', gain: 0.22 }, // Madhya Sa 1
      { freq: 262.18, type: 'sine', gain: 0.15 }, // Madhya Sa 2 (warm beating shimmer)
    ];

    this.droneNodes.push(lfo, lfoGain, warmthFilter, droneGain);

    strings.forEach((s) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = s.type;
      osc.frequency.value = s.freq;
      g.gain.value = s.gain;
      osc.connect(g);
      g.connect(warmthFilter);
      osc.start();
      this.droneNodes.push(osc, g);
    });
  }

  /**
   * Plays a velvety, deeply soothing Shehnai note with woodwind formant resonance,
   * soft breath swell, organic vibrato, and authentic Indian legato meend glide.
   */
  private playShehnaiNote(
    targetFreq: number,
    durationSec: number,
    glideFromFreq?: number,
    expressiveness = 0.9
  ): void {
    if (!this.ctx || !this.dryBus) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Gentle double-reed excitation: soft sawtooth + mellow triangle octave body
    const reedOsc = ctx.createOscillator();
    const bodyOsc = ctx.createOscillator();
    reedOsc.type = 'sawtooth';
    bodyOsc.type = 'triangle';

    const startFreq = glideFromFreq ?? targetFreq * 0.985;
    reedOsc.frequency.setValueAtTime(startFreq, now);
    bodyOsc.frequency.setValueAtTime(startFreq, now);

    // Smooth Indian meend pitch glide into the target swara
    const glideTime = glideFromFreq ? Math.min(0.28, durationSec * 0.26) : 0.08;
    reedOsc.frequency.exponentialRampToValueAtTime(targetFreq, now + glideTime);
    bodyOsc.frequency.exponentialRampToValueAtTime(targetFreq, now + glideTime);

    // Expressive late-onset gentle vibrato (gamak / andolan)
    const vibOsc = ctx.createOscillator();
    const vibGain = ctx.createGain();
    vibOsc.type = 'sine';
    vibOsc.frequency.value = 4.65;
    vibGain.gain.setValueAtTime(0.0001, now);
    vibGain.gain.linearRampToValueAtTime(11, now + Math.min(0.55, durationSec * 0.45));
    vibOsc.connect(vibGain);
    vibGain.connect(reedOsc.detune);
    vibGain.connect(bodyOsc.detune);

    // Dual woodwind formant bandpass filters for unmistakable warm Shehnai timbre
    const formantBody = ctx.createBiquadFilter();
    formantBody.type = 'bandpass';
    formantBody.frequency.value = Math.min(1050, Math.max(680, targetFreq * 2.15));
    formantBody.Q.value = 2.3;

    const formantReed = ctx.createBiquadFilter();
    formantReed.type = 'bandpass';
    formantReed.frequency.value = Math.min(2350, Math.max(1550, targetFreq * 4.2));
    formantReed.Q.value = 3.1;

    const formantBodyGain = ctx.createGain();
    formantBodyGain.gain.value = 0.78;
    const formantReedGain = ctx.createGain();
    formantReedGain.gain.value = 0.34;

    // Silky warmth lowpass cap so upper harmonics stay golden and soothing
    const warmthCap = ctx.createBiquadFilter();
    warmthCap.type = 'lowpass';
    warmthCap.frequency.setValueAtTime(2550, now);
    warmthCap.frequency.exponentialRampToValueAtTime(1650, now + durationSec);

    // Expressive breath amplitude envelope
    const env = ctx.createGain();
    const peakGain = 0.145 * expressiveness;
    const attack = Math.min(0.24, durationSec * 0.22);
    const releaseStart = Math.max(attack + 0.1, durationSec * 0.72);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakGain, now + attack);
    env.gain.linearRampToValueAtTime(peakGain * 0.86, now + releaseStart);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec + 0.36);

    const reedMix = ctx.createGain();
    reedMix.gain.value = 0.56;
    const bodyMix = ctx.createGain();
    bodyMix.gain.value = 0.44;

    reedOsc.connect(reedMix);
    bodyOsc.connect(bodyMix);

    reedMix.connect(formantBody);
    reedMix.connect(formantReed);
    bodyMix.connect(formantBody);

    formantBody.connect(formantBodyGain);
    formantReed.connect(formantReedGain);
    formantBodyGain.connect(warmthCap);
    formantReedGain.connect(warmthCap);

    warmthCap.connect(env);
    env.connect(this.dryBus);

    reedOsc.start(now);
    bodyOsc.start(now);
    vibOsc.start(now);

    const stopTime = now + durationSec + 0.44;
    reedOsc.stop(stopTime);
    bodyOsc.stop(stopTime);
    vibOsc.stop(stopTime);
  }

  /**
   * Plays an expressive Sitar pluck with authentic curved-bridge jawari resonance,
   * subtle upward string-pull meend, and delicate sympathetic taraf shimmer.
   */
  private playSitarNote(
    targetFreq: number,
    durationSec: number,
    glideFromFreq?: number,
    expressiveness = 0.9
  ): void {
    if (!this.ctx || !this.dryBus) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const ringTime = Math.max(2.3, durationSec + 1.55);

    // Primary plucked string (sawtooth for rich jawari harmonics + triangle body)
    const stringOsc = ctx.createOscillator();
    const bodyOsc = ctx.createOscillator();
    const tarafOsc = ctx.createOscillator(); // Sympathetic octave shimmer

    stringOsc.type = 'sawtooth';
    bodyOsc.type = 'triangle';
    tarafOsc.type = 'sine';

    const startFreq = glideFromFreq ?? targetFreq * 0.975;
    stringOsc.frequency.setValueAtTime(startFreq, now);
    bodyOsc.frequency.setValueAtTime(startFreq, now);
    stringOsc.frequency.exponentialRampToValueAtTime(targetFreq, now + (glideFromFreq ? 0.16 : 0.045));
    bodyOsc.frequency.exponentialRampToValueAtTime(targetFreq, now + (glideFromFreq ? 0.16 : 0.045));
    tarafOsc.frequency.setValueAtTime(targetFreq * 2.0, now);

    // Characteristic Sitar jawari resonant bandpass sweep (metallic twang settling into warm gourd)
    const jawariFilter = ctx.createBiquadFilter();
    jawariFilter.type = 'bandpass';
    jawariFilter.frequency.setValueAtTime(Math.min(3100, targetFreq * 5.2), now);
    jawariFilter.frequency.exponentialRampToValueAtTime(Math.max(480, targetFreq * 1.45), now + 1.65);
    jawariFilter.Q.value = 2.6;

    const gourdLowpass = ctx.createBiquadFilter();
    gourdLowpass.type = 'lowpass';
    gourdLowpass.frequency.setValueAtTime(2700, now);
    gourdLowpass.frequency.exponentialRampToValueAtTime(720, now + ringTime);

    const stringGain = ctx.createGain();
    stringGain.gain.value = 0.58;
    const bodyGain = ctx.createGain();
    bodyGain.gain.value = 0.52;
    const tarafGain = ctx.createGain();
    tarafGain.gain.setValueAtTime(0.0001, now);
    tarafGain.gain.linearRampToValueAtTime(0.085, now + 0.14);
    tarafGain.gain.exponentialRampToValueAtTime(0.0001, now + ringTime * 0.82);

    const env = ctx.createGain();
    const peakGain = 0.16 * expressiveness;
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peakGain, now + 0.016);
    env.gain.exponentialRampToValueAtTime(peakGain * 0.42, now + 0.45);
    env.gain.exponentialRampToValueAtTime(0.0001, now + ringTime);

    stringOsc.connect(jawariFilter);
    jawariFilter.connect(stringGain);
    bodyOsc.connect(bodyGain);
    tarafOsc.connect(tarafGain);

    stringGain.connect(gourdLowpass);
    bodyGain.connect(gourdLowpass);
    tarafGain.connect(gourdLowpass);

    gourdLowpass.connect(env);
    env.connect(this.dryBus);

    stringOsc.start(now);
    bodyOsc.start(now);
    tarafOsc.start(now);

    const stopTime = now + ringTime + 0.1;
    stringOsc.stop(stopTime);
    bodyOsc.stop(stopTime);
    tarafOsc.stop(stopTime);
  }

  private scheduleNextPhrase(): void {
    if (!this.playing || !this.ctx || !this.dryBus) return;

    const phrase = this.duetPhrases[this.phraseCursor % this.duetPhrases.length];
    this.phraseCursor += 1;

    let offsetMs = 0;
    phrase.notes.forEach((note) => {
      const freq = this.raagScale[note.degree] ?? 261.63;
      const glideFromFreq =
        note.glideFromDegree !== undefined ? this.raagScale[note.glideFromDegree] : undefined;

      this.scheduleTimer(() => {
        if (!this.playing) return;
        if (phrase.instrument === 'shehnai') {
          this.playShehnaiNote(freq, note.durationSec, glideFromFreq, note.expressiveness ?? 0.9);
        } else {
          this.playSitarNote(freq, note.durationSec, glideFromFreq, note.expressiveness ?? 0.9);
        }
      }, offsetMs);

      // Gentle legato overlap for Shehnai, crisp rhythmic flow for Sitar
      const stepFactor = phrase.instrument === 'shehnai' ? 0.92 : 0.88;
      offsetMs += Math.round(note.durationSec * 1000 * stepFactor);
    });

    this.scheduleTimer(() => {
      if (this.playing) this.scheduleNextPhrase();
    }, offsetMs + phrase.restAfterMs);
  }

  /**
   * Triggers a crisp, reverent Indian brass temple bell (ghanti) chime
   * routed through the warm courtyard ambience.
   */
  public playTempleChime(intensity: 'soft' | 'ceremonial' = 'ceremonial'): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const bellBus = ctx.createGain();
    const baseVolume = intensity === 'ceremonial' ? 0.2 : 0.13;
    bellBus.gain.setValueAtTime(0.0001, now);
    bellBus.gain.linearRampToValueAtTime(baseVolume, now + 0.008);
    bellBus.gain.exponentialRampToValueAtTime(0.0001, now + 3.6);
    bellBus.connect(ctx.destination);

    if (this.reverbNode) {
      const bellWet = ctx.createGain();
      bellWet.gain.value = 0.28;
      bellBus.connect(bellWet);
      bellWet.connect(this.reverbNode);
    }

    // Authentic bronze temple bell harmonic ratios
    const partials = [
      { freq: 784.0, gain: 0.55, decay: 3.2 }, // Fundamental G5
      { freq: 1568.0, gain: 0.28, decay: 2.4 }, // Octave
      { freq: 2145.0, gain: 0.15, decay: 1.75 }, // Metallic tierce partial
      { freq: 3136.0, gain: 0.08, decay: 1.15 }, // High shimmer overtone
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now);
      g.gain.setValueAtTime(p.gain, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);
      osc.connect(g);
      g.connect(bellBus);
      osc.start(now);
      osc.stop(now + p.decay + 0.12);
    });
  }

  private fadeInterval: number | null = null;

  private clearFade(): void {
    if (this.fadeInterval !== null) {
      window.clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  public startAmbience(): void {
    if (this.playing) return;

    // Play the mastered seamless looping joyful Indian wedding instrumental MP3
    if (MEDIA_ASSETS.backgroundMusicUrl) {
      try {
        if (!this.externalAudio) {
          this.externalAudio = new Audio(MEDIA_ASSETS.backgroundMusicUrl);
          this.externalAudio.loop = true;
          this.externalAudio.preload = 'auto';
        }
        this.clearFade();
        this.externalAudio.volume = 0.02;
        const playPromise = this.externalAudio.play();
        if (playPromise) {
          playPromise
            .then(() => {
              this.playing = true;
              this.emit();
              // Smooth celebratory fade-in over ~1.1s
              let vol = 0.02;
              this.fadeInterval = window.setInterval(() => {
                if (!this.externalAudio || !this.playing) {
                  this.clearFade();
                  return;
                }
                vol = Math.min(0.58, vol + 0.04);
                this.externalAudio.volume = vol;
                if (vol >= 0.58) this.clearFade();
              }, 75);
            })
            .catch(() => {
              this.startSynthesizedAmbience();
            });
        }
        return;
      } catch {
        // Fallback to procedural Sitar & Shehnai engine
      }
    }

    this.startSynthesizedAmbience();
  }

  private startSynthesizedAmbience(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    this.startTanpuraDrone(ctx);
    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
    this.masterGain.gain.linearRampToValueAtTime(0.72, now + 1.5);

    this.playing = true;
    this.emit();

    this.clearAllTimers();
    this.scheduleTimer(() => this.scheduleNextPhrase(), 650);
  }

  public pauseAmbience(): void {
    if (!this.playing) return;
    this.playing = false;
    this.emit();

    this.clearFade();
    if (this.externalAudio) {
      this.externalAudio.pause();
    }

    this.clearAllTimers();

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
    }
  }

  public toggleAmbience(): boolean {
    if (this.playing) {
      this.pauseAmbience();
    } else {
      this.startAmbience();
    }
    return this.playing;
  }

  public dispose(): void {
    this.pauseAmbience();
    this.droneNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as OscillatorNode).stop === 'function') {
          (node as OscillatorNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore already stopped
      }
    });
    this.droneNodes = [];
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const classicalAudio = new ClassicalAudioEngine();
