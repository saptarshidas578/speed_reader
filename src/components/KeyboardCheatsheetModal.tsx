import React, { useEffect } from 'react';

interface KeyboardCheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardCheatsheetModal: React.FC<KeyboardCheatsheetModalProps> = ({
  isOpen,
  onClose
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    {
      title: 'Playback & Flow',
      shortcuts: [
        { key: 'Space', desc: 'Play / Pause stream' },
        { key: 'R', desc: 'Restart document' },
        { key: 'Esc', desc: 'Exit reading view' }
      ]
    },
    {
      title: 'Navigation & Stepping',
      shortcuts: [
        { key: '← / →', desc: 'Step 1 word back / forward' },
        { key: '[ / ]', desc: 'Rewind / Skip 1 sentence' },
        { key: 'C', desc: 'Table of Contents drawer' }
      ]
    },
    {
      title: 'Pacing & Velocity',
      shortcuts: [
        { key: '↑ / ↓', desc: 'Speed ±25 words per minute' },
        { key: '1', desc: 'Classic ORP focal mode' },
        { key: '2', desc: 'Ghost context peripheral mode' },
        { key: '3', desc: 'Multi-word chunking bursts' }
      ]
    },
    {
      title: 'Focus & Sound',
      shortcuts: [
        { key: 'F', desc: 'Toggle center focal guide lines' },
        { key: 'M', desc: 'Toggle auditory metronome click' },
        { key: '?', desc: 'Toggle keyboard cheatsheet' }
      ]
    }
  ];

  return (
    <>
      <div className="settings-backdrop" onClick={onClose} />
      <div className="cheatsheet-modal" role="dialog" aria-modal="true" aria-labelledby="cheatsheet-title">
        <div className="cheatsheet-header">
          <div>
            <h3 id="cheatsheet-title">Keyboard Shortcuts</h3>
            <span className="cheatsheet-sub">Master rapid serial reading without touching the mouse</span>
          </div>
          <button className="icon-btn-close" type="button" onClick={onClose} aria-label="Close shortcuts">
            ×
          </button>
        </div>

        <div className="cheatsheet-body">
          <div className="cheatsheet-grid">
            {categories.map((cat) => (
              <div key={cat.title} className="cheatsheet-cat">
                <h4>{cat.title}</h4>
                <div className="cheatsheet-list">
                  {cat.shortcuts.map((s) => (
                    <div key={s.key} className="shortcut-row">
                      <kbd className="key-cap">{s.key}</kbd>
                      <span className="shortcut-desc">{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cheatsheet-footer">
          <p>Press <kbd className="key-cap-sm">?</kbd> at any time to toggle this reference card.</p>
        </div>
      </div>
    </>
  );
};
