import React, { useEffect, useState } from 'react';

interface CountdownOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete, onSkip }) => {
  const [count, setCount] = useState<number>(3);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount(prev => prev - 1);
    }, 800);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  // Handle click or Space key to skip countdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  return (
    <div className="countdown-overlay" onClick={onSkip}>
      <div className="countdown-circle">
        <span className="countdown-number" key={count}>
          {count > 0 ? count : 'GO'}
        </span>
      </div>
      <p className="countdown-hint">Click or press Space to skip</p>
    </div>
  );
};
