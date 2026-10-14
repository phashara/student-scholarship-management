import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  HelpCircle,
  Lock,
  Megaphone,
  Radio,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ScholarshipSystemPhase, TimelineConfig } from '../types';

interface LifecyclePhaseControlProps {
  timelineConfig: TimelineConfig;
  onUpdateConfig: (updated: TimelineConfig) => void;
}

const PHASES: {
  id: ScholarshipSystemPhase;
  stepNumber: number;
  label: string;
  shortLabel: string;
  description: string;
  publicEffect: string;
  colorClass: string;
  activeBg: string;
  activeBorder: string;
  badgeBg: string;
  icon: any;
}[] = [
  {
    id: 'open',
    stepNumber: 1,
    label: 'เปิดรับสมัครทุนการศึกษา',
    shortLabel: 'เปิดรับสมัคร',
    description: 'นิสิตสามารถกรอกใบสมัคร แนบไฟล์เอกสาร และส่งเข้าระบบได้ตามปกติ',
    publicEffect: 'หน้าแรกเข้าสู่ฟอร์มกรอกใบสมัคร',
    colorClass: 'text-[#34C759]',
    activeBg: 'bg-[#34C759]/10',
    activeBorder: 'border-[#34C759]',
    badgeBg: 'bg-[#34C759] text-white',
    icon: Calendar,
  },
  {
    id: 'closed_screening',
    stepNumber: 2,
    label: 'ปิดรับสมัครแล้ว (อยู่ระหว่างคัดกรอง)',
    shortLabel: 'ปิดรับสมัคร & คัดกรอง',
    description: 'สิ้นสุดระยะเวลารับสมัคร ล็อกฟอร์มไม่ให้ส่งใหม่ คณะกรรมการตรวจสอบเอกสารและคะแนนความเดือดร้อน',
    publicEffect: 'แท็บใบสมัครจะแสดงหน้าจอแจ้งปิดรับสมัครอย่างเป็นทางการ พร้อมแนะนำให้นิสิตเช็กสถานะ',
    colorClass: 'text-[#FF9500]',
    activeBg: 'bg-[#FF9500]/10',
    activeBorder: 'border-[#FF9500]',
    badgeBg: 'bg-[#FF9500] text-white',
    icon: Lock,
  },
  {
    id: 'interview_announced',
    stepNumber: 3,
    label: 'ประกาศผู้มีสิทธิ์สัมภาษณ์แล้ว',
    shortLabel: 'ประกาศสัมภาษณ์',
    description: 'ประกาศรายชื่อผู้มีสิทธิ์เข้ารับการสัมภาษณ์ทุน นิสิตตรวจสอบวัน เวลา และสถานที่สัมภาษณ์',
    publicEffect: 'มุ่งเน้นตารางประกาศรายชื่อสัมภาษณ์และสถานที่',
    colorClass: 'text-[#AF52DE]',
    activeBg: 'bg-[#AF52DE]/10',
    activeBorder: 'border-[#AF52DE]',
    badgeBg: 'bg-[#AF52DE] text-white',
    icon: Megaphone,
  },
  {
    id: 'awarded',
    stepNumber: 4,
    label: 'ประกาศผลการจัดสรรทุนเสร็จสิ้น',
    shortLabel: 'จัดสรรทุนเสร็จสิ้น',
    description: 'คณะกรรมการพิจารณาอนุมัติทุนครบถ้วน นิสิตตรวจสอบผลการอนุมัติและเตรียมรับทุนการศึกษา',
    publicEffect: 'ประกาศผลผู้ได้รับทุนอย่างเป็นทางการ สิ้นสุดรอบปีการศึกษา',
    colorClass: 'text-[#007AFF]',
    activeBg: 'bg-[#007AFF]/10',
    activeBorder: 'border-[#007AFF]',
    badgeBg: 'bg-[#007AFF] text-white',
    icon: Award,
  },
];

