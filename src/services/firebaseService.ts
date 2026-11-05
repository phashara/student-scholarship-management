/**
 * Firebase Firestore Service Layer for Scholarship Applications & Timeline
 */

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { validateSubmissionSize } from '../utils/applicationSubmission';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ScholarshipApplication, TimelineConfig } from '../types';
import {
  DEFAULT_TIMELINE_CONFIG,
  loadApplications as loadLocalApplications,
  saveApplication as saveLocalApplication,
  loadTimelineConfig as loadLocalTimelineConfig,
  saveTimelineConfig as saveLocalTimelineConfig,
  normalizeTimelineConfig,
} from '../data/scholarshipData';
import {
  safeSetApplicationsLocalStorage,
  saveAppsIndexedDB,
  deleteAppIndexedDB,
  clearAppsIndexedDB,
} from '../utils/offlineStorage';

const APPLICATIONS_COLLECTION = 'scholarship_applications';
const TIMELINE_COLLECTION = 'timeline_configs';
const TIMELINE_DOC_ID = 'nu_socsci_2569';
const functions = getFunctions(undefined, 'asia-southeast1');

const normalizeApplicationId = (id: string) => id.replace(/^APP-/, 'FSS-');
const pendingDeletedApplicationIds = new Set<string>();

export type ApplicationReadStatus = 'idle' | 'loading' | 'cache' | 'server' | 'quota-exceeded' | 'error';

export function firestoreReadErrorStatus(error: unknown): 'quota-exceeded' | 'error' {
  const candidate = error as { code?: string; message?: string } | null;
  return /resource-exhausted|quota|RESOURCE_EXHAUSTED/i.test(`${candidate?.code || ''} ${candidate?.message || String(error)}`)
    ? 'quota-exceeded' : 'error';
}

export const DEMO_APP_IDS = new Set([
  'FSS-2569-001',
  'FSS-2569-002',
  'FSS-2569-003',
  'APP-2569-001',
  'APP-2569-002',
  'APP-2569-003',
]);

/**
 * Remove undefined values to prevent Firestore serialization errors
 */
export function sanitizeForFirestore(obj: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizeForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

/**
 * Subscribe to real-time applications updates from Firestore
 */
export function subscribeApplications(
  onUpdate: (apps: ScholarshipApplication[]) => void,
  onError?: (err: unknown) => void,
  onStatus?: (status: ApplicationReadStatus) => void,
  isAdmin = false,
): () => void {
  const appsRef = collection(db, isAdmin ? APPLICATIONS_COLLECTION : 'public_applications');

  // Set up real-time listener with proper error callback as required by skill
  const unsubscribe = onSnapshot(
    appsRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      if (snapshot.metadata.fromCache) {
        onStatus?.('cache');
        // A partial client cache must not replace the administrator's complete
        // last server-confirmed register.
        if (isAdmin) {
          onUpdate(loadLocalApplications().filter((a) => !DEMO_APP_IDS.has(a.id)));
          return;
        }
      }
      const remoteApps: ScholarshipApplication[] = [];
      const snapshotIds = new Set<string>();

      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as ScholarshipApplication;
        const normalizedItemId = typeof item.id === 'string' ? normalizeApplicationId(item.id) : '';
        const normalizedDocumentId = normalizeApplicationId(docSnap.id);
        if (normalizedDocumentId) snapshotIds.add(normalizedDocumentId);
        if (normalizedItemId) snapshotIds.add(normalizedItemId);
        if (pendingDeletedApplicationIds.has(normalizedDocumentId) ||
            (normalizedItemId && pendingDeletedApplicationIds.has(normalizedItemId))) {
          return;
        }
        if (item.id && item.id.startsWith('APP-2569-')) {
          item.id = item.id.replace('APP-2569-', 'FSS-2569-');
        }

        // Permanently filter out and purge demo accounts
        if (DEMO_APP_IDS.has(item.id)) {
          // Reading data must never delete database records.
          return;
        }

        remoteApps.push(item);
      });

      // Only a server snapshot can confirm that a deleted record is gone.
      if (!snapshot.metadata.fromCache) {
        for (const id of pendingDeletedApplicationIds) {
          if (!snapshotIds.has(id)) pendingDeletedApplicationIds.delete(id);
        }
      }

      // Sort by createdAt descending
      remoteApps.sort((a, b) => {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });

      // Only authenticated administrators cache the full applicant records.
      if (isAdmin && !snapshot.metadata.fromCache) {
        try {
          const filtered = remoteApps.filter((a) => !DEMO_APP_IDS.has(a.id));
          safeSetApplicationsLocalStorage(filtered);
          saveAppsIndexedDB(filtered).catch(() => {});
        } catch {
          // ignore
        }
      }

      onUpdate(remoteApps);
      if (!snapshot.metadata.fromCache) {
        onStatus?.('server');
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, APPLICATIONS_COLLECTION);
      onStatus?.(firestoreReadErrorStatus(error));
      if (onError) onError(error);
      // Never fall back to full private records for a public visitor.
      onUpdate(isAdmin ? loadLocalApplications().filter((a) => !DEMO_APP_IDS.has(a.id)) : []);
    }
  );

  return unsubscribe;
}

