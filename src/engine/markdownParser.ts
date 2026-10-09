import type { WordToken } from '../types/reader';
import { parseText } from './textParser';

/**
 * Represents a navigational chapter boundary within a structured document.
 */
export interface ChapterMarker {
  /** Unique sequential chapter index. */
  id: number;
  /** Human-readable chapter title extracted from heading or manifest. */
  title: string;
  /** 0-based token start index in the document's word token array. */
  startIndex: number;
  /** Total number of words contained within this chapter. */
  wordCount: number;
}

/**
 * Result returned by the Markdown parser.
 */
export interface MarkdownParseResult {
  /** Array of tokenized words ready for RSVP presentation. */
  tokens: WordToken[];
  /** Discovered chapter landmarks based on Markdown heading tags. */
  chapters: ChapterMarker[];
  /** Sanitized text with Markdown markup syntax stripped. */
  cleanedText: string;
}

/**
 * Strips Markdown markup syntax while preserving readable wording,
 * paragraph structures, and heading titles.
 * @param raw Raw Markdown string
 * @returns Clean prose text string
 */
export function cleanMarkdown(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // Normalize line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Strip code blocks with ``` ... ```
  text = text.replace(/```[\s\S]*?```/g, (match) => {
    // Keep code body lines without backticks/lang
    const lines = match.split('\n');
    return lines.slice(1, -1).join('\n');
  });

  // Strip HTML tags e.g. <span class="xyz">, <br/>
  text = text.replace(/<[^>]+>/g, ' ');

  // Images ![alt](url) -> alt
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');

  // Links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // Reference links [text][id] -> text
  text = text.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1');

  // Strip reference definitions e.g. [id]: http://example.com
  text = text.replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, '');

  // Bold and italic: ***text*** -> text, **text** -> text, *text* -> text
  text = text.replace(/(\*{1,3}|_{1,3})([^_*]+?)\1/g, '$2');

  // Strikethrough ~~text~~ -> text
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // Inline code `text` -> text
  text = text.replace(/`([^`]+)`/g, '$1');

  // Blockquotes > text -> text
  text = text.replace(/^>\s*/gm, '');

  // Horizontal rules --- or *** or ___
  text = text.replace(/^(\s*[-*_]\s*){3,}$/gm, '');

  // Markdown lists (* item, - item, + item, 1. item) -> item
  text = text.replace(/^\s*[-*+]\s+/gm, '');
  text = text.replace(/^\s*\d+\.\s+/gm, '');

  // Clean Markdown headers (# Heading) -> Heading
  text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');

  // Trim whitespace
  return text.trim();
}

/**
 * Parses Markdown source text, discovering headings to create chapter markers,
 * and attaches chapter indices to generated WordTokens.
 * @param raw Raw Markdown source string
 * @returns Structured MarkdownParseResult
 */
export function parseMarkdown(raw: string): MarkdownParseResult {
  if (!raw || !raw.trim()) {
    return { tokens: [], chapters: [], cleanedText: '' };
  }

  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const chapters: ChapterMarker[] = [];
  const cleanedText = cleanMarkdown(raw);
  const tokens = parseText(cleanedText);

  // Scan lines for headings to match start token positions
  let currentWordOffset = 0;
  let chapterIndex = 0;

  // Default first chapter if tokens exist
  if (tokens.length > 0) {
    chapters.push({
      id: 0,
      title: 'Beginning',
      startIndex: 0,
      wordCount: tokens.length
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      const headingTitle = cleanMarkdown(headingMatch[1]);
      const headingFirstWord = headingTitle.split(/\s+/)[0]?.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();

      if (headingFirstWord) {
        // Find matching token near currentWordOffset
        for (let t = currentWordOffset; t < tokens.length; t++) {
          if (tokens[t].cleanText.toLowerCase() === headingFirstWord) {
            chapterIndex++;
            chapters.push({
              id: chapterIndex,
              title: headingTitle,
              startIndex: t,
              wordCount: 0 // Will compute at end
            });
            currentWordOffset = t + 1;
            break;
          }
        }
      }
    }
  }

  // Refine chapter word counts and attach chapterIndex to tokens
  if (chapters.length > 1) {
    // If we found actual headings, update the first chapter title if it overlaps
    if (chapters[0].startIndex === chapters[1].startIndex) {
      chapters.shift(); // Remove the generic 'Beginning' if first heading is at index 0
      chapters.forEach((ch, idx) => { ch.id = idx; });
    }

    for (let c = 0; c < chapters.length; c++) {
      const current = chapters[c];
      const next = chapters[c + 1];
      const endIndex = next ? next.startIndex : tokens.length;
      current.wordCount = Math.max(0, endIndex - current.startIndex);

      for (let t = current.startIndex; t < endIndex; t++) {
        (tokens[t] as unknown as { chapterIndex: number }).chapterIndex = current.id;
      }
    }
  } else if (chapters.length === 1) {
    chapters[0].wordCount = tokens.length;
    for (let t = 0; t < tokens.length; t++) {
      (tokens[t] as unknown as { chapterIndex: number }).chapterIndex = 0;
    }
  }

  return {
    tokens,
    chapters,
    cleanedText
  };
}
