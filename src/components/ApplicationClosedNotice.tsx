import React from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Lock,
  Megaphone,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { TimelineConfig } from '../types';

interface ApplicationClosedNoticeProps {
  timelineConfig: TimelineConfig;
  onGoToStatus: () => void;
  onGoToAnnouncements: () => void;
  onGoToTimeline: () => void;
}

export const ApplicationClosedNotice: React.FC<ApplicationClosedNoticeProps> = ({
  timelineConfig,
  onGoToStatus,
  onGoToAnnouncements,
  onGoToTimeline,
}) => {
  const academicYear = timelineConfig?.academicYear || '2569';
  const nextYear = String(parseInt(academicYear, 10) + 1);
  const interviewDate =
    timelineConfig?.criticalNotice?.interviewDate || '15 ตุลาคม 2569 เวลา 17.00 น. เป็นต้นไป';
  const interviewLocation =
    timelineConfig?.criticalNotice?.interviewLocation ||
    'ห้องประชุมราชพฤกษ์ 1 อาคารคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร';
  const contactPhone = timelineConfig?.contactPhone || '055-961911';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Main Notice Hero Card */}
      <div className="bg-white rounded-[32px] p-6 sm:p-10 border border-black/[0.08] shadow-sm relative overflow-hidden">
        {/* Soft Background Tint */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-2xl mx-auto space-y-5">
          {/* Status Capsule */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 text-xs sm:text-sm font-bold shadow-xs">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>ปิดรับสมัครประจำปีการศึกษา {academicYear} แล้ว</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C1C1E] font-['Prompt',sans-serif] tracking-tight leading-tight">
            {timelineConfig?.closedNoticeTitle || `ปิดรับสมัครทุนการศึกษา ประจำปีการศึกษา ${academicYear}`}
          </h1>

          <p className="text-sm sm:text-base text-[#636366] leading-relaxed">
            {timelineConfig?.closedNoticeMessage ||
              `ขณะนี้สิ้นสุดระยะเวลาการยื่นแบบคำขอรับทุนการศึกษาตามประกาศคณะสังคมศาสตร์แล้ว คณะกรรมการกำลังอยู่ระหว่างการตรวจสอบเอกสารและประเมินคุณสมบัติของผู้สมัครทั้งหมด`}
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGoToStatus}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#34C759] hover:bg-[#2FB34F] text-white text-sm font-bold shadow-sm shadow-[#34C759]/25 transition-all active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>ติดตามสถานะใบสมัคร (สำหรับผู้ที่ยื่นแล้ว)</span>
            </button>

            <button
              type="button"
              onClick={onGoToAnnouncements}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#AF52DE] hover:bg-[#9B42C8] text-white text-sm font-bold shadow-sm shadow-[#AF52DE]/25 transition-all active:scale-95 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>ประกาศรายชื่อผู้มีสิทธิ์สัมภาษณ์</span>
            </button>
          </div>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Annual Cycle Explanation */}
        <div className="bg-white rounded-[26px] p-6 border border-black/[0.06] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
            ระบบเปิดรับสมัครปีละ 1 ครั้ง
          </h3>
          <p className="text-xs sm:text-sm text-[#636366] leading-relaxed">
            ทุนการศึกษาคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร มีการเปิดรับสมัครปีละ 1 ครั้ง ในช่วงต้นภาคเรียนที่ 1 ของทุกปีการศึกษา
          </p>
          <div className="p-3.5 rounded-2xl bg-[#F2F2F7] text-xs text-[#3C3C43] space-y-1">
            <span className="font-semibold block text-[#1C1C1E]">สำหรับนิสิตที่สมัครไม่ทันรอบนี้:</span>
            <span>สามารถเตรียมความพร้อมเอกสารและติดตามการเปิดรับสมัครรอบถัดไปสำหรับ <strong>ปีการศึกษา {nextYear}</strong> ได้ทางเว็บไซต์และบอร์ดประชาสัมพันธ์คณะ</span>
          </div>
        </div>

        {/* Card 2: Next Milestones & Interview */}
        <div className="bg-white rounded-[26px] p-6 border border-black/[0.06] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
            ขั้นตอนต่อไปสำหรับผู้สมัคร
          </h3>
          <ul className="text-xs sm:text-sm text-[#636366] space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span><strong>คัดกรองคุณสมบัติ & เอกสาร:</strong> คณะกรรมการตรวจสอบหลักฐานและคำนวณคะแนนความจำเป็น</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span><strong>ประกาศผู้มีสิทธิ์สัมภาษณ์:</strong> ตรวจสอบรายชื่อได้ในแท็บ &quot;ประกาศรายชื่อ&quot;</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <span><strong>วันสอบสัมภาษณ์ทุน:</strong></span>
                <span className="block text-amber-900 font-semibold">{interviewDate}</span>
                <span className="text-[11px] text-[#8E8E93]">{interviewLocation}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Contact & Support Footer Card */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-[24px] p-5 border border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-full bg-black/[0.05] flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-[#1C1C1E]" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#1C1C1E] block">มีข้อสงสัยเกี่ยวกับผลการคัดเลือกหรือการสัมภาษณ์?</span>
            <span className="text-xs text-[#8E8E93]">
              ติดต่อ หน่วยกิจการนิสิตและศิษย์เก่าสัมพันธ์ คณะสังคมศาสตร์ โทร. <strong className="text-[#007AFF]">{contactPhone}</strong>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToTimeline}
          className="text-xs font-bold text-[#007AFF] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>ดูปฏิทินกำหนดการทั้งหมด</span>
          <Calendar className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
