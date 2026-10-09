import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { WordToken, PlaybackStatus, ReadingMode } from '../types/reader';
import type { ChapterMarker } from '../engine/markdownParser';
import { RSVPEngine } from '../engine/rsvpEngine';
import { CountdownOverlay } from './CountdownOverlay';
import { TimelineScrubber } from './TimelineScrubber';
import { PauseContextCard } from './PauseContextCard';
import { bionicSplit } from '../engine/bionicFormatter';

interface ReaderViewProps {
  engine: RSVPEngine;
  tokens: WordToken[];
  countdownEnabled: boolean;
  fontSize?: 'small' | 'medium' | 'large' | 'xl';
  bionicMode?: boolean;
  audioCadenceEnabled?: boolean;
  onToggleAudioCadence?: () => void;
  chapters?: ChapterMarker[];
  onOpenChapters?: () => void;
  startPosition?: number;
  onBookmarkSave?: (index: number) => void;
  onExit: () => void;
  onOpenCheatsheet?: () => void;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
}

const WPM_PRESETS = [100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500];

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  engine,
  tokens,
  countdownEnabled,
  fontSize = 'medium',
  bionicMode = false,
  audioCadenceEnabled = false,
  onToggleAudioCadence,
  chapters = [],
  onOpenChapters,
  startPosition = 0,
  onBookmarkSave,
  onExit,
  onOpenCheatsheet,
  onToggleFullscreen,
  onOpenSettings
}) => {
  const [currentToken, setCurrentToken] = useState<WordToken | null>(engine.getCurrentToken());
  const [currentIndex, setCurrentIndex] = useState<number>(engine.getCurrentIndex());
  const [status, setStatus] = useState<PlaybackStatus>(engine.getStatus());
  const [wpm, setWpm] = useState<number>(engine.getWpm());
  const [mode, setMode] = useState<ReadingMode>(engine.getMode());
  const [chunkSize, setChunkSize] = useState<1 | 2 | 3>(engine.getChunkSize());
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [focalGuide, setFocalGuide] = useState<boolean>(true);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(countdownEnabled);

  const viewportRef = useRef<HTMLDivElement>(null);
  const wordStageRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLSpanElement>(null);
  const orpRef = useRef<HTMLSpanElement>(null);
  const measureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize measurement canvas
  if (!measureCanvasRef.current) {
    measureCanvasRef.current = document.createElement('canvas');
  }

  const currentChunk = useMemo(() => engine.getCurrentChunk(), [engine, currentIndex, mode, chunkSize]);
  const ghostContext = useMemo(() => engine.getGhostContext(), [engine, currentIndex, mode]);
  const surroundingContext = useMemo(() => engine.getSurroundingContext(), [engine, currentIndex]);

  const handleModeChange = useCallback((newMode: ReadingMode) => {
    engine.setMode(newMode);
    setMode(newMode);
  }, [engine]);

  const handleChunkSizeChange = useCallback((newSize: 1 | 2 | 3) => {
    engine.setChunkSize(newSize);
    setChunkSize(newSize);
  }, [engine]);

  const startPlaybackAfterCountdown = useCallback(() => {
    setIsCountingDown(false);
    engine.play();
  }, [engine]);

  // Position word stage so the ORP lands at the exact horizontal center
  const updateStagePosition = useCallback(() => {
    if (!viewportRef.current || !wordStageRef.current || !beforeRef.current || !orpRef.current) return;
    const canvas = measureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cs = window.getComputedStyle(beforeRef.current);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;

    const beforeText = beforeRef.current.textContent || '';
    const orpText = orpRef.current.textContent || '';

    const beforeWidth = ctx.measureText(beforeText).width;
    const orpWidth = ctx.measureText(orpText || ' ').width;
    const viewportWidth = viewportRef.current.getBoundingClientRect().width;

    const focalX = viewportWidth / 2;
    const desiredLeft = focalX - beforeWidth - (orpWidth / 2);
    wordStageRef.current.style.left = `${desiredLeft.toFixed(2)}px`;
  }, []);

  // Subscribe to engine callbacks
  useEffect(() => {
    // When tokens are loaded, begin playing or countdown
    engine.loadTokens(tokens, startPosition || 0);
    if (!countdownEnabled) {
      setIsCountingDown(false);
      engine.play();
    } else {
      setIsCountingDown(true);
    }

    // Hook engine events
    (engine as unknown as { onTokenChange: (t: WordToken | null, idx: number) => void }).onTokenChange = (t, idx) => {
      setCurrentToken(t);
      setCurrentIndex(idx);
    };

    (engine as unknown as { onStatusChange: (s: PlaybackStatus) => void }).onStatusChange = (s) => {
      setStatus(s);
      if (s === 'paused') {
        onBookmarkSave?.(engine.getCurrentIndex());
      }
    };

    (engine as unknown as { onProgress: (cur: number, tot: number, elMs: number) => void }).onProgress = (_cur, _tot, elMs) => {
      setElapsedMs(elMs);
      setWpm(engine.getEffectiveWpm());
    };

    return () => {
      onBookmarkSave?.(engine.getCurrentIndex());
      engine.pause();
    };
  }, [engine, tokens, countdownEnabled, startPosition, onBookmarkSave]);

  // Re-align on token change or resize
  useEffect(() => {
    updateStagePosition();
  }, [currentToken, updateStagePosition]);

  useEffect(() => {
    const handleResize = () => updateStagePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateStagePosition]);

  const handleRestart = useCallback(() => {
    if (countdownEnabled) {
      engine.pause();
      engine.seekToIndex(0);
      setIsCountingDown(true);
    } else {
      engine.restart();
    }
  }, [engine, countdownEnabled]);

  const handleWpmChange = useCallback((newVal: number) => {
    const clamped = Math.max(50, Math.min(1500, newVal));
    engine.setWpm(clamped);
    setWpm(clamped);
  }, [engine]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'textarea' || tag === 'input' || tag === 'select') return;

      if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) {
        e.preventDefault();
        engine.pause();
        onOpenCheatsheet?.();
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          engine.toggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          engine.stepBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          engine.stepForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleWpmChange(engine.getWpm() + 25);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleWpmChange(engine.getWpm() - 25);
          break;
        case 'KeyR':
          e.preventDefault();
          handleRestart();
          break;
        case 'KeyF':
          e.preventDefault();
          setFocalGuide(prev => !prev);
          break;
        case 'KeyM':
          e.preventDefault();
          onToggleAudioCadence?.();
          break;
        case 'KeyC':
          e.preventDefault();
          onOpenChapters?.();
          break;
        case 'Digit1':
          e.preventDefault();
          handleModeChange('classic-orp');
          break;
        case 'Digit2':
          e.preventDefault();
          handleModeChange('ghost-context');
          break;
        case 'Digit3':
          e.preventDefault();
          handleModeChange('chunking');
          break;
        case 'BracketLeft':
          e.preventDefault();
          engine.rewindSentence();
          break;
        case 'BracketRight':
          e.preventDefault();
          engine.skipSentence();
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, onExit, onOpenCheatsheet, countdownEnabled, handleModeChange, handleRestart, handleWpmChange, onToggleAudioCadence, onOpenChapters]);

  const totalWords = tokens.length;
  const progressRatio = totalWords > 0 ? (currentIndex + 1) / totalWords : 0;
  const progressPercent = (progressRatio * 100).toFixed(1);
  const remainingWords = Math.max(0, totalWords - (currentIndex + 1));
  const remainingMs = wpm > 0 ? (remainingWords / wpm) * 60000 : 0;

  // Split current token into before, orp, after
  const { beforeText, orpChar, afterText } = useMemo(() => {
    if (!currentToken) return { beforeText: '', orpChar: '', afterText: '' };
    const text = currentToken.display;
    const idx = currentToken.orpIndex;
    return {
      beforeText: text.slice(0, idx),
      orpChar: text.slice(idx, idx + 1),
      afterText: text.slice(idx + 1)
    };
  }, [currentToken]);

  return (
    <main className="view-reader">
      {/* Top Bar */}
      <div className="reader-topbar">
        <button className="back-btn" type="button" onClick={onExit}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div className="reader-progress-mini">
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="progress-label-mini">
            {currentIndex + 1} / {totalWords}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onToggleAudioCadence && (
            <button
              className={`icon-btn ${audioCadenceEnabled ? 'active' : ''}`}
              type="button"
              onClick={onToggleAudioCadence}
              aria-label="Toggle audio metronome (M)"
              title={`Audio Metronome (M): ${audioCadenceEnabled ? 'ON' : 'OFF'}`}
              style={{
                color: audioCadenceEnabled ? 'var(--focus)' : 'inherit',
                borderColor: audioCadenceEnabled ? 'var(--focus)' : undefined
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                {audioCadenceEnabled ? (
                  <>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </>
                ) : (
                  <line x1="23" y1="9" x2="17" y2="15" />
                )}
              </svg>
            </button>
          )}
          {chapters && chapters.length > 0 && onOpenChapters && (
            <button
              className="icon-btn"
              type="button"
              onClick={onOpenChapters}
              aria-label="Table of Contents (C)"
              title="Table of Contents (C)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          )}
          {onOpenCheatsheet && (
            <button
              className="icon-btn"
              type="button"
              onClick={() => {
                engine.pause();
                onOpenCheatsheet();
              }}
              aria-label="Keyboard Shortcuts (?)"
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Reading Viewport */}
      <div className={`reading-viewport size-${fontSize}`} ref={viewportRef}>
        {isCountingDown && (
          <CountdownOverlay
            onComplete={startPlaybackAfterCountdown}
            onSkip={startPlaybackAfterCountdown}
          />
        )}
        {focalGuide && <div className="focal-guide" aria-hidden="true" />}
        <div className="word-stage word-anim" ref={wordStageRef} key={`${currentToken?.id ?? 0}-${mode}-${chunkSize}`}>
          {/* Ghost previous word */}
          {mode === 'ghost-context' && ghostContext.prev && (
            <span className="ghost-word ghost-prev">{ghostContext.prev.display}</span>
          )}

          {/* Focal word anchor */}
          <span className="focal-anchor">
            <span className="word-part w-before" ref={beforeRef}>{beforeText}</span>
            <span className="word-part w-orp orp-highlight" ref={orpRef}>{orpChar}</span>
            <span className="word-part w-after">{afterText}</span>
          </span>

          {/* Chunk trailing words */}
          {mode === 'chunking' && currentChunk.length > 1 && (
            <span className="chunk-trailing">
              {currentChunk.slice(1).map(tok => {
                if (bionicMode) {
                  const b = bionicSplit(tok.display);
                  return (
                    <span key={tok.id} className="chunk-word">
                      <strong style={{ fontWeight: 800 }}>{b.bold}</strong>{b.rest}
                    </span>
                  );
                }
                return (
                  <span key={tok.id} className="chunk-word">
                    {tok.display}
                  </span>
                );
              })}
            </span>
          )}

          {/* Ghost next word */}
          {mode === 'ghost-context' && ghostContext.next && (
            <span className="ghost-word ghost-next">{ghostContext.next.display}</span>
          )}
        </div>
      </div>

      {/* Reader Controls */}
      <div className="reader-controls">
        {/* Pause Context Inspector Card */}
        {status === 'paused' && !isCountingDown && surroundingContext.sentenceTokens.length > 0 && (
          <PauseContextCard
            sentenceTokens={surroundingContext.sentenceTokens}
            currentWordId={currentToken?.id ?? -1}
            onSelectWord={(id) => engine.seekToIndex(id)}
            onResume={() => engine.play()}
          />
        )}

        {/* Mode Switcher Pill */}
        <div className="mode-pills-bar">
          <div className="mode-pills">
            <button
              type="button"
              className={`mode-pill-btn ${mode === 'classic-orp' ? 'active' : ''}`}
              onClick={() => handleModeChange('classic-orp')}
              title="Classic ORP (1)"
            >
              Classic
            </button>
            <button
              type="button"
              className={`mode-pill-btn ${mode === 'ghost-context' ? 'active' : ''}`}
              onClick={() => handleModeChange('ghost-context')}
              title="Ghost Context (2)"
            >
              Ghost Context
            </button>
            <button
              type="button"
              className={`mode-pill-btn ${mode === 'chunking' ? 'active' : ''}`}
              onClick={() => handleModeChange('chunking')}
              title="Multi-Word Chunking (3)"
            >
              Chunking
            </button>
          </div>

          {mode === 'chunking' && (
            <div className="chunk-size-pills">
              {([1, 2, 3] as const).map(size => (
                <button
                  key={size}
                  type="button"
                  className={`chunk-pill-btn ${chunkSize === size ? 'active' : ''}`}
                  onClick={() => handleChunkSizeChange(size)}
                >
                  {size}w
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="stats-row">
          <span><strong>{currentIndex + 1}</strong> / {totalWords} words</span>
          <span><strong>{progressPercent}%</strong></span>
          <span>Elapsed <strong>{formatTime(elapsedMs)}</strong></span>
          <span>Remaining <strong>{formatTime(remainingMs)}</strong></span>
        </div>

        {/* Interactive Timeline Scrubber */}
        <TimelineScrubber
          currentIndex={currentIndex}
          tokens={tokens}
          onSeek={(idx) => engine.seekToIndex(idx)}
        />

        {/* Playback Controls */}
        <div className="playback-row">
          <button
            className="btn-icon"
            type="button"
            onClick={() => engine.rewindSentence()}
            title="Rewind 1 sentence ([)"
            aria-label="Rewind 1 sentence"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </svg>
          </button>

          <button
            className="btn-icon"
            type="button"
            onClick={() => engine.stepBackward()}
            title="Previous word (←)"
            aria-label="Previous word"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          <button
            className="btn-icon btn-play"
            type="button"
            onClick={() => engine.toggle()}
            title="Play / Pause (Space)"
            aria-label="Play or pause"
          >
            {status === 'playing' ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="7 4 20 12 7 20 7 4" />
              </svg>
            )}
          </button>

          <button
            className="btn-icon"
            type="button"
            onClick={() => engine.stepForward()}
            title="Next word (→)"
            aria-label="Next word"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>

          <button
            className="btn-icon"
            type="button"
            onClick={() => engine.skipSentence()}
            title="Skip 1 sentence (])"
            aria-label="Skip 1 sentence"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </svg>
          </button>

          <button
            className="btn-icon"
            type="button"
            onClick={() => engine.restart()}
            title="Restart (R)"
            aria-label="Restart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>

          <button
            className="btn-icon"
            type="button"
            onClick={onToggleFullscreen}
            title="Fullscreen"
            aria-label="Toggle fullscreen"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m11-5v3a2 2 0 0 1-2 2h-3" />
            </svg>
          </button>
        </div>

        {/* Speed Slider */}
        <div className="speed-row">
          <button
            className="btn-icon-sm"
            type="button"
            onClick={() => handleWpmChange(wpm - 25)}
            aria-label="Decrease speed"
          >
            −
          </button>
          <input
            type="range"
            min="50"
            max="1500"
            step="10"
            value={wpm}
            onChange={(e) => handleWpmChange(parseInt(e.target.value, 10))}
            aria-label="Words per minute"
          />
          <button
            className="btn-icon-sm"
            type="button"
            onClick={() => handleWpmChange(wpm + 25)}
            aria-label="Increase speed"
          >
            +
          </button>
          <span className="speed-label">{wpm} WPM</span>
        </div>

        {/* Speed Presets */}
        <div className="presets-row">
          {WPM_PRESETS.map((preset) => (
            <button
              key={preset}
              className={`preset-btn ${wpm === preset ? 'active' : ''}`}
              type="button"
              onClick={() => handleWpmChange(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};
