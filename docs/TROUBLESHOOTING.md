# Focus Reader Pro — Troubleshooting & Edge Cases

This guide details common edge cases, browser security constraints, and practical troubleshooting steps when using Focus Reader Pro.

---

## 1. Document Extraction Issues

### "DRM Protected EPUB" or "Cannot locate package document"
- **Cause:** Commercial EPUBs purchased through proprietary bookstores (e.g., Apple Books, Amazon Kindle, Kobo) often contain Adobe Adept or FairPlay Digital Rights Management (DRM) encryption.
- **Fix:** Focus Reader Pro runs entirely in your browser and deliberately does not break DRM encryption. Use DRM-free EPUB files (such as those from [Project Gutenberg](https://www.gutenberg.org/) or [Standard Ebooks](https://standardebooks.org/)).

### "Password protected or encrypted PDF"
- **Cause:** The PDF document requires a password or permissions certificate to decode character streams.
- **Fix:** Open the PDF in your default PDF viewer and export or print an unencrypted copy without password restrictions, then drop it into Focus Reader Pro.

### Text ordering is scrambled in multi-column PDFs
- **Cause:** PDFs encode characters as independent absolute coordinate glyphs rather than linear text streams. In some dense academic papers with complex multi-column layouts or floating footnotes, PDF text streams may interleave columns.
- **Fix:** Convert the paper to Markdown or plain text first, or copy-paste the specific section directly into the Setup text box.

---

## 2. Auditory Metronome Issues

### Audio metronome click is silent or doesn't sound
- **Cause:** Modern web browsers (Chrome, Edge, Safari) enforce strict **Autoplay Security Policies** that prevent any `AudioContext` from emitting sound until the user explicitly clicks or touches an element on the webpage.
- **Fix:** Press `Space` or click any interactive element on the screen to initialize the Web Audio API context. Ensure your computer's system volume is active and the Audio Cadence toggle in Settings is enabled.

---

## 3. Storage & Bookmarks Issues

### Documents or bookmarks disappear after closing the browser
- **Cause:** If you are using **Incognito / Private Browsing Mode**, most browsers automatically purge IndexedDB databases and `localStorage` as soon as the private window is closed.
- **Fix:** Use standard (non-private) browser windows if you want your books, bookmarks, and analytics to persist across days and weeks.

### "QuotaExceededError" when saving massive libraries
- **Cause:** While desktop browsers generally allocate tens of gigabytes to IndexedDB, mobile browsers or restricted enterprise environments may limit local storage to 50–100 MB.
- **Fix:** Open the **Library Drawer** and click the trash can icon on older finished books, or click **Clear Library** to reclaim local storage space.
