import React from 'react';

interface HeaderProps {
  onTryDemo: () => void;
  onOpenLibrary?: () => void;
  libraryCount?: number;
  onOpenAnalytics?: () => void;
  onOpenCheatsheet?: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onTryDemo,
  onOpenLibrary,
  libraryCount,
  onOpenAnalytics,
  onOpenCheatsheet,
  onToggleFullscreen,
  onOpenSettings
}) => {
  return (
    <header className="app-header">
      <div className="brand">
        <svg className="brand-mark" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" opacity="0.35"/>
          <circle cx="16" cy="16" r="7.5" stroke="currentColor" strokeWidth="2" opacity="0.7"/>
          <circle cx="16" cy="16" r="2.6" fill="currentColor"/>
          <line x1="16" y1="0.5" x2="16" y2="5" stroke="currentColor" strokeWidth="2" opacity="0.35"/>
          <line x1="16" y1="27" x2="16" y2="31.5" stroke="currentColor" strokeWidth="2" opacity="0.35"/>
        </svg>
        <div className="brand-text">
          <div className="eyebrow">FOCUS</div>
          <div className="title">Reader</div>
        </div>
      </div>
      <nav className="header-actions">
        {onOpenLibrary && (
          <button className="text-btn" type="button" onClick={onOpenLibrary} title="Open Document Library">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            Library
            {libraryCount !== undefined && libraryCount > 0 && (
              <span style={{
                background: 'var(--accent-soft)',
                color: 'var(--accent)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '10px',
                marginLeft: '3px'
              }}>
                {libraryCount}
              </span>
            )}
          </button>
        )}
        <button className="text-btn" type="button" onClick={onTryDemo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="6 4 20 12 6 20 6 4"/>
          </svg>
          Try demo
        </button>
        {onOpenAnalytics && (
          <button
            className="icon-btn"
            type="button"
            onClick={onOpenAnalytics}
            aria-label="View Analytics"
            title="Analytics"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
        )}
        {onOpenCheatsheet && (
          <button
            className="icon-btn"
            type="button"
            onClick={onOpenCheatsheet}
            aria-label="Keyboard Shortcuts"
            title="Keyboard Shortcuts (?)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        )}
        <button
          className="icon-btn"
          type="button"
          onClick={onOpenSettings}
          aria-label="Open settings"
          title="Settings"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <button
          className="icon-btn"
          type="button"
          onClick={onToggleFullscreen}
          aria-label="Toggle fullscreen"
          title="Fullscreen"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m11-5v3a2 2 0 0 1-2 2h-3"/>
          </svg>
        </button>
      </nav>
    </header>
  );
};
