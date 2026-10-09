# 04 Interactive Scrubber, Sentence Rewind, and Pause Context

## What to build
Structural navigation and effortless context recovery. An interactive timeline scrubber displays tick marks indicating sentence and paragraph divisions, allowing users to drag or click to seek anywhere in the document. Dedicated 1-tap controls and keyboard shortcuts (`[` and `]`) allow rewinding or skipping 1 sentence. Whenever reading is paused, an inspection card displays the surrounding sentence in full readable context so the reader can reorient their attention.

## Acceptance criteria
- [x] Interactive scrubber bar accurately reflects reading progress percentage and allows drag/click seeking.
- [x] Visual tick marks indicate sentence and paragraph boundaries on the scrubber track.
- [x] 1-tap "Rewind 1 Sentence" button and hotkey (`[`) jumps to the beginning of the current or previous sentence.
- [x] 1-tap "Skip 1 Sentence" button and hotkey (`]`) jumps to the next sentence.
- [x] When paused, a contextual inspection popover/card appears showing the active sentence highlighted within surrounding text.
- [x] Resuming playback hides the context card and resumes word flashing from the chosen word.

## Blocked by
- 01 Scaffold and Core RSVP Engine

## Status
closed
