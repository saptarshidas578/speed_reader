import React from 'react';
import type { ReaderSettings } from '../types/reader';
import type { AudioPacer } from '../engine/audioPacer';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings;
  audioPacer?: AudioPacer | null;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  audioPacer,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="settings-backdrop" onClick={onClose} />
      <aside className="settings-panel open" aria-label="Settings">
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="icon-btn-close" type="button" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>

        <div className="settings-body">
          {/* Display Mode Section */}
          <section className="settings-section">
            <h4>Display Mode</h4>

            <div className="mode-options-grid">
              <button
                type="button"
                className={`mode-select-btn ${settings.mode === 'classic-orp' ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ mode: 'classic-orp' })}
              >
                <span className="mode-title">Classic ORP</span>
                <span className="mode-desc">Single word with centered focal anchor</span>
              </button>

              <button
                type="button"
                className={`mode-select-btn ${settings.mode === 'ghost-context' ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ mode: 'ghost-context' })}
              >
                <span className="mode-title">Ghost Context</span>
                <span className="mode-desc">Faded surrounding words flank the center word</span>
              </button>

              <button
                type="button"
                className={`mode-select-btn ${settings.mode === 'chunking' ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ mode: 'chunking' })}
              >
                <span className="mode-title">Chunking</span>
                <span className="mode-desc">Read 2 or 3 words simultaneously in bursts</span>
              </button>
            </div>

            {settings.mode === 'chunking' && (
              <div className="setting-row" style={{ marginTop: '14px' }}>
                <span>Words per chunk</span>
                <div className="chunk-size-selector">
                  {([1, 2, 3] as const).map(size => (
                    <button
                      key={size}
                      type="button"
                      className={`chunk-size-btn ${settings.chunkSize === size ? 'active' : ''}`}
                      onClick={() => onUpdateSettings({ chunkSize: size })}
                    >
                      {size}w
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Pacing Section */}
          <section className="settings-section">
            <h4>Reading & Pacing</h4>

            <div className="setting-row">
              <span>3-2-1 Warmup Countdown</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.countdown}
                  onChange={(e) => onUpdateSettings({ countdown: e.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="setting-row">
              <span>Smart Punctuation Pauses</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.smartPunctuation}
                  onChange={(e) => onUpdateSettings({ smartPunctuation: e.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="setting-row">
              <span>Long Word Boost (&gt;10 chars)</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.longWordBoost}
                  onChange={(e) => onUpdateSettings({ longWordBoost: e.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            <div className="setting-row" style={{ marginTop: '16px' }}>
              <span>Progressive Speed Mode</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.progressiveSpeed.enabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      progressiveSpeed: {
                        ...settings.progressiveSpeed,
                        enabled: e.target.checked
                      }
                    })
                  }
                />
                <span className="slider" />
              </label>
            </div>

            {settings.progressiveSpeed.enabled && (
              <div className="progressive-options">
                <div className="setting-sub-row">
                  <span>Start WPM</span>
                  <input
                    type="number"
                    min="50"
                    max="1500"
                    step="10"
                    value={settings.progressiveSpeed.startWpm}
                    onChange={(e) =>
                      onUpdateSettings({
                        progressiveSpeed: {
                          ...settings.progressiveSpeed,
                          startWpm: Math.max(50, Math.min(1500, parseInt(e.target.value, 10) || 100))
                        }
                      })
                    }
                  />
                </div>

                <div className="setting-sub-row">
                  <span>Max WPM</span>
                  <input
                    type="number"
                    min="50"
                    max="1500"
                    step="10"
                    value={settings.progressiveSpeed.maxWpm}
                    onChange={(e) =>
                      onUpdateSettings({
                        progressiveSpeed: {
                          ...settings.progressiveSpeed,
                          maxWpm: Math.max(50, Math.min(1500, parseInt(e.target.value, 10) || 500))
                        }
                      })
                    }
                  />
                </div>

                <div className="setting-sub-row">
                  <span>Increase by (WPM)</span>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    step="5"
                    value={settings.progressiveSpeed.increment}
                    onChange={(e) =>
                      onUpdateSettings({
                        progressiveSpeed: {
                          ...settings.progressiveSpeed,
                          increment: Math.max(5, Math.min(200, parseInt(e.target.value, 10) || 25))
                        }
                      })
                    }
                  />
                </div>

                <div className="setting-sub-row">
                  <span>Interval (seconds)</span>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    step="5"
                    value={settings.progressiveSpeed.intervalSec}
                    onChange={(e) =>
                      onUpdateSettings({
                        progressiveSpeed: {
                          ...settings.progressiveSpeed,
                          intervalSec: Math.max(5, Math.min(300, parseInt(e.target.value, 10) || 30))
                        }
                      })
                    }
                  />
                </div>
              </div>
            )}
          </section>

          {/* Audio Cadence Metronome Section */}
          <section className="settings-section">
            <h4>Audio Cadence Metronome</h4>

            <div className="setting-row">
              <div>
                <span>Auditory Pacing Click</span>
                <span className="setting-hint" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Micro-click per word to suppress subvocalization
                </span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.audioCadence.enabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      audioCadence: {
                        ...settings.audioCadence,
                        enabled: e.target.checked
                      }
                    })
                  }
                />
                <span className="slider" />
              </label>
            </div>

            {settings.audioCadence.enabled && (
              <div className="audio-cadence-options" style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="setting-sub-row">
                  <span>Volume ({Math.round(settings.audioCadence.volume * 100)}%)</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.audioCadence.volume}
                    onChange={(e) =>
                      onUpdateSettings({
                        audioCadence: {
                          ...settings.audioCadence,
                          volume: parseFloat(e.target.value)
                        }
                      })
                    }
                  />
                </div>

                <div className="setting-sub-row">
                  <span>Pitch ({settings.audioCadence.pitch} Hz)</span>
                  <input
                    type="range"
                    min="200"
                    max="1200"
                    step="50"
                    value={settings.audioCadence.pitch}
                    onChange={(e) =>
                      onUpdateSettings({
                        audioCadence: {
                          ...settings.audioCadence,
                          pitch: parseInt(e.target.value, 10)
                        }
                      })
                    }
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    type="button"
                    className="preset-btn"
                    style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => {
                      if (audioPacer) {
                        audioPacer.audition(settings.audioCadence.pitch, settings.audioCadence.volume);
                      }
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                    Audition Click
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Appearance & Typography Section */}
          <section className="settings-section">
            <h4>Appearance & Typography</h4>

            {/* Font Family */}
            <div className="setting-row">
              <span>Font Family</span>
            </div>
            <div className="font-options-grid">
              <button
                type="button"
                className={`font-select-btn ${settings.fontFamily === 'sans' ? 'active' : ''}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
                onClick={() => onUpdateSettings({ fontFamily: 'sans' })}
              >
                Inter (Sans)
              </button>
              <button
                type="button"
                className={`font-select-btn ${settings.fontFamily === 'mono' ? 'active' : ''}`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                onClick={() => onUpdateSettings({ fontFamily: 'mono' })}
              >
                JetBrains (Mono)
              </button>
              <button
                type="button"
                className={`font-select-btn ${settings.fontFamily === 'dyslexic' ? 'active' : ''}`}
                style={{ fontFamily: 'OpenDyslexic, sans-serif' }}
                onClick={() => onUpdateSettings({ fontFamily: 'dyslexic' })}
              >
                OpenDyslexic
              </button>
              <button
                type="button"
                className={`font-select-btn ${settings.fontFamily === 'system' ? 'active' : ''}`}
                onClick={() => onUpdateSettings({ fontFamily: 'system' })}
              >
                System
              </button>
            </div>

            {/* Bionic Reading */}
            <div className="setting-row" style={{ marginTop: '16px' }}>
              <span>Bionic Reading (Anchor Bolding)</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.bionicMode}
                  onChange={(e) => onUpdateSettings({ bionicMode: e.target.checked })}
                />
                <span className="slider" />
              </label>
            </div>

            {/* Font Size */}
            <div className="setting-row" style={{ marginTop: '16px' }}>
              <span>Font Size</span>
              <div className="btn-group">
                {(['small', 'medium', 'large', 'xl'] as const).map(size => (
                  <button
                    key={size}
                    type="button"
                    className={`btn-group-opt ${settings.fontSize === size ? 'active' : ''}`}
                    onClick={() => onUpdateSettings({ fontSize: size })}
                  >
                    {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'XL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Weight */}
            <div className="setting-row" style={{ marginTop: '14px' }}>
              <span>Font Weight</span>
              <select
                className="select-dropdown"
                value={settings.fontWeight}
                onChange={(e) => onUpdateSettings({ fontWeight: e.target.value as '500' | '600' | '700' | '800' })}
              >
                <option value="500">Regular (500)</option>
                <option value="600">Medium (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
              </select>
            </div>

            {/* Focus Color */}
            <div className="setting-row" style={{ marginTop: '16px' }}>
              <span>Focus Anchor Color</span>
              <div className="color-swatches">
                {[
                  { name: 'Red', hex: '#ff3b30' },
                  { name: 'Orange', hex: '#ff9500' },
                  { name: 'Blue', hex: '#0a84ff' },
                  { name: 'Green', hex: '#30d158' },
                  { name: 'Purple', hex: '#bf5af2' }
                ].map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    className={`color-swatch ${settings.focusColor.toLowerCase() === c.hex ? 'active' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => onUpdateSettings({ focusColor: c.hex })}
                    aria-label={c.name}
                    title={c.name}
                  />
                ))}
                <input
                  type="color"
                  className="color-picker-input"
                  value={settings.focusColor}
                  onChange={(e) => onUpdateSettings({ focusColor: e.target.value })}
                  title="Custom Color"
                />
              </div>
            </div>

            {/* Theme */}
            <div className="setting-row" style={{ marginTop: '16px' }}>
              <span>Theme</span>
              <select
                className="select-dropdown"
                value={settings.theme}
                onChange={(e) => onUpdateSettings({ theme: e.target.value as 'dark' | 'light' | 'system' })}
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
                <option value="system">System Synchronized</option>
              </select>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
};
