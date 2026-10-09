# Focus Reader Pro — Developer Guide

This document outlines the engineering guidelines, testing workflows, and extension mechanisms for developing and maintaining Focus Reader Pro.

---

## 1. Environment Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ recommended)
- **npm:** v9.0.0 or higher
- **Git**

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/saptarshidas578/speed_reader.git
cd speed_reader
npm install
```

### Development Server
Start the local Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 2. Quality Verification & Testing

Focus Reader Pro uses **Vitest** for fast, isolated unit testing of all engine components, parsers, and persistent stores.

### Running Unit Tests
```bash
# Run all unit tests once and exit (CI mode)
npm test -- --run

# Run tests in interactive watch mode
npm test
```

### Linting
```bash
# Run oxlint for fast static analysis
npm run lint
```

### TypeScript Compilation & Production Build
```bash
# Type check with strict TypeScript compiler and bundle with Vite
npm run build
```

### Previewing Production Artifacts
```bash
# Preview the production dist bundle locally
npm run preview
```

---

## 3. Code Conventions & Architectural Standards

### Strict TypeScript
- `noUnusedLocals: true` and `noImplicitAny: true` are enforced via `tsconfig.app.json`.
- All domain types are defined in `src/types/reader.ts`.
- Prefer explicit return types on engine methods and exported functions.

### Design Tokens & Styling
- **Zero Tailwind / Utility Frameworks:** The UI uses Vanilla CSS structured in `src/index.css` via semantic CSS custom properties (`--bg`, `--surface`, `--accent`, `--focus`, `--radius-md`).
- All interactive controls must support both `--theme: dark` and `--theme: light`.
- Never use inline hardcoded color values when a custom property token exists.

### Zero-Server Guarantee
- Never introduce network calls or backend endpoints to process user documents. All parsing and persistence must remain 100% on-device.

---

## 4. How to Extend the Application

### Adding a New Document Parser
To add support for a new file format (e.g., `.docx` or `.html`):
1. Create a parser module in `src/engine/myFormatExtractor.ts`.
2. Ensure the parser returns a structured object matching:
   ```typescript
   export interface ExtractedDocument {
     title: string;
     text: string;
     tokens: WordToken[];
     chapters: ChapterMarker[];
     totalWords: number;
   }
   ```
3. Use dynamic ESM imports (`const module = await import('my-parser')`) so heavy parsing bundles only load when a user actually uploads that file type.
4. Add corresponding unit tests in `src/engine/myFormatExtractor.test.ts`.
5. Connect the file extension handler in `App.tsx`'s `handleFileUpload`.

### Adding a New Visual Reading Mode
1. Add the mode identifier to `ReadingMode` union in `src/types/reader.ts`.
2. Add state extraction in `src/engine/rsvpEngine.ts` (e.g. `getCustomContext()`).
3. Render the visual presentation in `src/components/ReaderView.tsx`.
4. Update the Keyboard Cheatsheet and User Guide to document the new mode.
