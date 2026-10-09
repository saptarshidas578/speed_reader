# Feature Specification: Focus Reader Pro (Advanced RSVP Speed Reader)

## Problem Statement

Readers who consume large volumes of text—including academic papers, books, technical documentation, and long-form articles—routinely face severe cognitive bottlenecks:
1. **Saccadic Eye Fatigue & Reading Plateaus**: Traditional reading requires constant mechanical eye jumps (saccades) and regressions, capping typical reading speeds at 200–250 words per minute and creating physical eye strain during prolonged sessions.
2. **Manual Ingestion Friction**: Existing speed reading tools force users to manually copy and paste text into an input box. Users cannot comfortably ingest full `.pdf` research papers, `.epub` ebooks, or Markdown documents without manual formatting, losing chapter organization and hitting storage caps.
3. **Tunnel Vision & Context Collapse**: Standard single-word RSVP (Rapid Serial Visual Presentation) strips away structural awareness. Missing or blinking on a single transitional word causes readers to lose the entire sentence clause because there is no peripheral preview or effortless way to rewind.
4. **Timer Drift & Cadence Stutter**: Common implementations rely on browser `setTimeout` or `setInterval`, which drift by tens of milliseconds, lag under CPU load, and stutter at speeds above 400 WPM, disrupting the neurological cadence necessary for high-speed comprehension.
5. **Session Amnesia & Lost Bookmarks**: Lack of structured client-side storage means readers lose their exact location when closing the tab, forcing tedious manual scrubbing to resume their books.

---

## Solution

**Focus Reader Pro** is a high-performance, modular web application built with Vite, React, and TypeScript that eliminates eye fatigue and elevates reading speed while protecting narrative comprehension:
1. **Zero-Friction Client-Side Ingestion**: Drag-and-drop parsing for `.pdf`, `.epub`, `.txt`, and `.md` files with asynchronous extraction, table-of-contents chapter segmentation, and zero server dependencies.
2. **Cognitive Reading Engines**:
   - **Classic ORP Mode**: Pixel-perfect Optimal Recognition Point centering calculated via canvas text metrics with colored fixation anchoring.
   - **Peripheral Ghost Context Mode**: Displays faint, dimmed preceding and upcoming words flanking the fixation point to preserve syntactic grammar without inducing eye movement.
   - **Multi-Word Chunking Mode**: Flashes 1 to 3 words simultaneously for experienced readers who digest phrases as cohesive cognitive units.
   - **Bionic Reading Anchors**: Bolds leading word phonemes across all modes to accelerate visual parsing.
3. **Frame-Accurate Clock & Cadence Audio**:
   - A jitter-free `requestAnimationFrame` + `performance.now()` delta-accumulator engine with automatic pause multipliers for punctuation and paragraphs.
   - A 3-2-1 countdown warm-up ramp.
   - An optional Web Audio API synthesized cadence metronome to help lock in focus and suppress subvocalization.
4. **Intuitive Navigation & Context Recovery**:
   - Interactive timeline scrubber with chapter, paragraph, and sentence marks.
   - 1-tap sentence rewind (`[`) and skip (`]`).
   - Pause-to-Inspect context popover that surfaces the current sentence within its surrounding paragraph.
5. **Persistent Document Library & Analytics**:
   - IndexedDB storage that saves complete books, chapters, and exact resume bookmarks across browser restarts.
   - Reading Analytics dashboard tracking effective WPM, words read, reading streaks, and time invested.

---

## User Stories

### Document Ingestion & Library Management
1. As a reader, I want to drag and drop a PDF file into the application, so that its text is extracted client-side without sending my documents to a third-party server.
2. As a reader, I want to drag and drop an EPUB ebook, so that its chapters and table of contents are automatically detected and structured for reading.
3. As a reader, I want to drag and drop Markdown and plain text files, so that I can immediately speed-read notes and exported articles.
4. As a reader, I want to paste raw text from my clipboard or click a "Try Demo" button, so that I can test the reader instantly without having a file on hand.
5. As a reader, I want to see an asynchronous progress bar when importing large books, so that the application never freezes or becomes unresponsive.
6. As a reader, I want my imported books and articles saved in a local Document Library, so that I can switch between multiple reading materials at any time.
7. As a reader, I want the library to remember my exact reading position and progress percentage for every document, so that I can pick up right where I left off after closing the browser.
8. As a reader, I want to view a table-of-contents chapter drawer for multi-chapter documents, so that I can jump directly to any chapter.
9. As a reader, I want to delete documents or clear my reading history from the library, so that I can manage my local storage and privacy.

