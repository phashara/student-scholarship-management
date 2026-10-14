/**
 * Resilient offline storage utilities for scholarship applications.
 * Handles LocalStorage quota limitations by safely degrading large base64 payloads
 * while maintaining complete copies in IndexedDB when available.
 */

import { AttachedDoc, ScholarshipApplication } from '../types';

export const STORAGE_KEY = 'nu_socsci_scholarship_applications_2569';
export const DRAFT_STORAGE_KEY = 'nu_socsci_scholarship_draft_2569';

const DB_NAME = 'nu_socsci_scholarship_db';
const DB_VERSION = 1;
const STORE_APPLICATIONS = 'applications';
const STORE_DRAFTS = 'drafts';

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_APPLICATIONS)) {
          db.createObjectStore(STORE_APPLICATIONS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
          db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Save an application to IndexedDB (asynchronous full backup)
 */
export async function saveAppIndexedDB(app: ScholarshipApplication): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_APPLICATIONS, 'readwrite');
    const store = tx.objectStore(STORE_APPLICATIONS);
    store.put(app);
  } catch {
    // IndexedDB failure shouldn't block the app
  }
}

/**
 * Save multiple applications to IndexedDB
 */
export async function saveAppsIndexedDB(apps: ScholarshipApplication[]): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_APPLICATIONS, 'readwrite');
    const store = tx.objectStore(STORE_APPLICATIONS);
    for (const app of apps) {
      store.put(app);
    }
  } catch {
    // ignore
  }
}

/**
 * Delete an application from IndexedDB
 */
export async function deleteAppIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_APPLICATIONS, 'readwrite');
    const store = tx.objectStore(STORE_APPLICATIONS);
    store.delete(id);
  } catch {
    // ignore
  }
}

/**
 * Clear all applications from IndexedDB
 */
export async function clearAppsIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_APPLICATIONS, 'readwrite');
    const store = tx.objectStore(STORE_APPLICATIONS);
    store.clear();
  } catch {
    // ignore
  }
}

/**
 * Clean large base64 dataUrl from an AttachedDoc while retaining metadata
 */
function cleanDoc(doc?: AttachedDoc, maxChars = 20000): AttachedDoc | undefined {
  if (!doc) return undefined;
  if (doc.dataUrl && doc.dataUrl.length > maxChars) {
    return {
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      fileType: doc.fileType,
      uploadedAt: doc.uploadedAt,
      // dataUrl stripped for local storage quota safety
    };
  }
  return doc;
}

/**
 * Strip large attachments from an application to fit in LocalStorage
 */
export function stripLargeAttachments(
  app: ScholarshipApplication,
  maxChars = 20000
): ScholarshipApplication {
  const result: ScholarshipApplication = {
    ...app,
    studentPhotoDoc: cleanDoc(app.studentPhotoDoc, maxChars),
    academicTranscriptDoc: cleanDoc(app.academicTranscriptDoc, maxChars),
    incomeCertificateDoc: cleanDoc(app.incomeCertificateDoc, maxChars),
  };

  // Clean any other dynamically added doc properties
  for (const [key, value] of Object.entries(app)) {
    if (value && typeof value === 'object' && 'dataUrl' in value && 'fileName' in value) {
      (result as unknown as Record<string, unknown>)[key] = cleanDoc(value as AttachedDoc, maxChars);
    }
  }

  return result;
}

/**
 * Strip large attachments from a draft
 */
export function stripLargeDraftAttachments(
  draft: Partial<ScholarshipApplication>,
  maxChars = 20000
): Partial<ScholarshipApplication> {
  const result: Partial<ScholarshipApplication> = {
    ...draft,
    studentPhotoDoc: cleanDoc(draft.studentPhotoDoc, maxChars),
    academicTranscriptDoc: cleanDoc(draft.academicTranscriptDoc, maxChars),
    incomeCertificateDoc: cleanDoc(draft.incomeCertificateDoc, maxChars),
  };

  for (const [key, value] of Object.entries(draft)) {
    if (value && typeof value === 'object' && 'dataUrl' in value && 'fileName' in value) {
      (result as unknown as Record<string, unknown>)[key] = cleanDoc(value as AttachedDoc, maxChars);
    }
  }

  return result;
}

/**
 * Safely store applications in LocalStorage with automatic quota fallback
 */
export function safeSetApplicationsLocalStorage(apps: ScholarshipApplication[]): boolean {
  if (typeof window === 'undefined') return false;

  // Level 1: Try storing directly
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    return true;
  } catch (err1) {
    // QuotaExceededError or similar - proceed to Level 2
  }

  // Level 2: Strip large base64 attachments from older applications, keep latest app full
  try {
    const semiStripped = apps.map((app, index) => {
      // Keep only the first/latest application full if possible, strip the rest
      return index === 0 ? cleanDocOnlyHuge(app) : stripLargeAttachments(app, 15000);
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semiStripped));
    return true;
  } catch (err2) {
    // proceed to Level 3
  }

  // Level 3: Strip all attachments larger than 5KB from every application
  try {
    const fullyStripped = apps.map((app) => stripLargeAttachments(app, 5000));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullyStripped));
    return true;
  } catch (err3) {
    // proceed to Level 4
  }

  // Level 4: Strip completely and keep only the latest 30 applications
  try {
    const minimal = apps.slice(0, 30).map((app) => stripLargeAttachments(app, 0));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    return true;
  } catch (err4) {
    console.warn('LocalStorage quota exhausted, local cache could not be persisted');
    return false;
  }
}

function cleanDocOnlyHuge(app: ScholarshipApplication): ScholarshipApplication {
  // Strip documents over 200KB from the current app
  return stripLargeAttachments(app, 200000);
}

/**
 * Safely store draft in LocalStorage with fallback
 */
export function safeSetDraftLocalStorage(draft: Partial<ScholarshipApplication>): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch (err1) {
    // Strip large attachments so student doesn't lose text answers
    try {
      const strippedDraft = stripLargeDraftAttachments(draft, 10000);
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(strippedDraft));
      return true;
    } catch {
      console.warn('Draft text could not be saved to LocalStorage due to quota limits');
      return false;
    }
  }
}
