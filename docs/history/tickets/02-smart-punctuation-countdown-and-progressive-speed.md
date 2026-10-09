# 02 Smart Punctuation, Countdown, and Progressive Speed

## What to build
Natural reading cadence and pacing enhancements. When reading text, the RSVP engine pauses longer at sentence and clause boundaries (periods, commas, exclamation/question marks, colons, and paragraph breaks). Before reading starts or restarts, an optional 3-2-1 visual countdown displays to let the user's eyes settle. An optional progressive speed ramp increases WPM gradually at configurable intervals from a start WPM to a target ceiling.

## Acceptance criteria
- [x] Words ending with punctuation hold for calibrated multipliers (commas 1.5x, semicolons 2.0x, colons 2.0x, periods 2.5x, question/exclamation marks 3.0x, paragraph ends 4.0x).
- [x] Long words (>10 characters) receive an optional duration boost.
- [x] A 3-2-1 countdown overlay displays before word playback commences, with an option to skip or disable.
- [x] Progressive speed ramp increments WPM by a set step (e.g. +25 WPM) every N seconds until max WPM is reached.
- [x] Settings toggles exist for Smart Punctuation, Long Word Boost, and Progressive Speed.

## Blocked by
- 01 Scaffold and Core RSVP Engine

## Status
closed
