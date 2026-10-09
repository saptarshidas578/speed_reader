import React from 'react';
import type { WordToken } from '../types/reader';

interface PauseContextCardProps {
  sentenceTokens: WordToken[];
  currentWordId: number;
  onSelectWord: (index: number) => void;
  onResume: () => void;
}

export const PauseContextCard: React.FC<PauseContextCardProps> = ({
  sentenceTokens,
  currentWordId,
  onSelectWord,
  onResume
}) => {
  if (sentenceTokens.length === 0) return null;

  return (
    <div className="pause-context-card">
      <div className="context-card-header">
        <span className="context-badge">Context Inspector</span>
        <span className="context-hint">Click any word to jump • Space to resume</span>
      </div>

      <div className="context-card-sentence">
        {sentenceTokens.map((tok) => {
          const isCurrent = tok.id === currentWordId;
          return (
            <button
              key={tok.id}
              type="button"
              className={`context-word ${isCurrent ? 'active' : ''}`}
              onClick={() => onSelectWord(tok.id)}
              title={`Jump to "${tok.display}"`}
            >
              {tok.display}
            </button>
          );
        })}
      </div>

      <button className="context-resume-btn" type="button" onClick={onResume}>
        Resume reading
      </button>
    </div>
  );
};
