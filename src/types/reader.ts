/**
 * Represents a tokenized word unit ready for RSVP presentation.
 */
export interface WordToken {
  /** Unique sequential identifier for the token. */
  id: number;
  /** Full formatted display string including surrounding punctuation. */
  display: string;
  /** Normalized alphanumeric representation without punctuation or trailing spaces. */
  cleanText: string;
  /** Character length of the cleaned alphanumeric string. */
  alnumLength: number;
  /** Relative duration multiplier based on terminal or clause punctuation (e.g. 2.2 for period). */
  pauseMultiplier: number;
  /** 0-based character index of the Optimal Recognition Point (ORP) within display string. */
  orpIndex: number;
  /** Sequential index of the sentence this token belongs to. */
  sentenceIndex: number;
  /** Sequential index of the paragraph this token belongs to. */
  paragraphIndex: number;
  /** True if this token is the first word in its sentence. */
  isSentenceStart: boolean;
  /** True if this token is the first word in its paragraph. */
  isParagraphStart: boolean;
}

/**
 * Visual RSVP presentation modes.
 * - 'classic-orp': Single word centered at the calculated ORP letter.
 * - 'ghost-context': Single word centered with dimmed peripheral previous/next words.
 * - 'chunking': Multi-word rhythmic bursts (1, 2, or 3 words).
 */
export type ReadingMode = 'classic-orp' | 'ghost-context' | 'chunking';

/**
 * Playback state machine statuses.
 */
export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'complete';

/**
 * Comprehensive user configuration settings persisted across sessions.
 */
export interface ReaderSettings {
  /** Target speed in words per minute (50 to 1500). */
  wpm: number;
  /** Active visual RSVP mode. */
  mode: ReadingMode;
  /** Number of words displayed per flash when in 'chunking' mode (1, 2, or 3). */
  chunkSize: 1 | 2 | 3;
  /** When true, multiplies word duration for commas, semicolons, and periods. */
  smartPunctuation: boolean;
  /** When true, adds subtle duration bonus to long words (>9 characters). */
  longWordBoost: boolean;
  /** Number of times each word repeats before advancing (training mode). */
  wordRepetition: number;
  /** When true, bolds initial characters (Bionic reading format). */
  bionicMode: boolean;
  /** Active typography family. */
  fontFamily: 'sans' | 'mono' | 'dyslexic' | 'system';
  /** Display font scale preset. */
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  /** Font weight for the reading display text. */
  fontWeight: '500' | '600' | '700' | '800';
  /** Hex color for the highlighted ORP letter and focal markers. */
  focusColor: string;
  /** When true, renders vertical center guide markers. */
  focalGuide: boolean;
  /** Horizontal alignment alignment mode for the focal stage. */
  focalMode: 'auto' | 'center' | 'left' | 'right';
  /** Color theme preference. */
  theme: 'dark' | 'light' | 'system';
  /** When true, runs a 3-2-1 visual countdown before playback begins. */
  countdown: boolean;
  /** Progressive speed ramp settings. */
  progressiveSpeed: {
    /** Whether progressive speed ramp-up is active. */
    enabled: boolean;
    /** Starting speed in WPM. */
    startWpm: number;
    /** Maximum ceiling speed in WPM. */
    maxWpm: number;
    /** WPM step increase applied per interval. */
    increment: number;
    /** Interval duration in seconds between speed increments. */
    intervalSec: number;
  };
  /** Auditory metronome pacer settings. */
  audioCadence: {
    /** Whether synthesized audio clicks are enabled. */
    enabled: boolean;
    /** Output volume level (0.0 to 1.0). */
    volume: number;
    /** Oscillator frequency pitch in Hz (e.g. 600–1200). */
    pitch: number;
  };
}

/**
 * Default initial reader configuration.
 */
export const DEFAULT_SETTINGS: ReaderSettings = {
  wpm: 400,
  mode: 'classic-orp',
  chunkSize: 1,
  smartPunctuation: true,
  longWordBoost: true,
  wordRepetition: 0,
  bionicMode: false,
  fontFamily: 'sans',
  fontSize: 'medium',
  fontWeight: '700',
  focusColor: '#ff3b30',
  focalGuide: true,
  focalMode: 'auto',
  theme: 'dark',
  countdown: true,
  progressiveSpeed: {
    enabled: false,
    startWpm: 250,
    maxWpm: 600,
    increment: 25,
    intervalSec: 30
  },
  audioCadence: {
    enabled: false,
    volume: 0.3,
    pitch: 600
  }
};
