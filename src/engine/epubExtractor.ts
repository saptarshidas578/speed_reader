import type { WordToken } from '../types/reader';
import type { ChapterMarker } from './markdownParser';
import { parseText } from './textParser';

/**
 * Standard structured document returned by file extractors (EPUB, PDF, etc.).
 */
export interface ExtractedDocument {
  /** Extracted or fallback document title. */
  title: string;
  /** Complete extracted text string with paragraphs delimited by double newlines. */
  text: string;
  /** Unified array of parsed WordTokens ready for RSVP presentation. */
  tokens: WordToken[];
  /** Hierarchical or sequential chapter landmarks with word offsets. */
  chapters: ChapterMarker[];
  /** Total word count of the extracted document. */
  totalWords: number;
}

/**
 * Progress notification callback invoked during asynchronous extraction.
 * @param percent Numeric completion percentage (0 to 100)
 * @param status Human-readable status message
 */
export type ProgressCallback = (percent: number, status: string) => void;

/**
 * Client-side asynchronous EPUB parser.
 * Dynamically imports JSZip on demand to keep the initial application bundle size lean.
 * Handles container XML resolution, OPF package parsing, spine reading order, and DRM detection.
 * @param fileOrBuffer EPUB File object or raw ArrayBuffer
 * @param onProgress Optional progress callback for UI updates
 * @returns Promise resolving to an ExtractedDocument
 * @throws Error if the EPUB is corrupted, missing required metadata, or DRM-encrypted
 */
export async function extractEpub(
  fileOrBuffer: File | ArrayBuffer,
  onProgress?: ProgressCallback
): Promise<ExtractedDocument> {
  onProgress?.(5, 'Loading EPUB parser...');
  const JSZipModule = await import('jszip');
  const JSZip = JSZipModule.default || JSZipModule;

  onProgress?.(15, 'Unpacking EPUB container...');
  let buffer: ArrayBuffer;
  if (fileOrBuffer instanceof File) {
    buffer = await fileOrBuffer.arrayBuffer();
  } else {
    buffer = fileOrBuffer;
  }

  const zip = await JSZip.loadAsync(buffer);

  // Check for DRM encryption
  const encryptionXml = zip.file('META-INF/encryption.xml');
  if (encryptionXml) {
    const encText = await encryptionXml.async('text');
    if (encText.includes('EncryptedData') || encText.includes('CipherData')) {
      throw new Error('This EPUB is protected by DRM encryption and cannot be read without proprietary decryption.');
    }
  }

  // 1. Locate rootfile from META-INF/container.xml
  const containerFile = zip.file('META-INF/container.xml');
  if (!containerFile) {
    throw new Error('Invalid EPUB file: missing META-INF/container.xml');
  }

  onProgress?.(25, 'Reading package metadata...');
  const containerXml = await containerFile.async('text');
  const domParser = new DOMParser();
  const containerDoc = domParser.parseFromString(containerXml, 'application/xml');
  const rootfileEl = containerDoc.querySelector('rootfile');
  const opfPath = rootfileEl?.getAttribute('full-path');

  if (!opfPath) {
    throw new Error('Invalid EPUB: rootfile not found in container.xml');
  }

  // Determine base path for OPF
  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  // 2. Read OPF file
  const opfFile = zip.file(opfPath);
  if (!opfFile) {
    throw new Error(`Invalid EPUB: package file missing at ${opfPath}`);
  }

  const opfXml = await opfFile.async('text');
  const opfDoc = domParser.parseFromString(opfXml, 'application/xml');

  // Book title
  const titleEl = opfDoc.querySelector('metadata > title, metadata > dc\\:title');
  const bookTitle = titleEl?.textContent?.trim() || 'Untitled Book';

  // Manifest items: id -> href
  const manifestMap = new Map<string, string>();
  opfDoc.querySelectorAll('manifest > item').forEach((item) => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) {
      manifestMap.set(id, href);
    }
  });

  // Spine items in reading order
  const spineItemRefs = Array.from(opfDoc.querySelectorAll('spine > itemref'))
    .map((ref) => ref.getAttribute('idref'))
    .filter(Boolean) as string[];

  if (spineItemRefs.length === 0) {
    throw new Error('Invalid EPUB: no reading order spine items found.');
  }

  // 3. Extract text from each spine item
  const chapters: ChapterMarker[] = [];
  const fullTextParts: string[] = [];
  let currentTokenOffset = 0;

  const totalItems = spineItemRefs.length;
  for (let i = 0; i < totalItems; i++) {
    const idref = spineItemRefs[i];
    const relHref = manifestMap.get(idref);
    if (!relHref) continue;

    // Handle relative path resolution against opfDir
    const fullHref = opfDir ? `${opfDir}${relHref}` : relHref;
    // Normalize path separators
    const normalizedHref = fullHref.replace(/^\/+/, '');
    const chapterFile = zip.file(normalizedHref) || zip.file(decodeURIComponent(normalizedHref));

    if (!chapterFile) continue;

    const pct = Math.round(30 + ((i + 1) / totalItems) * 55);
    onProgress?.(pct, `Extracting chapter ${i + 1} of ${totalItems}...`);

    const htmlContent = await chapterFile.async('text');
    const doc = domParser.parseFromString(htmlContent, 'text/html');

    // Extract title from heading or title tag
    const headingEl = doc.querySelector('h1, h2, h3, title');
    const sectionTitle = headingEl?.textContent?.trim() || `Chapter ${chapters.length + 1}`;

    // Extract body paragraphs
    const paragraphs: string[] = [];
    const blockElements = doc.body?.querySelectorAll('p, h1, h2, h3, h4, blockquote, li, div') || [];

    if (blockElements.length > 0) {
      blockElements.forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.length > 0 && !paragraphs.includes(text)) {
          paragraphs.push(text);
        }
      });
    } else {
      const rawText = doc.body?.textContent?.trim();
      if (rawText) paragraphs.push(rawText);
    }

    const chapterText = paragraphs.join('\n\n');
    if (!chapterText.trim()) continue;

    const chapterTokens = parseText(chapterText);
    if (chapterTokens.length === 0) continue;

    chapters.push({
      id: chapters.length,
      title: sectionTitle,
      startIndex: currentTokenOffset,
      wordCount: chapterTokens.length
    });

    currentTokenOffset += chapterTokens.length;
    fullTextParts.push(chapterText);
  }

  onProgress?.(90, 'Tokenizing extracted content...');
  const combinedText = fullTextParts.join('\n\n');
  const tokens = parseText(combinedText);

  // Recalculate chapter boundaries on final unified token array
  chapters.forEach((ch, idx) => {
    const next = chapters[idx + 1];
    const end = next ? next.startIndex : tokens.length;
    ch.wordCount = Math.max(0, end - ch.startIndex);
  });

  onProgress?.(100, 'EPUB extraction complete!');

  return {
    title: bookTitle,
    text: combinedText,
    tokens,
    chapters,
    totalWords: tokens.length
  };
}
