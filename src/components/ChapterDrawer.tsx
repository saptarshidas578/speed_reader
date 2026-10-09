import React from 'react';
import type { ChapterMarker } from '../engine/markdownParser';

interface ChapterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterMarker[];
  currentIndex?: number;
  totalWords?: number;
  onSelectChapter: (startIndex: number) => void;
}

export const ChapterDrawer: React.FC<ChapterDrawerProps> = ({
  isOpen,
  onClose,
  chapters,
  currentIndex = 0,
  totalWords = 0,
  onSelectChapter
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="settings-backdrop" onClick={onClose} />
      <aside className="chapter-drawer open" aria-label="Table of Contents">
        <div className="chapter-drawer-header">
          <div>
            <h3>Table of Contents</h3>
            <span className="chapter-count-subtitle">
              {chapters.length} {chapters.length === 1 ? 'section' : 'sections'}
            </span>
          </div>
          <button
            className="icon-btn-close"
            type="button"
            onClick={onClose}
            aria-label="Close table of contents"
          >
            ×
          </button>
        </div>

        <div className="chapter-drawer-body">
          {chapters.length === 0 ? (
            <div className="chapter-empty">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p>No chapter divisions detected in this document.</p>
            </div>
          ) : (
            <ul className="chapter-list">
              {chapters.map((ch, idx) => {
                const nextCh = chapters[idx + 1];
                const endIdx = nextCh ? nextCh.startIndex : (totalWords || ch.startIndex + ch.wordCount);
                const isActive = currentIndex >= ch.startIndex && currentIndex < endIdx;
                const progressPct = totalWords > 0 ? Math.round((ch.startIndex / totalWords) * 100) : 0;

                return (
                  <li key={ch.id} className="chapter-item">
                    <button
                      type="button"
                      className={`chapter-btn ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        onSelectChapter(ch.startIndex);
                        onClose();
                      }}
                    >
                      <div className="chapter-btn-left">
                        <span className="chapter-index">{idx + 1}</span>
                        <div className="chapter-meta">
                          <span className="chapter-title">{ch.title}</span>
                          <span className="chapter-sub">
                            {ch.wordCount.toLocaleString()} words · {progressPct}%
                          </span>
                        </div>
                      </div>
                      {isActive && (
                        <span className="chapter-current-badge">Reading</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
};
