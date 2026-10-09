# 08 Asynchronous PDF and EPUB Extraction

## What to build
Client-side parsing for `.pdf` research papers and `.epub` ebooks. Heavy parser libraries (`pdfjs-dist` and lightweight EPUB zip/xml extractors) are loaded dynamically on demand when a matching file is provided. The extraction runs asynchronously with a visual percentage progress bar without locking the main thread. Extracted table-of-contents chapters populate a slide-over Chapter Drawer.

## Acceptance criteria
- [x] Users can drag and drop `.pdf` and `.epub` files.
- [x] Parser libraries are lazy-loaded on demand to keep initial app bundle small.
- [x] Visual progress indicator shows parsing progress for multi-page/multi-chapter documents.
- [x] EPUB table of contents and internal spine items map to navigable chapters.
- [x] A slide-over Table of Contents drawer allows jumping directly to any detected chapter.
- [x] Extraction errors (e.g. DRM-encrypted EPUBs or password-protected PDFs) produce clear user-friendly toasts.

## Blocked by
- 07 TXT and Markdown Ingestion

## Status
closed
