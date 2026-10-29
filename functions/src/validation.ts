import { HttpsError } from 'firebase-functions/v2/https';

const submissionFields = new Set([
  'id', 'submissionToken', 'createdAt', 'updatedAt', 'academicYear', 'status', 'agreedToTerms',
  'fullName', 'studentId', 'department', 'studyYear', 'phone', 'homeAddress', 'gpaxRange',
  'studentPhotoDoc', 'academicTranscriptDoc', 'fatherName', 'fatherStatus', 'fatherAge',
  'fatherOccupation', 'fatherOccupationDetail', 'motherName', 'motherStatus', 'motherAge',
  'motherOccupation', 'motherOccupationDetail', 'guardianName', 'guardianStatus', 'guardianAge',
  'guardianOccupation', 'guardianOccupationDetail', 'guardianRelation', 'parentsMaritalStatus',
  'familyLivingCondition', 'familyIllnessStatus', 'siblingsStudyingCount', 'familyYearlyIncome',
  'incomeCertificateDoc', 'monthlyAllowance', 'studentLoanStatus', 'pastScholarshipHistory',
  'pastScholarshipName', 'pastScholarshipAmount', 'accommodationType', 'partTimeWorkHistory',
  'studentActivityParticipation', 'volunteerWorkParticipation', 'selfPrideOrTalent',
  'reasonForApplying', 'scholarshipFundUsagePlan',
]);

const requiredStrings: Record<string, number> = {
  id: 64, submissionToken: 96, createdAt: 64, updatedAt: 64, academicYear: 10,
  fullName: 200, studentId: 30, department: 100, studyYear: 50, phone: 30,
  homeAddress: 500, gpaxRange: 50,
};

const optionalStringLimits: Record<string, number> = {
  fatherName: 200, fatherStatus: 100, fatherAge: 30, fatherOccupation: 200, fatherOccupationDetail: 500,
  motherName: 200, motherStatus: 100, motherAge: 30, motherOccupation: 200, motherOccupationDetail: 500,
  guardianName: 200, guardianStatus: 100, guardianAge: 30, guardianOccupation: 200,
  guardianOccupationDetail: 500, guardianRelation: 100, parentsMaritalStatus: 200,
  familyLivingCondition: 2000, familyIllnessStatus: 2000, siblingsStudyingCount: 50,
  familyYearlyIncome: 100, monthlyAllowance: 100, studentLoanStatus: 500,
  pastScholarshipHistory: 200, pastScholarshipName: 300, pastScholarshipAmount: 100,
  accommodationType: 200, partTimeWorkHistory: 1000, studentActivityParticipation: 1000,
  volunteerWorkParticipation: 1000, selfPrideOrTalent: 5000, reasonForApplying: 3000,
  scholarshipFundUsagePlan: 3000,
};

const attachmentFields = ['studentPhotoDoc', 'academicTranscriptDoc', 'incomeCertificateDoc'] as const;
const maxAttachmentBytes = 450 * 1024;
const maxTotalAttachmentBytes = 650 * 1024;
const maxSubmissionBytes = 850_000;

function invalid(message: string): never {
  throw new HttpsError('invalid-argument', message);
}

function validateAttachment(value: unknown, field: string): number {
  if (value === undefined) return 0;
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(`ไฟล์แนบ ${field} ไม่ถูกต้อง`);
  const file = value as Record<string, unknown>;
  const allowed = ['fileName', 'fileSize', 'fileType', 'dataUrl', 'uploadedAt'];
  if (Object.keys(file).some((key) => !allowed.includes(key))) invalid(`ไฟล์แนบ ${field} มีข้อมูลที่ไม่อนุญาต`);
  if (typeof file.fileName !== 'string' || file.fileName.length === 0 || file.fileName.length > 255 ||
      typeof file.fileType !== 'string' || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.fileType) ||
      typeof file.uploadedAt !== 'string' || file.uploadedAt.length > 64 ||
      typeof file.fileSize !== 'number' || !Number.isInteger(file.fileSize) || file.fileSize < 0 || file.fileSize > maxAttachmentBytes ||
      typeof file.dataUrl !== 'string') invalid(`ไฟล์แนบ ${field} ไม่ถูกต้อง`);
  const mime = file.fileType === 'application/pdf' ? 'application/pdf' : file.fileType;
  if (!new RegExp(`^data:${mime.replace('/', '\\/')};base64,[A-Za-z0-9+/]+={0,2}$`).test(file.dataUrl)) {
    invalid(`ไฟล์แนบ ${field} ต้องเป็น PDF, JPG หรือ PNG ที่เข้ารหัสถูกต้อง`);
  }
  const encoded = file.dataUrl.slice(file.dataUrl.indexOf(',') + 1);
  const bytes = Math.floor(encoded.length * 3 / 4) - (encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0);
  if (bytes > maxAttachmentBytes || bytes !== file.fileSize) invalid(`ขนาดไฟล์แนบ ${field} ไม่ตรงกับข้อมูล`);
  return bytes;
}

export function validateApplication(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('ไม่พบข้อมูลใบสมัคร');
  const app = value as Record<string, unknown>;
  for (const key of Object.keys(app)) {
    if (!submissionFields.has(key)) invalid(`มีฟิลด์ที่ไม่อนุญาต: ${key}`);
  }
  for (const [key, max] of Object.entries(requiredStrings)) {
    const field = app[key];
    if (typeof field !== 'string' || field.length === 0 || field.length > max) invalid(`ข้อมูล ${key} ไม่ถูกต้อง`);
  }
  for (const [key, max] of Object.entries(optionalStringLimits)) {
    const field = app[key];
    if (field !== undefined && (typeof field !== 'string' || field.length > max)) invalid(`ข้อมูล ${key} ไม่ถูกต้อง`);
  }
  if (!/^[0-9]{4,10}$/.test(app.academicYear as string)) invalid('ปีการศึกษาไม่ถูกต้อง');
  if (app.id !== `FSS-${app.academicYear}-${app.submissionToken}` || !/^FSS-[0-9]{4,10}-[0-9a-f-]{36}$/.test(app.id as string)) {
    invalid('เลขที่ใบสมัครไม่ถูกต้อง');
  }
  if (!/^[0-9a-f-]{36}$/.test(app.submissionToken as string)) invalid('รหัสยืนยันใบสมัครไม่ถูกต้อง');
  if (app.status !== 'submitted') invalid('สถานะใบสมัครไม่ถูกต้อง');
  if (app.agreedToTerms !== true) invalid('ต้องยืนยันข้อตกลงก่อนสมัคร');
  let totalAttachmentBytes = 0;
  for (const field of attachmentFields) totalAttachmentBytes += validateAttachment(app[field], field);
  if (totalAttachmentBytes > maxTotalAttachmentBytes) invalid('ขนาดไฟล์แนบรวมเกินกำหนด');
  if (Buffer.byteLength(JSON.stringify(app), 'utf8') > maxSubmissionBytes) invalid('ข้อมูลใบสมัครมีขนาดใหญ่เกินกำหนด');
}
