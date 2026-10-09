import React, { useRef, useState, useCallback } from 'react';
import type { WordToken } from '../types/reader';

interface TimelineScrubberProps {
  currentIndex: number;
  tokens: WordToken[];
  onSeek: (index: number) => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  currentIndex,
  tokens,
  onSeek
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const totalWords = tokens.length;
  const progressRatio = totalWords > 0 ? (currentIndex + 1) / totalWords : 0;
  const progressPercent = (progressRatio * 100).toFixed(2);

  const calculateIndexFromEvent = useCallback((e: React.MouseEvent | MouseEvent): number => {
    if (!trackRef.current || totalWords === 0) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    return Math.max(0, Math.min(totalWords - 1, Math.round(ratio * (totalWords - 1))));
  }, [totalWords]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverX(x);
    const idx = calculateIndexFromEvent(e);
    setHoverIndex(idx);

    if (isDragging) {
      onSeek(idx);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const idx = calculateIndexFromEvent(e);
    onSeek(idx);

    const onGlobalMouseMove = (moveEvent: MouseEvent) => {
      const newIdx = calculateIndexFromEvent(moveEvent);
      onSeek(newIdx);
    };

    const onGlobalMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    };

    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHoverIndex(null);
    }
  };

  const hoveredToken = hoverIndex !== null ? tokens[hoverIndex] : null;

  return (
    <div
      className="scrubber-container"
      ref={trackRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
    >
      <div className="scrubber-track">
        <div className="scrubber-fill" style={{ width: `${progressPercent}%` }} />

        {/* Ticks for paragraph boundaries */}
        {totalWords < 600 && tokens.map((tok) => {
          if (!tok.isParagraphStart && !tok.isSentenceStart) return null;
          const leftPct = (tok.id / totalWords) * 100;
          return (
            <div
              key={tok.id}
              className={`scrubber-tick ${tok.isParagraphStart ? 'para-tick' : 'sentence-tick'}`}
              style={{ left: `${leftPct}%` }}
              aria-hidden="true"
            />
          );
        })}

        {/* Scrubber thumb */}
        <div className="scrubber-thumb" style={{ left: `${progressPercent}%` }} />
      </div>

      {/* Hover preview tooltip */}
      {hoveredToken && (
        <div
          className="scrubber-tooltip"
          style={{ left: `${hoverX}px` }}
        >
          <span className="tooltip-pos">Word {hoverIndex! + 1} of {totalWords}</span>
          <span className="tooltip-word">"{hoveredToken.display}"</span>
        </div>
      )}
    </div>
  );
};
