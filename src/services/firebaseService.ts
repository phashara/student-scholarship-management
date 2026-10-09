/**
 * Firebase Firestore Service Layer for Scholarship Applications & Timeline
 */

import {
  collection,
  doc,
  getDocsFromServer,
  writeBatch,
  onSnapshot,
  setDoc,
  getDoc,
  getDocFromServer,
  runTransaction,
} from 'firebase/firestore';
import { validateSubmissionSize } from '../utils/applicationSubmission';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ScholarshipApplication, TimelineConfig } from '../types';
import {
  INITIAL_APPLICATIONS_2569,
  DEFAULT_TIMELINE_CONFIG,
  loadApplications as loadLocalApplications,
  saveApplication as saveLocalApplication,
  loadTimelineConfig as loadLocalTimelineConfig,
  saveTimelineConfig as saveLocalTimelineConfig,
} from '../data/scholarshipData';

const APPLICATIONS_COLLECTION = 'scholarship_applications';
const TIMELINE_COLLECTION = 'timeline_configs';
const TIMELINE_DOC_ID = 'nu_socsci_2569';

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
  onStatus?: (status: ApplicationReadStatus) => void
): () => void {
  const appsRef = collection(db, APPLICATIONS_COLLECTION);

  // Set up real-time listener with proper error callback as required by skill
  const unsubscribe = onSnapshot(
    appsRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      // Firestore's in-memory cache may be empty or only contain one recently
      // submitted application. It is never authoritative for the full register.
      if (snapshot.metadata.fromCache) {
        onStatus?.('cache');
        return;
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

      // Update local storage cache to match Firestore truth
      try {
        localStorage.setItem(
          'nu_socsci_scholarship_applications_2569',
          JSON.stringify(remoteApps.filter((a) => !DEMO_APP_IDS.has(a.id)))
        );
      } catch {
        // ignore
      }

      onUpdate(remoteApps);
      onStatus?.('server');
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, APPLICATIONS_COLLECTION);
      onStatus?.(firestoreReadErrorStatus(error));
      if (onError) onError(error);
      // Fallback to local storage only if offline
      onUpdate(loadLocalApplications().filter((a) => !DEMO_APP_IDS.has(a.id)));
    }
  );

  return unsubscribe;
}

/**
 * Clear all applications from both Firestore and LocalStorage
 */
export async function clearAllApplicationsOnline(): Promise<void> {
  const snapshot = await getDocsFromServer(collection(db, APPLICATIONS_COLLECTION));
  if (snapshot.size > 500) throw new Error('มีข้อมูลเกิน 500 รายการ กรุณาลบเป็นรายบุคคล');
  const removedIds = new Set(snapshot.docs.flatMap(item => [
    normalizeApplicationId(item.id),
    String(item.data().id || '').replace(/^APP-/, 'FSS-'),
  ]));
  removedIds.forEach((id) => pendingDeletedApplicationIds.add(id));
  try {
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach(item => batch.delete(item.ref));
      await batch.commit();
    }
    const verification = await getDocsFromServer(collection(db, APPLICATIONS_COLLECTION));
    const stillPresent = verification.docs.some((item) => {
      const dataId = typeof item.data().id === 'string' ? normalizeApplicationId(item.data().id) : '';
      return removedIds.has(normalizeApplicationId(item.id)) || (dataId && removedIds.has(dataId));
    });
    if (stillPresent) throw new Error('เซิร์ฟเวอร์ยังพบข้อมูลเดิมหลังการลบ กรุณาลองใหม่อีกครั้ง');

    const remaining = loadLocalApplications().filter(app => !removedIds.has(app.id.replace(/^APP-/, 'FSS-')));
    localStorage.setItem('nu_socsci_scholarship_applications_2569', JSON.stringify(remaining));
    localStorage.removeItem('nu_socsci_scholarship_draft_2569');
  } catch (error) {
    removedIds.forEach((id) => pendingDeletedApplicationIds.delete(id));
    throw error;
  }
}

/**
 * Seed initial applications to Firestore if online
 */
