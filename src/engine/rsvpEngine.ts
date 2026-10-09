import type { WordToken, PlaybackStatus, ReadingMode } from '../types/reader';
import type { AudioPacer } from './audioPacer';

/**
 * Initialization options for creating an RSVPEngine instance.
 */
export interface RSVPEngineOptions {
  /** Target reading speed in words per minute. */
  wpm: number;
  /** Visual presentation mode ('classic-orp', 'ghost-context', 'chunking'). */
  mode?: ReadingMode;
  /** Number of words per flash when in chunking mode (1, 2, or 3). */
  chunkSize?: 1 | 2 | 3;
  /** When true, pauses longer on punctuation marks (periods, commas, etc.). */
  smartPunctuation?: boolean;
  /** When true, adds 25% duration boost to long words (>10 characters). */
  longWordBoost?: boolean;
  /** Optional audio pacer instance for auditory metronome clicks. */
  audioPacer?: AudioPacer | null;
  /** Optional progressive speed acceleration configuration. */
  progressiveSpeed?: {
    enabled: boolean;
    startWpm: number;
    maxWpm: number;
    increment: number;
    intervalSec: number;
  };
  /** Callback fired whenever the current active word token changes. */
  onTokenChange?: (token: WordToken | null, index: number) => void;
  /** Callback fired whenever the playback status changes ('playing', 'paused', etc.). */
  onStatusChange?: (status: PlaybackStatus) => void;
  /** Callback fired with current progress, total words, and elapsed milliseconds. */
  onProgress?: (current: number, total: number, elapsedMs: number) => void;
  /** Callback fired upon reaching the final token of the document. */
  onComplete?: (stats: { totalWords: number; elapsedMs: number; avgWpm: number }) => void;
}

/**
 * High-precision, drift-free RSVP (Rapid Serial Visual Presentation) speed reading engine.
 * Powered by a continuous requestAnimationFrame loop synchronized with performance.now().
 */
export class RSVPEngine {
  private tokens: WordToken[] = [];
  private currentIndex: number = 0;
  private status: PlaybackStatus = 'idle';
  private wpm: number = 400;
  private mode: ReadingMode = 'classic-orp';
  private chunkSize: 1 | 2 | 3 = 1;
  private smartPunctuation: boolean = true;
  private longWordBoost: boolean = true;
  private progressiveSpeed = {
    enabled: false,
    startWpm: 250,
    maxWpm: 600,
    increment: 25,
    intervalSec: 30
  };
  private audioPacer: AudioPacer | null = null;

  private rafId: number | null = null;
  private lastTimestamp: number = 0;
  private accumulatedMs: number = 0;
  private sessionElapsedMs: number = 0;
  private sessionPlayStart: number = 0;

  private onTokenChange?: (token: WordToken | null, index: number) => void;
  private onStatusChange?: (status: PlaybackStatus) => void;
  private onProgress?: (current: number, total: number, elapsedMs: number) => void;
  private onComplete?: (stats: { totalWords: number; elapsedMs: number; avgWpm: number }) => void;

  /**
   * Initializes a new RSVPEngine instance.
   * @param options Configuration options and event callbacks
   */
  constructor(options: RSVPEngineOptions) {
    this.wpm = options.wpm;
    this.mode = options.mode || 'classic-orp';
    this.chunkSize = options.chunkSize || 1;
    this.smartPunctuation = options.smartPunctuation ?? true;
    this.longWordBoost = options.longWordBoost ?? true;
    this.audioPacer = options.audioPacer ?? null;
    if (options.progressiveSpeed) {
      this.progressiveSpeed = { ...this.progressiveSpeed, ...options.progressiveSpeed };
    }
    this.onTokenChange = options.onTokenChange;
    this.onStatusChange = options.onStatusChange;
    this.onProgress = options.onProgress;
    this.onComplete = options.onComplete;
  }

  /**
   * Connects or updates the synthesized audio metronome pacer.
   * @param pacer AudioPacer instance or null
   */
  public setAudioPacer(pacer: AudioPacer | null): void {
    this.audioPacer = pacer;
  }

  /**
   * Returns the connected audio pacer instance.
   */
  public getAudioPacer(): AudioPacer | null {
    return this.audioPacer;
  }

