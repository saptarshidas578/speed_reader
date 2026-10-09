# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-09

### Added

#### Core RSVP & Timing Engine
- High-precision, drift-free `requestAnimationFrame` timing clock that maintains exact target WPM across fluctuating browser frame rates.
- Dynamic Optimal Recognition Point (ORP) character index calculation (`floor((len - 1) * 0.35)`) and canvas-measured horizontal centering to keep eye fixation static.
- Smart punctuation multiplier engine weighting pauses for periods, exclamation marks, question marks (2.2×), commas, colons, semicolons (1.5×), and paragraph breaks (2.8×).
- Smooth progressive acceleration option ramping reading speed gently up to target WPM over configurable word counts.
- Visual 3-2-1 countdown overlay with pulse animation before streaming initiates.

#### Visual Reading Modes & Ergonomics
- Three distinct reading modes:
  - **Classic ORP Mode:** Centered single-word stream with highlighted fixation letter and central guide lines.
  - **Ghost Context Mode:** Ambient preview displaying dimmed previous and upcoming words flanking the focal word.
  - **Chunking Mode:** Multi-word rhythmic bursts (1, 2, or 3 words) designed for advanced readers.
- Interactive timeline scrubber with percentage progress, remaining word counter, and estimated time remaining.
- Single-key sentence rewind (`[`) and sentence skip (`]`) for instant comprehension recovery.
- Ambient pause context card displaying full sentence context whenever playback stops.
- Bionic reading mode emphasizing the leading 40–50% of words with heavier font weights.
- Font family customization (Inter Sans, JetBrains Mono, OpenDyslexic, System) and font scale presets (Small, Medium, Large, Extra Large).
- Dark and Light theme engine with bespoke HSL tokens and customizable focal guide accent colors.

#### Audio & Accessibility
- Synthesized Web Audio API metronome generating crisp, low-latency micro-click auditory pacing pulses without external audio files.
- Accessible keyboard shortcuts reference modal (`?`) covering all playback, stepping, pacing, and focus hotkeys.

#### Document Ingestion & Extraction
- Plain text and Markdown ingestion with automatic syntax stripping and heading-based table-of-contents extraction.
- Drag-and-drop file upload target with live word counts and estimated reading duration.
- Client-side asynchronous EPUB extraction using `jszip` with chapter TOC parsing and progress indicators.
- Client-side asynchronous PDF extraction using `pdfjs-dist` with multi-page text concatenation and encrypted PDF guards.
- Dynamic ESM code splitting ensuring heavy parsing libraries only download on-demand.

#### Persistence & Analytics
- Client-side IndexedDB document library (`focus_reader_db`) persisting books, raw text, token arrays, chapters, and exact word bookmarks.
- Preloaded starter documents: *The Science of RSVP Speed Reading*, *The Time Machine* (H.G. Wells), and *Speed Benchmark Challenge*.
- Reading Velocity & Analytics dashboard tracking lifetime words consumed, reading time invested, top velocity benchmark, and session history.
- Celebration completion card summarizing session duration, words read, and effective WPM.
