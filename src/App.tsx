import { useState, useMemo, useCallback, useEffect } from 'react';
import { RSVPEngine } from './engine/rsvpEngine';
import { AudioPacer } from './engine/audioPacer';
import { parseText } from './engine/textParser';
import { parseMarkdown } from './engine/markdownParser';
import type { ChapterMarker } from './engine/markdownParser';
import { extractEpub } from './engine/epubExtractor';
import { extractPdf } from './engine/pdfExtractor';
import type { WordToken, ReaderSettings } from './types/reader';
import { DEFAULT_SETTINGS } from './types/reader';
import { Header } from './components/Header';
import { SetupView } from './components/SetupView';
import { ReaderView } from './components/ReaderView';
import { CompleteView } from './components/CompleteView';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ChapterDrawer } from './components/ChapterDrawer';
import { LibraryDrawer } from './components/LibraryDrawer';
import { AnalyticsModal } from './components/AnalyticsModal';
import { KeyboardCheatsheetModal } from './components/KeyboardCheatsheetModal';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import { loadAnalytics, recordCompletedSession, clearAnalytics } from './engine/analytics';
import type { ReadingAnalytics } from './engine/analytics';
import {
  saveDocument,
  getAllDocuments,
  deleteDocument as deleteStoredDocument,
  clearLibrary as clearStoredLibrary,
  updateBookmark,
  seedStarterDocuments
} from './engine/storage';
import type { StoredDocument } from './engine/storage';

const DEMO_TEXT = `The human mind is remarkably good at recognizing patterns. By reducing unnecessary eye movement, rapid serial visual presentation can create a different way to experience written language. With words centered dynamically at their optimal recognition points, comprehension accelerates effortlessly.`;
const SETTINGS_KEY = 'focus_reader_settings_v2';

function loadPersistedSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resolveTheme(pref: 'dark' | 'light' | 'system'): 'dark' | 'light' {
  if (pref === 'system') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return pref;
}

