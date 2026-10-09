import React from 'react';

interface CompleteViewProps {
  totalWords: number;
  avgWpm: number;
  elapsedMs: number;
  onReadAgain: () => void;
  onBackToLibrary: () => void;
  onBackToText: () => void;
  onOpenAnalytics: () => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const CompleteView: React.FC<CompleteViewProps> = ({
  totalWords,
  avgWpm,
  elapsedMs,
  onReadAgain,
  onBackToLibrary,
  onBackToText,
  onOpenAnalytics
}) => {
  return (
    <main className="view-complete">
      <div className="complete-card">
        <div className="celebration-badge">
          <span>🎉</span> Stream Finished
        </div>
        <div className="complete-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2>Velocity Mastered</h2>
        <p className="complete-sub">
          You read <strong>{totalWords.toLocaleString()}</strong> words
        </p>

        <div className="complete-stats-grid">
          <div>
            <span>{avgWpm} WPM</span>
            <label>Average speed</label>
          </div>
          <div>
            <span>{formatTime(elapsedMs)}</span>
            <label>Reading time</label>
          </div>
        </div>

        <div className="complete-actions">
          <button className="btn btn-primary" type="button" onClick={onReadAgain}>
            Read again
          </button>
          <button className="btn btn-secondary" type="button" onClick={onOpenAnalytics}>
            View Analytics
          </button>
          <button className="btn btn-ghost" type="button" onClick={onBackToLibrary}>
            Back to Library
          </button>
          <button className="btn btn-ghost" type="button" onClick={onBackToText}>
            Back to text
          </button>
        </div>
      </div>
    </main>
  );
};
