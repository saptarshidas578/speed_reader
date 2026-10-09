import { describe, it, expect, beforeAll } from 'vitest';
import { extractEpub } from './epubExtractor';
import JSZip from 'jszip';

beforeAll(() => {
  if (typeof globalThis.DOMParser === 'undefined') {
    globalThis.DOMParser = class {
      parseFromString(str: string) {
        return {
          querySelector(sel: string) {
            if (sel.includes('rootfile')) {
              const match = str.match(/full-path=["']([^"']+)["']/);
              return match ? { getAttribute: (attr: string) => (attr === 'full-path' ? match[1] : null) } : null;
            }
            if (sel.includes('title')) {
              const match = str.match(/<[^:]*:?title[^>]*>([^<]+)<\//i);
              return match ? { textContent: match[1] } : null;
            }
            if (sel.includes('h1') || sel.includes('h2')) {
              const match = str.match(/<h[12][^>]*>([^<]+)<\/h[12]>/i);
              return match ? { textContent: match[1] } : null;
            }
            return null;
          },
          querySelectorAll(sel: string) {
            if (sel.includes('manifest')) {
              const items: { getAttribute: (a: string) => string | null }[] = [];
              const re = /<item\s+[^>]*id=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*\/?>/g;
              let m;
              while ((m = re.exec(str)) !== null) {
                const id = m[1];
                const href = m[2];
                items.push({ getAttribute: (a: string) => (a === 'id' ? id : a === 'href' ? href : null) });
              }
              return items;
            }
            if (sel.includes('spine')) {
              const items: { getAttribute: (a: string) => string | null }[] = [];
              const re = /<itemref\s+[^>]*idref=["']([^"']+)["'][^>]*\/?>/g;
              let m;
              while ((m = re.exec(str)) !== null) {
                const idref = m[1];
                items.push({ getAttribute: (a: string) => (a === 'idref' ? idref : null) });
              }
              return items;
            }
            if (sel.includes('p') || sel.includes('div')) {
              const items: { textContent: string }[] = [];
              const re = /<p[^>]*>([^<]+)<\/p>/gi;
              let m;
              while ((m = re.exec(str)) !== null) {
                items.push({ textContent: m[1] });
              }
              return items;
            }
            return [];
          },
          body: {
            textContent: str.replace(/<[^>]+>/g, ' '),
            querySelectorAll() {
              const items: { textContent: string }[] = [];
              const re = /<p[^>]*>([^<]+)<\/p>/gi;
              let m;
              while ((m = re.exec(str)) !== null) {
                items.push({ textContent: m[1] });
              }
              return items;
            }
          }
        } as unknown as Document;
      }
    } as unknown as typeof DOMParser;
  }
});

describe('epubExtractor', () => {
  it('throws descriptive error if container.xml is missing', async () => {
    const zip = new JSZip();
    zip.file('dummy.txt', 'hello');
    const buffer = await zip.generateAsync({ type: 'arraybuffer' });

    await expect(extractEpub(buffer)).rejects.toThrow('missing META-INF/container.xml');
  });

  it('detects DRM encryption and throws clear message', async () => {
    const zip = new JSZip();
    zip.file('META-INF/container.xml', '<container/>');
    zip.file('META-INF/encryption.xml', '<encryption><enc:EncryptedData/></encryption>');
    const buffer = await zip.generateAsync({ type: 'arraybuffer' });

    await expect(extractEpub(buffer)).rejects.toThrow('DRM encryption');
  });

  it('extracts valid EPUB structure and generates chapter markers', async () => {
    const zip = new JSZip();
    zip.file(
      'META-INF/container.xml',
      '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
    );
    zip.file(
      'OEBPS/content.opf',
      '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf"><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">Sample Ebook</dc:title></metadata><manifest><item id="ch1" href="ch1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="ch1"/></spine></package>'
    );
    zip.file(
      'OEBPS/ch1.xhtml',
      '<!DOCTYPE html><html><head><title>Chapter 1</title></head><body><h1>Chapter 1</h1><p>The speed reader unlocks fast reading.</p></body></html>'
    );

    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    const progressLogs: number[] = [];

    const doc = await extractEpub(buffer, (pct) => progressLogs.push(pct));
    expect(doc.title).toBe('Sample Ebook');
    expect(doc.tokens.length).toBeGreaterThan(0);
    expect(doc.chapters.length).toBe(1);
    expect(doc.chapters[0].title).toBe('Chapter 1');
    expect(progressLogs.length).toBeGreaterThan(0);
  });
});
