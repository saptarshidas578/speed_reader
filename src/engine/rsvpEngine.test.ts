import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RSVPEngine } from './rsvpEngine';
import { parseText } from './textParser';

describe('RSVPEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with paused state when tokens are loaded', () => {
    const tokens = parseText('One two three four.');
    const engine = new RSVPEngine({ wpm: 400 });

    engine.loadTokens(tokens);

    expect(engine.getStatus()).toBe('paused');
    expect(engine.getCurrentIndex()).toBe(0);
    expect(engine.getCurrentToken()?.display).toBe('One');
    expect(engine.getTotalWords()).toBe(4);
  });

  it('steps forward and backward manually when paused', () => {
    const tokens = parseText('Alpha beta gamma.');
    const engine = new RSVPEngine({ wpm: 300 });
    engine.loadTokens(tokens);

    engine.stepForward();
    expect(engine.getCurrentIndex()).toBe(1);
    expect(engine.getCurrentToken()?.display).toBe('beta');

    engine.stepForward();
    expect(engine.getCurrentIndex()).toBe(2);
    expect(engine.getCurrentToken()?.display).toBe('gamma.');

    // Attempting step beyond end should clamp
    engine.stepForward();
    expect(engine.getCurrentIndex()).toBe(2);

    engine.stepBackward();
    expect(engine.getCurrentIndex()).toBe(1);
    expect(engine.getCurrentToken()?.display).toBe('beta');
  });

  it('updates WPM within valid limits (50 to 1500)', () => {
    const engine = new RSVPEngine({ wpm: 400 });

    engine.setWpm(600);
    expect(engine.getWpm()).toBe(600);

    engine.setWpm(20); // below min
    expect(engine.getWpm()).toBe(50);

    engine.setWpm(2000); // above max
    expect(engine.getWpm()).toBe(1500);
  });

  it('calculates progressive speed correctly over intervals', () => {
    const engine = new RSVPEngine({
      wpm: 250,
      progressiveSpeed: {
        enabled: true,
        startWpm: 200,
        maxWpm: 500,
        increment: 50,
        intervalSec: 10
      }
    });

    expect(engine.getEffectiveWpm()).toBe(200);

    // Mock elapsed time
    vi.spyOn(engine, 'getElapsedMs').mockReturnValue(15000); // 15s elapsed -> 1 interval (+50)
    expect(engine.getEffectiveWpm()).toBe(250);

    vi.spyOn(engine, 'getElapsedMs').mockReturnValue(80000); // 80s elapsed -> 8 intervals (+400 -> 600, clamped to max 500)
    expect(engine.getEffectiveWpm()).toBe(500);
  });

  it('handles chunking mode with variable chunk sizes', () => {
    const tokens = parseText('One two three four five six.');
    const engine = new RSVPEngine({ wpm: 400, mode: 'chunking', chunkSize: 2 });
    engine.loadTokens(tokens);

    expect(engine.getMode()).toBe('chunking');
    expect(engine.getChunkSize()).toBe(2);

    const chunk1 = engine.getCurrentChunk();
    expect(chunk1.length).toBe(2);
    expect(chunk1[0].display).toBe('One');
    expect(chunk1[1].display).toBe('two');

    engine.stepForward(); // Steps by 2 in chunking mode
    expect(engine.getCurrentIndex()).toBe(2);

    const chunk2 = engine.getCurrentChunk();
    expect(chunk2.length).toBe(2);
    expect(chunk2[0].display).toBe('three');
    expect(chunk2[1].display).toBe('four');
  });

  it('provides ghost context with previous, active, and upcoming tokens', () => {
    const tokens = parseText('Red green blue yellow.');
    const engine = new RSVPEngine({ wpm: 400, mode: 'ghost-context' });
    engine.loadTokens(tokens);

    // At index 0: prev is null
    let ctx = engine.getGhostContext();
    expect(ctx.prev).toBeNull();
    expect(ctx.current?.display).toBe('Red');
    expect(ctx.next?.display).toBe('green');
  });

  it('rewinds and skips by sentence boundaries', () => {
    const text = 'First sentence here. Second sentence follows. Third sentence ends.';
    const tokens = parseText(text);
    const engine = new RSVPEngine({ wpm: 300 });
    engine.loadTokens(tokens);

    // Initial position: 0 (in sentence 1)
    expect(engine.getCurrentIndex()).toBe(0);

    // Skip to sentence 2
    engine.skipSentence();
    expect(engine.getCurrentToken()?.display).toBe('Second');

    // Skip to sentence 3
    engine.skipSentence();
    expect(engine.getCurrentToken()?.display).toBe('Third');

    // Rewind back to sentence 2
    engine.rewindSentence();
    expect(engine.getCurrentToken()?.display).toBe('Second');
  });

  it('retrieves surrounding sentence context for inspection', () => {
    const text = 'Alpha beta gamma. Delta epsilon zeta.';
    const tokens = parseText(text);
    const engine = new RSVPEngine({ wpm: 300 });
    engine.loadTokens(tokens);

    engine.seekToIndex(1); // 'beta'
    const ctx = engine.getSurroundingContext();

    expect(ctx.sentenceTokens.length).toBe(3);
    expect(ctx.sentenceTokens.map(t => t.display)).toEqual(['Alpha', 'beta', 'gamma.']);
    expect(ctx.currentWordIndexInSentence).toBe(1);
  });

  it('triggers audio pacer click when enabled during playback', () => {
    const mockPacer = {
      isEnabled: vi.fn().mockReturnValue(true),
      playClick: vi.fn(),
      getVolume: vi.fn(),
      setVolume: vi.fn(),
      getPitch: vi.fn(),
      setPitch: vi.fn(),
      setEnabled: vi.fn(),
      audition: vi.fn(),
      destroy: vi.fn()
    };

    const tokens = parseText('Quick test pacing.');
    const engine = new RSVPEngine({
      wpm: 600,
      audioPacer: mockPacer as any
    });

    engine.loadTokens(tokens);
    engine.play();

    expect(mockPacer.isEnabled).toHaveBeenCalled();
    expect(mockPacer.playClick).toHaveBeenCalled();
    engine.pause();
  });
});
