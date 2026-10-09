# Privacy Policy & Architecture Guarantee

**Last Updated:** October 2026

Focus Reader Pro was built from the ground up on a fundamental privacy principle: **your reading material is private and belongs solely to you.**

---

### Zero-Server / 100% Client-Side Execution

- **Zero Content Uploads:** When you paste text, drop a file, or open an EPUB/PDF, processing happens entirely within your web browser using client-side JavaScript, WebAssembly, and Web Workers. Your documents are never uploaded to any remote server or third-party cloud.
- **Zero Telemetry or Analytics:** Focus Reader Pro contains zero tracking scripts, telemetry pings, advertisement SDKs, or third-party analytics (no Google Analytics, no Mixpanel, no Facebook Pixel, no Sentry).
- **Zero External API Calls:** The application does not communicate with external APIs during reading. All speed reading calculation, tokenization, ORP calibration, and audio synthesis operate offline.

---

### What Is Stored on Your Device

Focus Reader Pro utilizes standard, isolated browser storage APIs strictly on your local machine:

1. **IndexedDB (`focus_reader_db`):**
   - Stores your saved library documents, tokenized chapters, word counts, and bookmark index positions so you can resume reading across sessions.
2. **Local Storage (`focus_reader_settings_v2`):**
   - Stores your visual and pacing preferences (WPM speed, theme, font size, font family, focus color, progressive speed ramps, audio cadence volume/pitch).
3. **Local Storage (`focus_reader_analytics_v1`):**
   - Stores your aggregate reading velocity statistics (total words read, time invested, top WPM, and recent session history).

---

### Data Deletion & Control

You retain complete control over your data:
- **Delete Individual Books:** Click the trash icon on any card in the Document Library drawer.
- **Clear All Documents:** Click "Clear Library" in the Document Library drawer to wipe the local IndexedDB database.
- **Reset Analytics:** Click "Reset History" in the Analytics modal to clear reading logs.
- **Complete Erase:** Clearing your browser's site data or cache for the domain permanently removes all local stores.

---

### Codebase Verification

This guarantee is independently verifiable in the open source code:
- Check `src/engine/storage.ts` to inspect client-side IndexedDB operations.
- Check `src/engine/analytics.ts` to inspect client-side session logging.
- Check `src/engine/pdfExtractor.ts` and `src/engine/epubExtractor.ts` to verify in-browser parsing via `pdfjs-dist` and `jszip`.
- Inspect your browser's **Network tab** during playback; you will observe **zero outgoing HTTP requests**.
