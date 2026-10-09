/**
 * Synthesizes low-latency auditory pacing micro-clicks via the browser Web Audio API.
 * Eliminates the need for external sound files, guaranteeing zero network latency.
 */
export class AudioPacer {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;
  private volume: number = 0.3;
  private pitch: number = 600;

  /**
   * Initializes a new AudioPacer instance.
   * @param enabled Whether audio cadence is enabled initially
   * @param volume Initial volume level (0.0 to 1.0)
   * @param pitch Oscillator frequency pitch in Hz (200 to 1500)
   */
  constructor(enabled: boolean = false, volume: number = 0.3, pitch: number = 600) {
    this.enabled = enabled;
    this.volume = volume;
    this.pitch = pitch;
  }

  /**
   * Lazily initializes and resumes the AudioContext upon user gesture.
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Sets whether the auditory pacer emits clicks during playback.
   * @param enabled Boolean flag
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.getContext();
    }
  }

  /**
   * Returns whether the audio pacer is currently enabled.
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Sets the volume level between 0.0 (silent) and 1.0 (full).
   * @param volume Volume level
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Returns the current volume level.
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Sets the oscillator frequency pitch in Hz (clamped between 200 and 1500).
   * @param pitch Frequency in Hz
   */
  public setPitch(pitch: number): void {
    this.pitch = Math.max(200, Math.min(1500, pitch));
  }

  /**
   * Returns the current oscillator frequency pitch in Hz.
   */
  public getPitch(): number {
    return this.pitch;
  }

  /**
   * Synthesizes an instantaneous, crisp micro-click sound using a triangle oscillator
   * and exponential decay gain envelope.
   * @param overridePitch Optional pitch override in Hz
   * @param overrideVolume Optional volume override (0.0 to 1.0)
   */
  public playClick(overridePitch?: number, overrideVolume?: number): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = overridePitch ?? this.pitch;
      const vol = overrideVolume ?? this.volume;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.015);

      gain.gain.setValueAtTime(vol * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // AudioContext policy catch
    }
  }

  /**
   * Plays a preview click (useful in settings sliders).
   * @param pitch Optional test pitch
   * @param volume Optional test volume
   */
  public audition(pitch?: number, volume?: number): void {
    this.playClick(pitch, volume);
  }

  /**
   * Closes the AudioContext and releases hardware audio resources.
   */
  public destroy(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}
