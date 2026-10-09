# 01 Scaffold and Core RSVP Engine

## What to build
A runnable, modular single-page application built on Vite, React 19, and TypeScript featuring a headless RSVP state machine and a responsive word stage. Users can paste text into an input box or click a "Try Demo" button, start playback with the Play button or Spacebar, and watch words flash sequentially. Each word's Optimal Recognition Point (ORP) character is dynamically measured via offscreen canvas metrics and locked horizontally at the exact center of the viewport with a red highlight. Playback timing runs on a drift-free `requestAnimationFrame` + `performance.now()` delta accumulator supporting speeds between 50 and 1500 WPM, with speed slider and preset buttons.

## Acceptance criteria
- [x] Application compiles cleanly and launches with `npm run dev`.
- [x] Users can paste text into a textarea or click "Try Demo" to populate starter text.
- [x] Clicking "Start Reading" transitions to the reader view and initiates sequential word flashing.
- [x] The focal ORP character is calculated accurately based on word length and aligns horizontally to the center of the viewport via canvas measurement.
- [x] Playback is controlled via Play/Pause button or the Spacebar.
- [x] Speed can be adjusted smoothly from 50 to 1500 WPM using a slider, +/- buttons, or preset chips.
- [x] Playback timing runs on `requestAnimationFrame` with delta accumulation so timing does not drift over time.
- [x] Step back (`ArrowLeft`) and step forward (`ArrowRight`) allow single-word navigation when paused.
- [x] Unit tests for the tokenizer and ORP calculation pass green.

## Blocked by
None (can start immediately)

## Status
closed
