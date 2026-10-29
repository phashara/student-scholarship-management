import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { createHash } from 'node:crypto';

initializeApp();
const databaseId = 'ai-studio-fe3c4a48-112f-4eaf-a043-a8df974c73b0';
const db = getFirestore(databaseId);
const applications = db.collection('scholarship_applications');
const publicApplications = db.collection('public_applications');
const metadata = db.collection('system_metadata');
const region = 'asia-southeast1';
const allowedStatuses = new Set(['submitted', 'eligible_for_interview', 'interviewed', 'awarded', 'not_selected']);
const maxSubmissionBytes = 850_000;

function requireAdmin(request: { auth?: { token: Record<string, unknown> } | null }) {
  const token = request.auth?.token;
  if (!token || token.email !== 'phasharak@gmail.com' || token.email_verified !== true) {
    throw new HttpsError('permission-denied', 'บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ');
  }
}

function boundedString(value: unknown, max: number, required = false): value is string {
  return typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);
}

function validateApplication(app: Record<string, unknown>) {
  const requiredStrings: [string, number][] = [
    ['id', 64], ['submissionToken', 96], ['fullName', 200], ['studentId', 30],
    ['department', 100], ['studyYear', 50], ['phone', 30], ['academicYear', 10],
  ];
  for (const [key, max] of requiredStrings) {
    if (!boundedString(app[key], max, true)) throw new HttpsError('invalid-argument', `ข้อมูล ${key} ไม่ถูกต้อง`);
  }
  if (app.id !== `FSS-${app.academicYear}-${app.submissionToken}` || !/^[A-Za-z0-9_-]+$/.test(app.id as string)) {
    throw new HttpsError('invalid-argument', 'เลขที่ใบสมัครไม่ถูกต้อง');
  }
  if (!allowedStatuses.has(String(app.status)) || app.status !== 'submitted') {
    throw new HttpsError('invalid-argument', 'สถานะใบสมัครไม่ถูกต้อง');
  }
  if (app.agreedToTerms !== true) throw new HttpsError('invalid-argument', 'ต้องยืนยันข้อตกลงก่อนสมัคร');
  if (typeof app.awardedAmount === 'number' && (!Number.isFinite(app.awardedAmount) || app.awardedAmount < 0)) {
    throw new HttpsError('invalid-argument', 'จำนวนเงินทุนไม่ถูกต้อง');
  }
  if (!boundedString(app.reasonForApplying ?? '', 3000)) throw new HttpsError('invalid-argument', 'เหตุผลการสมัครยาวเกินกำหนด');
  if (Buffer.byteLength(JSON.stringify(app), 'utf8') > maxSubmissionBytes) {
    throw new HttpsError('invalid-argument', 'ไฟล์แนบมีขนาดใหญ่เกินกำหนด กรุณาลดขนาดแล้วลองใหม่');
  }
}

function publicProjection(id: string, app: Record<string, unknown>) {
  const projection: Record<string, unknown> = {
    id,
    fullName: String(app.fullName || '').slice(0, 200),
    department: String(app.department || '').slice(0, 100),
    studyYear: String(app.studyYear || '').slice(0, 50),
    academicYear: String(app.academicYear || '').slice(0, 10),
    status: allowedStatuses.has(String(app.status)) ? app.status : 'submitted',
    createdAt: String(app.createdAt || ''),
    finalRank: typeof app.finalRank === 'number' ? app.finalRank : null,
  };
  if (app.status === 'awarded' && typeof app.awardedAmount === 'number') projection.awardedAmount = app.awardedAmount;
  return projection;
}

async function enforceRateLimit(request: { rawRequest: { ip?: string } }, action: string, limit: number, windowMs: number) {
  const ip = request.rawRequest.ip || 'unknown';
  const key = createHash('sha256').update(`${action}:${ip}`).digest('hex');
  const ref = db.collection('api_rate_limits').doc(key);
  const now = Date.now();
  await db.runTransaction(async (transaction) => {
    const current = await transaction.get(ref);
    const data = current.data();
    const start = typeof data?.windowStartedAt === 'number' ? data.windowStartedAt : now;
    const count = now - start >= windowMs ? 0 : Number(data?.count || 0);
    if (count >= limit) throw new HttpsError('resource-exhausted', 'มีการใช้งานถี่เกินไป กรุณารอสักครู่แล้วลองใหม่');
    transaction.set(ref, { windowStartedAt: now - start >= windowMs ? now : start, count: count + 1 });
  });
}

export const syncPublicApplication = onDocumentWritten({
  document: 'scholarship_applications/{applicationId}',
  database: databaseId,
  region,
}, async (event) => {
  const after = event.data?.after;
  const id = event.params.applicationId;
  if (!after?.exists) {
    await publicApplications.doc(id).delete();
    return;
  }
  await publicApplications.doc(id).set(publicProjection(id, after.data() as Record<string, unknown>), { merge: false });
});

