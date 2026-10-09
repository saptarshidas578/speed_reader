# 10 Analytics Dashboard and Keyboard Cheatsheet

## What to build
Session completion summary, long-term reading analytics, and an interactive keyboard shortcut cheatsheet. When a reading session finishes, an animated completion card summarizes reading duration, effective WPM, and total words read. A persistent Analytics modal displays cumulative statistics (total words read, reading time, sessions completed). Pressing `?` opens a keyboard shortcut reference modal detailing all navigation and controls.

## Acceptance criteria
- [x] Completion view shows celebration badge, words read, reading duration, and average WPM with "Read Again" and "Back to Library" actions.
- [x] Analytics modal aggregates historical reading data from completed sessions stored locally.
- [x] Pressing `?` or clicking the Help icon opens an accessible shortcut modal displaying all hotkeys.
- [x] Hotkeys covered: Space (Play/Pause), ArrowLeft/Right (Word step), ArrowUp/Down (WPM +/-), `[` and `]` (Sentence rewind/skip), 1/2/3 (Mode), R (Restart), F (Focal guide), ? (Help), Esc (Exit).

## Blocked by
- 04 Interactive Scrubber, Sentence Rewind, and Pause Context
- 09 Persistent IndexedDB Library and Bookmarks

## Status
closed