  /**
   * Loads a new token array and sets the initial bookmark position.
   * Resets elapsed session time and accumulators.
   * @param tokens Array of WordTokens to stream
   * @param startPosition 0-based initial word index (defaults to 0)
   */
  public loadTokens(tokens: WordToken[], startPosition: number = 0): void {
    this.stopLoop();
    this.tokens = tokens;
    this.currentIndex = Math.max(0, Math.min(startPosition, Math.max(0, tokens.length - 1)));
    this.accumulatedMs = 0;
    this.sessionElapsedMs = 0;
    this.status = tokens.length > 0 ? 'paused' : 'idle';

    this.notifyToken();
    this.notifyStatus();
    this.notifyProgress();
  }

  /**
   * Updates the target words-per-minute speed.
   * Clamped between 50 and 1500 WPM.
   * @param wpm Target speed in words per minute
   */
  public setWpm(wpm: number): void {
    this.wpm = Math.max(50, Math.min(1500, Math.round(wpm)));
    this.notifyProgress();
  }

  /**
   * Returns the base configured target words-per-minute speed.
   */
  public getWpm(): number {
    return this.wpm;
  }

  /**
   * Enables or disables proportional punctuation pause delays.
   * @param enabled Boolean flag
   */
  public setSmartPunctuation(enabled: boolean): void {
    this.smartPunctuation = enabled;
  }

  /**
   * Enables or disables duration boost for long words (>10 characters).
   * @param enabled Boolean flag
   */
  public setLongWordBoost(enabled: boolean): void {
    this.longWordBoost = enabled;
  }

  /**
   * Updates the progressive acceleration ramp configuration.
   * @param config Partial progressive speed parameters
   */
  public setProgressiveSpeed(config: Partial<typeof this.progressiveSpeed>): void {
    this.progressiveSpeed = { ...this.progressiveSpeed, ...config };
    this.notifyProgress();
  }

  /**
   * Returns a copy of the active progressive speed ramp configuration.
   */
  public getProgressiveSpeed() {
    return { ...this.progressiveSpeed };
  }

  /**
   * Calculates the instantaneous effective WPM taking progressive speed ramps into account.
   */
  public getEffectiveWpm(): number {
    if (!this.progressiveSpeed.enabled) return this.wpm;
    const elapsedSec = this.getElapsedMs() / 1000;
    const steps = Math.floor(elapsedSec / Math.max(1, this.progressiveSpeed.intervalSec));
    const target = this.progressiveSpeed.startWpm + steps * this.progressiveSpeed.increment;
    return Math.max(this.progressiveSpeed.startWpm, Math.min(this.progressiveSpeed.maxWpm, target));
  }

  /**
   * Returns the current playback status ('idle', 'playing', 'paused', 'complete').
   */
  public getStatus(): PlaybackStatus {
    return this.status;
  }

  /**
   * Returns the current 0-based token index.
   */
  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Returns the total count of loaded tokens.
   */
  public getTotalWords(): number {
    return this.tokens.length;
  }

  /**
   * Sets the active visual presentation mode.
   * @param mode 'classic-orp', 'ghost-context', or 'chunking'
   */
  public setMode(mode: ReadingMode): void {
    this.mode = mode;
    this.notifyToken();
  }

  /**
   * Returns the active visual presentation mode.
   */
  public getMode(): ReadingMode {
    return this.mode;
  }

  /**
   * Sets the chunk size when in chunking mode.
   * @param size 1, 2, or 3 words
   */
  public setChunkSize(size: 1 | 2 | 3): void {
    this.chunkSize = size;
    this.notifyToken();
  }

  /**
   * Returns the current chunk size setting.
   */
  public getChunkSize(): 1 | 2 | 3 {
    return this.chunkSize;
  }

  /**
   * Returns the slice of tokens corresponding to the current chunk.
   */
  public getCurrentChunk(): WordToken[] {
    const size = this.mode === 'chunking' ? this.chunkSize : 1;
    return this.tokens.slice(this.currentIndex, this.currentIndex + size);
  }

  /**
   * Returns the peripheral ghost context (previous, current, and next words).
   */
  public getGhostContext(): { prev: WordToken | null; current: WordToken | null; next: WordToken | null } {
    return {
      prev: this.currentIndex > 0 ? this.tokens[this.currentIndex - 1] : null,
      current: this.tokens[this.currentIndex] || null,
      next: this.currentIndex < this.tokens.length - 1 ? this.tokens[this.currentIndex + 1] : null
    };
  }

  /**
   * Returns the single WordToken currently active at currentIndex.
   */
  public getCurrentToken(): WordToken | null {
    return this.tokens[this.currentIndex] || null;
  }