export const LifecyclePhaseControl: React.FC<LifecyclePhaseControlProps> = ({
  timelineConfig,
  onUpdateConfig,
}) => {
  const currentPhase: ScholarshipSystemPhase = timelineConfig?.systemPhase || 'closed_screening';
  const academicYear = timelineConfig?.academicYear || '2569';
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState(
    timelineConfig?.closedNoticeTitle || `ปิดรับสมัครทุนการศึกษา ประจำปีการศึกษา ${academicYear} แล้ว`
  );
  const [noticeMessage, setNoticeMessage] = useState(
    timelineConfig?.closedNoticeMessage ||
      `ขณะนี้สิ้นสุดระยะเวลาการยื่นแบบคำขอรับทุนการศึกษาตามประกาศคณะสังคมศาสตร์แล้ว คณะกรรมการกำลังอยู่ระหว่างการตรวจสอบเอกสารและประเมินคุณสมบัติของผู้สมัครทั้งหมด`
  );
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSelectPhase = (phaseId: ScholarshipSystemPhase) => {
    if (phaseId === currentPhase) return;
    const phaseObj = PHASES.find((p) => p.id === phaseId);
    const updated: TimelineConfig = {
      ...timelineConfig,
      systemPhase: phaseId,
      lastUpdatedAt: new Date().toLocaleString('th-TH'),
      lastUpdatedBy: 'ผู้ดูแลระบบ (Admin Phase Switch)',
    };
    onUpdateConfig(updated);
    setFeedback(`ปรับสถานะระบบเป็น "${phaseObj?.shortLabel}" เรียบร้อยแล้ว`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveNoticeText = () => {
    const updated: TimelineConfig = {
      ...timelineConfig,
      closedNoticeTitle: noticeTitle.trim(),
      closedNoticeMessage: noticeMessage.trim(),
      lastUpdatedAt: new Date().toLocaleString('th-TH'),
      lastUpdatedBy: 'ผู้ดูแลระบบ (Admin Notice Edit)',
    };
    onUpdateConfig(updated);
    setIsEditingNotice(false);
    setFeedback('บันทึกข้อความประกาศปิดรับสมัครเรียบร้อยแล้ว');
    setTimeout(() => setFeedback(null), 3000);
  };

  const currentObj = PHASES.find((p) => p.id === currentPhase) || PHASES[1];

  return (
    <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-black/[0.06] shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/[0.05] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1C1C1E] font-['Prompt',sans-serif] flex items-center gap-2">
              <span>สถานะรอบการดำเนินงานทุนการศึกษา (Academic Year Lifecycle)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 font-mono text-[#636366]">
                ปี {academicYear}
              </span>
            </h3>
            <p className="text-xs text-[#8E8E93]">
              ทุนเปิดปีละ 1 ครั้ง แอดมินสามารถคลิกสลับระยะการดำเนินงานได้ทันที ระบบจะปรับหน้าบ้านให้โดยอัตโนมัติ
            </p>
          </div>
        </div>

        {feedback && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34C759]/15 text-[#248A3D] text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* 4 Phase Stepper Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PHASES.map((phase) => {
          const isSelected = phase.id === currentPhase;
          const Icon = phase.icon;

          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => handleSelectPhase(phase.id)}
              className={`p-3.5 rounded-[20px] text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? `${phase.activeBg} ${phase.activeBorder} shadow-xs ring-2 ring-black/5`
                  : 'bg-[#F2F2F7]/60 hover:bg-[#F2F2F7] border-transparent text-[#636366]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected ? phase.badgeBg : 'bg-black/10 text-[#636366]'
                    }`}
                  >
                    ระยะที่ {phase.stepNumber}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#1C1C1E]">
                      <Check className="w-3.5 h-3.5 text-[#34C759]" />
                      <span>สถานะปัจจุบัน</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? phase.colorClass : 'text-[#8E8E93]'}`} />
                  <span
                    className={`text-xs sm:text-sm font-bold font-['Prompt',sans-serif] ${
                      isSelected ? 'text-[#1C1C1E]' : 'text-[#3C3C43]'
                    }`}
                  >
                    {phase.shortLabel}
                  </span>
                </div>

                <p className="text-[11px] text-[#636366] leading-relaxed line-clamp-2">
                  {phase.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-black/[0.04] text-[10px] text-[#8E8E93]">
                <span className="font-medium">ผลต่อหน้าบ้าน:</span> {phase.publicEffect}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail & Notice Customizer (if closed_screening) */}
      {currentPhase === 'closed_screening' && (
        <div className="rounded-[20px] bg-amber-500/10 border border-amber-500/20 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <Lock className="w-4 h-4 text-amber-700" />
              <span>การแสดงผลเมื่อปิดรับสมัครแล้ว: หน้าฟอร์มจะล็อกและแสดงข้อความชี้แจงแก่นิสิต</span>
            </div>

            <button
              type="button"
              onClick={() => setIsEditingNotice(!isEditingNotice)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingNotice ? 'ยกเลิกแก้ไข' : 'ปรับแก้ข้อความชี้แจง'}</span>
            </button>
          </div>

          {isEditingNotice ? (
            <div className="space-y-2 pt-2 border-t border-amber-500/20">
              <div>
                <label className="text-[11px] font-bold text-amber-950 block mb-1">หัวข้อประกาศปิดรับสมัคร</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-amber-500/30 bg-white text-xs text-[#1C1C1E] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-amber-950 block mb-1">รายละเอียดข้อความชี้แจง</label>
                <textarea
                  rows={2}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-amber-500/30 bg-white text-xs text-[#1C1C1E] outline-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveNoticeText}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกข้อความ</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-900/80 leading-relaxed">
              &quot;{timelineConfig?.closedNoticeMessage || noticeMessage}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
};
