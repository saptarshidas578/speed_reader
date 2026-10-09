# Contributing to Focus Reader Pro

Thank you for your interest in contributing to Focus Reader Pro! We welcome issues, bug reports, feature suggestions, and pull requests.

---

## Code of Conduct

This project is governed by the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Development Workflow

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher
- Git

### 2. Getting Started
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/saptarshidas578/speed_reader.git
   cd speed_reader
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

---

## Quality Checks & Testing

Before submitting a pull request, ensure all tests pass and the production build compiles cleanly:

```bash
# Run unit tests
npm test -- --run

# Run linter
npm run lint

# Run TypeScript typecheck & production bundle
npm run build
```

---

## Architectural Principles & Constraints

When contributing code, please respect these core architectural constraints:
1. **Zero-Server Guarantee:** Never introduce backend calls, telemetry beacons, or external API requirements for reading features. All processing must execute 100% client-side in the browser.
2. **Drift-Free Timing:** Never replace the `requestAnimationFrame` timing clock with naive `setInterval` or `setTimeout` calls for RSVP playback.
3. **Vanilla CSS Design System:** Avoid introducing Tailwind or heavy CSS utility frameworks. Use the existing CSS custom property tokens defined in `src/index.css`.
4. **Code Splitting for Heavy Parsers:** Keep `pdfjs-dist` and `jszip` lazy-loaded via dynamic `import()` to preserve initial page load performance.

---

## Submitting Pull Requests

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Write clear, atomic commits with descriptive commit messages.
3. Push to your fork and submit a Pull Request describing your changes, why they are needed, and how they were tested.
