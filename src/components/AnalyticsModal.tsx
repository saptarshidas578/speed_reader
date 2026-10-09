import React, { useEffect } from 'react';
import type { ReadingAnalytics } from '../engine/analytics';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: ReadingAnalytics;
  onClearAnalytics: () => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  analytics,
  onClearAnalytics
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalWords = analytics.totalWordsRead;
  const totalTime = formatDuration(analytics.totalDurationMs);
  const sessionsCount = analytics.completedSessions;
  const topSpeed = analytics.topSpeedWpm;

  // Average WPM across sessions
  const avgWpm =
    analytics.recentSessions.length > 0
      ? Math.round(
          analytics.recentSessions.reduce((acc, s) => acc + s.avgWpm, 0) /
            analytics.recentSessions.length
        )
      : 0;

  return (
    <>
      <div className="settings-backdrop" onClick={onClose} />
      <div className="analytics-modal" role="dialog" aria-modal="true" aria-labelledby="analytics-title">
        <div className="analytics-header">
          <div>
            <h3 id="analytics-title">Reading Velocity & Analytics</h3>
            <span className="analytics-sub">
              Your personal reading volume across {sessionsCount} completed {sessionsCount === 1 ? 'session' : 'sessions'}
            </span>
          </div>
          <button className="icon-btn-close" type="button" onClick={onClose} aria-label="Close analytics">
            ×
          </button>
        </div>

        <div className="analytics-body">
          {/* Hero Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-value">{totalWords.toLocaleString()}</span>
              <span className="metric-label">Words Consumed</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{totalTime}</span>
              <span className="metric-label">Time Invested</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{topSpeed} <small>WPM</small></span>
              <span className="metric-label">Top Velocity</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{avgWpm} <small>WPM</small></span>
              <span className="metric-label">Average Velocity</span>
            </div>
          </div>

          {/* Session History */}
          <div className="sessions-section">
            <h4>Recent Sessions ({analytics.recentSessions.length})</h4>
            {analytics.recentSessions.length === 0 ? (
              <div className="sessions-empty">
                <p>Complete your first reading stream to see performance history here.</p>
              </div>
            ) : (
              <div className="sessions-list">
                {analytics.recentSessions.map((session) => (
                  <div key={session.id} className="session-item">
                    <div className="session-item-left">
                      <span className="session-item-title">{session.title}</span>
                      <span className="session-item-date">{formatDate(session.timestamp)}</span>
                    </div>
                    <div className="session-item-right">
                      <span className="session-wpm-pill">{session.avgWpm} WPM</span>
                      <span className="session-words-sub">
                        {session.wordsRead.toLocaleString()} words · {formatDuration(session.durationMs)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="analytics-footer">
          {analytics.completedSessions > 0 && (
            <button
              type="button"
              className="btn-clear-analytics"
              onClick={() => {
                if (confirm('Reset your lifetime reading analytics and session history?')) {
                  onClearAnalytics();
                }
              }}
            >
              Reset History
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </>
  );
};
