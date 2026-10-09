# Architectural Decision Records (ADRs)

This document captures the key architectural and technical decisions made during the design and construction of Focus Reader Pro.

---

## ADR 01: requestAnimationFrame Clock vs. setInterval / Web Workers

- **Context:** RSVP reading requires displaying words at intervals as short as 40 milliseconds (1500 WPM).
- **Decision:** Use a single, continuous `requestAnimationFrame` loop tracking delta timestamps (`performance.now()`) with residual accumulated carryover.
- **Rationale:**
  - `setInterval` and `setTimeout` are clamped to a minimum of 4ms by the HTML5 spec, suffer from browser task-queue delays, and accumulate drift.
  - `requestAnimationFrame` aligns word transitions directly with display refresh cycles (60Hz / 120Hz / 144Hz / 240Hz), completely eliminating visual tearing and frame-skip stutter.
  - While Web Workers were considered for background timing, DOM rendering must occur on the main thread anyway. Synchronizing state via `postMessage` added serialization overhead without rendering benefit.

---

## ADR 02: Vanilla CSS Custom Property Tokens vs. Utility Frameworks (Tailwind)

- **Context:** The application requires sleek dark/light theme switching, accent focus color customization, and responsive typography scaling.
- **Decision:** Implement a bespoke Vanilla CSS design system using native CSS variables (`var(--bg)`, `var(--surface)`, `var(--focus)`) in `src/index.css`.
- **Rationale:**
  - Zero external CSS build dependencies keeps build times under 1 second.
  - Runtime dynamic modifications (e.g. changing `--focus` to any user-picked hex color) happen instantaneously via `document.documentElement.style.setProperty` without recompiling class maps or needing runtime style injection.

---

## ADR 03: Zero-Server Client-Side IndexedDB vs. Backend Database

- **Context:** Users need their uploaded books, reading bookmarks, and historical analytics to persist across days and weeks.
- **Decision:** Utilize browser-native IndexedDB (`focus_reader_db`) for documents/tokens and `localStorage` for visual preferences and aggregate metrics.
- **Rationale:**
  - **Privacy:** Speed reading material frequently includes proprietary company documents, draft papers, or private ebooks. Keeping data strictly local provides an absolute, unverifiable-by-third-parties privacy guarantee.
  - **Zero Infrastructure:** No servers, databases, or API maintenance costs. The application can run offline or as a Progressive Web App (PWA).

---

## ADR 04: HTML5 Canvas Measurement for ORP Centering

- **Context:** To eliminate eye movement, the calculated Optimal Recognition Point (ORP) character of every word must align to the exact physical center of the screen.
- **Decision:** Measure character string widths dynamically using an off-screen `CanvasRenderingContext2D` matching the exact CSS font family, weight, and size.
- **Rationale:**
  - In proportional typefaces, character widths vary wildly (e.g., `M` is 3× wider than `l`). Offsetting by character count results in visible horizontal jitter.
  - Canvas `.measureText().width` provides micro-pixel precision, allowing the word container's CSS `left` coordinate to offset smoothly so the fixation letter never shifts.

---

## ADR 05: Dynamic ESM Code Splitting for PDF and EPUB Extraction

- **Context:** `pdfjs-dist` and `jszip` are large dependencies (~1.5 MB uncompressed).
- **Decision:** Lazy-load extraction logic via dynamic `import()` statements inside `pdfExtractor.ts` and `epubExtractor.ts`.
- **Rationale:**
  - Users reading pasted text or Markdown do not need to download the PDF rendering engine.
  - Initial application bundle size remains under 90 kB gzipped, providing instantaneous initial load times.
