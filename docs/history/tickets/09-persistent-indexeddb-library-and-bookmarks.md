# 09 Persistent IndexedDB Library and Bookmarks

## What to build
A local client-side Document Library backed by IndexedDB. Uploaded books, articles, and past reading sessions are saved locally with metadata (title, word count, date added, progress percentage). The application automatically bookmarks the exact word/sentence index whenever the reader pauses or exits, allowing users to return days later and resume seamlessly.

## Acceptance criteria
- [x] IndexedDB schema stores documents, chapter structures, and last-read bookmark positions.
- [x] Library drawer displays saved documents with title, source badge (PDF, EPUB, TXT), and progress bars.
- [x] Clicking any document restores its tokens, chapters, and resumes at the exact bookmarked position.
- [x] Users can delete individual documents or clear the library.
- [x] Preloaded starter documents (classic excerpt, tech essay, speed benchmark) populate on first visit.

## Blocked by
- 07 TXT and Markdown Ingestion
- 08 Asynchronous PDF and EPUB Extraction

## Status
closed