/**
 * Clear all applications via Cloud Function callable
 */
export async function clearAllApplicationsOnline(): Promise<void> {
  await httpsCallable(functions, 'clearApplications')({});
  safeSetApplicationsLocalStorage([]);
  await clearAppsIndexedDB();
  localStorage.removeItem('nu_socsci_scholarship_draft_2569');
}

/**
 * Save an application to both Firestore (online) and LocalStorage (offline cache)
 */
export async function submitApplicationOnline(app: ScholarshipApplication): Promise<ScholarshipApplication> {
  validateSubmissionSize(app);
  if (!app.submissionToken || app.id !== `FSS-${app.academicYear}-${app.submissionToken}`) {
    throw new Error('เลขใบสมัครไม่ถูกต้อง กรุณากลับไปตรวจข้อมูลแล้วลองใหม่');
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('ขณะนี้ไม่มีอินเทอร์เน็ต กรุณาเชื่อมต่อแล้วลองส่งอีกครั้ง ข้อมูลที่กรอกยังอยู่ครบ');
  }
  const cleanData = sanitizeForFirestore(app);
  const result = await httpsCallable<{ application: Record<string, unknown> }, { application: ScholarshipApplication }>(functions, 'submitApplication')({ application: cleanData });
  const saved = result.data.application;
  if (!saved || saved.submissionToken !== app.submissionToken || saved.studentId !== app.studentId) {
    throw new Error('ยังยืนยันการบันทึกไม่ได้ กรุณาลองส่งอีกครั้งด้วยเลขใบสมัครเดิม');
  }
  saveLocalApplication(saved);
  return saved;
}

// Staff updates keep the existing application ID. New submissions use the
// callable above and must never enter this update path.
export async function saveApplicationOnline(app: ScholarshipApplication): Promise<void> {
  const cleanData = sanitizeForFirestore(app);
  const result = await httpsCallable<{ application: Record<string, unknown> }, { application: ScholarshipApplication }>(functions, 'updateApplication')({ application: cleanData });
  const saved = result.data.application;
  saveLocalApplication({ ...app, updatedAt: String(saved.updatedAt || new Date().toISOString()) });
}

/**
 * Delete an application via Cloud Function callable
 */
export async function deleteApplicationOnline(appId: string, studentId?: string): Promise<void> {
  if (!appId) throw new Error('ไม่พบเลขที่ใบสมัครที่ต้องการลบ');
  const normalizedAppId = normalizeApplicationId(appId);
  pendingDeletedApplicationIds.add(normalizedAppId);
  try {
    await httpsCallable(functions, 'deleteApplication')({ applicationId: appId, studentId });
    safeSetApplicationsLocalStorage(loadLocalApplications().filter(app => normalizeApplicationId(app.id) !== normalizedAppId));
    deleteAppIndexedDB(normalizedAppId).catch(() => {});
  } catch (error) {
    pendingDeletedApplicationIds.delete(normalizedAppId);
    throw error;
  }
}

export async function lookupApplicationStatus(query: string): Promise<ScholarshipApplication | null> {
  const result = await httpsCallable<{ query: string }, { application: ScholarshipApplication | null }>(functions, 'getApplicationStatus')({ query });
  return result.data.application;
}

export async function backfillPublicApplicationsOnce(): Promise<void> {
  await httpsCallable(functions, 'backfillPublicApplications')({});
}

/**
 * Subscribe to real-time timeline configuration
 */
export function subscribeTimelineConfig(
  onUpdate: (config: TimelineConfig) => void,
  onError?: (err: unknown) => void
): () => void {
  const docRef = doc(db, TIMELINE_COLLECTION, TIMELINE_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) return;
      if (snapshot.exists()) {
        const rawData = snapshot.data() as TimelineConfig;
        const data = normalizeTimelineConfig(rawData);
        saveLocalTimelineConfig(data);
        onUpdate(data);

        // Self-heal cloud timeline if it had legacy 28 or old schedule format
        const rawStr = JSON.stringify(rawData);
        if (rawStr.includes('28') || rawStr.includes('11.30') || !rawData.version || rawData.version !== data.version) {
          saveTimelineConfigOnline(data).catch(() => {});
        }
      } else {
        const local = loadLocalTimelineConfig();
        onUpdate(local);
        // Reading the schedule must not create or overwrite cloud data.
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${TIMELINE_COLLECTION}/${TIMELINE_DOC_ID}`);
      onError?.(error);
      onUpdate(loadLocalTimelineConfig());
    }
  );

  return unsubscribe;
}

/**
 * Save timeline configuration to Firestore and LocalStorage
 */
export async function saveTimelineConfigOnline(config: TimelineConfig): Promise<void> {
  const normalized = normalizeTimelineConfig(config);
  const docRef = doc(db, TIMELINE_COLLECTION, TIMELINE_DOC_ID);
  const updated: TimelineConfig = {
    ...normalized,
    lastUpdatedAt: new Date().toLocaleString('th-TH'),
    lastUpdatedBy: config.lastUpdatedBy || 'ผู้ดูแลระบบ (Admin)',
  };
  await setDoc(docRef, sanitizeForFirestore(updated), { merge: true });
  saveLocalTimelineConfig(normalized);
}