export const submitApplication = onCall({ region, maxInstances: 10, invoker: 'public' }, async (request) => {
  await enforceRateLimit(request, 'submit', 50, 60 * 60 * 1000);
  const app = request.data?.application;
  if (!app || typeof app !== 'object' || Array.isArray(app)) throw new HttpsError('invalid-argument', 'ไม่พบข้อมูลใบสมัคร');
  const clean = app as Record<string, unknown>;
  validateApplication(clean);
  const ref = applications.doc(clean.id as string);
  await db.runTransaction(async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists) {
      const saved = existing.data()!;
      if (saved.submissionToken !== clean.submissionToken || saved.studentId !== clean.studentId || saved.academicYear !== clean.academicYear) {
        throw new HttpsError('already-exists', 'เลขใบสมัครนี้มีข้อมูลอื่นอยู่แล้ว กรุณาติดต่อเจ้าหน้าที่ โทร. 055-961911');
      }
      return;
    }
    transaction.create(ref, clean);
  });
  const saved = (await ref.get()).data();
  if (!saved || saved.submissionToken !== clean.submissionToken) throw new HttpsError('internal', 'ยังยืนยันการบันทึกไม่ได้');
  return { application: saved };
});

export const deleteApplication = onCall({ region, maxInstances: 5 }, async (request) => {
  requireAdmin(request);
  const id = request.data?.applicationId;
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new HttpsError('invalid-argument', 'เลขใบสมัครไม่ถูกต้อง');
  const expectedStudentId = request.data?.studentId;
  const ids = [id, id.replace(/^FSS-/, 'APP-')];
  let ref = applications.doc(ids[0]);
  let snapshot = await ref.get();
  if (!snapshot.exists && ids[1] !== ids[0]) {
    ref = applications.doc(ids[1]);
    snapshot = await ref.get();
  }
  if (!snapshot.exists) throw new HttpsError('not-found', 'ไม่พบใบสมัครในฐานข้อมูล');
  if (typeof expectedStudentId === 'string' && snapshot.get('studentId') !== expectedStudentId) {
    throw new HttpsError('failed-precondition', 'รหัสนิสิตไม่ตรงกับใบสมัคร กรุณารีเฟรชแล้วตรวจสอบอีกครั้ง');
  }
  await ref.delete();
  return { deleted: true };
});

export const clearApplications = onCall({ region, maxInstances: 1, timeoutSeconds: 540 }, async (request) => {
  requireAdmin(request);
  let deleted = 0;
  while (true) {
    const page = await applications.limit(400).get();
    if (page.empty) break;
    const batch = db.batch();
    page.docs.forEach((snapshot) => batch.delete(snapshot.ref));
    await batch.commit();
    deleted += page.size;
    if (deleted > 10_000) throw new HttpsError('resource-exhausted', 'ลบเกิน 10,000 รายการ กรุณาแบ่งดำเนินการ');
  }
  return { deleted };
});

export const getApplicationStatus = onCall({ region, maxInstances: 20, invoker: 'public' }, async (request) => {
  await enforceRateLimit(request, 'status', 60, 60 * 1000);
  const query = String(request.data?.query || '').trim();
  if (query.length < 6 || query.length > 64) throw new HttpsError('invalid-argument', 'กรอกรหัสนิสิตหรือเลขที่ใบสมัครให้ถูกต้อง');
  let doc = await applications.doc(query).get();
  if (!doc.exists && /^\d{8,12}$/.test(query)) {
    const result = await applications.where('studentId', '==', query).limit(1).get();
    doc = result.docs[0] || doc;
  }
  if (!doc.exists) return { application: null };
  const data = doc.data()!;
  return { application: {
    id: doc.id,
    fullName: data.fullName,
    studentId: data.studentId,
    department: data.department,
    studyYear: data.studyYear,
    academicYear: data.academicYear,
    status: data.status,
    createdAt: data.createdAt,
    awardedAmount: data.awardedAmount,
  } };
});

export const backfillPublicApplications = onCall({ region, maxInstances: 1, timeoutSeconds: 540 }, async (request) => {
  requireAdmin(request);
  const checkpoint = metadata.doc('public_applications_backfill');
  const existingCheckpoint = await checkpoint.get();
  if (existingCheckpoint.get('complete') === true) return { migrated: 0 };
  let cursor: FirebaseFirestore.QueryDocumentSnapshot | undefined;
  let count = 0;
  while (true) {
    let query = applications.orderBy('__name__').limit(400);
    if (cursor) query = query.startAfter(cursor);
    const page = await query.get();
    if (page.empty) break;
    const batch = db.batch();
    page.docs.forEach((doc) => batch.set(publicApplications.doc(doc.id), publicProjection(doc.id, doc.data())));
    await batch.commit();
    count += page.size;
    cursor = page.docs[page.docs.length - 1];
  }
  await checkpoint.set({ complete: true, migrated: count, completedAt: Date.now() });
  return { migrated: count };
});
