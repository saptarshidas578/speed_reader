import type { WordToken } from '../types/reader';

const ALNUM_RE = /[\p{L}\p{N}]/u;
const SENTENCE_END_RE = /[.!?]+$/;

/**
 * Standard cognitive pause duration multipliers based on punctuation type.
 */
export const PAUSE_MULTIPLIERS = {
  comma: 1.5,
  semicolon: 2.0,
  colon: 2.0,
  period: 2.5,
  exclamationQuestion: 3.0,
  paragraph: 4.0
};

/**
 * Counts alphanumeric characters in a string (Unicode aware).
 * @param word Input word string
 * @returns Count of alphanumeric characters
 */
export function countAlnum(word: string): number {
  let count = 0;
  for (let i = 0; i < word.length; i++) {
    if (ALNUM_RE.test(word[i])) count++;
  }
  return count;
}

/**
 * Returns the indices of all alphanumeric characters in a word.
 * @param word Input word string
 * @returns Array of character indices
 */
export function findAlnumIndices(word: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (ALNUM_RE.test(word[i])) indices.push(i);
  }
  return indices;
}

/**
 * Computes base core Optimal Recognition Point index for a word length.
 * Follows cognitive reading research (fixation 25%–35% into word).
 * @param length Alphanumeric word length
 * @returns 0-based character anchor index
 */
export function baseCoreIndex(length: number): number {
  if (length <= 0) return 0;
  if (length <= 3) return Math.floor((length - 1) / 2);
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  if (length <= 13) return 3;
  return Math.min(length - 1, Math.floor(length * 0.3));
}

/**
 * Calculates the Optimal Recognition Point (ORP) character index within a word string.
 * @param word Raw word string including punctuation
 * @param mode Alignment mode ('auto', 'center', 'left', 'right')
 * @returns 0-based index of the fixation letter in the word
 */
export function calculateORPIndex(
  word: string,
  mode: 'auto' | 'center' | 'left' | 'right' = 'auto'
): number {
  if (!word || word.length === 0) return 0;
  const alnumIdxs = findAlnumIndices(word);
  if (alnumIdxs.length === 0) {
    return Math.max(0, Math.floor((word.length - 1) / 2));
  }
  const L = alnumIdxs.length;
  let coreIdx = baseCoreIndex(L);
  if (mode === 'center') coreIdx = Math.floor((L - 1) / 2);
  else if (mode === 'left') coreIdx = Math.max(0, coreIdx - 1);
  else if (mode === 'right') coreIdx = Math.min(L - 1, coreIdx + 1);
  coreIdx = Math.min(Math.max(coreIdx, 0), L - 1);
  return alnumIdxs[coreIdx];
}

/**
 * Determines the cognitive pause duration multiplier for a word based on trailing punctuation.
 * @param word Raw word string
 * @returns Numerical duration multiplier (>= 1.0)
 */
export function getPunctuationMultiplier(word: string): number {
  const match = word.match(/[.,!?;:…]+$/);
  if (!match) return 1;
  const punct = match[0];
  if (/[!?]/.test(punct)) return PAUSE_MULTIPLIERS.exclamationQuestion;
  if (punct.includes('.')) return PAUSE_MULTIPLIERS.period;
  if (punct.includes(';')) return PAUSE_MULTIPLIERS.semicolon;
  if (punct.includes(':')) return PAUSE_MULTIPLIERS.colon;
  if (punct.includes(',')) return PAUSE_MULTIPLIERS.comma;
  return 1;
}

/**
 * Parses raw text into an array of structured WordToken objects ready for RSVP playback.
 * Performs sentence and paragraph segmentation, ORP calculation, and punctuation weighting.
 * @param raw Raw input text string
 * @returns Array of WordToken objects
 */
export function parseText(raw: string): WordToken[] {
  if (!raw || !raw.trim()) return [];
  const paragraphs = raw.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
  const tokens: WordToken[] = [];
  let tokenCounter = 0;
  let sentenceCounter = 0;
  let isNextSentenceStart = true;

  paragraphs.forEach((para, pIdx) => {
    const rawTokens = para.replace(/[\t\r]+/g, ' ').split(/\s+/).filter(Boolean);
    rawTokens.forEach((tok, tokIdx) => {
      const isLastInPara = tokIdx === rawTokens.length - 1;
      let multiplier = getPunctuationMultiplier(tok);
      if (isLastInPara && pIdx < paragraphs.length - 1) {
        multiplier = Math.max(multiplier, PAUSE_MULTIPLIERS.paragraph);
      }

      const isCurrentSentenceStart = isNextSentenceStart;
      const currentSentenceIdx = sentenceCounter;
      if (SENTENCE_END_RE.test(tok) || isLastInPara) {
        sentenceCounter++;
        isNextSentenceStart = true;
      } else {
        isNextSentenceStart = false;
      }

      tokens.push({
        id: tokenCounter++,
        display: tok,
        cleanText: tok.replace(/[^\p{L}\p{N}]/gu, ''),
        alnumLength: countAlnum(tok),
        pauseMultiplier: multiplier,
        orpIndex: calculateORPIndex(tok, 'auto'),
        sentenceIndex: currentSentenceIdx,
        paragraphIndex: pIdx,
        isSentenceStart: isCurrentSentenceStart,
        isParagraphStart: tokIdx === 0
      });
    });
  });

  return tokens;
}
