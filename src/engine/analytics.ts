/**
 * Historical record of an individual completed reading stream.
 */
export interface SessionRecord {
  /** Unique session identifier. */
  id: string;
  /** Millisecond timestamp when the session finished. */
  timestamp: number;
  /** Document title or descriptive name. */
  title: string;
  /** Total count of words streamed in the session. */
  wordsRead: number;
  /** Active reading duration in milliseconds. */
  durationMs: number;
  /** Average effective speed achieved in words per minute. */
  avgWpm: number;
}

/**
 * Aggregated lifetime reading statistics and session history.
 */
export interface ReadingAnalytics {
  /** Cumulative total of all words read across sessions. */
  totalWordsRead: number;
  /** Cumulative total reading time in milliseconds. */
  totalDurationMs: number;
  /** Total number of successfully completed reading sessions. */
  completedSessions: number;
  /** Personal highest speed benchmark achieved in WPM. */
  topSpeedWpm: number;
  /** Chronological history of recent reading sessions (up to 50). */
  recentSessions: SessionRecord[];
}

const ANALYTICS_STORAGE_KEY = 'focus_reader_analytics_v1';

const DEFAULT_ANALYTICS: ReadingAnalytics = {
  totalWordsRead: 0,
  totalDurationMs: 0,
  completedSessions: 0,
  topSpeedWpm: 0,
  recentSessions: []
};

let memoryStorage: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    }
  } catch {
    // fallback
  }
  return memoryStorage[key] ?? null;
}

function setStorageItem(key: string, value: string): void {
  memoryStorage[key] = value;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {
    // fallback
  }
}

function removeStorageItem(key: string): void {
  delete memoryStorage[key];
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {
    // fallback
  }
}

/**
 * Loads aggregated reading analytics from local storage.
 * Falls back to in-memory defaults if local storage is unpopulated or unavailable.
 * @returns Current ReadingAnalytics record
 */
export function loadAnalytics(): ReadingAnalytics {
  try {
    const raw = getStorageItem(ANALYTICS_STORAGE_KEY);
    if (!raw) return DEFAULT_ANALYTICS;
    const parsed = JSON.parse(raw);
    return {
      totalWordsRead: Number(parsed.totalWordsRead) || 0,
      totalDurationMs: Number(parsed.totalDurationMs) || 0,
      completedSessions: Number(parsed.completedSessions) || 0,
      topSpeedWpm: Number(parsed.topSpeedWpm) || 0,
      recentSessions: Array.isArray(parsed.recentSessions) ? parsed.recentSessions : []
    };
  } catch {
    return DEFAULT_ANALYTICS;
  }
}

/**
 * Persists updated reading analytics to local storage.
 * @param analytics ReadingAnalytics data to store
 */
export function saveAnalytics(analytics: ReadingAnalytics): void {
  try {
    setStorageItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));
  } catch {
    // Ignored
  }
}

/**
 * Records a newly completed reading session, recalculates cumulative totals,
 * updates top speed records, and saves the updated analytics.
 * @param session Finished session parameters
 * @returns Updated ReadingAnalytics object
 */
export function recordCompletedSession(session: {
  title: string;
  wordsRead: number;
  durationMs: number;
  avgWpm: number;
}): ReadingAnalytics {
  const current = loadAnalytics();

  const newRecord: SessionRecord = {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    title: session.title || 'Reading Session',
    wordsRead: session.wordsRead,
    durationMs: session.durationMs,
    avgWpm: session.avgWpm
  };

  const updated: ReadingAnalytics = {
    totalWordsRead: current.totalWordsRead + session.wordsRead,
    totalDurationMs: current.totalDurationMs + session.durationMs,
    completedSessions: current.completedSessions + 1,
    topSpeedWpm: Math.max(current.topSpeedWpm, session.avgWpm),
    recentSessions: [newRecord, ...current.recentSessions.slice(0, 49)] // Keep last 50
  };

  saveAnalytics(updated);
  return updated;
}

/**
 * Resets lifetime reading analytics and wipes recent session history.
 * @returns Zeroed ReadingAnalytics object
 */
export function clearAnalytics(): ReadingAnalytics {
  removeStorageItem(ANALYTICS_STORAGE_KEY);
  return DEFAULT_ANALYTICS;
}
