import React from 'react';
import type { StoredDocument } from '../engine/storage';

interface LibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: StoredDocument[];
  activeDocId?: string | null;
  onOpenDocument: (doc: StoredDocument) => void;
  onDeleteDocument: (id: string) => void;
  onClearLibrary: () => void;
}

function formatDate(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const LibraryDrawer: React.FC<LibraryDrawerProps> = ({
  isOpen,
  onClose,
  documents,
  activeDocId,
  onOpenDocument,
  onDeleteDocument,
  onClearLibrary
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="settings-backdrop" onClick={onClose} />
      <aside className="library-drawer open" aria-label="Document Library">
        <div className="library-drawer-header">
          <div>
            <h3>Document Library</h3>
            <span className="library-subtitle">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'} saved locally
            </span>
          </div>
          <button
            className="icon-btn-close"
            type="button"
            onClick={onClose}
            aria-label="Close library"
          >
            ×
          </button>
        </div>

        <div className="library-drawer-body">
          {documents.length === 0 ? (
            <div className="library-empty">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p>Your library is empty.<br />Upload a TXT, Markdown, EPUB, or PDF document to save it here.</p>
            </div>
          ) : (
            <div className="library-list">
              {documents.map((doc) => {
                const isActive = doc.id === activeDocId;
                const hasStarted = doc.bookmarkIndex > 0;

                return (
                  <div key={doc.id} className={`library-card ${isActive ? 'active' : ''}`}>
                    <div className="library-card-top">
                      <div className="library-card-title-group">
                        <span className={`file-badge badge-${doc.fileType}`}>
                          {doc.fileType.toUpperCase()}
                        </span>
                        <h4 className="library-card-title" title={doc.title}>
                          {doc.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        className="library-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${doc.title}" from your library?`)) {
                            onDeleteDocument(doc.id);
                          }
                        }}
                        title="Delete from library"
                        aria-label={`Delete ${doc.title}`}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>

                    <div className="library-card-meta">
                      <span>{doc.totalWords.toLocaleString()} words</span>
                      <span>·</span>
                      <span>{formatDate(doc.lastReadAt)}</span>
                      {doc.chapters.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{doc.chapters.length} ch</span>
                        </>
                      )}
                    </div>

                    <div className="library-progress-bar">
                      <div
                        className="library-progress-fill"
                        style={{ width: `${Math.max(doc.progressPercent, hasStarted ? 2 : 0)}%` }}
                      />
                    </div>

                    <div className="library-card-footer">
                      <span className="library-progress-text">
                        {doc.progressPercent}% read {hasStarted ? `(word ${doc.bookmarkIndex + 1})` : ''}
                      </span>
                      <button
                        type="button"
                        className="btn-resume"
                        onClick={() => {
                          onOpenDocument(doc);
                          onClose();
                        }}
                      >
                        {hasStarted ? 'Resume' : 'Read'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {documents.length > 0 && (
          <div className="library-drawer-footer">
            <button
              type="button"
              className="btn-clear-library"
              onClick={() => {
                if (confirm('Clear all saved documents from your local library?')) {
                  onClearLibrary();
                }
              }}
            >
              Clear Library
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
