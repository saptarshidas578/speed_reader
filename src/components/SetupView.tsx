import React, { useMemo, useState, useRef } from 'react';

interface SetupViewProps {
  text: string;
  wpm: number;
  fileName?: string | null;
  chapterCount?: number;
  onTextChange: (val: string) => void;
  onFileUpload: (file: File) => void;
  onRemoveFile: () => void;
  onOpenChapters?: () => void;
  onStartReading: () => void;
  onClear: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  text,
  wpm,
  fileName,
  chapterCount = 0,
  onTextChange,
  onFileUpload,
  onRemoveFile,
  onOpenChapters,
  onStartReading,
  onClear
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { wordCount, charCount, estMinutes } = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const minutes = words > 0 && wpm > 0 ? Math.max(1, Math.round(words / wpm)) : 0;
    return {
      wordCount: words,
      charCount: text.length,
      estMinutes: minutes
    };
  }, [text, wpm]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    }
    // Reset file input value to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <main className="view-setup">
      <section className="empty-hero">
        <svg className="glyph" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
          <circle cx="24" cy="24" r="11" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <circle cx="24" cy="24" r="3.4" fill="currentColor"/>
        </svg>
        <h1>Focus. Read. Understand.</h1>
        <p>Drop a document or paste text below. Your eyes stay anchored while the words stream to you.</p>
      </section>

      <div
        className={`input-card ${isDragging ? 'is-dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="drop-overlay">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Drop your .txt, .md, .pdf, or .epub file here</p>
          </div>
        )}

        {fileName && (
          <div className="file-info-badge">
            <div className="file-info-left">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="file-name">{fileName}</span>
              {chapterCount > 0 && (
                <button
                  type="button"
                  className="chapters-pill"
                  onClick={onOpenChapters}
                  title="View chapters / table of contents"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'} ▾
                </button>
              )}
            </div>
            <button
              type="button"
              className="file-remove-btn"
              onClick={onRemoveFile}
              title="Remove uploaded file"
              aria-label="Remove uploaded file"
            >
              ×
            </button>
          </div>
        )}

        <textarea
          className="text-input"
          spellCheck={false}
          placeholder="Paste text or drag and drop a .txt, .md, .pdf, or .epub file here..."
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />

        <div className="input-meta">
          <span>{wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}</span>
          <span>{charCount.toLocaleString()} {charCount === 1 ? 'character' : 'characters'}</span>
          {estMinutes > 0 && (
            <span className="reading-time-est">⏱ ~{estMinutes} {estMinutes === 1 ? 'min' : 'mins'} at {wpm} WPM</span>
          )}
        </div>

        <div className="input-actions">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".txt,.md,.markdown,.pdf,.epub,text/plain,text/markdown,application/pdf,application/epub+zip"
            onChange={handleFileInputChange}
          />
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload File
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClear}>
            Clear
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={onStartReading}
            disabled={wordCount === 0}
            style={{ opacity: wordCount === 0 ? 0.6 : 1, cursor: wordCount === 0 ? 'not-allowed' : 'pointer' }}
          >
            Start reading
          </button>
        </div>
      </div>

      <p className="privacy-note">Your text stays 100% in your browser. No files or data ever leave your machine.</p>
    </main>
  );
};
