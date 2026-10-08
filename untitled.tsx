import type { AttachedDoc } from './src/types';
import { attachmentBytes, MAX_FILE_BYTES } from './src/utils/applicationSubmission';

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ กรุณาเลือกไฟล์อีกครั้ง'));
    reader.readAsDataURL(file);
  });
}

export async function prepareAttachment(file: File, isPhoto = false): Promise<AttachedDoc> {
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || (isPhoto && file.type === 'application/pdf')) {
    throw new Error(isPhoto ? 'กรุณาเลือกภาพ JPG หรือ PNG' : 'กรุณาเลือกไฟล์ PDF, JPG หรือ PNG');
  }
  if (file.size > 10 * 1024 * 1024) throw new Error('ไฟล์ต้นฉบับต้องมีขนาดไม่เกิน 10 MB');
  if (file.type === 'application/pdf' && file.size > MAX_FILE_BYTES) {
    throw new Error('PDF ต้องมีขนาดไม่เกิน 450 KB กรุณาลดขนาดไฟล์หรือใช้ภาพ JPG / PNG ซึ่งระบบจะช่วยย่อให้');
  }
  let dataUrl = await readDataUrl(file);
  let fileType = file.type;
  if (file.type.startsWith('image/')) {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('เปิดภาพไม่สำเร็จ กรุณาเลือกภาพใหม่'));
      image.src = dataUrl;
    });
    const canvas = document.createElement('canvas');
    const maxDimension = isPhoto ? 800 : 1800;
    const ratio = Math.min(1, maxDimension / Math.max(img.width, img.height));
    canvas.width = Math.max(1, Math.round(img.width * ratio));
    canvas.height = Math.max(1, Math.round(img.height * ratio));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ประมวลผลภาพไม่ได้ กรุณาลองใช้เบราว์เซอร์อื่น');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Preserve readable document resolution; stop rather than silently over-compress.
    for (const quality of [0.85, 0.75, 0.65, 0.55]) {
      dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (attachmentBytes({ dataUrl } as AttachedDoc) <= 150 * 1024) break;
    }
    fileType = 'image/jpeg';
  }
  const prepared: AttachedDoc = {
    fileName: fileType === 'image/jpeg' ? file.name.replace(/\.[^.]+$/, '') + '.jpg' : file.name,
    fileType,
    fileSize: 0,
    dataUrl,
    uploadedAt: new Date().toISOString(),
  };
  prepared.fileSize = attachmentBytes(prepared);
  if (prepared.fileSize > MAX_FILE_BYTES) throw new Error('ภาพยังมีขนาดเกิน 450 KB หลังย่อ กรุณาเลือกภาพที่เล็กลง');
  return prepared;
}
