import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  FilePenLine,
  FileText,
  GraduationCap,
  HelpCircle,
  MapPin,
  Megaphone,
  Phone,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { AnnouncementItem, TimelineConfig } from '../types';
import { resetTimelineConfig } from '../data/scholarshipData';

interface TimelineEditorModalProps {
  initialConfig: TimelineConfig;
  onSave: (config: TimelineConfig) => void;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  { name: 'FilePenLine', label: 'กรอกใบสมัคร', icon: FilePenLine },
  { name: 'Megaphone', label: 'ประกาศรายชื่อ', icon: Megaphone },
  { name: 'Users', label: 'สัมภาษณ์', icon: Users },
  { name: 'Award', label: 'พิจารณาผล/มอบรางวัล', icon: Award },
  { name: 'GraduationCap', label: 'พิธีมอบทุน', icon: GraduationCap },
  { name: 'Calendar', label: 'ปฏิทินทั่วไป', icon: Calendar },
  { name: 'Clock', label: 'กำหนดเวลา', icon: Clock },
];

export const TimelineEditorModal: React.FC<TimelineEditorModalProps> = ({
  initialConfig,
  onSave,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'banner' | 'requirements'>('steps');
  const [config, setConfig] = useState<TimelineConfig>(() => JSON.parse(JSON.stringify(initialConfig)));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  // Steps Handlers
  const handleStepChange = (index: number, field: keyof AnnouncementItem, value: any) => {
    setConfig((prev) => {
      const nextSteps = [...prev.steps];
      nextSteps[index] = {
        ...nextSteps[index],
        [field]: value,
      };
      return { ...prev, steps: nextSteps };
    });
  };

  const handleAddStep = () => {
    const newStep: AnnouncementItem = {
      id: `step-${Date.now()}`,
      dateStr: 'ระบุวันและเวลา',
      title: 'ขั้นตอนใหม่',
      subtitle: 'รายละเอียดขั้นตอนการดำเนินงาน',
      iconName: 'Calendar',
      highlight: false,
    };
    setConfig((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const handleDeleteStep = (index: number) => {
    if (config.steps.length <= 1) {
      showNotice('ต้องมีขั้นตอนกำหนดการอย่างน้อย 1 ขั้นตอน');
      return;
    }
    setConfig((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= config.steps.length) return;

    setConfig((prev) => {
      const nextSteps = [...prev.steps];
      const temp = nextSteps[index];
      nextSteps[index] = nextSteps[targetIndex];
      nextSteps[targetIndex] = temp;
      return { ...prev, steps: nextSteps };
    });
  };

  // Qualifications Handlers
  const handleQualificationChange = (index: number, val: string) => {
    setConfig((prev) => {
      const next = [...prev.qualifications];
      next[index] = val;
      return { ...prev, qualifications: next };
    });
  };

  const handleAddQualification = () => {
    setConfig((prev) => ({
      ...prev,
      qualifications: [...prev.qualifications, ''],
    }));
  };

  const handleDeleteQualification = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
  };

  // Required Documents Handlers
  const handleDocumentChange = (index: number, val: string) => {
    setConfig((prev) => {
      const next = [...prev.requiredDocuments];
      next[index] = val;
      return { ...prev, requiredDocuments: next };
    });
  };

  const handleAddDocument = () => {
    setConfig((prev) => ({
      ...prev,
      requiredDocuments: [...prev.requiredDocuments, ''],
    }));
  };

  const handleDeleteDocument = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index),
    }));
  };

  // Reset to default
  const handleResetToDefault = () => {
    const restored = resetTimelineConfig();
    setConfig(JSON.parse(JSON.stringify(restored)));
    showNotice('คืนค่ากำหนดการเริ่มต้นเรียบร้อยแล้ว กรุณากด "บันทึกข้อมูลกำหนดการ"');
  };

  // Start Next Academic Year (+1 Year)
  const handleStartNextAcademicYear = () => {
    const currentYrNum = parseInt(config.academicYear || '2569', 10);
    const nextYr = String(isNaN(currentYrNum) ? 2570 : currentYrNum + 1);
    const oldYrStr = String(config.academicYear || '2569');

    setConfig((prev) => {
      const updatedSteps = prev.steps.map((st) => ({
        ...st,
        dateStr: st.dateStr.replace(new RegExp(oldYrStr, 'g'), nextYr),
        title: st.title.replace(new RegExp(oldYrStr, 'g'), nextYr),
        subtitle: st.subtitle.replace(new RegExp(oldYrStr, 'g'), nextYr),
      }));

      return {
        ...prev,
        academicYear: nextYr,
        heroTitle: `เปิดรับสมัครทุนการศึกษา ประจำปีการศึกษา ${nextYr}`,
        criticalNotice: {
          ...prev.criticalNotice,
          interviewDate: prev.criticalNotice.interviewDate.replace(new RegExp(oldYrStr, 'g'), nextYr),
        },
        steps: updatedSteps,
      };
    });

    showNotice(`สลับปีการศึกษาเป็น ${nextYr} เรียบร้อย กรุณาตรวจสอบวันเวลาและกด "บันทึกข้อมูลกำหนดการ"`);
  };

  // Save handler
  const handleSave = () => {
    onSave(config);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-[28px] shadow-2xl border border-black/[0.08] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Banner Notice */}
        {bannerNotice && (
          <div className="bg-[#007AFF] text-white text-xs px-4 py-2 font-medium flex items-center justify-between animate-fadeIn">
            <span>{bannerNotice}</span>
            <button type="button" onClick={() => setBannerNotice(null)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-black/[0.06] flex items-center justify-between bg-[#F2F2F7]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[14px] bg-[#FF9500]/15 text-[#b06000] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold font-['Prompt',sans-serif] text-[#1C1C1E]">
                  แก้ไขกำหนดการ & ข้อมูลรับสมัคร (Admin Schedule Editor)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9500]/15 text-[#b06000]">
                  โหมดแอดมิน
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">
                ปรับแต่งกำหนดการสัมภาษณ์ ประกาศผล วันสถาปนาคณะ และเงื่อนไขการรับสมัคร
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartNextAcademicYear}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF9500] to-[#FF2D55] text-white text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              title={`คลิกเพื่อสลับปีการศึกษาเป็นปีถัดไปอัตโนมัติ (ปัจจุบัน: ปี ${config.academicYear || '2569'})`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>เปิดปีใหม่ (+1) • ปี {config.academicYear || '2569'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 pt-3 border-b border-black/[0.05] bg-white">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('steps')}
              className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'steps'
                  ? 'bg-[#FF9500] text-white shadow-xs'
                  : 'bg-[#F2F2F7] text-[#636366] hover:text-[#1C1C1E]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>1. ขั้นตอนและกำหนดการ ({config.steps.length} ขั้นตอน)</span>
            </button>
            <button
              onClick={() => setActiveTab('banner')}
              className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'banner'
                  ? 'bg-[#FF9500] text-white shadow-xs'
                  : 'bg-[#F2F2F7] text-[#636366] hover:text-[#1C1C1E]'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>2. หัวข้อประกาศ & หมายเหตุสัมภาษณ์</span>
            </button>
            <button
              onClick={() => setActiveTab('requirements')}
              className={`px-4 py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'requirements'
                  ? 'bg-[#FF9500] text-white shadow-xs'
                  : 'bg-[#F2F2F7] text-[#636366] hover:text-[#1C1C1E]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>3. คุณสมบัติ & เอกสาร ({config.qualifications.length + config.requiredDocuments.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#1C1C1E]">
                    ขั้นตอนกำหนดการรับสมัครทุน (Timeline Steps)
                  </h4>
                  <p className="text-xs text-[#8E8E93]">
                    สามารถแก้ไขวันเวลา เพิ่ม ลบ หรือเปลี่ยนลำดับของขั้นตอนได้ตามประกาศจริง
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#007AFF] text-white hover:bg-[#0071EB] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มขั้นตอน</span>
                </button>
              </div>

              <div className="space-y-3">
                {config.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`rounded-[20px] p-4 sm:p-5 border transition-all ${
                      step.highlight
                        ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                        : 'bg-[#F2F2F7]/50 border-black/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.05] mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#1C1C1E] text-white text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#1C1C1E]">
                          ขั้นตอนที่ {idx + 1}
                        </span>
                        {step.highlight && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9500]/15 text-[#b06000]">
                            ขั้นตอนสำคัญ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded-md text-[#8E8E93] hover:text-[#1C1C1E] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          title="เลื่อนขึ้น"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveStep(idx, 'down')}
                          disabled={idx === config.steps.length - 1}
                          className="p-1 rounded-md text-[#8E8E93] hover:text-[#1C1C1E] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          title="เลื่อนลง"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(idx)}
                          className="p-1 rounded-md text-[#FF3B30] hover:bg-[#FF3B30]/10 cursor-pointer ml-1"
                          title="ลบขั้นตอนนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* วันที่และเวลา */}
                      <div>
                        <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                          วันที่และระยะเวลา
                        </label>
                        <input
                          type="text"
                          value={step.dateStr}
                          onChange={(e) => handleStepChange(idx, 'dateStr', e.target.value)}
                          placeholder="เช่น 23 กันยายน 2569 (เวลา 17.00 น.)"
                          className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                        />
                      </div>

                      {/* ไอคอนและไฮไลต์ */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                            รูปแบบไอคอน
                          </label>
                          <select
                            value={step.iconName}
                            onChange={(e) => handleStepChange(idx, 'iconName', e.target.value)}
                            className="w-full text-xs px-2.5 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                          >
                            {AVAILABLE_ICONS.map((ic) => (
                              <option key={ic.name} value={ic.name}>
                                {ic.label} ({ic.name})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="pt-5">
                          <label className="inline-flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!step.highlight}
                              onChange={(e) => handleStepChange(idx, 'highlight', e.target.checked)}
                              className="w-4 h-4 text-[#FF9500] rounded focus:ring-[#FF9500]"
                            />
                            <span className="text-xs font-medium text-[#1C1C1E]">
                              ไฮไลต์สำคัญ
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* ชื่อขั้นตอน */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                          ชื่อขั้นตอน (Title)
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                          placeholder="เช่น สัมภาษณ์ทุนการศึกษา"
                          className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF9500] font-semibold"
                        />
                      </div>

                      {/* คำบรรยาย */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                          คำอธิบายขั้นตอน (Subtitle)
                        </label>
                        <textarea
                          rows={2}
                          value={step.subtitle}
                          onChange={(e) => handleStepChange(idx, 'subtitle', e.target.value)}
                          placeholder="รายละเอียดขั้นตอนและคำแนะนำสำหรับนิสิต"
                          className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                        />
                      </div>

                      {/* สถานที่ */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-[#1C1C1E] mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#007AFF]" />
                          <span>สถานที่จัดกิจกรรม (ถ้ามี เช่น ห้องประชุมราชพฤกษ์ 3)</span>
                        </label>
                        <input
                          type="text"
                          value={step.location || ''}
                          onChange={(e) => handleStepChange(idx, 'location', e.target.value)}
                          placeholder="ระบุสถานที่ หรือเว้นว่างหากไม่มี"
                          className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BANNER & CRITICAL NOTICE */}
          {activeTab === 'banner' && (
            <div className="space-y-6">
              {/* ส่วนหัวประกาศ (Hero Banner) */}
              <div className="bg-[#F2F2F7]/50 rounded-[20px] p-5 border border-black/[0.06] space-y-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-[#007AFF]" />
                  <h4 className="text-sm font-bold text-[#1C1C1E]">
                    หัวข้อประกาศหลัก (Hero Banner Header)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                      ชื่อประกาศ / หัวเรื่อง
                    </label>
                    <input
                      type="text"
                      value={config.heroTitle}
                      onChange={(e) => setConfig((prev) => ({ ...prev, heroTitle: e.target.value }))}
                      className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF9500] font-semibold"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#1C1C1E]">
                        ปีการศึกษา
                      </label>
                      <button
                        type="button"
                        onClick={handleStartNextAcademicYear}
                        className="text-[10px] font-bold text-[#FF9500] hover:text-[#d97706] hover:underline cursor-pointer flex items-center gap-0.5"
                        title="ปรับเป็นปีการศึกษาถัดไปอัตโนมัติ (+1 ปี) เช่น 2570"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>เปิดปีใหม่ (+1)</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={config.academicYear}
                      onChange={(e) => setConfig((prev) => ({ ...prev, academicYear: e.target.value }))}
                      className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF9500] font-bold text-[#FF9500]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                      คำบรรยายประกาศ
                    </label>
                    <textarea
                      rows={2}
                      value={config.heroSubtitle}
                      onChange={(e) => setConfig((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                      className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1E] mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#34C759]" />
                      <span>เบอร์โทรศัพท์ติดต่อ</span>
                    </label>
                    <input
                      type="text"
                      value={config.contactPhone}
                      onChange={(e) => setConfig((prev) => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="055-961911"
                      className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF9500]"
                    />
                  </div>
                </div>
              </div>

              {/* กล่องเตือนเงื่อนไขสำคัญ (Critical Alert Notice) */}
              <div className="bg-[#FFF2F2] rounded-[20px] p-5 border border-[#FF3B30]/20 space-y-4">
                <div className="flex items-center gap-2 text-[#FF3B30]">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="text-sm font-bold">
                    หมายเหตุสำคัญและเงื่อนไขการสละสิทธิ์ (Critical Warning Box)
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                      หัวข้อกล่องเตือน
                    </label>
                    <input
                      type="text"
                      value={config.criticalNotice.title}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          criticalNotice: { ...prev.criticalNotice, title: e.target.value },
                        }))
                      }
                      className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF3B30] font-semibold text-[#FF3B30]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                      ข้อความเตือน / เงื่อนไข
                    </label>
                    <textarea
                      rows={2}
                      value={config.criticalNotice.description}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          criticalNotice: { ...prev.criticalNotice, description: e.target.value },
                        }))
                      }
                      className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF3B30]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                        วันและเวลาสัมภาษณ์ (ที่ระบุในกล่องเตือน)
                      </label>
                      <input
                        type="text"
                        value={config.criticalNotice.interviewDate}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            criticalNotice: { ...prev.criticalNotice, interviewDate: e.target.value },
                          }))
                        }
                        placeholder="23 กันยายน 2569 เวลา 17.00 น. เป็นต้นไป"
                        className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF3B30]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                        สถานที่สัมภาษณ์ (ที่ระบุในกล่องเตือน)
                      </label>
                      <input
                        type="text"
                        value={config.criticalNotice.interviewLocation}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            criticalNotice: { ...prev.criticalNotice, interviewLocation: e.target.value },
                          }))
                        }
                        placeholder="ห้องประชุมราชพฤกษ์ 3 ชั้น 3 อาคารคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร"
                        className="w-full text-xs px-3 py-2 bg-white rounded-[10px] border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-[#FF3B30]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Qualifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#007AFF]" />
                    <h4 className="text-sm font-bold text-[#1C1C1E]">
                      คุณสมบัติผู้ขอรับทุน
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddQualification}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#007AFF]/12 text-[#007AFF] hover:bg-[#007AFF]/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มข้อ</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {config.qualifications.map((q, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-[#8E8E93] w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={q}
                        onChange={(e) => handleQualificationChange(idx, e.target.value)}
                        className="flex-1 text-xs px-3 py-1.5 bg-[#F2F2F7] rounded-[8px] border border-transparent focus:border-[#007AFF] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteQualification(idx)}
                        className="p-1 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#FF9500]" />
                    <h4 className="text-sm font-bold text-[#1C1C1E]">
                      เอกสารที่ต้องเตรียม (100%)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF9500]/12 text-[#b06000] hover:bg-[#FF9500]/20 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มข้อ</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {config.requiredDocuments.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-[#8E8E93] w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={doc}
                        onChange={(e) => handleDocumentChange(idx, e.target.value)}
                        className="flex-1 text-xs px-3 py-1.5 bg-[#F2F2F7] rounded-[8px] border border-transparent focus:border-[#FF9500] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(idx)}
                        className="p-1 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-black/[0.06] bg-[#F2F2F7]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-[#FF3B30] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่ากำหนดการเริ่มต้น (Reset)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#636366] hover:bg-black/5 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`inline-flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-bold text-white transition-all cursor-pointer shadow-md active:scale-95 ${
                savedSuccess ? 'bg-[#34C759]' : 'bg-[#FF9500] hover:bg-[#e08500]'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูลกำหนดการ</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