export async function seedInitialApplications(initialList: ScholarshipApplication[]): Promise<void> {
  try {
    for (const app of initialList) {
      const docRef = doc(db, APPLICATIONS_COLLECTION, app.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, sanitizeForFirestore(app));
      }
    }
  } catch (err) {
    console.warn('Initial seed postponed or offline:', err);
  }
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
  const docRef = doc(db, APPLICATIONS_COLLECTION, app.id);
  const cleanData = sanitizeForFirestore(app);
  // Transactions fail while offline and never overwrite a different submission.
  // A retry after an uncertain response reuses the same ID and is safe to repeat.
  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(docRef);
    if (existing.exists()) {
      const saved = existing.data();
      if (saved.submissionToken !== app.submissionToken || saved.studentId !== app.studentId || saved.academicYear !== app.academicYear) {
        throw new Error('เลขใบสมัครนี้มีข้อมูลอื่นอยู่แล้ว กรุณาติดต่อเจ้าหน้าที่ โทร. 055-961911');
      }
      return;
    }
    transaction.set(docRef, cleanData);
  });
  const confirmed = await getDocFromServer(docRef);
  const saved = confirmed.data() as ScholarshipApplication | undefined;
  if (!confirmed.exists() || saved?.submissionToken !== app.submissionToken || saved.studentId !== app.studentId) {
    throw new Error('ยังยืนยันการบันทึกไม่ได้ กรุณาลองส่งอีกครั้งด้วยเลขใบสมัครเดิม');
  }
  saveLocalApplication(saved);
  return saved;
}

// Staff updates keep the existing application ID. New submissions use the
// transaction above and must never enter this merge-based update path.
export async function saveApplicationOnline(app: ScholarshipApplication): Promise<void> {
  // Always update local cache immediately for responsive UX
  saveLocalApplication(app);

  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, app.id);
    const cleanData = sanitizeForFirestore({
      ...app,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${APPLICATIONS_COLLECTION}/${app.id}`);
    console.warn('Saved locally, will sync to cloud when online.');
  }
}

/**
 * Delete an application from Firestore and LocalStorage permanently
 */
export async function deleteApplicationOnline(appId: string, studentId?: string): Promise<void> {
  if (!appId) throw new Error('ไม่พบเลขที่ใบสมัครที่ต้องการลบ');
  const normalizedAppId = normalizeApplicationId(appId);
  const snapshot = await getDocsFromServer(collection(db, APPLICATIONS_COLLECTION));
  const matches = snapshot.docs.filter(item => {
    const data = item.data();
    const idMatches = normalizeApplicationId(item.id) === normalizedAppId ||
      (typeof data.id === 'string' && normalizeApplicationId(data.id) === normalizedAppId);
    return idMatches && (!studentId || data.studentId === studentId);
  });
  if (!matches.length) throw new Error('ไม่พบใบสมัครที่ตรงกันบนฐานข้อมูล กรุณารีเฟรชก่อนลองใหม่');
  if (matches.length > 500) throw new Error('พบรายการตรงกันมากผิดปกติ ยกเลิกการลบ');
  const removedIds = new Set(matches.flatMap(item => [
    normalizeApplicationId(item.id),
    typeof item.data().id === 'string' ? normalizeApplicationId(item.data().id) : '',
  ].filter(Boolean)));
  removedIds.forEach((id) => pendingDeletedApplicationIds.add(id));
  try {
    const batch = writeBatch(db);
    matches.forEach(item => batch.delete(item.ref));
    await batch.commit();
    const verification = await getDocsFromServer(collection(db, APPLICATIONS_COLLECTION));
    const stillPresent = verification.docs.some(item => {
      const data = item.data();
      const idMatches = normalizeApplicationId(item.id) === normalizedAppId ||
        (typeof data.id === 'string' && normalizeApplicationId(data.id) === normalizedAppId);
      return idMatches && (!studentId || data.studentId === studentId);
    });
    if (stillPresent) throw new Error('เซิร์ฟเวอร์ยังพบข้อมูลเดิมหลังการลบ กรุณาลองใหม่อีกครั้ง');

    const remaining = loadLocalApplications().filter(app =>
      !(normalizeApplicationId(app.id) === normalizedAppId && (!studentId || app.studentId === studentId))
    );
    localStorage.setItem('nu_socsci_scholarship_applications_2569', JSON.stringify(remaining));
  } catch (error) {
    removedIds.forEach((id) => pendingDeletedApplicationIds.delete(id));
    throw error;
  }
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
        const data = snapshot.data() as TimelineConfig;
        saveLocalTimelineConfig(data);
        onUpdate(data);
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
  saveLocalTimelineConfig(config);
  try {
    const docRef = doc(db, TIMELINE_COLLECTION, TIMELINE_DOC_ID);
    const updated: TimelineConfig = {
      ...config,
      lastUpdatedAt: new Date().toLocaleString('th-TH'),
      lastUpdatedBy: config.lastUpdatedBy || 'ผู้ดูแลระบบ (Admin)',
    };
    await setDoc(docRef, sanitizeForFirestore(updated), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${TIMELINE_COLLECTION}/${TIMELINE_DOC_ID}`);
  }
}
