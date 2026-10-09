import type { AttachedDoc, ScholarshipApplication } from '../types';

// Keep headroom below Firestore's 1 MiB document limit for field names/metadata.
export const MAX_APPLICATION_BYTES = 900 * 1024;
export const MAX_FILE_BYTES = 450 * 1024;
export const MAX_TOTAL_FILE_BYTES = 650 * 1024;
export const ATTACHMENT_FIELDS = ['studentPhotoDoc', 'academicTranscriptDoc', 'incomeCertificateDoc'] as const;

export function attachmentBytes(doc?: AttachedDoc): number {
  if (!doc?.dataUrl) return 0;
  const encoded = doc.dataUrl.split(',')[1] || '';
  return Math.floor(encoded.length * 3 / 4) - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0);
}

export function validateAttachments(app: Partial<ScholarshipApplication>): void {
  let total = 0;
  for (const field of ATTACHMENT_FIELDS) {
    const attached = app[field];
    if (!attached) continue;
    if (!attached.dataUrl || !/^data:(application\/pdf|image\/jpeg|image\/png);base64,[A-Za-z0-9+/]+={0,2}$/.test(attached.dataUrl)) {
      throw new Error(`กรุณาแนบไฟล์ ${attached.fileName || ''} ใหม่ โดยใช้ PDF, JPG หรือ PNG`);
    }
    const bytes = attachmentBytes(attached);
    if (bytes > MAX_FILE_BYTES) throw new Error(`ไฟล์ ${attached.fileName} ใหญ่เกิน 450 KB กรุณาลดขนาดไฟล์หรือเปลี่ยนเป็นรูปภาพ`);
    total += bytes;
  }
  if (total > MAX_TOTAL_FILE_BYTES) {
    throw new Error('ไฟล์แนบรวมใหญ่เกิน 650 KB กรุณาลดขนาด PDF หรือรูปภาพก่อนส่ง ข้อมูลที่กรอกยังอยู่ครบ');
  }
}

export function validateSubmissionSize(app: ScholarshipApplication): void {
  validateAttachments(app);
  if (new TextEncoder().encode(JSON.stringify(app)).length > MAX_APPLICATION_BYTES) {
    throw new Error('ข้อมูลใบสมัครและไฟล์แนบมีขนาดรวมใหญ่เกินไป กรุณาลดขนาดไฟล์แนบก่อนส่ง');
  }
}

export function prepareSubmission(draft: Partial<ScholarshipApplication>, academicYear: string): ScholarshipApplication {
  const token = draft.submissionToken && draft.academicYear === academicYear
    ? draft.submissionToken : crypto.randomUUID();
  const now = new Date().toISOString();
  return {
    ...draft,
    id: `FSS-${academicYear}-${token}`,
    submissionToken: token,
    academicYear,
    createdAt: draft.submissionToken === token && draft.createdAt ? draft.createdAt : now,
    updatedAt: now,
    status: 'submitted',
  } as ScholarshipApplication;
}

export function submissionErrorMessage(error: unknown): string {
  const code = String((error as { code?: string })?.code || '');
  const msg = error instanceof Error ? error.message : String(error);
  if (/unavailable|deadline-exceeded|network-request-failed/.test(code) || /offline|network/i.test(msg)) {
    return 'ยังยืนยันการบันทึกไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วกดลองส่งอีกครั้ง ระบบจะใช้เลขใบสมัครเดิมเพื่อป้องกันข้อมูลซ้ำ';
  }
  if (code.includes('permission-denied') || msg.includes('permission-denied')) {
    return 'ฐานข้อมูลไม่อนุญาตให้บันทึก กรุณาติดต่อเจ้าหน้าที่ โทร. 055-961911 ข้อมูลที่กรอกยังอยู่ในหน้านี้';
  }
  if (code.includes('resource-exhausted') || /quota/i.test(msg)) {
    return 'ระบบฐานข้อมูลมีผู้ใช้งานเต็มโควตาของวันนี้ กรุณาติดต่อเจ้าหน้าที่ โทร. 055-961911 หรือลองใหม่อีกครั้ง ข้อมูลที่กรอกยังอยู่ในหน้านี้';
  }
  return error instanceof Error ? error.message : 'ส่งใบสมัครไม่สำเร็จ กรุณาลองอีกครั้ง ข้อมูลที่กรอกยังอยู่ครบ';
}
