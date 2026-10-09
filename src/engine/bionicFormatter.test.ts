import { describe, it, expect } from 'vitest';
import { bionicSplit, getBionicBoldLength } from './bionicFormatter';

describe('bionicFormatter', () => {
  it('calculates bold length based on word length', () => {
    expect(getBionicBoldLength(1)).toBe(1);
    expect(getBionicBoldLength(3)).toBe(1);
    expect(getBionicBoldLength(4)).toBe(2);
    expect(getBionicBoldLength(6)).toBe(3);
    expect(getBionicBoldLength(10)).toBe(4);
  });

  it('splits words into bold and rest parts properly', () => {
    expect(bionicSplit('the')).toEqual({ bold: 't', rest: 'he' });
    expect(bionicSplit('focus')).toEqual({ bold: 'fo', rest: 'cus' });
    expect(bionicSplit('reading')).toEqual({ bold: 'rea', rest: 'ding' });
    expect(bionicSplit('"smart"')).toEqual({ bold: '"sm', rest: 'art"' });
  });

  it('handles empty input gracefully', () => {
    expect(bionicSplit('')).toEqual({ bold: '', rest: '' });
  });
});