  /**
   * Returns total elapsed playback time for this session in milliseconds.
   */
  public getElapsedMs(): number {
    if (this.status === 'playing') {
      return this.sessionElapsedMs + (performance.now() - this.sessionPlayStart);
    }
    return this.sessionElapsedMs;
  }

  /**
   * Starts or resumes RSVP streaming from the current index.
   */
  public play(): void {
    if (this.tokens.length === 0) return;
    if (this.status === 'playing') return;

    if (this.currentIndex >= this.tokens.length - 1) {
      this.currentIndex = 0;
      this.accumulatedMs = 0;
    }

    this.status = 'playing';
    this.sessionPlayStart = performance.now();
    this.lastTimestamp = performance.now();
    this.accumulatedMs = 0;

    this.notifyStatus();
    this.notifyToken();
    this.notifyProgress();

    if (this.audioPacer?.isEnabled()) {
      this.audioPacer.playClick();
    }

    if (typeof requestAnimationFrame !== 'undefined') {
      this.rafId = requestAnimationFrame(this.loop.bind(this));
    }
  }

  /**
   * Pauses RSVP streaming and freezes the current position.
   */
  public pause(): void {
    if (this.status !== 'playing') return;

    this.sessionElapsedMs += performance.now() - this.sessionPlayStart;
    this.stopLoop();
    this.status = 'paused';

    this.notifyStatus();
    this.notifyProgress();
  }

