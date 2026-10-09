# 05 Typography, Bionic Reading, and Themes

## What to build
Comprehensive visual comfort and personalization. Users can choose among specialized fonts (Inter Sans, JetBrains Mono, OpenDyslexic, and System Sans), adjust font size (S, M, L, XL) and weight, toggle Bionic Reading mode (bolding initial word phonemes), configure the focal highlight color (red, orange, blue, green, purple, custom), and select Dark, Light, or System themes. All visual preferences persist in `localStorage`.

## Acceptance criteria
- [x] Typography selector allows switching fonts dynamically (Inter, JetBrains Mono, OpenDyslexic, System).
- [x] Bionic Reading toggle renders initial letters of words in bold weight across all modes.
- [x] Font size and weight controls update canvas measurement and viewport scaling smoothly.
- [x] Accent focus color can be selected from presets or custom color input, with glowing text-shadow.
- [x] Dark, Light, and System themes adapt all surfaces, borders, and text contrast.
- [x] Preferences survive page reloads via `localStorage`.

## Blocked by
- 01 Scaffold and Core RSVP Engine
- 03 Peripheral Ghost Context and Chunking

## Status
closed
