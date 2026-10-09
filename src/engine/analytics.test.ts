import { describe, it, expect, beforeEach } from 'vitest';
import { loadAnalytics, recordCompletedSession, clearAnalytics } from './analytics';

describe('analytics engine', () => {
  beforeEach(() => {
    clearAnalytics();
  });

  it('initializes with zeroed defaults', () => {
    const stats = loadAnalytics();
    expect(stats.totalWordsRead).toBe(0);
    expect(stats.completedSessions).toBe(0);
    expect(stats.topSpeedWpm).toBe(0);
    expect(stats.recentSessions).toEqual([]);
  });

  it('records completed sessions and updates cumulative stats', () => {
    const res1 = recordCompletedSession({
      title: 'First Article',
      wordsRead: 400,
      durationMs: 60000,
      avgWpm: 400
    });

    expect(res1.completedSessions).toBe(1);
    expect(res1.totalWordsRead).toBe(400);
    expect(res1.topSpeedWpm).toBe(400);
    expect(res1.recentSessions.length).toBe(1);

    const res2 = recordCompletedSession({
      title: 'Second Book Chapter',
      wordsRead: 600,
      durationMs: 60000,
      avgWpm: 600
    });

    expect(res2.completedSessions).toBe(2);
    expect(res2.totalWordsRead).toBe(1000);
    expect(res2.topSpeedWpm).toBe(600);
    expect(res2.recentSessions.length).toBe(2);
  });

  it('clears all recorded sessions correctly', () => {
    recordCompletedSession({
      title: 'Test',
      wordsRead: 200,
      durationMs: 30000,
      avgWpm: 400
    });

    const cleared = clearAnalytics();
    expect(cleared.totalWordsRead).toBe(0);
    expect(cleared.completedSessions).toBe(0);
  });
});