  /**
   * Toggles playback between playing and paused.
   */
  public toggle(): void {
    if (this.status === 'playing') {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Rewinds stream to word index zero and immediately begins playing.
   */
  public restart(): void {
    this.stopLoop();
    this.currentIndex = 0;
    this.accumulatedMs = 0;
    this.sessionElapsedMs = 0;
    this.play();
  }

  /**
   * Steps forward by 1 word (or active chunk size) while paused.
   */
  public stepForward(): void {
    this.pause();
    const step = this.mode === 'chunking' ? this.chunkSize : 1;
    if (this.currentIndex < this.tokens.length - 1) {
      this.currentIndex = Math.min(this.tokens.length - 1, this.currentIndex + step);
      this.notifyToken();
      this.notifyProgress();
    }
  }

  /**
   * Steps backward by 1 word (or active chunk size) while paused.
   */
  public stepBackward(): void {
    this.pause();
    const step = this.mode === 'chunking' ? this.chunkSize : 1;
    if (this.currentIndex > 0) {
      this.currentIndex = Math.max(0, this.currentIndex - step);
      this.notifyToken();
      this.notifyProgress();
    }
  }

  /**
   * Seeks directly to an arbitrary token index.
   * Maintains playback state if currently playing.
   * @param index Target token index
   */
  public seekToIndex(index: number): void {
    const wasPlaying = this.status === 'playing';
    if (wasPlaying) this.pause();

    this.currentIndex = Math.max(0, Math.min(index, this.tokens.length - 1));
    this.accumulatedMs = 0;

    this.notifyToken();
    this.notifyProgress();

    if (wasPlaying) this.play();
  }

  /**
   * Rewinds playback to the start of the current or preceding sentence.
   */
  public rewindSentence(): void {
    const wasPlaying = this.status === 'playing';
    if (wasPlaying) this.pause();

    const currentToken = this.getCurrentToken();
    if (!currentToken || this.currentIndex === 0) return;

    let targetIndex = this.currentIndex;
    while (targetIndex > 0 && !this.tokens[targetIndex].isSentenceStart) {
      targetIndex--;
    }

    if (this.currentIndex - targetIndex <= 1 && targetIndex > 0) {
      targetIndex--;
      while (targetIndex > 0 && !this.tokens[targetIndex].isSentenceStart) {
        targetIndex--;
      }
    }

    this.currentIndex = targetIndex;
    this.accumulatedMs = 0;
    this.notifyToken();
    this.notifyProgress();

    if (wasPlaying) this.play();
  }

  /**
   * Skips forward past the remaining words of the current sentence.
   */
  public skipSentence(): void {
    const wasPlaying = this.status === 'playing';
    if (wasPlaying) this.pause();

    const currentToken = this.getCurrentToken();
    if (!currentToken) return;

    const currentSentence = currentToken.sentenceIndex;
    let targetIndex = this.currentIndex;
    while (targetIndex < this.tokens.length && this.tokens[targetIndex].sentenceIndex === currentSentence) {
      targetIndex++;
    }

    if (targetIndex < this.tokens.length) {
      this.currentIndex = targetIndex;
      this.accumulatedMs = 0;
      this.notifyToken();
      this.notifyProgress();
    }

    if (wasPlaying) this.play();
  }

  /**
   * Returns surrounding sentence and paragraph context for ambient pause preview.
   */
  public getSurroundingContext(): {
    sentenceTokens: WordToken[];
    currentWordIndexInSentence: number;
    paragraphTokens: WordToken[];
  } {
    const currentToken = this.getCurrentToken();
    if (!currentToken) {
      return { sentenceTokens: [], currentWordIndexInSentence: -1, paragraphTokens: [] };
    }

    const sentenceTokens = this.tokens.filter(t => t.sentenceIndex === currentToken.sentenceIndex);
    const paragraphTokens = this.tokens.filter(t => t.paragraphIndex === currentToken.paragraphIndex);
    const currentWordIndexInSentence = sentenceTokens.findIndex(t => t.id === currentToken.id);

    return {
      sentenceTokens,
      currentWordIndexInSentence,
      paragraphTokens
    };
  }

  /**
   * Calculates the precise duration in milliseconds for the current word or chunk.
   * Incorporates base WPM, punctuation multipliers, and word length boosts.
   */
  private calculateTokenDelay(_token?: WordToken): number {
    const effectiveWpm = this.getEffectiveWpm();
    const chunk = this.getCurrentChunk();
    const wordCount = Math.max(1, chunk.length);

    let delay = (60000 / Math.max(1, effectiveWpm)) * wordCount;

    if (this.mode === 'chunking' && wordCount > 1) {
      delay = (60000 / Math.max(1, effectiveWpm)) * (wordCount * 0.9);
    }

    if (this.smartPunctuation) {
      const maxMultiplier = Math.max(...chunk.map(t => t.pauseMultiplier));
      if (maxMultiplier > 1) {
        delay *= maxMultiplier;
      }
    }
    if (this.longWordBoost && chunk.some(t => t.alnumLength > 10)) {
      delay *= 1.25;
    }
    return delay;
  }

  /**
   * Core requestAnimationFrame animation loop.
   * Maintains sub-millisecond precision with delta accumulation.
   */
  private loop(now: number): void {
    if (this.status !== 'playing') return;

    const delta = now - this.lastTimestamp;
    this.lastTimestamp = now;
    this.accumulatedMs += delta;

    const currentToken = this.tokens[this.currentIndex];
    if (!currentToken) {
      this.finish();
      return;
    }

    const targetDelay = this.calculateTokenDelay(currentToken);

    if (this.accumulatedMs >= targetDelay) {
      this.accumulatedMs -= targetDelay;
      const advanceStep = this.mode === 'chunking' ? this.chunkSize : 1;
      this.currentIndex += advanceStep;

      if (this.currentIndex >= this.tokens.length) {
        this.finish();
        return;
      }

      this.notifyToken();
      this.notifyProgress();

      if (this.audioPacer?.isEnabled()) {
        this.audioPacer.playClick();
      }
    }

    if (typeof requestAnimationFrame !== 'undefined') {
      this.rafId = requestAnimationFrame(this.loop.bind(this));
    }
  }

  /**
   * Handles document completion when the final token has been displayed.
   */
  private finish(): void {
    this.sessionElapsedMs += performance.now() - this.sessionPlayStart;
    this.stopLoop();
    this.status = 'complete';

    const totalWords = this.tokens.length;
    const elapsedMinutes = this.sessionElapsedMs / 60000;
    const avgWpm = elapsedMinutes > 0 ? Math.round(totalWords / elapsedMinutes) : this.wpm;

    this.notifyStatus();
    this.notifyProgress();
    if (this.onComplete) {
      this.onComplete({
        totalWords,
        elapsedMs: this.sessionElapsedMs,
        avgWpm
      });
    }
  }

  /**
   * Cancels any pending requestAnimationFrame subscription.
   */
  private stopLoop(): void {
    if (this.rafId !== null) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = null;
    }
  }

  private notifyToken(): void {
    if (this.onTokenChange) {
      this.onTokenChange(this.getCurrentToken(), this.currentIndex);
    }
  }

  private notifyStatus(): void {
    if (this.onStatusChange) {
      this.onStatusChange(this.status);
    }
  }

  private notifyProgress(): void {
    if (this.onProgress) {
      this.onProgress(this.currentIndex, this.tokens.length, this.getElapsedMs());
    }
  }

  /**
   * Cleans up engine loops and event references.
   */
  public destroy(): void {
    this.stopLoop();
  }
}
