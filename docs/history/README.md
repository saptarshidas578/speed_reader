# Development History & Tracer-Bullet Tickets

Focus Reader Pro was architected and built sequentially using a tracer-bullet ticket workflow driven by DeepMind's Antigravity AI pair programming agent.

Every feature was defined in [SPEC.md](../../SPEC.md), decomposed into an issue with strict acceptance criteria and blocking dependencies, implemented vertically, verified with automated unit tests and interactive browser subagents, and closed before progressing to the subsequent ticket.

### Ticket Index

| Ticket | Title | Status | Primary Focus |
|---|---|---|---|
| [#01](tickets/01-scaffold-and-core-rsvp-engine.md) | Scaffold & Core RSVP Engine | Closed | Vite + React 19 + TypeScript, rAF drift-free clock, ORP math |
| [#02](tickets/02-smart-punctuation-countdown-and-progressive-speed.md) | Smart Punctuation & Speed Ramps | Closed | Weighted punctuation delays, 3-2-1 countdown, progressive speed |
| [#03](tickets/03-peripheral-ghost-context-and-chunking.md) | Ghost Context & Chunking | Closed | Ambient previous/next ghost words and multi-word chunking bursts |
| [#04](tickets/04-interactive-scrubber-sentence-rewind-and-pause-context.md) | Scrubber, Rewind & Pause Context | Closed | Interactive scrubber slider, sentence rewind `[` / `]`, pause card |
| [#05](tickets/05-typography-bionic-reading-and-themes.md) | Typography, Bionic Reading & Themes | Closed | Font family selector, font scale, Bionic bolding, dark/light themes |
| [#06](tickets/06-synthesized-web-audio-metronome.md) | Synthesized Web Audio Metronome | Closed | Web Audio API oscillator micro-clicks synced with word flashes |
| [#07](tickets/07-txt-and-markdown-ingestion.md) | TXT & Markdown Ingestion | Closed | Markdown syntax stripper, heading TOC extractor, drag & drop |
| [#08](tickets/08-asynchronous-pdf-and-epub-extraction.md) | Asynchronous PDF & EPUB Extraction | Closed | Dynamic ESM code splitting for PDF.js & JSZip, progress modal |
| [#09](tickets/09-persistent-indexeddb-library-and-bookmarks.md) | IndexedDB Library & Bookmarks | Closed | Client-side IndexedDB document store, auto word bookmarking |
| [#10](tickets/10-analytics-dashboard-and-keyboard-cheatsheet.md) | Analytics & Keyboard Cheatsheet | Closed | Session velocity logging, cumulative stats, hotkey cheatsheet |
