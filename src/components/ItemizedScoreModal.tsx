/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Coins,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Heart,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Printer,
  Scale,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import { calculateScholarshipScore } from '../data/scholarshipData';
import { ScholarshipApplication } from '../types';

interface ItemizedScoreModalProps {
  application: ScholarshipApplication | null;
  onClose: () => void;
  onSaveNotes?: (appId: string, notes: string) => void;
}

export const ItemizedScoreModal: React.FC<ItemizedScoreModalProps> = ({
  application,
  onClose,
  onSaveNotes,
}) => {
  const [interviewerNote, setInterviewerNote] = useState<string>(
    application?.reviewerNotes || ''
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  if (!application) return null;

  const scoreBreakdown = calculateScholarshipScore(application);
  const itemizedList = scoreBreakdown.itemizedScores || [];

  // Print / Save as PDF via native vector print engine
  const handleDownloadPdf = () => {
    setPrintNotice('ระบบเปิดหน้าต่างพิมพ์ ให้เลือกเครื่องพิมพ์ปลายทางเป็น "บันทึกเป็น PDF" (Save as PDF)');
    setTimeout(() => setPrintNotice(null), 4000);
    handlePrint();
  };

  // Robust isolated iframe printing (works in iframe sandboxes & prevents blank page)
  const handlePrint = () => {
    const printContent = document.getElementById('printable-itemized-score-sheet');
    if (!printContent) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-score-iframe';
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

    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ใบคะแนนการประเมินทุน_${application.studentId || ''}_${application.fullName || ''}</title>
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
          <div id="printable-itemized-score-sheet" class="space-y-6">
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

  const handleSaveNotes = () => {
    if (onSaveNotes) {
      onSaveNotes(application.id, interviewerNote);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto animate-fadeIn print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl border border-black/[0.08] overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:rounded-none">
        {/* Toast / Status Notice */}
        {printNotice && (
          <div className="print:hidden absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1E] text-white text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
            <span>{printNotice}</span>
          </div>
        )}

        {/* iOS Modal Header - Not visible in print */}
        <div className="px-6 py-5 bg-[#1C1C1E] text-white flex items-center justify-between border-b border-white/10 print:hidden flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/20 text-[#007AFF] flex items-center justify-center font-bold">
              <ClipboardList className="w-5 h-5 text-[#30B0C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Prompt',sans-serif]">
                  ใบคะแนนการประเมินรายข้อ (Officer Score Sheet)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30">
                  100 คะแนนเต็ม
                </span>
              </div>
              <p className="text-xs text-white/70">
                ระบบคัดกรองทุน คณะสังคมศาสตร์ ประจำปีการศึกษา {application.academicYear || '2569'} มหาวิทยาลัยนเรศวร
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#34C759] hover:bg-[#2db24f] text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
              title="ดาวน์โหลดใบคะแนนเป็นไฟล์ PDF ทันที"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกเป็น PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
              title="พิมพ์ใบคะแนนสำหรับการประชุมกรรมการ"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบคะแนน</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div
          id="printable-itemized-score-sheet"
          className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6 print:max-h-none print:overflow-visible"
        >
          {/* Printable Official Header */}
          <div className="border-b border-black/[0.08] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Student Photo */}
              <div className="shrink-0">
                {application.studentPhotoDoc?.dataUrl ? (
                  <div className="w-20 h-24 rounded-[12px] overflow-hidden border border-black/10 shadow-xs bg-[#F2F2F7]">
                    <img
                      src={application.studentPhotoDoc.dataUrl}
                      alt={application.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-24 rounded-[12px] border border-dashed border-[#8E8E93]/40 flex flex-col items-center justify-center p-1 text-center bg-[#F8F9FA] text-[#8E8E93]">
                    <User className="w-6 h-6 text-[#8E8E93]/50" />
                    <span className="text-[9px] mt-1 text-[#8E8E93]">ไม่มีรูปถ่าย</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold font-mono">
                    รหัส: {application.studentId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${scoreBreakdown.colorClass}`}>
                    {scoreBreakdown.priorityLabel}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                  {application.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#636366]">
                  <span>ภาควิชา: <strong>{application.department}</strong></span>
                  <span>ชั้นปี: <strong>{application.studyYear}</strong></span>
                  <span>เกรดเฉลี่ย: <strong>{application.gpaxRange}</strong></span>
                  <span>เบอร์โทร: <strong>{application.phone}</strong></span>
                </div>

                {/* Evidence badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  {application.academicTranscriptDoc ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#5856D6]/10 text-[#5856D6] font-semibold text-[11px]">
                      📄 มีใบเกรด/Transcript แนบ
                      {application.academicTranscriptDoc.dataUrl && (
                        <a
                          href={application.academicTranscriptDoc.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="print:hidden underline font-bold ml-1 hover:text-[#3634A3]"
                        >
                          (ดูไฟล์)
                        </a>
                      )}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#8E8E93]">
                      (ยังไม่ได้แนบใบรายงานผลการศึกษา)
                    </span>
                  )}
                  {application.incomeCertificateDoc && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-semibold text-[11px]">
                      📎 มีหนังสือรับรองรายได้
                      {application.incomeCertificateDoc.dataUrl && (
                        <a
                          href={application.incomeCertificateDoc.dataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="print:hidden underline font-bold ml-1 hover:text-[#0051D5]"
                        >
                          (ดูไฟล์)
                        </a>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Score Summary Box */}
            <div className="shrink-0 bg-[#F2F2F7] rounded-[22px] p-4 sm:p-5 text-center sm:text-right min-w-[200px] border border-black/[0.05]">
              <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider block">
                คะแนนความเดือดร้อนรวม
              </span>
              <div className="flex items-baseline justify-center sm:justify-end gap-1.5 mt-1">
                <span className="text-4xl font-extrabold font-mono text-[#007AFF]">
                  {scoreBreakdown.totalScore}
                </span>
                <span className="text-sm font-semibold text-[#8E8E93]">/ 100</span>
              </div>
              <p className="text-[11px] text-[#8E8E93] mt-1 font-mono">
                ยื่นเมื่อ: {new Date(application.createdAt).toLocaleDateString('th-TH')}
              </p>
            </div>
          </div>

          {/* Category Quick Bar (Pillars) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-[16px] bg-[#007AFF]/8 border border-[#007AFF]/20">
              <span className="text-[10px] text-[#007AFF] block font-semibold truncate">1. รายได้ (มีหลักฐาน)</span>
              <strong className="text-sm font-mono text-[#007AFF]">{scoreBreakdown.incomeScore}/30</strong>
            </div>
            <div className="p-2.5 rounded-[16px] bg-[#0077B6]/8 border border-[#0077B6]/20">
              <span className="text-[10px] text-[#0077B6] block font-semibold truncate">2. ทุน & กยศ.</span>
              <strong className="text-sm font-mono text-[#0077B6]">{scoreBreakdown.scholarshipHistoryScore || 0}/5</strong>
            </div>
            <div className="p-2.5 rounded-[16px] bg-[#5856D6]/8 border border-[#5856D6]/20">
              <span className="text-[10px] text-[#5856D6] block font-semibold truncate">3. GPAX (X2)</span>
              <strong className="text-sm font-mono text-[#5856D6]">{scoreBreakdown.gpaxScore || 0}/10</strong>
            </div>
            <div className="p-2.5 rounded-[16px] bg-[#34C759]/8 border border-[#34C759]/20">
              <span className="text-[10px] text-[#248A3D] block font-semibold truncate">4. ค่าใช้จ่าย</span>
              <strong className="text-sm font-mono text-[#248A3D]">{scoreBreakdown.allowanceScore}/15</strong>
            </div>
            <div className="p-2.5 rounded-[16px] bg-[#AF52DE]/8 border border-[#AF52DE]/20">
              <span className="text-[10px] text-[#AF52DE] block font-semibold truncate">5. ครอบครัว&โรค</span>
              <strong className="text-sm font-mono text-[#AF52DE]">{scoreBreakdown.familyHardshipScore}/15</strong>
            </div>
            <div className="p-2.5 rounded-[16px] bg-[#8E8E93]/10 border border-[#8E8E93]/20">
              <span className="text-[10px] text-[#636366] block font-semibold truncate">6. ภาระพี่น้อง</span>
              <strong className="text-sm font-mono text-[#636366]">{scoreBreakdown.siblingsScore}/10</strong>
            </div>
            <div className="p-2.5 rounded-[16px] bg-[#FF2D55]/8 border border-[#FF2D55]/20">
              <span className="text-[10px] text-[#FF2D55] block font-semibold truncate">7. งานพิเศษ&กิจกรรม</span>
              <strong className="text-sm font-mono text-[#FF2D55]">{scoreBreakdown.selfRelianceScore}/10</strong>
            </div>
          </div>

          {/* Itemized Score Breakdown Table (เห็นคะแนนแต่ละข้อ) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#1C1C1E] font-['Prompt',sans-serif] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF9500]" />
                <span>รายละเอียดคะแนนแยกตามข้อคำถาม (Itemized Rubric Scores)</span>
              </h3>
              <span className="text-xs text-[#8E8E93]">
                รวมทั้งสิ้น {itemizedList.length} รายการ
              </span>
            </div>

            <div className="overflow-hidden rounded-[22px] border border-black/[0.08] shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F2F2F7] text-[#636366] border-b border-black/[0.06] font-semibold">
                    <th className="py-3 px-3.5 w-16 text-center">ข้อ</th>
                    <th className="py-3 px-3.5">หัวข้อ / เกณฑ์การพิจารณา</th>
                    <th className="py-3 px-3.5">คำตอบของนิสิต</th>
                    <th className="py-3 px-3.5 text-center w-24">คะแนนที่ได้</th>
                    <th className="py-3 px-3.5 hidden md:table-cell">การประเมิน / หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] bg-white">
                  {itemizedList.map((item, idx) => {
                    const pct = (item.score / item.maxScore) * 100;
                    return (
                      <tr key={item.id} className="hover:bg-[#F9F9FB] transition-colors">
                        <td className="py-3 px-3.5 text-center font-mono font-bold text-[#8E8E93]">
                          {item.questionNumber}
                        </td>
                        <td className="py-3 px-3.5 font-medium text-[#1C1C1E]">
                          <div>
                            <span className="text-[10px] text-[#8E8E93] block font-mono">
                              {item.moduleLabel}
                            </span>
                            <span>{item.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-[#3C4043]">
                          <span className="px-2 py-0.5 rounded-md bg-[#F2F2F7] inline-block font-medium">
                            {item.applicantValue}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center font-mono">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-[#007AFF] text-sm">
                              {item.score} <span className="text-[#8E8E93] text-xs font-normal">/ {item.maxScore}</span>
                            </span>
                            <div className="w-16 bg-[#E5E5EA] h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-[#007AFF] h-full rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 text-[#636366] text-[11px] hidden md:table-cell">
                          {item.criteriaNote}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Self-Reflection & Need Essay (Module 8) */}
          <div className="bg-[#F2F2F7]/70 rounded-[22px] p-5 space-y-3 border border-black/[0.05]">
            <h4 className="font-bold text-xs text-[#1C1C1E] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#007AFF]" />
              <span>ความจำเป็นตามที่นิสิตชี้แจง (ข้อ 24 - 26)</span>
            </h4>
            <div className="space-y-2 text-xs text-[#3C4043]">
              {application.selfPrideOrTalent && (
                <div>
                  <strong className="text-[#1C1C1E] block">สิ่งที่ภูมิใจ / ความสามารถ (ข้อ 24):</strong>
                  <p className="bg-white p-2.5 rounded-[12px] mt-0.5 leading-relaxed text-[#636366]">
                    {application.selfPrideOrTalent}
                  </p>
                </div>
              )}
              {application.reasonForApplying && (
                <div>
                  <strong className="text-[#1C1C1E] block">เหตุผลและความจำเป็นในการรับทุน (ข้อ 25):</strong>
                  <p className="bg-white p-2.5 rounded-[12px] mt-0.5 leading-relaxed text-[#636366]">
                    {application.reasonForApplying}
                  </p>
                </div>
              )}
              {application.scholarshipFundUsagePlan && (
                <div>
                  <strong className="text-[#1C1C1E] block">แผนการนำเงินทุนไปใช้ประโยชน์ (ข้อ 26):</strong>
                  <p className="bg-white p-2.5 rounded-[12px] mt-0.5 leading-relaxed text-[#636366]">
                    {application.scholarshipFundUsagePlan}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Committee / Officer Interview Notes & Adjustments */}
          <div className="bg-white rounded-[22px] p-5 border border-black/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#1C1C1E] flex items-center gap-2 font-['Prompt',sans-serif]">
                <MessageSquare className="w-4 h-4 text-[#34C759]" />
                <span>บันทึกความเห็นคณะกรรมการสัมภาษณ์ / การให้คะแนนเพิ่มเติม</span>
              </h4>
              {isSaved && (
                <span className="text-[11px] text-[#34C759] font-bold flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>บันทึกแล้ว</span>
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={interviewerNote}
              onChange={(e) => setInterviewerNote(e.target.value)}
              placeholder="ระบุข้อสังเกตจากการสัมภาษณ์, ข้อมูลตรวจสอบเชิงลึก, หรือข้อเสนอแนะในการจัดสรรเงินทุน..."
              className="w-full p-3 rounded-[14px] bg-[#F2F2F7] border border-transparent focus:border-[#007AFF] focus:bg-white outline-none text-xs text-[#1C1C1E] transition-all resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-[#8E8E93]">
                * ข้อความนี้จะถูกจัดเก็บเป็นบันทึกการพิจารณาของคณะกรรมการ
              </p>
              {onSaveNotes && (
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0056b3] text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  บันทึกความเห็น
                </button>
              )}
            </div>
          </div>

          {/* Official Sign-off Area for Print */}
          <div className="hidden print:grid grid-cols-2 gap-8 pt-8 border-t border-black/[0.1] text-xs">
            <div className="text-center space-y-8">
              <p>ลงชื่อ..............................................................</p>
              <p>(..............................................................)<br />กรรมการสัมภาษณ์ทุน</p>
            </div>
            <div className="text-center space-y-8">
              <p>ลงชื่อ..............................................................</p>
              <p>(..............................................................)<br />ประธานคณะกรรมการพิจารณาทุน</p>
            </div>
          </div>
        </div>

        {/* Modal Footer - Not visible in print */}
        <div className="px-6 py-4 bg-[#F2F2F7] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <span className="text-xs text-[#8E8E93]">
            เกณฑ์คะแนนตามประกาศคณะสังคมศาสตร์ ประจำปีการศึกษา {application.academicYear || '2569'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#34C759] hover:bg-[#2db24f] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
              title="ดาวน์โหลดใบคะแนนเป็นไฟล์ PDF ทันที"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกเป็น PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              title="พิมพ์ใบคะแนนสำหรับการประชุมกรรมการ"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบคะแนน</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#1C1C1E] text-white text-xs font-semibold hover:bg-black transition-all active:scale-95 cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
