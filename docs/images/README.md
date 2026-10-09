# Documentation Screenshots

This directory contains verified UI screenshots of Focus Reader Pro for use in the project README, user guide, and architectural specifications.

| File | View / Feature | Description |
|---|---|---|
| `01-setup-view.png` | Ingestion / Setup | Text input area, drag-and-drop zone, WPM speed slider, and quick presets. |
| `02-reader-view.png` | RSVP Engine | Dynamic ORP letter fixation in crimson with center focal guide lines. |
| `03-scrubber-controls.png` | Timeline Scrubber | Interactive percentage scrubber, WPM selector, and playback transport controls. |
| `04-pause-context.png` | Pause Context Card | Ambient sentence context overlay displayed when playback is paused. |
| `05-library-drawer.png` | Document Library | Slide-out IndexedDB library drawer with document cards, format badges, and bookmarks. |

### How to Capture Fresh Screenshots
Run the dev server locally:
```bash
npm run dev
```
Open `http://localhost:5173/` in a 1280x720 or 1920x1080 viewport and capture using your browser's developer tools (Ctrl+Shift+P -> "Capture full size screenshot" or "Capture screenshot").
