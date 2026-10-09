import { describe, it, expect } from 'vitest';
import { AudioPacer } from './audioPacer';

describe('AudioPacer', () => {
  it('initializes with default volume and pitch configuration', () => {
    const pacer = new AudioPacer(false, 0.4, 750);
    expect(pacer.isEnabled()).toBe(false);
    expect(pacer.getVolume()).toBe(0.4);
    expect(pacer.getPitch()).toBe(750);
  });

  it('updates parameters within safety bounds', () => {
    const pacer = new AudioPacer();

    pacer.setEnabled(true);
    expect(pacer.isEnabled()).toBe(true);

    pacer.setVolume(1.5); // clamps to 1
    expect(pacer.getVolume()).toBe(1);

    pacer.setVolume(-0.2); // clamps to 0
    expect(pacer.getVolume()).toBe(0);

    pacer.setPitch(1800); // clamps to 1500
    expect(pacer.getPitch()).toBe(1500);

    pacer.setPitch(100); // clamps to 200
    expect(pacer.getPitch()).toBe(200);
  });

  it('handles playClick without throwing even in headless environments', () => {
    const pacer = new AudioPacer(true);
    expect(() => pacer.playClick()).not.toThrow();
    expect(() => pacer.audition()).not.toThrow();
  });
});