### Visual Reading & Cognitive Ergonomics
10. As a reader, I want the focal character of each word to align horizontally at the exact center of the screen, so that my eyes remain stationary.
11. As a reader, I want an optional vertical focal guide line with an alignment pip, so that my gaze stays anchored to the optimal recognition point.
12. As a reader, I want to switch to Peripheral Ghost Context mode, so that I can see the preceding and upcoming words at low opacity to retain sentence structure.
13. As a reader, I want to switch to Multi-Word Chunking mode (2 or 3 words at a time), so that I can practice reading multi-word thought groups.
14. As a reader, I want to toggle Bionic Reading mode, so that initial letters of words are bolded to accelerate visual word recognition.
15. As a reader, I want to choose between specialized fonts (Inter Sans, JetBrains Mono, OpenDyslexic, and System Sans), so that I can select the typography that causes the least visual fatigue for my eyes.
16. As a reader, I want to adjust font size (Small, Medium, Large, Extra Large) and font weight, so that the text is comfortable on any screen size.
17. As a reader, I want to customize the accent focus color (Red, Orange, Blue, Green, Purple, or custom hex), so that the fixation point stands out against the background.
18. As a reader, I want Dark, Light, and System theme support, so that I can read comfortably in both high-glare and low-light environments.

### Pacing, Playback & Audio Cadence
19. As a reader, I want playback to use a frame-accurate `requestAnimationFrame` clock, so that word timings remain consistent without stutter at high speeds (up to 1500 WPM).
20. As a reader, I want an automatic 3-2-1 countdown before playback starts, so that my focus can settle before high-speed text begins.
21. As a reader, I want Smart Punctuation pauses (longer pauses on periods, exclamation marks, commas, colons, and paragraph breaks), so that I have cognitive time to digest complex sentence boundaries.
22. As a reader, I want a Long Word Boost setting, so that words longer than 10 characters are held on screen slightly longer to allow visual processing.
23. As a reader, I want an optional Progressive Speed mode that starts at a comfortable WPM and steadily ramps up, so that I can train my reading speed over time.
24. As a reader, I want a Word Repetition setting (flash each word once or twice), so that I can reinforce comprehension during difficult technical passages.
25. As a reader, I want an optional synthesized audio cadence pacer (a subtle, soft click generated via Web Audio API), so that I can sync my mental focus to an auditory rhythm.
26. As a reader, I want to adjust the volume and pitch of the audio metronome or mute it completely, so that it fits my personal sensory preference.

### Navigation & Context Recovery
27. As a reader, I want an interactive scrubber bar with sentence and paragraph markers, so that I can scrub visually through the text.
28. As a reader, I want a 1-tap "Rewind 1 Sentence" button and keyboard shortcut (`[`), so that I can re-read a missed clause instantly without scrubbing manually.
29. As a reader, I want a "Skip 1 Sentence" button and shortcut (`]`), so that I can bypass skippable passages.
30. As a reader, I want pausing the reader to display an inspection card showing the surrounding sentence and paragraph, so that I can re-orient myself if my attention wanders.
31. As a reader, I want manual single-word stepping backwards and forwards when paused, so that I can inspect specific vocabulary.
32. As a reader, I want to press `R` to restart the current chapter or text from the beginning, so that I can re-read an entire section.

### Analytics, Accessibility & Pro Shortcuts
33. As a reader, I want to see real-time statistics (current word count, total words, elapsed time, remaining time, and progress percentage), so that I know exactly how much reading remains.
34. As a reader, I want an end-of-session completion screen showing average WPM, total words read, and duration, so that I get immediate feedback on my performance.
35. As a reader, I want a persistent Reading Analytics dashboard showing cumulative reading time and words read, so that I can track my reading habits and speed improvements over time.
36. As a reader, I want full keyboard shortcut navigation (`Space` play/pause, `↑`/`↓` WPM, `[`/`]` sentence skip, `1`/`2`/`3` mode switch, `F` toggle guide, `Esc` exit), so that I can operate the reader without touching a mouse.
37. As a reader, I want to press `?` to open an interactive keyboard shortcuts cheat sheet, so that I can discover and master all keyboard controls.
38. As a reader, I want fullscreen mode support, so that I can eliminate all operating system and browser distractions while reading.

---

## Implementation Decisions

### Architectural Decisions
- **Application Structure**: Modular single-page web application built with **Vite**, **React 19**, and **TypeScript**, compiled to an ultra-lean static distribution.
- **Design System**: Bespoke **Vanilla CSS design system** utilizing CSS Custom Properties (tokens), fluid typography, hardware-accelerated animations, and responsive CSS modules. No Tailwind or heavy utility libraries.
- **Client-Side Document Processing**:
  - `pdfjs-dist` loaded dynamically on demand to extract text items and page structures.
  - Client-side EPUB parser utilizing lightweight zip/xml extraction to parse `META-INF/container.xml`, the OPF package, and individual XHTML spine items.
  - Zero server calls; 100% of text processing occurs locally within the browser.
