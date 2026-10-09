import { describe, it, expect } from 'vitest';
import {
  countAlnum,
  baseCoreIndex,
  calculateORPIndex,
  getPunctuationMultiplier,
  parseText,
  PAUSE_MULTIPLIERS
} from './textParser';

describe('textParser', () => {
  describe('countAlnum', () => {
    it('counts alphanumeric characters correctly including unicode', () => {
      expect(countAlnum('hello')).toBe(5);
      expect(countAlnum('"hello!"')).toBe(5);
      expect(countAlnum('über-cool')).toBe(8);
      expect(countAlnum('...')).toBe(0);
    });
  });

  describe('baseCoreIndex', () => {
    it('calculates optimal recognition point index for different lengths', () => {
      expect(baseCoreIndex(0)).toBe(0);
      expect(baseCoreIndex(1)).toBe(0); // 1-char: 0
      expect(baseCoreIndex(2)).toBe(0); // 2-char: 0
      expect(baseCoreIndex(3)).toBe(1); // 3-char: 1
      expect(baseCoreIndex(4)).toBe(1); // 4-char: 1
      expect(baseCoreIndex(5)).toBe(1); // 5-char: 1
      expect(baseCoreIndex(6)).toBe(2); // 6-char: 2
      expect(baseCoreIndex(10)).toBe(3); // 10-char: 3
    });
  });

  describe('calculateORPIndex', () => {
    it('finds the correct index in the raw string ignoring leading punctuation', () => {
      // "Focus" -> 5 letters, core index 1 -> 'o' is at index 1
      expect(calculateORPIndex('Focus')).toBe(1);
      // "(Focus)" -> leading punctuation: 'F' is at 1, 'o' is at 2
      expect(calculateORPIndex('(Focus)')).toBe(2);
      // Empty string
      expect(calculateORPIndex('')).toBe(0);
    });
  });

  describe('getPunctuationMultiplier', () => {
    it('detects periods and sentence endings with appropriate multipliers', () => {
      expect(getPunctuationMultiplier('word.')).toBe(PAUSE_MULTIPLIERS.period);
      expect(getPunctuationMultiplier('wait,')).toBe(PAUSE_MULTIPLIERS.comma);
      expect(getPunctuationMultiplier('what?!')).toBe(PAUSE_MULTIPLIERS.exclamationQuestion);
      expect(getPunctuationMultiplier('normal')).toBe(1);
    });
  });

  describe('parseText', () => {
    it('parses multi-paragraph text into structured WordTokens', () => {
      const text = `Focus on the red dot.\n\nSpeed reading is fast.`;
      const tokens = parseText(text);

      expect(tokens.length).toBe(9);
      expect(tokens[0].display).toBe('Focus');
      expect(tokens[0].isParagraphStart).toBe(true);
      expect(tokens[0].isSentenceStart).toBe(true);

      // End of first paragraph should have paragraph pause multiplier
      expect(tokens[4].display).toBe('dot.');
      expect(tokens[4].pauseMultiplier).toBeGreaterThanOrEqual(PAUSE_MULTIPLIERS.period);

      // Second paragraph start
      expect(tokens[5].display).toBe('Speed');
      expect(tokens[5].isParagraphStart).toBe(true);
      expect(tokens[5].paragraphIndex).toBe(1);
    });

    it('returns empty array on empty input', () => {
      expect(parseText('')).toEqual([]);
      expect(parseText('   ')).toEqual([]);
    });
  });
});