export function App() {
  const [view, setView] = useState<'setup' | 'reading' | 'complete'>('setup');
  const [text, setText] = useState<string>('');
  const [tokens, setTokens] = useState<WordToken[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [chapters, setChapters] = useState<ChapterMarker[]>([]);
  const [libraryDocs, setLibraryDocs] = useState<StoredDocument[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [startBookmarkIndex, setStartBookmarkIndex] = useState<number>(0);
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [parsingState, setParsingState] = useState<{ isParsing: boolean; percent: number; message: string } | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>(loadPersistedSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<ReadingAnalytics>(loadAnalytics);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState<boolean>(false);
  const [completionStats, setCompletionStats] = useState<{
    totalWords: number;
    elapsedMs: number;
    avgWpm: number;
  } | null>(null);

  // Global keyboard listener for help / cheatsheet (?)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'textarea' || tag === 'input' || tag === 'select') return;
      if (e.key === '?' || (e.shiftKey && e.code === 'Slash')) {
        e.preventDefault();
        setIsCheatsheetOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Seed and load initial starter documents into IndexedDB
  useEffect(() => {
    seedStarterDocuments()
      .then(docs => setLibraryDocs(docs))
      .catch(() => {});
  }, []);

  // Sync body data-view attribute
  useEffect(() => {
    document.body.setAttribute('data-view', view);
  }, [view]);

  // Apply visual theme, focus color, and typography custom properties
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolveTheme(settings.theme));
    document.documentElement.style.setProperty('--focus', settings.focusColor);
    document.documentElement.style.setProperty('--focus-glow', hexToRgba(settings.focusColor, 0.55));
    document.documentElement.style.setProperty('--word-font-weight', settings.fontWeight);

    const fontMap = {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", monospace',
      dyslexic: 'OpenDyslexic, sans-serif',
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };
    document.documentElement.style.setProperty('--font-reading', fontMap[settings.fontFamily] || fontMap.sans);
  }, [settings.theme, settings.focusColor, settings.fontWeight, settings.fontFamily]);

  // Handle completion from engine and log session to analytics
  const handleEngineComplete = useCallback((stats: { totalWords: number; elapsedMs: number; avgWpm: number }) => {
    setCompletionStats(stats);
    const sessionTitle = fileName || (text.slice(0, 32).trim() || 'Reading Stream');
    const updated = recordCompletedSession({
      title: sessionTitle,
      wordsRead: stats.totalWords,
      durationMs: stats.elapsedMs,
      avgWpm: stats.avgWpm
    });
    setAnalytics(updated);
    setView('complete');
  }, [fileName, text]);

  const handleClearAnalytics = useCallback(() => {
    const cleared = clearAnalytics();
    setAnalytics(cleared);
  }, []);

  // Persistent audio pacer instance
  const audioPacer = useMemo(() => {
    return new AudioPacer(
      settings.audioCadence.enabled,
      settings.audioCadence.volume,
      settings.audioCadence.pitch
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync audio pacer settings
  useEffect(() => {
    audioPacer.setEnabled(settings.audioCadence.enabled);
    audioPacer.setVolume(settings.audioCadence.volume);
    audioPacer.setPitch(settings.audioCadence.pitch);
  }, [audioPacer, settings.audioCadence]);

  // Persistent engine instance
  const engine = useMemo(() => {
    return new RSVPEngine({
      wpm: settings.wpm,
      smartPunctuation: settings.smartPunctuation,
      longWordBoost: settings.longWordBoost,
      progressiveSpeed: settings.progressiveSpeed,
      audioPacer: audioPacer,
      onComplete: handleEngineComplete
    });
  }, [audioPacer, handleEngineComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep engine in sync with settings
  useEffect(() => {
    engine.setSmartPunctuation(settings.smartPunctuation);
    engine.setLongWordBoost(settings.longWordBoost);
    engine.setProgressiveSpeed(settings.progressiveSpeed);
    engine.setWpm(settings.wpm);
    engine.setMode(settings.mode);
    engine.setChunkSize(settings.chunkSize);
    engine.setAudioPacer(audioPacer);
  }, [engine, settings, audioPacer]);

  const handleUpdateSettings = useCallback((updates: Partial<ReaderSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // Ignored
      }
      return next;
    });
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    const name = file.name;
    const lower = name.toLowerCase();

    if (lower.endsWith('.epub')) {
      setParsingState({ isParsing: true, percent: 5, message: 'Loading EPUB parser...' });
      try {
        const doc = await extractEpub(file, (pct, msg) => {
          setParsingState({ isParsing: true, percent: pct, message: msg });
        });
        setFileName(name);
        setText(doc.text);
        setTokens(doc.tokens);
        setChapters(doc.chapters);

        const newDoc: StoredDocument = {
          id: `doc-${Date.now()}`,
          title: doc.title,
          fileName: name,
          fileType: 'epub',
          rawText: doc.text,
          tokens: doc.tokens,
          chapters: doc.chapters,
          totalWords: doc.tokens.length,
          bookmarkIndex: 0,
          progressPercent: 0,
          lastReadAt: Date.now(),
          createdAt: Date.now()
        };
        await saveDocument(newDoc);
        setActiveDocId(newDoc.id);
        setStartBookmarkIndex(0);
        getAllDocuments().then(setLibraryDocs);

        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: 'EPUB Loaded',
          message: `"${doc.title}" saved to library (${doc.totalWords.toLocaleString()} words).`
        });
      } catch (err: unknown) {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          title: 'Failed to read EPUB',
          message: err instanceof Error ? err.message : 'Unknown extraction failure'
        });
      } finally {
        setParsingState(null);
      }
    } else if (lower.endsWith('.pdf')) {
      setParsingState({ isParsing: true, percent: 5, message: 'Loading PDF engine...' });
      try {
        const doc = await extractPdf(file, (pct, msg) => {
          setParsingState({ isParsing: true, percent: pct, message: msg });
        });
        setFileName(name);
        setText(doc.text);
        setTokens(doc.tokens);
        setChapters(doc.chapters);

        const newDoc: StoredDocument = {
          id: `doc-${Date.now()}`,
          title: doc.title,
          fileName: name,
          fileType: 'pdf',
          rawText: doc.text,
          tokens: doc.tokens,
          chapters: doc.chapters,
          totalWords: doc.tokens.length,
          bookmarkIndex: 0,
          progressPercent: 0,
          lastReadAt: Date.now(),
          createdAt: Date.now()
        };
        await saveDocument(newDoc);
        setActiveDocId(newDoc.id);
        setStartBookmarkIndex(0);
        getAllDocuments().then(setLibraryDocs);

        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: 'PDF Loaded',
          message: `"${doc.title}" saved to library (${doc.totalWords.toLocaleString()} words).`
        });
      } catch (err: unknown) {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          title: 'Failed to read PDF',
          message: err instanceof Error ? err.message : 'Unknown extraction failure'
        });
      } finally {
        setParsingState(null);
      }
    } else if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
      try {
        const raw = await file.text();
        const res = parseMarkdown(raw);
        setFileName(name);
        setText(res.cleanedText);
        setTokens(res.tokens);
        setChapters(res.chapters);

        const newDoc: StoredDocument = {
          id: `doc-${Date.now()}`,
          title: name.replace(/\.[^.]+$/, ''),
          fileName: name,
          fileType: 'md',
          rawText: res.cleanedText,
          tokens: res.tokens,
          chapters: res.chapters,
          totalWords: res.tokens.length,
          bookmarkIndex: 0,
          progressPercent: 0,
          lastReadAt: Date.now(),
          createdAt: Date.now()
        };
        await saveDocument(newDoc);
        setActiveDocId(newDoc.id);
        setStartBookmarkIndex(0);
        getAllDocuments().then(setLibraryDocs);

        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: 'Markdown Loaded',
          message: `${res.tokens.length.toLocaleString()} words saved to library.`
        });
      } catch {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          title: 'File Read Error',
          message: 'Could not read markdown file.'
        });
      }
    } else {
      // Plain text
      try {
        const raw = await file.text();
        setFileName(name);
        setText(raw);
        const parsed = parseText(raw);
        setTokens(parsed);
        setChapters([]);

        const newDoc: StoredDocument = {
          id: `doc-${Date.now()}`,
          title: name.replace(/\.[^.]+$/, ''),
          fileName: name,
          fileType: 'txt',
          rawText: raw,
          tokens: parsed,
          chapters: [],
          totalWords: parsed.length,
          bookmarkIndex: 0,
          progressPercent: 0,
          lastReadAt: Date.now(),
          createdAt: Date.now()
        };
        await saveDocument(newDoc);
        setActiveDocId(newDoc.id);
        setStartBookmarkIndex(0);
        getAllDocuments().then(setLibraryDocs);

        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: 'Text File Loaded',
          message: `${parsed.length.toLocaleString()} words saved to library.`
        });
      } catch {
        setToast({
          id: Date.now().toString(),
          type: 'error',
          title: 'File Read Error',
          message: 'Could not read plain text file.'
        });
      }
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFileName(null);
    setChapters([]);
    setActiveDocId(null);
    setStartBookmarkIndex(0);
  }, []);

  const handleStartReading = useCallback(() => {
    let activeTokens = tokens;
    if (activeTokens.length === 0 && text.trim().length > 0) {
      if (fileName?.endsWith('.md') || fileName?.endsWith('.markdown')) {
        const res = parseMarkdown(text);
        activeTokens = res.tokens;
        setChapters(res.chapters);
      } else {
        activeTokens = parseText(text);
      }
      setTokens(activeTokens);
    }
    if (activeTokens.length === 0) return;

    if (!activeDocId && activeTokens.length > 0) {
      const customDoc: StoredDocument = {
        id: `paste-${Date.now()}`,
        title: fileName || (text.slice(0, 32).trim() + '...'),
        fileName: fileName || 'custom-text.txt',
        fileType: fileName?.endsWith('.md') ? 'md' : 'txt',
        rawText: text,
        tokens: activeTokens,
        chapters: chapters,
        totalWords: activeTokens.length,
        bookmarkIndex: 0,
        progressPercent: 0,
        lastReadAt: Date.now(),
        createdAt: Date.now()
      };
      saveDocument(customDoc).then(() => {
        setActiveDocId(customDoc.id);
        getAllDocuments().then(setLibraryDocs);
      });
    }

    setView('reading');
  }, [text, tokens, fileName, chapters, activeDocId]);

  const handleOpenFromLibrary = useCallback((doc: StoredDocument) => {
    setActiveDocId(doc.id);
    setFileName(doc.fileName);
    setText(doc.rawText);
    setTokens(doc.tokens);
    setChapters(doc.chapters);
    setStartBookmarkIndex(doc.bookmarkIndex || 0);
    setView('reading');
  }, []);

  const handleBookmarkSave = useCallback((idx: number) => {
    if (activeDocId && tokens.length > 0) {
      updateBookmark(activeDocId, idx, tokens.length)
        .then(() => getAllDocuments().then(setLibraryDocs))
        .catch(() => {});
    }
  }, [activeDocId, tokens.length]);

  const handleDeleteDocument = useCallback(async (id: string) => {
    await deleteStoredDocument(id);
    const updated = await getAllDocuments();
    setLibraryDocs(updated);
    if (activeDocId === id) {
      setActiveDocId(null);
    }
  }, [activeDocId]);

  const handleClearLibrary = useCallback(async () => {
    await clearStoredLibrary();
    setLibraryDocs([]);
    setActiveDocId(null);
  }, []);

  const handleTryDemo = useCallback(() => {
    setFileName('science-of-rsvp.md');
    setChapters([]);
    setText(DEMO_TEXT);
    const parsed = parseText(DEMO_TEXT);
    setTokens(parsed);
    setActiveDocId('starter-science-rsvp');
    setStartBookmarkIndex(0);
    setView('reading');
  }, []);

  const handleClear = useCallback(() => {
    setText('');
    setTokens([]);
    setFileName(null);
    setChapters([]);
    setActiveDocId(null);
    setStartBookmarkIndex(0);
  }, []);

  const handleExitReader = useCallback(() => {
    engine.pause();
    setView('setup');
  }, [engine]);

  const handleReadAgain = useCallback(() => {
    if (tokens.length === 0) return;
    setView('reading');
  }, [tokens]);

  const handleBackToText = useCallback(() => {
    setView('setup');
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    } catch {
      // Ignored if fullscreen is blocked by browser policy
    }
  }, []);

  return (
    <div className="app-container">
      {view === 'setup' && (
        <>
          <Header
            onTryDemo={handleTryDemo}
            onOpenLibrary={() => setIsLibraryOpen(true)}
            libraryCount={libraryDocs.length}
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
            onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
            onToggleFullscreen={handleToggleFullscreen}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <SetupView
            text={text}
            wpm={settings.wpm}
            fileName={fileName}
            chapterCount={chapters.length}
            onTextChange={(val) => {
              setText(val);
              setTokens([]);
            }}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
            onOpenChapters={() => setIsChapterDrawerOpen(true)}
            onStartReading={handleStartReading}
            onClear={handleClear}
          />
        </>
      )}

      {view === 'reading' && (
        <ReaderView
          engine={engine}
          tokens={tokens}
          startPosition={startBookmarkIndex}
          onBookmarkSave={handleBookmarkSave}
          countdownEnabled={settings.countdown}
          fontSize={settings.fontSize}
          bionicMode={settings.bionicMode}
          audioCadenceEnabled={settings.audioCadence.enabled}
          chapters={chapters}
          onOpenChapters={() => setIsChapterDrawerOpen(true)}
          onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
          onToggleAudioCadence={() =>
            handleUpdateSettings({
              audioCadence: {
                ...settings.audioCadence,
                enabled: !settings.audioCadence.enabled
              }
            })
          }
          onExit={handleExitReader}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {view === 'complete' && completionStats && (
        <>
          <Header
            onTryDemo={handleTryDemo}
            onOpenLibrary={() => setIsLibraryOpen(true)}
            libraryCount={libraryDocs.length}
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
            onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
            onToggleFullscreen={handleToggleFullscreen}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
          <CompleteView
            totalWords={completionStats.totalWords}
            avgWpm={completionStats.avgWpm}
            elapsedMs={completionStats.elapsedMs}
            onReadAgain={handleReadAgain}
            onBackToLibrary={() => {
              setView('setup');
              setIsLibraryOpen(true);
            }}
            onBackToText={handleBackToText}
            onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          />
        </>
      )}

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        audioPacer={audioPacer}
        onUpdateSettings={handleUpdateSettings}
      />

      <ChapterDrawer
        isOpen={isChapterDrawerOpen}
        onClose={() => setIsChapterDrawerOpen(false)}
        chapters={chapters}
        currentIndex={engine.getCurrentIndex()}
        totalWords={tokens.length}
        onSelectChapter={(startIndex) => {
          engine.seekToIndex(startIndex);
        }}
      />

      <LibraryDrawer
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        documents={libraryDocs}
        activeDocId={activeDocId}
        onOpenDocument={handleOpenFromLibrary}
        onDeleteDocument={handleDeleteDocument}
        onClearLibrary={handleClearLibrary}
      />

      {parsingState && (
        <div className="parsing-modal-backdrop">
          <div className="parsing-modal-card">
            <div className="parsing-spinner" />
            <h4 className="parsing-title">Extracting Document</h4>
            <p className="parsing-status-msg">{parsingState.message}</p>
            <div className="parsing-progress-track">
              <div className="parsing-progress-fill" style={{ width: `${parsingState.percent}%` }} />
            </div>
          </div>
        </div>
      )}

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        analytics={analytics}
        onClearAnalytics={handleClearAnalytics}
      />

      <KeyboardCheatsheetModal
        isOpen={isCheatsheetOpen}
        onClose={() => setIsCheatsheetOpen(false)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export default App;