- **Local Persistence Layer**:
  - IndexedDB stores document files, extracted chapter tokens, and resume position bookmarks.
  - `localStorage` stores user preferences (WPM, font size, theme, focus color, cadence audio settings).

### Prototype Data Contracts & State Machine

```typescript
// Core token representation produced by the parsing pipeline
export interface WordToken {
  id: number;
  display: string;
  cleanText: string;
  alnumLength: number;
  pauseMultiplier: number;
  orpIndex: number;
  sentenceIndex: number;
  paragraphIndex: number;
  isSentenceStart: boolean;
  isParagraphStart: boolean;
}

// Display and perceptual reading modes
export type ReadingMode = 'classic-orp' | 'ghost-context' | 'chunking';

// Document structure stored in IndexedDB
export interface DocumentItem {
  id: string;
  title: string;
  sourceType: 'pdf' | 'epub' | 'txt' | 'markdown' | 'paste';
  totalWords: number;
  createdAt: number;
  lastReadAt: number;
  lastPosition: number; // Token index
  chapters: DocumentChapter[];
}

export interface DocumentChapter {
  id: string;
  title: string;
  startIndex: number;
  endIndex: number;
}

// Global user preferences
export interface ReaderSettings {
  wpm: number;
  mode: ReadingMode;
  chunkSize: 1 | 2 | 3;
  smartPunctuation: boolean;
  longWordBoost: boolean;
  wordRepetition: number;
  bionicMode: boolean;
  fontFamily: 'sans' | 'mono' | 'dyslexic';
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  fontWeight: '500' | '600' | '700' | '800';
  focusColor: string;
  focalGuide: boolean;
  focalMode: 'auto' | 'center' | 'left' | 'right';
  theme: 'dark' | 'light' | 'system';
  audioCadence: {
    enabled: boolean;
    volume: number;
    pitch: number;
  };
  progressiveSpeed: {
    enabled: boolean;
    startWpm: number;
    maxWpm: number;
    increment: number;
    intervalSec: number;
  };
}
```

### Perception & Timing Subsystems
- **ORP Measurement Engine**: Offscreen HTML5 Canvas context calculating font metrics via `measureText()` to compute the exact horizontal pixel offset required to center the ORP character on the viewport's focal vertical axis.
- **Clock Engine**: Replaces `setTimeout` with a `requestAnimationFrame` loop that accumulates millisecond deltas against `performance.now()`. When accumulated delta exceeds the target word duration (modulated by WPM and punctuation multipliers), the engine advances token pointers without timing drift.
- **Synthesized Audio Metronome**: Implemented via Web Audio API `AudioContext` with an exponential gain envelope decay (15ms click duration at 440–880 Hz), completely avoiding external audio asset loading.

---

## Testing Decisions

### What Makes a Good Test
Tests must verify **external behavior and observable state transitions**, rather than internal private variables or component DOM implementation details:
1. When inputting text or files, verify the correct token stream, ORP indices, and sentence boundaries are produced.
2. When controlling playback (play, pause, seek, speed change), verify the reader advances, pauses, and calculates remaining time accurately.
3. When saving documents, verify that IndexedDB accurately stores and restores reading positions across sessions.

### Testing Seams
- **Primary Seam (Highest Seam)**: **The Headless Reader Controller**.
  - A headless state machine that coordinates playback, time advancement, speed changes, sentence seeking, and token progression.
  - Allows full end-to-end testing of playback loops, punctuation pauses, countdown timers, and progressive ramping without requiring a live browser display or canvas mock.
- **Secondary Seam**: **The Text & Document Parser Pipeline**.
  - Pure functional seam accepting raw text, Markdown, PDF text items, or EPUB chapters and returning structured `WordToken[]` with validated punctuation multipliers and ORP indices.
- **Tertiary Seam**: **The Storage Adapter (IndexedDB/LocalStorage)**.
  - Seam managing document serialization, bookmark updates, and preference migrations.

### Prior Art
- The algorithmic token parser and ORP calculation function from the original single-file HTML implementation.

---

## Out of Scope

1. **Cloud Sync & User Accounts**: All documents and analytics remain strictly local to the user's browser; no user authentication or cloud backend is included.
2. **Optical Character Recognition (OCR)**: Scanned, non-searchable PDF images without an embedded text layer will not be processed.
3. **Neural Text-to-Speech (TTS) Voice Synthesis**: The audio engine provides an auditory cadence metronome; full AI speech reading is out of scope.
4. **Collaborative Social Features**: Sharing reading lists or competitive multiplayer speed-reading leaderboards.

---

## Further Notes

- **Offline Portability**: The compiled production build will function completely offline as static assets.
- **Privacy Assurance**: Text and book files never leave the user's device, ensuring compliance with strict privacy requirements for sensitive documents.
