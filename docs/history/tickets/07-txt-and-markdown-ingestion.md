# 07 TXT and Markdown Ingestion

## What to build
File drag-and-drop and local file selection for plain text (`.txt`) and Markdown (`.md`) documents. The drop zone accepts files dropped anywhere on the setup view or through a file input button. Text is tokenized client-side into structured paragraphs, sentences, and words, with metadata (file name, word count, estimated reading time) displayed immediately.

## Acceptance criteria
- [x] Users can drag and drop `.txt` and `.md` files onto the interface with visual drop-zone feedback.
- [x] A dedicated "Upload File" button allows standard OS file selection.
- [x] Markdown headings and formatting are cleaned and parsed into structured chapters and paragraphs.
- [x] Word counts and estimated reading times compute instantly.
- [x] Starting the reader loads the parsed tokens directly into the reading viewport and timeline scrubber.

## Blocked by
- 01 Scaffold and Core RSVP Engine
- 04 Interactive Scrubber, Sentence Rewind, and Pause Context

## Status
closed
