/**
 * Firebase Firestore Service Layer for Scholarship Applications & Timeline
 */

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
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
  onError?: (err: unknown) => void
): () => void {
  const appsRef = collection(db, APPLICATIONS_COLLECTION);

  // Set up real-time listener with proper error callback as required by skill
  const unsubscribe = onSnapshot(
    appsRef,
    (snapshot) => {
      const remoteApps: ScholarshipApplication[] = [];

      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as ScholarshipApplication;
        if (item.id && item.id.startsWith('APP-2569-')) {
          item.id = item.id.replace('APP-2569-', 'FSS-2569-');
        }

        // Permanently filter out and purge demo accounts
        if (DEMO_APP_IDS.has(item.id)) {
          deleteDoc(doc(db, APPLICATIONS_COLLECTION, docSnap.id)).catch(() => {});
          return;
        }

        remoteApps.push(item);
      });

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
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, APPLICATIONS_COLLECTION);
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
  try {
    const appsRef = collection(db, APPLICATIONS_COLLECTION);
    const snapshot = await getDocs(appsRef);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, APPLICATIONS_COLLECTION, docSnap.id));
    }
  } catch (err) {
    console.warn('Error clearing online applications:', err);
  }
  try {
    localStorage.setItem('nu_socsci_scholarship_applications_2569', JSON.stringify([]));
    localStorage.removeItem('nu_socsci_scholarship_draft_2569');
  } catch {
    // ignore
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
export async function deleteApplicationOnline(appId: string): Promise<void> {
  // 1. Immediately remove from local storage cache
  try {
    const current = loadLocalApplications().filter(
      (a) => a.id !== appId && a.studentId !== appId
    );
    localStorage.setItem('nu_socsci_scholarship_applications_2569', JSON.stringify(current));
  } catch {
    // ignore
  }

  // 2. Delete all matching documents from Cloud Firestore
  try {
    // Delete direct doc ref by ID
    const directDocRef = doc(db, APPLICATIONS_COLLECTION, appId);
    await deleteDoc(directDocRef);

    // Also scan and delete any document matching this ID or studentId
    const appsRef = collection(db, APPLICATIONS_COLLECTION);
    const snapshot = await getDocs(appsRef);
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (
        docSnap.id === appId ||
        data.id === appId ||
        (data.studentId && (data.studentId === appId || docSnap.id === data.studentId))
      ) {
        await deleteDoc(doc(db, APPLICATIONS_COLLECTION, docSnap.id));
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${APPLICATIONS_COLLECTION}/${appId}`);
  }
}

/**
 * Subscribe to real-time timeline configuration
 */
export function subscribeTimelineConfig(
  onUpdate: (config: TimelineConfig) => void
): () => void {
  const docRef = doc(db, TIMELINE_COLLECTION, TIMELINE_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as TimelineConfig;
        saveLocalTimelineConfig(data);
        onUpdate(data);
      } else {
        const local = loadLocalTimelineConfig();
        onUpdate(local);
        // Save initial to cloud
        setDoc(docRef, sanitizeForFirestore(local)).catch(() => {});
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${TIMELINE_COLLECTION}/${TIMELINE_DOC_ID}`);
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
