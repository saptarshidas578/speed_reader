/**
 * Calculates the count of initial characters to emphasize in bold
 * according to Bionic reading cognitive principles (typically 40%–50% of word length).
 * @param cleanLength Alphanumeric character length
 * @returns Number of characters to bold
 */
export function getBionicBoldLength(cleanLength: number): number {
  if (cleanLength <= 0) return 0;
  if (cleanLength <= 3) return 1;
  if (cleanLength <= 5) return 2;
  if (cleanLength <= 8) return 3;
  return Math.min(cleanLength - 1, Math.ceil(cleanLength * 0.4));
}

/**
 * Splits a word into its emphasized bold prefix and standard suffix parts.
 * Accounts for leading punctuation symbols so punctuation is not counted against character limits.
 * @param word Raw word string including punctuation
 * @returns Object with bold prefix and remaining string
 */
export function bionicSplit(word: string): { bold: string; rest: string } {
  if (!word) return { bold: '', rest: '' };

  // Count leading non-alphanumeric chars
  let startIdx = 0;
  while (startIdx < word.length && !/[\p{L}\p{N}]/u.test(word[startIdx])) {
    startIdx++;
  }

  // Count alphanumeric characters from startIdx
  let alnumCount = 0;
  for (let i = startIdx; i < word.length; i++) {
    if (/[\p{L}\p{N}]/u.test(word[i])) alnumCount++;
  }

  const boldCount = getBionicBoldLength(alnumCount);
  let boldCharsCollected = 0;
  let splitIndex = startIdx;

  while (splitIndex < word.length && boldCharsCollected < boldCount) {
    if (/[\p{L}\p{N}]/u.test(word[splitIndex])) {
      boldCharsCollected++;
    }
    splitIndex++;
  }

  return {
    bold: word.slice(0, splitIndex),
    rest: word.slice(splitIndex)
  };
}
