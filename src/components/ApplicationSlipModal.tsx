/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  Printer,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { ScholarshipApplication } from '../types';
import { formatThaiDateTime } from '../utils/dateUtils';

interface ApplicationSlipModalProps {
  application: ScholarshipApplication | null;
  onClose: () => void;
  onTrackStatus?: () => void;
}

export const ApplicationSlipModal: React.FC<ApplicationSlipModalProps> = ({
  application,
  onClose,
  onTrackStatus,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  if (!application) return null;

  // Print / Save as PDF via native vector print engine
  const handleDownloadPdf = () => {
    setPrintNotice('ระบบเปิดหน้าต่างพิมพ์ ให้เลือกเครื่องพิมพ์ปลายทางเป็น "บันทึกเป็น PDF" (Save as PDF)');
    setTimeout(() => setPrintNotice(null), 4000);
    handlePrint();
  };

  // Robust isolated iframe printing (works in iframe sandboxes & prevents outer shell print)
  const handlePrint = () => {
    const printContent = document.getElementById('printable-application-slip');
    if (!printContent) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-slip-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets from current document
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ใบสมัครขอรับทุนการศึกษา_${application.studentId || ''}_${application.fullName || ''}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700;800&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          ${styleTags}
          <style>
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 10mm 12mm;
              font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 11pt;
              color: #1C1C1E;
              background: #ffffff;
              line-height: 1.45;
            }
            .print\\:hidden { display: none !important; }
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            .page-break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            .page-break-before {
              break-before: page !important;
              page-break-before: always !important;
            }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div id="printable-application-slip" class="space-y-6">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 4000);
      }
    }, 400);
  };

  const isIncomeDocImage =
    application.incomeCertificateDoc?.fileType?.startsWith('image/') ||
    application.incomeCertificateDoc?.dataUrl?.startsWith('data:image/');

  const isTranscriptDocImage =
    application.academicTranscriptDoc?.fileType?.startsWith('image/') ||
    application.academicTranscriptDoc?.dataUrl?.startsWith('data:image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto animate-fadeIn print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl border border-black/[0.08] overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none">
        {/* Toast / Status Notice */}
        {printNotice && (
          <div className="print:hidden absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1E] text-white text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
            <span>{printNotice}</span>
          </div>
        )}

        {/* Modal Top Bar (Hidden when printing) */}
        <div className="print:hidden px-6 py-4 bg-[#1C1C1E] text-white flex items-center justify-between border-b border-white/10 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
            <span className="font-bold text-sm font-['Prompt',sans-serif] tracking-tight">
              ใบสมัครขอรับทุนการศึกษา ประจำปีการศึกษา {application.academicYear || '2569'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#34C759] hover:bg-[#2db24f] text-white rounded-full transition-all active:scale-95 shadow-md shadow-[#34C759]/25 cursor-pointer disabled:opacity-50"
              title="ดาวน์โหลดเป็นไฟล์ PDF ทันที"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>บันทึกเป็น PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#007AFF] hover:bg-[#0066d6] text-white rounded-full transition-all active:scale-95 shadow-md shadow-[#007AFF]/25 cursor-pointer"
              title="สั่งพิมพ์ผ่านเครื่องพิมพ์ (Print Dialog)"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>สั่งพิมพ์</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Application Document */}
        <div
          id="printable-application-slip"
          className="p-6 sm:p-10 space-y-6 text-[#1C1C1E] text-sm font-['Sarabun',sans-serif] max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-[#1C1C1E] pb-5 page-break-inside-avoid">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-[16px] bg-[#1C1C1E] text-[#FF9500] flex items-center justify-center font-bold text-xl shadow-md print:bg-white print:border print:border-black">
                <Award className="w-7 h-7" />
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
              แบบคำขอรับทุนการศึกษาสำหรับนิสิตที่ขาดแคลนทุนทรัพย์
            </h2>
            <h3 className="text-base font-semibold text-[#636366] print:text-black">
              คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร ประจำปีการศึกษา {application.academicYear || '2569'}
            </h3>
            <div className="mt-2 inline-flex flex-wrap items-center justify-center gap-3 text-xs text-[#8E8E93] print:text-black">
              <span className="px-2.5 py-1 bg-[#F2F2F7] rounded-full font-mono font-bold text-[#1C1C1E] border border-black/[0.05]">
                เลขที่ใบสมัคร: {application.id}
              </span>
              <span>วันที่บันทึก: {formatThaiDateTime(application.createdAt)}</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#34C759]/12 text-[#248A3D] border border-[#34C759]/30 print:bg-transparent print:border-black print:text-black">
                สถานะ: บันทึกและยื่นใบสมัครแล้ว
              </span>
            </div>
          </div>

          {/* Module 0 : การยืนยันข้อมูล */}
          <div className="bg-[#F8F9FA] rounded-[14px] p-3.5 border border-black/[0.06] text-xs page-break-inside-avoid">
            <p className="font-bold text-[#1C1C1E] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
              <span>Module 0 : การยืนยันข้อมูลและรับรองความถูกต้อง</span>
            </p>
            <p className="text-[#3C4043] mt-1 pl-5">
              ข้าพเจ้าขอรับรองว่าข้อมูลตามแบบคำขอสมัครทุนการศึกษาเป็นข้อมูลที่ถูกต้องตามความเป็นจริงทุกประการ
              (ผ่านการยืนยันตัวตนในระบบดิจิทัลแล้ว: {application.agreedToTerms ? 'ยืนยันถูกต้องครบถ้วน' : 'ไม่ระบุ'})
            </p>
          </div>

          {/* Module 1 : ข้อมูลส่วนตัวของนิสิต พร้อมรูปภาพที่อัปโหลด */}
          <div className="page-break-inside-avoid">
            <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3.5 py-1.5 rounded-[10px] mb-3">
              Module 1 : ข้อมูลส่วนตัวของนิสิต
            </h4>
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* 📷 รูปถ่ายนิสิตที่ Upload */}
              <div className="shrink-0 flex flex-col items-center">
                {application.studentPhotoDoc?.dataUrl ? (
                  <div className="w-32 h-40 rounded-[12px] overflow-hidden border-2 border-black/20 shadow-xs bg-[#F2F2F7]">
                    <img
                      src={application.studentPhotoDoc.dataUrl}
                      alt={application.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-40 rounded-[12px] border-2 border-dashed border-[#8E8E93]/40 flex flex-col items-center justify-center p-2 text-center bg-[#F8F9FA]">
                    <User className="w-8 h-8 text-[#8E8E93]/40 mb-1" />
                    <span className="text-[11px] text-[#8E8E93] leading-tight">
                      รูปถ่ายนิสิต<br />(ชุดนิสิตหน้าตรง)
                    </span>
                  </div>
                )}
                <span className="text-[10px] text-[#8E8E93] mt-1">รูปถ่ายหน้าตรงชุดนิสิต</span>
              </div>

              {/* ข้อมูลประวัตินิสิต */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs sm:text-sm">
                <p>
                  <strong>1. ชื่อ-สกุล:</strong> {application.fullName}
                </p>
                <p>
                  <strong>2. รหัสนิสิต:</strong> {application.studentId || '-'}
                </p>
                <p>
                  <strong>3. ภาควิชา:</strong> {application.department}
                </p>
                <p>
                  <strong>4. ชั้นปี:</strong> {application.studyYear}
                </p>
                <p>
                  <strong>5. เบอร์โทรศัพท์:</strong> {application.phone}
                </p>
                <p>
                  <strong>7. ผลการเรียนเฉลี่ยสะสม (GPAX):</strong> {application.gpaxRange || application.gpax || '-'}
                </p>
                <p className="sm:col-span-2">
                  <strong>6. บ้านเลขที่ ภูมิลำเนาของนิสิต:</strong> {application.homeAddress || '-'}
                </p>

                {/* สถานะเอกสารผลการเรียน */}
                <div className="sm:col-span-2 pt-1">
                  <strong>เอกสารผลการศึกษา:</strong>{' '}
                  {application.academicTranscriptDoc ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#007AFF]/10 text-[#007AFF] font-medium text-xs print:bg-transparent print:text-black">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{application.academicTranscriptDoc.fileName}</span>
                      <span className="text-[11px] text-[#636366]">(แนบเอกสารฉบับเต็มด้านล่างใบสมัคร)</span>
                    </span>
                  ) : (
                    <span className="text-[#8E8E93] text-xs">ไม่ได้แนบไฟล์</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Module 2 : ข้อมูลครอบครัว */}
          <div className="page-break-inside-avoid">
            <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3.5 py-1.5 rounded-[10px] mb-3">
              Module 2 : ข้อมูลครอบครัว
            </h4>
            <div className="space-y-3 pl-2 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-[#F9F9FB] rounded-[10px]">
                <p>
                  <strong>8. บิดา:</strong> {application.fatherName || '-'} ({application.fatherStatus || 'ยังมีชีวิต'}, อายุ {application.fatherAge || '-'} ปี)
                </p>
                <p>
                  <strong>อาชีพ:</strong> {application.fatherOccupation || '-'} {application.fatherOccupationDetail ? `(${application.fatherOccupationDetail})` : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-[#F9F9FB] rounded-[10px]">
                <p>
                  <strong>9. มารดา:</strong> {application.motherName || '-'} ({application.motherStatus || 'ยังมีชีวิต'}, อายุ {application.motherAge || '-'} ปี)
                </p>
                <p>
                  <strong>อาชีพ:</strong> {application.motherOccupation || '-'} {application.motherOccupationDetail ? `(${application.motherOccupationDetail})` : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-[#F9F9FB] rounded-[10px]">
                <p>
                  <strong>10. ผู้ปกครอง:</strong> {application.guardianName || '-'} (เกี่ยวข้อง: {application.guardianRelation || '-'})
                </p>
                <p>
                  <strong>อาชีพ:</strong> {application.guardianOccupation || '-'} {application.guardianOccupationDetail ? `(${application.guardianOccupationDetail})` : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <p>
                  <strong>11. สถานภาพสมรสของบิดามารดา:</strong> {application.parentsMaritalStatus || '-'}
                </p>
                <p>
                  <strong>14. จำนวนพี่น้องที่กำลังศึกษา:</strong> {application.siblingsStudyingCount || '-'}
                </p>
                <p className="sm:col-span-2">
                  <strong>12. สภาพความเป็นอยู่ในครอบครัว:</strong> {application.familyLivingCondition || '-'}
                </p>
                <p className="sm:col-span-2">
                  <strong>13. การเจ็บป่วยหรือโรคประจำตัวในครอบครัว:</strong> {application.familyIllnessStatus || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Module 3 & 4 : ฐานะเศรษฐกิจ & ประวัติรับทุน */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 page-break-inside-avoid">
            <div>
              <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3.5 py-1.5 rounded-[10px] mb-2">
                Module 3 : ฐานะทางเศรษฐกิจ
              </h4>
              <div className="space-y-1.5 text-xs sm:text-sm pl-2">
                <p>
                  <strong>15. รายได้ครอบครัว/ปี:</strong> {application.familyYearlyIncome || '-'} บาท
                </p>
                {application.incomeCertificateDoc ? (
                  <div className="mt-1 p-2 bg-[#007AFF]/8 rounded-[10px] border border-[#007AFF]/20 flex items-center justify-between">
                    <span className="text-[11px] text-[#007AFF] font-medium truncate max-w-[170px] print:text-black">
                      📎 {application.incomeCertificateDoc.fileName}
                    </span>
                    <span className="text-[10px] text-[#636366]">(แนบเอกสารด้านล่าง)</span>
                  </div>
                ) : (
                  <p className="text-xs text-[#8E8E93]">ไม่มีเอกสารแนบ</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3.5 py-1.5 rounded-[10px] mb-2">
                Module 4 : ประวัติการได้รับทุน
              </h4>
              <div className="space-y-1.5 text-xs sm:text-sm pl-2">
                <p>
                  <strong>17. เงินค่าใช้จ่ายได้รับ/เดือน:</strong> {application.monthlyAllowance || '-'} บาท
                </p>
                <p>
                  <strong>18. การกู้ยืม กยศ.:</strong> {application.studentLoanStatus || '-'}
                </p>
                <p>
                  <strong>19. ทุนการศึกษาอื่น:</strong> {application.pastScholarshipHistory || '-'}
                  {application.pastScholarshipName ? ` (${application.pastScholarshipName} ${application.pastScholarshipAmount} บ.)` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Module 5, 6, 7 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 page-break-inside-avoid">
            <div>
              <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3.5 py-1.5 rounded-[10px] mb-2">
                Module 5 : ที่พักอาศัย
              </h4>
              <p className="text-xs sm:text-sm pl-2">
                <strong>20. ที่พักอาศัย:</strong> {application.accommodationType || '-'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3.5 py-1.5 rounded-[10px] mb-2">
                Module 6 : การทำงานพิเศษ
              </h4>
              <p className="text-xs sm:text-sm pl-2">
                <strong>21. ประวัติทำงานพิเศษ:</strong> {application.partTimeWorkHistory || '-'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3.5 py-1.5 rounded-[10px] mb-2">
                Module 7 : การมีส่วนร่วม
              </h4>
              <div className="text-xs sm:text-sm pl-2 space-y-1">
                <p>
                  <strong>22. กิจกรรมชมรม/สโมสร:</strong> {application.studentActivityParticipation || '-'}
                </p>
                <p>
                  <strong>23. จิตอาสา/บำเพ็ญประโยชน์:</strong> {application.volunteerWorkParticipation || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Module 8 : ความจำเป็นในการรับทุน */}
          <div className="page-break-inside-avoid">
            <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3.5 py-1.5 rounded-[10px] mb-3">
              Module 8 : ความจำเป็นในการรับทุน
            </h4>
            <div className="space-y-3 pl-2 text-xs sm:text-sm">
              <div className="bg-[#F8F9FA] p-3 rounded-[12px]">
                <p className="font-bold text-[#1C1C1E] mb-1">
                  24. สิ่งที่นิสิตภูมิใจในตนเอง หรือความสามารถของนิสิต:
                </p>
                <p className="text-[#3A3A3C] leading-relaxed">
                  "{application.selfPrideOrTalent || '-'}"
                </p>
              </div>

              <div className="bg-[#F8F9FA] p-3 rounded-[12px]">
                <p className="font-bold text-[#1C1C1E] mb-1">
                  25. เหตุผลและความจำเป็นในการรับทุนการศึกษา:
                </p>
                <p className="text-[#3A3A3C] leading-relaxed">
                  "{application.reasonForApplying || '-'}"
                </p>
              </div>

              <div className="bg-[#F8F9FA] p-3 rounded-[12px]">
                <p className="font-bold text-[#1C1C1E] mb-1">
                  26. หากได้รับทุนการศึกษา จะนำเงินทุนไปใช้ประโยชน์ในด้านใด อย่างไร:
                </p>
                <p className="text-[#3A3A3C] leading-relaxed">
                  "{application.scholarshipFundUsagePlan || '-'}"
                </p>
              </div>
            </div>
          </div>

          {/* Signature & Endorsement Sign-offs */}
          {/* ข้อ 1: นิสิตผ่านการยืนยันตัวตนในระบบแล้ว ไม่ต้องให้เซ็นมือ */}
          {/* ข้อ 2: แก้ไขเป็น "ความเห็นจากภาควิชา/สถาน" และตัดกรรมการพิจารณาทุนออก */}
          <div className="pt-6 border-t border-black/15 page-break-inside-avoid space-y-4">
            <div className="bg-[#F8F9FA] p-3 rounded-[12px] border border-black/[0.06] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                <span className="text-[#1C1C1E] font-medium">
                  ผู้สมัครได้ยืนยันความถูกต้องของข้อมูลผ่านระบบรับสมัครทุนออนไลน์เรียบร้อยแล้ว:
                  <strong className="text-[#007AFF] ml-1">{application.fullName}</strong>
                </span>
              </div>
              <span className="font-mono text-[#8E8E93] text-[11px]">
                (ยืนยันเมื่อ {formatThaiDateTime(application.createdAt)})
              </span>
            </div>

            <div className="p-4 bg-white rounded-[14px] border border-black/10 space-y-8 text-xs">
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <span className="font-bold text-sm font-['Prompt',sans-serif] text-[#1C1C1E]">
                  ความเห็นจากภาควิชา/สถาน
                </span>
                <span className="text-[11px] text-[#8E8E93]">
                  (สำหรับหัวหน้าภาควิชา / ประธานหลักสูตร / อาจารย์ที่ปรึกษา)
                </span>
              </div>

              <div className="space-y-4 pt-2">
                <div className="border-b border-dotted border-black/40 h-6" />
                <div className="border-b border-dotted border-black/40 h-6" />
                <div className="border-b border-dotted border-black/40 h-6" />
              </div>

              <div className="text-right pt-4 space-y-6 max-w-xs ml-auto">
                <div className="border-b border-black/40 w-56 ml-auto" />
                <p className="text-center text-xs">
                  ลงชื่อ (.......................................................)
                  <br />
                  <span className="text-[11px] text-[#636366]">หัวหน้าภาควิชา/สถาน หรือ ผู้แทน</span>
                  <br />
                  วันที่ ...... / ...... / ............
                </p>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* ข้อ 3: เอกสารแนบ 2 อย่างที่แนบมากับใบสมัคร */}
          {/* (1) ผลการเรียน (Academic Transcript) */}
          {/* (2) หนังสือรับรองรายได้ครอบครัว (Income Certificate) */}
          {/* ================================================================ */}
          <div className="page-break-before pt-6 space-y-8">
            <div className="border-b-2 border-[#1C1C1E] pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-['Prompt',sans-serif] text-[#1C1C1E]">
                  เอกสารแนบประกอบใบสมัครขอรับทุนการศึกษา
                </h3>
                <p className="text-xs text-[#636366]">
                  เลขที่ใบสมัคร: <strong className="font-mono">{application.id}</strong> • นิสิต: <strong>{application.fullName}</strong> ({application.studentId})
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2F2F7] text-[#1C1C1E] border border-black/10">
                เอกสารแนบ
              </span>
            </div>

            {/* เอกสารแนบ 1: ผลการเรียน (Transcript / ใบแจ้งเกรด) */}
            <div className="p-5 rounded-[18px] bg-white border border-black/15 shadow-xs space-y-4 page-break-inside-avoid">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-[8px] bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1C1C1E] font-['Prompt',sans-serif]">
                      เอกสารแนบ 1: ใบรายงานผลการศึกษา (Transcript / ใบแจ้งเกรด)
                    </h4>
                    <p className="text-xs text-[#8E8E93]">
                      ผลการเรียนเฉลี่ยสะสม (GPAX): <strong>{application.gpaxRange || application.gpax || '-'}</strong>
                    </p>
                  </div>
                </div>

                {application.academicTranscriptDoc?.dataUrl && (
                  <a
                    href={application.academicTranscriptDoc.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="print:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#5856D6]/10 hover:bg-[#5856D6]/20 text-[#5856D6] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดดูไฟล์ต้นฉบับ</span>
                  </a>
                )}
              </div>

              {application.academicTranscriptDoc ? (
                <div className="space-y-3">
                  <div className="text-xs text-[#636366] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#5856D6]" />
                    <span>ชื่อไฟล์: <strong>{application.academicTranscriptDoc.fileName}</strong></span>
                    <span>• ขนาด: {Math.round(application.academicTranscriptDoc.fileSize / 1024)} KB</span>
                  </div>

                  {isTranscriptDocImage && application.academicTranscriptDoc.dataUrl ? (
                    <div className="rounded-[12px] border border-black/10 overflow-hidden max-w-2xl mx-auto bg-[#F9F9FB] p-2">
                      <img
                        src={application.academicTranscriptDoc.dataUrl}
                        alt="ใบรายงานผลการศึกษา"
                        className="w-full h-auto max-h-[700px] object-contain rounded-[8px]"
                      />
                    </div>
                  ) : application.academicTranscriptDoc.dataUrl ? (
                    <div className="p-6 bg-[#F8F9FA] rounded-[14px] border border-dashed border-black/20 text-center space-y-2">
                      <FileText className="w-10 h-10 text-[#5856D6] mx-auto" />
                      <p className="text-xs font-semibold text-[#1C1C1E]">
                        ไฟล์เอกสาร PDF: {application.academicTranscriptDoc.fileName}
                      </p>
                      <p className="text-[11px] text-[#8E8E93]">
                        (เอกสารรูปแบบ PDF ถูกแนบและบันทึกในระบบเรียบร้อยแล้ว)
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="p-6 bg-[#F8F9FA] rounded-[14px] border border-dashed border-[#8E8E93]/30 text-center text-xs text-[#8E8E93]">
                  ไม่มีเอกสารใบรายงานผลการศึกษาแนบในใบสมัครนี้
                </div>
              )}
            </div>

            {/* เอกสารแนบ 2: หนังสือรับรองรายได้ครอบครัว / สลิปเงินเดือน */}
            <div className="p-5 rounded-[18px] bg-white border border-black/15 shadow-xs space-y-4 page-break-inside-avoid">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-[8px] bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1C1C1E] font-['Prompt',sans-serif]">
                      เอกสารแนบ 2: หนังสือรับรองรายได้ครอบครัว / สลิปเงินเดือน (ใช้แบบฟอร์มเดียวกับ กยศ. ได้)
                    </h4>
                    <p className="text-xs text-[#8E8E93]">
                      รายได้ครอบครัว/ปี: <strong>{application.familyYearlyIncome || '-'} บาท</strong>
                    </p>
                  </div>
                </div>

                {application.incomeCertificateDoc?.dataUrl && (
                  <a
                    href={application.incomeCertificateDoc.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="print:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>เปิดดูไฟล์ต้นฉบับ</span>
                  </a>
                )}
              </div>

              {application.incomeCertificateDoc ? (
                <div className="space-y-3">
                  <div className="text-xs text-[#636366] flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-[#007AFF]" />
                    <span>ชื่อไฟล์: <strong>{application.incomeCertificateDoc.fileName}</strong></span>
                    <span>• ขนาด: {Math.round(application.incomeCertificateDoc.fileSize / 1024)} KB</span>
                  </div>

                  {isIncomeDocImage && application.incomeCertificateDoc.dataUrl ? (
                    <div className="rounded-[12px] border border-black/10 overflow-hidden max-w-2xl mx-auto bg-[#F9F9FB] p-2">
                      <img
                        src={application.incomeCertificateDoc.dataUrl}
                        alt="หนังสือรับรองรายได้"
                        className="w-full h-auto max-h-[700px] object-contain rounded-[8px]"
                      />
                    </div>
                  ) : application.incomeCertificateDoc.dataUrl ? (
                    <div className="p-6 bg-[#F8F9FA] rounded-[14px] border border-dashed border-black/20 text-center space-y-2">
                      <FileCheck2 className="w-10 h-10 text-[#007AFF] mx-auto" />
                      <p className="text-xs font-semibold text-[#1C1C1E]">
                        ไฟล์เอกสาร PDF: {application.incomeCertificateDoc.fileName}
                      </p>
                      <p className="text-[11px] text-[#8E8E93]">
                        (เอกสารรูปแบบ PDF ถูกแนบและบันทึกในระบบเรียบร้อยแล้ว)
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="p-6 bg-[#F8F9FA] rounded-[14px] border border-dashed border-[#8E8E93]/30 text-center text-xs text-[#8E8E93]">
                  ไม่มีหนังสือรับรองรายได้แนบในใบสมัครนี้
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="print:hidden px-6 py-4 bg-[#F2F2F7] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#8E8E93]">
            เลขที่ใบสมัคร: <strong className="text-[#1C1C1E] font-mono">{application.id}</strong>
          </div>

          <div className="flex items-center gap-2">
            {onTrackStatus && (
              <button
                onClick={onTrackStatus}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#007AFF]/12 hover:bg-[#007AFF]/20 text-[#007AFF] transition-colors cursor-pointer"
              >
                ตรวจสอบสถานะการสมัคร
              </button>
            )}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#34C759] hover:bg-[#2db24f] text-white transition-all active:scale-95 cursor-pointer shadow-md shadow-[#34C759]/25 flex items-center gap-1.5 disabled:opacity-50"
              title="ดาวน์โหลดเป็นไฟล์ PDF ทันที"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>บันทึกเป็น PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#007AFF] hover:bg-[#0066d6] text-white transition-all active:scale-95 cursor-pointer shadow-md shadow-[#007AFF]/25 flex items-center gap-1.5"
              title="สั่งพิมพ์ผ่านเครื่องพิมพ์ (Print Dialog)"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
