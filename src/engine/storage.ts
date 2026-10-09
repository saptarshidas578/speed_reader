import type { WordToken } from '../types/reader';
import type { ChapterMarker } from './markdownParser';
import { parseMarkdown } from './markdownParser';

/**
 * Record representing a saved document in the IndexedDB library.
 */
export interface StoredDocument {
  /** Unique document identifier. */
  id: string;
  /** Display title for the document. */
  title: string;
  /** Original file name with extension. */
  fileName: string;
  /** File format discriminator. */
  fileType: 'txt' | 'md' | 'pdf' | 'epub' | 'demo';
  /** Full cleaned string contents. */
  rawText: string;
  /** Pre-tokenized WordToken array. */
  tokens: WordToken[];
  /** Chapter boundaries and headings. */
  chapters: ChapterMarker[];
  /** Total word count. */
  totalWords: number;
  /** Last read 0-based word index bookmark. */
  bookmarkIndex: number;
  /** Percentage of completion (0 to 100). */
  progressPercent: number;
  /** Timestamp in milliseconds of last reading session. */
  lastReadAt: number;
  /** Creation timestamp in milliseconds. */
  createdAt: number;
}

const DB_NAME = 'focus_reader_db';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

/**
 * Opens or upgrades the client-side IndexedDB database.
 * @returns Promise resolving to an IDBDatabase instance
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('lastReadAt', 'lastReadAt', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves or updates a document record in IndexedDB.
 * @param doc StoredDocument record to save
 */
export async function saveDocument(doc: StoredDocument): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(doc);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves a document from IndexedDB by its unique ID.
 * @param id Document identifier
 * @returns Promise resolving to the StoredDocument or null
 */
export async function getDocument(id: string): Promise<StoredDocument | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieves all stored documents ordered by lastReadAt descending.
 * @returns Promise resolving to an array of StoredDocuments
 */
export async function getAllDocuments(): Promise<StoredDocument[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const list = (req.result || []) as StoredDocument[];
      // Sort by lastReadAt descending
      list.sort((a, b) => b.lastReadAt - a.lastReadAt);
      resolve(list);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Updates the reading bookmark index and progress percentage for a document.
 * @param id Document ID
 * @param bookmarkIndex Word index where reader paused
 * @param totalWords Total words in document
 */
export async function updateBookmark(
  id: string,
  bookmarkIndex: number,
  totalWords: number
): Promise<void> {
  const doc = await getDocument(id);
  if (!doc) return;

  const validIndex = Math.max(0, Math.min(bookmarkIndex, totalWords - 1));
  const progressPercent = totalWords > 0 ? Math.round(((validIndex + 1) / totalWords) * 100) : 0;

  doc.bookmarkIndex = validIndex;
  doc.progressPercent = progressPercent;
  doc.lastReadAt = Date.now();

  await saveDocument(doc);
}

/**
 * Deletes a document from the local IndexedDB database.
 * @param id Document ID to delete
 */
export async function deleteDocument(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clears all documents from the local library.
 */
export async function clearLibrary(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

const STARTER_ESSAY = `# The Science of RSVP Speed Reading

Rapid Serial Visual Presentation, or RSVP, represents a fundamentally different paradigm for processing human written language. In traditional reading, human eyes engage in a continuous cycle of saccades: rapid, jerky ballistic eye movements separated by brief fixations. During each fixation, our fovea focuses on a small cluster of letters while cognitive processing decodes phonemes and semantics.

Research indicates that saccadic physical movement accounts for up to 80% of total reading time, rather than actual comprehension processing. By presenting words sequentially at a single focal point, RSVP eliminates the physical latency of eye travel.

## The Optimal Recognition Point
Every printed word possesses an Optimal Recognition Point (ORP). When the human eye fixates precisely at this anchor—typically between 25% and 35% into the word—the brain identifies the word up to four times faster.`;

const STARTER_TIME_MACHINE = `# Chapter 1: The Machine
## The Time Machine by H.G. Wells

The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His pale grey eyes shone and twinkled, and his usually pale face was flushed and animated. The fire burned brightly, and the soft radiance of the incandescent lights in the lilies of silver caught the bubbles that flashed and passed in our glasses.

"You must follow me carefully," said the Time Traveller. "I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, they taught you at school is founded on a misconception."

## The Fourth Dimension
"Can an instantaneous cube exist?" he asked thoughtfully. "Can a cube have a real existence that has no duration whatsoever? Clearly, any real body must have extension in four dimensions: Length, Breadth, Thickness, and Duration."`;

const STARTER_BENCHMARK = `# Speed Benchmark Challenge

This speed reading benchmark is calibrated to test your comprehension at accelerating velocities. Pay close attention to key facts as you read.

The International Space Station travels around the Earth at approximately seventeen thousand five hundred miles per hour. At this tremendous speed, the station orbits our planet once every ninety minutes, allowing astronauts to witness sixteen sunrises and sunsets every single day.

Scientific research shows that human comprehension does not decline linearly with reading speed. In fact, when individuals read too slowly, the conscious mind experiences cognitive drift, daydreaming between words and forgetting the beginning of a paragraph before reaching the end.`;

/**
 * Pre-populates the library with initial starter documents if the library is currently empty.
 * @returns Promise resolving to the list of starter documents
 */
export async function seedStarterDocuments(): Promise<StoredDocument[]> {
  const existing = await getAllDocuments();
  if (existing.length > 0) return existing;

  const now = Date.now();

  const md1 = parseMarkdown(STARTER_ESSAY);
  const doc1: StoredDocument = {
    id: 'starter-science-rsvp',
    title: 'The Science of RSVP Speed Reading',
    fileName: 'science-of-rsvp.md',
    fileType: 'md',
    rawText: md1.cleanedText,
    tokens: md1.tokens,
    chapters: md1.chapters,
    totalWords: md1.tokens.length,
    bookmarkIndex: 0,
    progressPercent: 0,
    lastReadAt: now - 3600000 * 2,
    createdAt: now - 3600000 * 2
  };

  const md2 = parseMarkdown(STARTER_TIME_MACHINE);
  const doc2: StoredDocument = {
    id: 'starter-time-machine',
    title: 'The Time Machine (H.G. Wells Chapter 1)',
    fileName: 'time-machine-ch1.md',
    fileType: 'md',
    rawText: md2.cleanedText,
    tokens: md2.tokens,
    chapters: md2.chapters,
    totalWords: md2.tokens.length,
    bookmarkIndex: 0,
    progressPercent: 0,
    lastReadAt: now - 3600000 * 5,
    createdAt: now - 3600000 * 5
  };

  const md3 = parseMarkdown(STARTER_BENCHMARK);
  const doc3: StoredDocument = {
    id: 'starter-benchmark',
    title: 'Speed Benchmark Challenge',
    fileName: 'speed-benchmark.md',
    fileType: 'md',
    rawText: md3.cleanedText,
    tokens: md3.tokens,
    chapters: md3.chapters,
    totalWords: md3.tokens.length,
    bookmarkIndex: 0,
    progressPercent: 0,
    lastReadAt: now - 3600000 * 12,
    createdAt: now - 3600000 * 12
  };

  await saveDocument(doc1);
  await saveDocument(doc2);
  await saveDocument(doc3);

  return [doc1, doc2, doc3];
}
