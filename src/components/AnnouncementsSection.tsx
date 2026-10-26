/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Info,
  Layers,
  Loader2,
  Lock,
  MapPin,
  Megaphone,
  Phone,
  Printer,
  Search,
  ShieldAlert,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { OFFICIAL_DEPARTMENTS_2569, calculateScholarshipScore } from '../data/scholarshipData';
import { ScholarshipApplication, TimelineConfig } from '../types';

interface AnnouncementsSectionProps {
  applications: ScholarshipApplication[];
  timelineConfig: TimelineConfig;
  onViewApplication?: (app: ScholarshipApplication) => void;
  isAdminLoggedIn?: boolean;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  applications,
  timelineConfig,
  onViewApplication,
  isAdminLoggedIn = false,
}) => {
  // Tab: 'interview' (รายชื่อผู้มีสิทธิ์สัมภาษณ์) or 'awarded' (รายชื่อผู้ได้รับทุนการศึกษา)
  const [activeSubTab, setActiveSubTab] = useState<'interview' | 'awarded'>('interview');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(timelineConfig?.academicYear || '2569');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available academic years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    if (timelineConfig?.academicYear) years.add(timelineConfig.academicYear);
    years.add('2569');
    applications.forEach((a) => {
      if (a.academicYear) years.add(a.academicYear);
    });
    return Array.from(years).sort().reverse();
  }, [applications, timelineConfig?.academicYear]);

  // Interview candidates list: status in ['eligible_for_interview', 'interviewed', 'awarded']
  // Deduplicated by student ID/name and sorted by evaluation score (คะแนนความจำเป็น) descending
  const interviewCandidates = useMemo(() => {
    if (!Array.isArray(applications)) return [];

    const rawList = applications.filter((app) => {
      if (!app) return false;
      // Must match academic year
      const appYear = String(app.academicYear || '2569');
      if (selectedAcademicYear !== 'all' && appYear !== selectedAcademicYear) return false;
      // Must have passed screening to interview stage
      return app.status === 'eligible_for_interview' || app.status === 'interviewed' || app.status === 'awarded';
    });

    // Deduplicate duplicate applications (e.g. repeated student submissions)
    const seen = new Map<string, { app: ScholarshipApplication; score: number }>();
    for (const app of rawList) {
      if (!app) continue;
      const sid = app.studentId != null ? String(app.studentId).trim() : '';
      const fname = app.fullName != null ? String(app.fullName).trim() : '';
      const key = sid || fname || String(app.id || Math.random());
      let score = 0;
      try {
        const breakdown = calculateScholarshipScore(app);
        score = typeof breakdown?.totalScore === 'number' ? breakdown.totalScore : 0;
      } catch {
        score = 0;
      }

      if (!seen.has(key)) {
        seen.set(key, { app, score });
      } else {
        const existing = seen.get(key)!;
        if (score > existing.score) {
          seen.set(key, { app, score });
        }
      }
    }

    const uniqueList = Array.from(seen.values());

    const parseRank = (val: any): number | null => {
      if (val === undefined || val === null || val === '') return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    // Sort by committee finalRank if assigned, otherwise by evaluation score descending
    return uniqueList
      .sort((a, b) => {
        const rankA = parseRank(a.app.finalRank);
        const rankB = parseRank(b.app.finalRank);
        if (rankA !== null && rankB !== null) {
          if (rankA !== rankB) return rankA - rankB;
        } else if (rankA !== null) {
          return -1;
        } else if (rankB !== null) {
          return 1;
        }
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        const sidA = a.app.studentId != null ? String(a.app.studentId) : '';
        const sidB = b.app.studentId != null ? String(b.app.studentId) : '';
        return sidA.localeCompare(sidB);
      })
      .map((item) => item.app);
  }, [applications, selectedAcademicYear]);

  // Awarded recipients list: status === 'awarded'
  const awardedRecipients = useMemo(() => {
    if (!Array.isArray(applications)) return [];

    const rawList = applications.filter((app) => {
      if (!app) return false;
      const appYear = String(app.academicYear || '2569');
      if (selectedAcademicYear !== 'all' && appYear !== selectedAcademicYear) return false;
      return app.status === 'awarded';
    });

    const seen = new Map<string, { app: ScholarshipApplication; score: number }>();
    for (const app of rawList) {
      if (!app) continue;
      const sid = app.studentId != null ? String(app.studentId).trim() : '';
      const fname = app.fullName != null ? String(app.fullName).trim() : '';
      const key = sid || fname || String(app.id || Math.random());
      let score = 0;
      try {
        const breakdown = calculateScholarshipScore(app);
        score = typeof breakdown?.totalScore === 'number' ? breakdown.totalScore : 0;
      } catch {
        score = 0;
      }

      if (!seen.has(key)) {
        seen.set(key, { app, score });
      } else {
        const existing = seen.get(key)!;
        if (score > existing.score) {
          seen.set(key, { app, score });
        }
      }
    }

    const parseRank = (val: any): number | null => {
      if (val === undefined || val === null || val === '') return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    return Array.from(seen.values())
      .sort((a, b) => {
        const rankA = parseRank(a.app.finalRank);
        const rankB = parseRank(b.app.finalRank);
        if (rankA !== null && rankB !== null) {
          if (rankA !== rankB) return rankA - rankB;
        } else if (rankA !== null) {
          return -1;
        } else if (rankB !== null) {
          return 1;
        }
        if (b.score !== a.score) return b.score - a.score;
        const sidA = a.app.studentId != null ? String(a.app.studentId) : '';
        const sidB = b.app.studentId != null ? String(b.app.studentId) : '';
        return sidA.localeCompare(sidB);
      })
      .map((item) => item.app);
  }, [applications, selectedAcademicYear]);

  // Filtered by department and search query
  const currentList = activeSubTab === 'interview' ? interviewCandidates : awardedRecipients;
  const filteredList = useMemo(() => {
    return currentList.filter((app) => {
      if (!app) return false;
      if (selectedDept !== 'all' && app.department !== selectedDept) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const sid = String(app.studentId || '').toLowerCase();
        const name = String(app.fullName || '').toLowerCase();
        const dept = String(app.department || '').toLowerCase();
        return sid.includes(q) || name.includes(q) || dept.includes(q);
      }
      return true;
    });
  }, [currentList, selectedDept, searchQuery]);

  // Stats calculation
  const totalAwardedBudget = useMemo(() => {
    return awardedRecipients.reduce((sum, a) => sum + (Number(a?.awardedAmount) || 10000), 0);
  }, [awardedRecipients]);

  const interviewDateStr =
    timelineConfig?.criticalNotice?.interviewDate ||
    timelineConfig?.steps?.find((s) => s.id === 'step-3')?.dateStr ||
    '15 ตุลาคม 2569 เวลา 17.00 น. เป็นต้นไป';

  const interviewLocationStr =
    timelineConfig?.criticalNotice?.interviewLocation ||
    timelineConfig?.steps?.find((s) => s.id === 'step-3')?.location ||
    'ห้องประชุมราชพฤกษ์ 1 คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร';

  // Date only for the table row column after student name (ตัดเวลา 17.00 น. ออก เหลือเฉพาะวันที่ 15 ตุลาคม 2569)
  const interviewDateTableStr = useMemo(() => {
    return (
      interviewDateStr
        .replace(/\s*\(?เวลา\s*17\.00\s*น\.[^)]*\)?/gi, '')
        .replace(/\s*\(?เวลา\s*\d{1,2}[:.]\d{2}\s*น\.[^)]*\)?/gi, '')
        .replace(/\s*เป็นต้นไป/gi, '')
        .replace(/\s*\(?\s*\)?/g, '')
        .trim() || '15 ตุลาคม 2569'
    );
  }, [interviewDateStr]);

  const awardDateStr =
    timelineConfig?.steps?.find((s) => s.id === 'step-5' || s.title?.includes('พิธีมอบทุน') || s.title?.includes('สถาปนา'))?.dateStr ||
    'วันศุกร์ที่ 6 พฤศจิกายน 2569 (เวลา 08.30 - 12.00 น.)';

  // Export announcement document as PDF via print preview
  const handleExportPdf = () => {
    setToastMessage('ระบบเปิดหน้าต่างพิมพ์ ให้เลือกเครื่องพิมพ์ปลายทางเป็น "บันทึกเป็น PDF" (Save as PDF)');
    setTimeout(() => setToastMessage(null), 4000);
    handlePrint();
  };

  // Robust isolated iframe printing
  const handlePrint = () => {
    const printContent = document.getElementById('printable-announcements-list');
    if (!printContent) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-announcement-iframe';
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

    const tabTitle = activeSubTab === 'interview' ? 'ประกาศรายชื่อผู้มีสิทธิ์สัมภาษณ์ทุน' : 'ประกาศรายชื่อผู้ได้รับทุนการศึกษา';

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${tabTitle}_คณะสังคมศาสตร์_${selectedAcademicYear}</title>
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
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d1d5db; padding: 6px 10px; }
            th { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          <div id="printable-announcements-list" class="space-y-6">
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-[#1C1C1E] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Announcement Header Card */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 shadow-xs border border-black/[0.06] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.05]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-[8px] bg-[#AF52DE]/15 text-[#AF52DE]">
                <Megaphone className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-[#AF52DE] uppercase tracking-wider">
                ประกาศผลทางการ คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] font-['Prompt',sans-serif] tracking-tight">
              ทำเนียบประกาศรายชื่อผู้สมัครทุนการศึกษา
            </h1>
            <p className="text-xs sm:text-sm text-[#8E8E93] mt-1">
              ประจำปีการศึกษา {selectedAcademicYear === 'all' ? (timelineConfig?.academicYear || '2569') : selectedAcademicYear} • งานกิจการนิสิตและศิษย์เก่าสัมพันธ์
            </p>
          </div>

          {/* Action Buttons: PDF Export & Print */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#34C759] hover:bg-[#2db24f] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs disabled:opacity-50"
              title="ดาวน์โหลดประกาศทางการเป็นไฟล์ PDF"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกประกาศ PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              title="สั่งพิมพ์ประกาศผ่านเครื่องพิมพ์"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ประกาศ</span>
            </button>
          </div>
        </div>

        {/* Segmented Control: 2 Main Announcement Tabs (แบบที่ 1) */}
        <div className="bg-[#F2F2F7] p-1.5 rounded-[20px] flex flex-col sm:flex-row items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab('interview')}
            className={`flex-1 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[16px] text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'interview'
                ? 'bg-white text-[#007AFF] shadow-sm scale-[1.01]'
                : 'text-[#636366] hover:text-[#1C1C1E]'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeSubTab === 'interview' ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`} />
            <span>1. ประกาศรายชื่อผู้มีสิทธิ์สัมภาษณ์ทุน</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeSubTab === 'interview' ? 'bg-[#007AFF]/12 text-[#007AFF]' : 'bg-black/5 text-[#8E8E93]'
              }`}
            >
              {interviewCandidates.length} คน
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('awarded')}
            className={`flex-1 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-[16px] text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'awarded'
                ? 'bg-white text-[#34C759] shadow-sm scale-[1.01]'
                : 'text-[#636366] hover:text-[#1C1C1E]'
            }`}
          >
            <Award className={`w-4 h-4 ${activeSubTab === 'awarded' ? 'text-[#34C759]' : 'text-[#8E8E93]'}`} />
            <span>2. ประกาศรายชื่อผู้ได้รับทุนการศึกษา</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeSubTab === 'awarded' ? 'bg-[#34C759]/15 text-[#248A3D]' : 'bg-black/5 text-[#8E8E93]'
              }`}
            >
              {awardedRecipients.length} คน
            </span>
          </button>
        </div>

        {/* Context Information Callout Banner based on Active Tab */}
        {activeSubTab === 'interview' ? (
          <div className="rounded-[22px] bg-[#007AFF]/[0.06] border border-[#007AFF]/20 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#007AFF]">
                <Calendar className="w-4 h-4" />
                <h3 className="text-xs sm:text-sm font-bold font-['Prompt',sans-serif]">
                  กำหนดการสัมภาษณ์ทุนการศึกษา
                </h3>
              </div>
              <p className="text-xs text-[#1C1C1E] font-medium">
                วันและเวลา:{' '}
                <strong className="text-[#007AFF] bg-[#007AFF]/10 px-1.5 py-0.5 rounded">
                  {interviewDateStr}
                </strong>{' '}
                • สถานที่: <strong>{interviewLocationStr}</strong>
              </p>
              <p className="text-[11px] text-[#FF3B30] font-semibold">
                * ข้อปฏิบัติ: นิสิตที่มีรายชื่อตามประกาศ กรุณาแต่งกายด้วยชุดนิสิตถูกระเบียบ และมาถึงก่อนเวลาอย่างน้อย 15 นาที
              </p>
            </div>

            <div className="shrink-0 bg-white px-4 py-2.5 rounded-[14px] border border-[#007AFF]/20 text-center">
              <div className="text-[10px] text-[#8E8E93]">ผู้มีสิทธิ์สัมภาษณ์ทั้งหมด</div>
              <div className="text-lg font-extrabold text-[#007AFF] font-mono">
                {interviewCandidates.length} <span className="text-xs font-normal">คน</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[22px] bg-gradient-to-r from-[#34C759]/10 via-[#34C759]/5 to-transparent border border-[#34C759]/25 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#248A3D]">
                <Sparkles className="w-4 h-4 text-[#34C759]" />
                <h3 className="text-xs sm:text-sm font-bold font-['Prompt',sans-serif]">
                  ขอแสดงความยินดีกับนิสิตผู้ได้รับอนุมัติทุนการศึกษา ประจำปีการศึกษา {selectedAcademicYear === 'all' ? (timelineConfig?.academicYear || '2569') : selectedAcademicYear}
                </h3>
              </div>
              <p className="text-xs text-[#1C1C1E] font-medium leading-relaxed">
                พิธีมอบทุนการศึกษา: ในงานวันคล้ายวันสถาปนาคณะสังคมศาสตร์ {awardDateStr}
                <br />
                📍 <strong>สถานที่:</strong> ณ โถงชั้น 1 อาคารคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
              </p>
              <div className="text-[11px] text-[#248A3D] space-y-0.5 mt-2 p-3 bg-white/80 rounded-xl border border-[#34C759]/20 shadow-2xs">
                <div className="font-bold text-[#166534]">📝 เอกสารที่ต้องเตรียม:</div>
                <div className="pl-1">▫️ สำเนาบัตรประชาชน 1 ฉบับ</div>
                <div className="pl-1">▫️ สำเนาหน้าบัญชีธนาคาร 1 ฉบับ</div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <div className="bg-white px-4 py-2.5 rounded-[14px] border border-[#34C759]/20 text-center">
                <div className="text-[10px] text-[#8E8E93]">ผู้ได้รับทุนทั้งหมด</div>
                <div className="text-lg font-extrabold text-[#34C759] font-mono">
                  {awardedRecipients.length} <span className="text-xs font-normal">คน</span>
                </div>
              </div>
              <div className="bg-white px-4 py-2.5 rounded-[14px] border border-[#34C759]/20 text-center">
                <div className="text-[10px] text-[#8E8E93]">งบประมาณจัดสรรรวม</div>
                <div className="text-lg font-extrabold text-[#1C1C1E] font-mono">
                  ฿{totalAwardedBudget.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-[#F8F9FA] rounded-[20px] p-3.5 border border-black/[0.04] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-[#8E8E93] mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>กรอง:</span>
            </div>

            {/* Academic Year Filter */}
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="px-3 py-1.5 rounded-full border border-[#007AFF]/25 bg-white text-xs font-bold text-[#007AFF] outline-none cursor-pointer"
            >
              <option value="all">ปีการศึกษา: ทั้งหมด</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  ปีการศึกษา {yr} {yr === (timelineConfig?.academicYear || '2569') ? '(รอบปัจจุบัน)' : ''}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 rounded-full border border-black/[0.08] bg-white text-xs font-medium text-[#1C1C1E] outline-none cursor-pointer"
            >
              <option value="all">ทุกภาควิชา (5 ภาควิชา)</option>
              {OFFICIAL_DEPARTMENTS_2569.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหารหัสนิสิต, ชื่อ-สกุล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/15 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Printable Official Announcement Document Area */}
      <div
        id="printable-announcements-list"
        className="bg-white rounded-[28px] p-6 sm:p-10 shadow-xs border border-black/[0.06] space-y-6"
      >
        {/* Official Letterhead Header for Print / PDF */}
        <div className="text-center pb-6 border-b-2 border-[#1C1C1E] space-y-2 page-break-inside-avoid">
          <div className="w-12 h-12 rounded-[16px] bg-[#1C1C1E] text-[#FF9500] flex items-center justify-center font-bold text-xl shadow-md mx-auto mb-2 print:bg-white print:border print:border-black">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-['Prompt',sans-serif] text-[#1C1C1E]">
            ประกาศคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
          </h2>
          <h3 className="text-sm sm:text-base font-semibold text-[#48484A]">
            เรื่อง {activeSubTab === 'interview' ? 'รายชื่อนิสิตผู้มีสิทธิ์เข้ารับการสัมภาษณ์ทุนการศึกษา' : 'รายชื่อนิสิตผู้ได้รับอนุมัติทุนการศึกษา'}
          </h3>
          <p className="text-xs text-[#8E8E93]">
            สำหรับนิสิตที่ขาดแคลนทุนทรัพย์ ประจำปีการศึกษา {selectedAcademicYear === 'all' ? (timelineConfig?.academicYear || '2569') : selectedAcademicYear}
          </p>
        </div>

        {/* Announcement Summary Details for Print */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F8F9FA] p-4 rounded-[16px] border border-black/[0.05] page-break-inside-avoid">
          {activeSubTab === 'interview' ? (
            <>
              <div>
                <span className="text-[#8E8E93]">วันและเวลาสัมภาษณ์: </span>
                <strong className="text-[#1C1C1E]">{interviewDateStr}</strong>
              </div>
              <div>
                <span className="text-[#8E8E93]">สถานที่สัมภาษณ์: </span>
                <strong className="text-[#1C1C1E]">{interviewLocationStr}</strong>
              </div>
              <div className="sm:col-span-2 text-[#FF3B30] font-medium">
                * หมายเหตุ: นิสิตที่ไม่มาเข้ารับการสัมภาษณ์ตามวัน เวลา และสถานที่ดังกล่าว จะถือว่าสละสิทธิ์ในการขอรับทุน
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-[#8E8E93]">กำหนดการมอบทุน: </span>
                <strong className="text-[#1C1C1E]">วันสถาปนาคณะสังคมศาสตร์ {awardDateStr}</strong>
              </div>
              <div>
                <span className="text-[#8E8E93]">สถานที่จัดพิธี: </span>
                <strong className="text-[#1C1C1E]">ณ โถงชั้น 1 อาคารคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร</strong>
              </div>
              <div className="sm:col-span-2 text-[#248A3D] font-medium space-y-1 pt-1 border-t border-black/[0.05]">
                <div className="font-bold text-[#166534]">
                  📝 เอกสารที่ต้องเตรียม: ▫️ สำเนาบัตรประชาชน 1 ฉบับ &nbsp;&bull;&nbsp; ▫️ สำเนาหน้าบัญชีธนาคาร 1 ฉบับ
                </div>
                <div className="text-[#636366] text-[11px] font-normal">
                  * ขอให้นิสิตผู้มีรายชื่อเตรียมความพร้อมในการเข้าร่วมพิธีมอบทุนและลงนามเอกสารตามที่งานกิจการนิสิตฯ นัดหมาย
                </div>
              </div>
            </>
          )}
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto rounded-[20px] border border-black/[0.08]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2F2F7] text-[#1C1C1E] font-bold border-b border-black/[0.06]">
              <tr>
                <th className="py-3 px-3.5 text-center w-12">ลำดับ</th>
                <th className="py-3 px-3.5">รหัสนิสิต</th>
                <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                <th className="py-3 px-4">ภาควิชา</th>
                <th className="py-3 px-3">ชั้นปี</th>
                {activeSubTab === 'interview' ? (
                  <>
                    <th className="py-3 px-4">กำหนดการสัมภาษณ์</th>
                    <th className="py-3 px-3 text-center">สถานะ</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4 text-right">จำนวนเงินทุน</th>
                    <th className="py-3 px-4 text-center">กำหนดมอบทุน</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8E8E93] text-xs">
                    {searchQuery.trim() || selectedDept !== 'all'
                      ? 'ไม่พบข้อมูลนิสิตที่ตรงกับเงื่อนไขการค้นหา'
                      : activeSubTab === 'interview'
                      ? 'ยังไม่มีการประกาศรายชื่อผู้มีสิทธิ์สัมภาษณ์ในรอบนี้ หรืออยู่ระหว่างการตรวจสอบ'
                      : 'ยังไม่มีการประกาศรายชื่อผู้ได้รับทุนในรอบนี้ หรืออยู่ระหว่างการสรุปผล'}
                  </td>
                </tr>
              ) : (
                filteredList.map((app, index) => (
                  <tr key={app.id || index} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3 px-3.5 text-center font-mono font-bold text-[#8E8E93]">
                      {app.finalRank !== undefined && app.finalRank !== null && String(app.finalRank).trim() !== ''
                        ? Number(app.finalRank)
                        : index + 1}
                    </td>
                    <td className="py-3 px-3.5 font-mono font-bold text-[#007AFF]">
                      {app.studentId || '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1C1C1E]">
                      {app.fullName}
                    </td>
                    <td className="py-3 px-4 text-[#636366]">
                      {app.department}
                    </td>
                    <td className="py-3 px-3 text-[#636366]">
                      {app.studyYear}
                    </td>

                    {activeSubTab === 'interview' ? (
                      <>
                        <td className="py-3 px-4 text-[#1C1C1E]">
                          <div className="font-semibold text-xs">{interviewDateTableStr}</div>
                          <div className="text-[11px] text-[#8E8E93] truncate max-w-[200px]">
                            {interviewLocationStr}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              app.status === 'interviewed' || app.status === 'awarded'
                                ? 'bg-[#34C759]/15 text-[#248A3D]'
                                : 'bg-[#007AFF]/12 text-[#007AFF]'
                            }`}
                          >
                            {app.status === 'interviewed' || app.status === 'awarded'
                              ? 'สัมภาษณ์แล้ว'
                              : 'มีสิทธิ์สัมภาษณ์'}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 text-right font-mono font-bold text-[#248A3D]">
                          ฿{(app.awardedAmount || 10000).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#34C759]/15 text-[#248A3D] border border-[#34C759]/30">
                            ศุกร์ที่ 6 พ.ย. 2569 (08.30 - 12.00 น.)
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Sign-off Footer Area for Print */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-10 border-t border-black/[0.1] text-xs">
          <div className="text-center space-y-10">
            <p>ลงชื่อ..............................................................</p>
            <p>
              (..............................................................)
              <br />
              หัวหน้างานกิจการนิสิตและศิษย์เก่าสัมพันธ์
            </p>
          </div>
          <div className="text-center space-y-10">
            <p>ลงชื่อ..............................................................</p>
            <p>
              (..............................................................)
              <br />
              คณบดีคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
