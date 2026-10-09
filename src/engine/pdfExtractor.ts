import type { ChapterMarker } from './markdownParser';
import type { ExtractedDocument, ProgressCallback } from './epubExtractor';
import { parseText } from './textParser';

/**
 * Client-side asynchronous PDF parser.
 * Lazy-loads pdfjs-dist and its Web Worker on demand to preserve initial application bundle performance.
 * Extracts multi-page text streams, maps individual pages to ChapterMarker boundaries,
 * and guards against password-encrypted documents.
 * @param fileOrBuffer PDF File object or raw ArrayBuffer
 * @param onProgress Optional progress callback for UI updates
 * @returns Promise resolving to an ExtractedDocument
 * @throws Error if the PDF contains zero pages or is password-encrypted
 */
export async function extractPdf(
  fileOrBuffer: File | ArrayBuffer,
  onProgress?: ProgressCallback
): Promise<ExtractedDocument> {
  onProgress?.(5, 'Loading PDF parser engine...');

  const pdfjsLib = await import('pdfjs-dist');

  // Configure worker
  try {
    const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }

  onProgress?.(15, 'Reading PDF structure...');
  let arrayBuffer: ArrayBuffer;
  let docTitle = 'PDF Document';

  if (fileOrBuffer instanceof File) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
    docTitle = fileOrBuffer.name.replace(/\.pdf$/i, '');
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true
  });

  loadingTask.onPassword = () => {
    throw new Error('This PDF is encrypted with a password and cannot be read client-side.');
  };

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  if (numPages === 0) {
    throw new Error('The PDF document contains no readable pages.');
  }

  // Attempt to read metadata / title
  try {
    const metadata = await pdfDoc.getMetadata();
    const info = metadata?.info as Record<string, unknown> | undefined;
    if (info && typeof info.Title === 'string' && info.Title.trim()) {
      docTitle = info.Title.trim();
    }
  } catch {
    // Keep filename default
  }

  const pageTexts: { pageNum: number; text: string }[] = [];
  const chapters: ChapterMarker[] = [];
  let currentTokenOffset = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const pct = Math.round(20 + (pageNum / numPages) * 70);
    onProgress?.(pct, `Reading page ${pageNum} of ${numPages}...`);

    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Group items by line
    const textItems = textContent.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .filter(Boolean);

    const pageStr = textItems.join(' ').trim();
    if (pageStr.length > 0) {
      pageTexts.push({ pageNum, text: pageStr });

      const pageTokens = parseText(pageStr);
      if (pageTokens.length > 0) {
        chapters.push({
          id: chapters.length,
          title: `Page ${pageNum}`,
          startIndex: currentTokenOffset,
          wordCount: pageTokens.length
        });
        currentTokenOffset += pageTokens.length;
      }
    }
  }

  onProgress?.(95, 'Tokenizing document text...');
  const combinedText = pageTexts.map((p) => p.text).join('\n\n');
  const tokens = parseText(combinedText);

  // Recalculate chapter boundaries
  chapters.forEach((ch, idx) => {
    const next = chapters[idx + 1];
    const end = next ? next.startIndex : tokens.length;
    ch.wordCount = Math.max(0, end - ch.startIndex);
  });

  onProgress?.(100, 'PDF extraction complete!');

  return {
    title: docTitle,
    text: combinedText,
    tokens,
    chapters,
    totalWords: tokens.length
  };
}
