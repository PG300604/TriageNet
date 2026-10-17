/**
 * sound-beacon.ts — Tactical Audio Synthesizer for TriageNet
 *
 * Implements Phase 13: Zero-Email W3C Acoustic Sound Beacon & Emergency Sirens.
 * Uses 100% native Web Audio API (AudioContext) with zero external audio assets
 * or MP3 dependencies. Works offline across low-bandwidth clinical endpoints.
 */

class SoundBeaconManager {
  private audioCtx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('triagenet_sound_muted');
      if (stored !== null) {
        this.muted = stored === 'true';
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('triagenet_sound_muted', String(muted));
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * 108 Emergency Dual-Tone Siren
   * Alternates 750 Hz (Low) and 960 Hz (Hi) frequencies in tactical pulses.
   */
  public playDualToneSiren(durationSec: number = 2.4): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.08, now);

    // Alternate 750Hz and 960Hz every 0.3s
    const steps = Math.floor(durationSec / 0.3);
    for (let i = 0; i < steps; i++) {
      const freq = i % 2 === 0 ? 750 : 960;
      osc.frequency.setValueAtTime(freq, now + i * 0.3);
    }

    gain.gain.setValueAtTime(0.08, now + durationSec - 0.1);
    gain.gain.linearRampToValueAtTime(0.001, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec);
  }

  /**
   * Critical Acuity / Sepsis Alert Chime
   * 1200 Hz pulsed warning tone for SpO2 drop or severe triage escalation.
   */
  public playCriticalVitalsChime(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const beeps = [0, 0.12, 0.24];

    beeps.forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now + offset);

      gain.gain.setValueAtTime(0.12, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  /**
   * Hungarian Matcher Bed Allocation Confirmation Chime
   * Harmonic C5 (523 Hz) -> E5 (659 Hz) -> G5 (784 Hz) major triad arpeggio.
   */
  public playTriageSuccessSound(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.14, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.36);
    });
  }

  public playAllocationChime(): void {
    this.playTriageSuccessSound();
  }

  /**
   * Tactical Walkie-Talkie / Radio PTT Click
   * Brief burst for dispatch transmissions & UI actions.
   */
  public playRadioClick(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }
}

export const soundBeacon = new SoundBeaconManager();
