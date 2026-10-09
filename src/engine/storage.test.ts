import { describe, it, expect } from 'vitest';
import {
  saveDocument,
  getAllDocuments,
  getDocument,
  updateBookmark,
  deleteDocument
} from './storage';
import type { StoredDocument } from './storage';

describe('IndexedDB Storage Layer', () => {
  it('handles environment without indexedDB safely', async () => {
    // If running in headless node without indexedDB mock
    if (typeof indexedDB === 'undefined') {
      await expect(getAllDocuments()).rejects.toThrow('IndexedDB is not supported');
    }
  });

  it('updates bookmark position and progress calculation', async () => {
    const mockDoc: StoredDocument = {
      id: 'test-doc-1',
      title: 'Test Document',
      fileName: 'test.txt',
      fileType: 'txt',
      rawText: 'One two three four five.',
      tokens: [],
      chapters: [],
      totalWords: 100,
      bookmarkIndex: 0,
      progressPercent: 0,
      lastReadAt: 1000,
      createdAt: 1000
    };

    // If indexedDB is available or mocked
    if (typeof indexedDB !== 'undefined') {
      await saveDocument(mockDoc);
      await updateBookmark('test-doc-1', 49, 100);

      const retrieved = await getDocument('test-doc-1');
      expect(retrieved?.bookmarkIndex).toBe(49);
      expect(retrieved?.progressPercent).toBe(50);

      await deleteDocument('test-doc-1');
    }
  });
});
