import { describe, it, expect } from 'vitest';
import { cleanMarkdown, parseMarkdown } from './markdownParser';

describe('markdownParser', () => {
  it('strips formatting markup and preserves readable text', () => {
    const md = `
# Title

This is **bold** text and *italic* words, with a [link](https://example.com) and some \`inline code\`.

> This is a quote block.
    `;
    const cleaned = cleanMarkdown(md);
    expect(cleaned).toContain('Title');
    expect(cleaned).toContain('This is bold text and italic words, with a link and some inline code.');
    expect(cleaned).toContain('This is a quote block.');
    expect(cleaned).not.toContain('**');
    expect(cleaned).not.toContain('https://example.com');
    expect(cleaned).not.toContain('# Title');
  });

  it('extracts chapter markers and associates tokens with chapters', () => {
    const md = `
# Chapter 1

First chapter content starts here.

## Chapter 2

Second chapter content follows next.
    `;
    const res = parseMarkdown(md);
    expect(res.chapters.length).toBe(2);
    expect(res.chapters[0].title).toBe('Chapter 1');
    expect(res.chapters[1].title).toBe('Chapter 2');
    expect(res.tokens.length).toBeGreaterThan(0);
    expect(res.chapters[0].wordCount).toBeGreaterThan(0);
    expect(res.chapters[1].wordCount).toBeGreaterThan(0);
  });

  it('handles empty or blank markdown gracefully', () => {
    expect(parseMarkdown('').tokens).toEqual([]);
    expect(parseMarkdown('   ').chapters).toEqual([]);
    expect(cleanMarkdown('')).toBe('');
  });
});
