import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  ExternalLink,
  FilePenLine,
  GraduationCap,
  HelpCircle,
  MapPin,
  Megaphone,
  Phone,
  Settings,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  loadTimelineConfig,
  saveTimelineConfig,
} from '../data/scholarshipData';
import { saveTimelineConfigOnline } from '../services/firebaseService';
import { TimelineConfig } from '../types';
import { TimelineEditorModal } from './TimelineEditorModal';

interface TimelineSectionProps {
  onStartApplication: () => void;
  timelineConfig?: TimelineConfig;
  onUpdateConfig?: (newConfig: TimelineConfig) => void;
  isAdminLoggedIn?: boolean;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({
  onStartApplication,
  timelineConfig: propConfig,
  onUpdateConfig,
  isAdminLoggedIn = false,
}) => {
  const [localConfig, setLocalConfig] = useState<TimelineConfig>(loadTimelineConfig);
  const config = propConfig || localConfig;
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!propConfig) {
      setLocalConfig(loadTimelineConfig());
    }
  }, [propConfig]);

  const handleSaveConfig = (newConfig: TimelineConfig) => {
    setLocalConfig(newConfig);
    if (onUpdateConfig) {
      onUpdateConfig(newConfig);
    } else {
      saveTimelineConfig(newConfig);
      saveTimelineConfigOnline(newConfig);
    }
    setToastMessage('บันทึกกำหนดการและเงื่อนไขการรับสมัครเรียบร้อยแล้ว');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const getIconBadge = (name: string) => {
    switch (name) {
      case 'FilePenLine':
        return (
          <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/12 text-[#007AFF] flex items-center justify-center shrink-0 shadow-2xs">
            <FilePenLine className="w-5 h-5" />
          </div>
        );
      case 'Megaphone':
        return (
          <div className="w-10 h-10 rounded-[14px] bg-[#34C759]/12 text-[#34C759] flex items-center justify-center shrink-0 shadow-2xs">
            <Megaphone className="w-5 h-5" />
          </div>
        );
      case 'Users':
        return (
          <div className="w-10 h-10 rounded-[14px] bg-[#FF9500]/12 text-[#FF9500] flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
        );
      case 'Award':
        return (
          <div className="w-10 h-10 rounded-[14px] bg-[#AF52DE]/12 text-[#AF52DE] flex items-center justify-center shrink-0 shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
        );
      case 'GraduationCap':
        return (
          <div className="w-10 h-10 rounded-[14px] bg-[#5856D6]/12 text-[#5856D6] flex items-center justify-center shrink-0 shadow-2xs">
            <GraduationCap className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/12 text-[#007AFF] flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-[#1C1C1E] text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#34C759]" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Admin Quick Action Banner (แสดงเฉพาะเมื่อล็อกอินแอดมินแล้วเท่านั้น) */}
      {isAdminLoggedIn && (
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 border border-[#FF9500]/25 rounded-[20px] px-4 sm:px-5 py-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#FF9500]/20 text-[#b06000]">
              <Settings className="w-4 h-4" />
            </span>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                ระบบจัดการกำหนดการสำหรับผู้ดูแลระบบ (Admin)
              </div>
              {config.lastUpdatedAt && (
                <div className="text-[10px] text-[#8E8E93]">
                  อัปเดตล่าสุด: {config.lastUpdatedAt} ({config.lastUpdatedBy || 'ผู้ดูแลระบบ'})
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsEditorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FF9500] hover:bg-[#e08500] text-white shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            title="แก้ไขกำหนดการ วันสัมภาษณ์ และเงื่อนไข"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>แก้ไขกำหนดการ</span>
          </button>
        </div>
      )}

      {/* iOS Hero Card */}
      <div className="relative overflow-hidden rounded-[28px] bg-white p-6 sm:p-8 shadow-sm border border-black/[0.04]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#007AFF]/10 text-[#007AFF] flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" /> ประกาศทางการ คณะสังคมศาสตร์
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#767680]/10 text-[#636366]">
              มหาวิทยาลัยนเรศวร (ปี {config.academicYear})
            </span>
          </div>

          {isAdminLoggedIn && (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="p-1.5 text-[#8E8E93] hover:text-[#FF9500] hover:bg-[#FF9500]/10 rounded-full transition-colors cursor-pointer"
              title="แก้ไขหัวข้อประกาศ"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-['Prompt',sans-serif] text-[#1C1C1E] tracking-tight">
          {config.heroTitle}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#636366] leading-relaxed">
          {config.heroSubtitle}
        </p>

        {/* Action Button */}
        <div className="mt-6 flex flex-wrap items-center gap-3 pt-5 border-t border-black/[0.05]">
          <button
            id="hero-apply-btn"
            onClick={onStartApplication}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#007AFF] hover:bg-[#0071EB] text-white font-semibold text-sm shadow-md shadow-[#007AFF]/25 transition-all active:scale-[0.98] cursor-pointer"
          >
            <FilePenLine className="w-4 h-4" />
            <span>กรอกใบสมัครขอรับทุน (ปี {config.academicYear})</span>
          </button>
          {config.contactPhone && (
            <a
              href={`tel:${config.contactPhone.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-[#767680]/10 hover:bg-[#767680]/15 text-[#1C1C1E] text-sm font-semibold transition-colors"
            >
              <Phone className="w-4 h-4 text-[#FF9500]" />
              <span>โทร: {config.contactPhone}</span>
            </a>
          )}
        </div>
      </div>

      {/* Critical Note: iOS Callout Banner */}
      <div className="rounded-[24px] bg-[#FFF2F2] border border-[#FF3B30]/20 p-5 shadow-xs relative group">
        {isAdminLoggedIn && (
          <button
            onClick={() => setIsEditorOpen(true)}
            className="absolute top-4 right-4 p-1.5 text-[#FF3B30]/60 hover:text-[#FF3B30] hover:bg-red-100 rounded-full transition-colors cursor-pointer"
            title="แก้ไขข้อความเตือนและวันสัมภาษณ์"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-10 h-10 rounded-[14px] bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#FF3B30] font-['Prompt',sans-serif] flex items-center gap-1.5">
              <span>{config.criticalNotice.title}</span>
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#3A1D1D] leading-relaxed font-medium">
              {config.criticalNotice.description}{' '}
              {config.criticalNotice.interviewDate && (
                <>
                  โดยการสัมภาษณ์มีกำหนดจัดขึ้นในวันที่{' '}
                  <strong className="text-[#D70015] bg-red-100 px-1 py-0.5 rounded">
                    {config.criticalNotice.interviewDate}
                  </strong>{' '}
                </>
              )}
              {config.criticalNotice.interviewLocation && (
                <>
                  ณ <strong>{config.criticalNotice.interviewLocation}</strong>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* iOS Inset Grouped Timeline Section */}
      <div className="space-y-3">
        <div className="px-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
            กำหนดการและขั้นตอนการสมัคร (Timeline)
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8E8E93] font-medium">
              {config.steps.length} ขั้นตอน
            </span>
            {isAdminLoggedIn && (
              <button
                onClick={() => setIsEditorOpen(true)}
                className="text-xs font-bold text-[#FF9500] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                <span>แก้ไขขั้นตอน</span>
              </button>
            )}
          </div>
        </div>

        <div className="rounded-[24px] bg-white shadow-sm border border-black/[0.04] overflow-hidden divide-y divide-black/[0.05]">
          {config.steps.map((item, idx) => (
            <div
              key={item.id || idx}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                item.highlight ? 'bg-[#FF9500]/[0.03]' : 'hover:bg-black/[0.01]'
              }`}
            >
              {getIconBadge(item.iconName)}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-xs font-bold text-[#FF9500]">
                    {item.dateStr}
                  </span>
                  {item.highlight && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9500]/15 text-[#D97706]">
                      ขั้นตอนสำคัญ
                    </span>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#1C1C1E] font-['Prompt',sans-serif] mt-0.5">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#636366] mt-1 leading-relaxed">
                  {item.subtitle}
                </p>
                {item.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#007AFF] font-medium mt-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* iOS Dual Inset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Qualifications Card */}
        <div className="rounded-[24px] bg-white p-5 sm:p-6 shadow-sm border border-black/[0.04] space-y-3 relative group">
          {isAdminLoggedIn && (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="absolute top-4 right-4 p-1.5 text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#007AFF]/10 rounded-full transition-colors cursor-pointer"
              title="แก้ไขคุณสมบัติ"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-2 text-sm font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
            <div className="w-7 h-7 rounded-[10px] bg-[#007AFF]/12 text-[#007AFF] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span>คุณสมบัติผู้ขอรับทุน</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#636366]">
            {config.qualifications.map((q, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1.5 shrink-0"></span>
                <span className={idx === config.qualifications.length - 1 ? 'font-semibold text-[#1C1C1E]' : ''}>
                  {q}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Required Documents Card */}
        <div className="rounded-[24px] bg-white p-5 sm:p-6 shadow-sm border border-black/[0.04] space-y-3 relative group">
          {isAdminLoggedIn && (
            <button
              onClick={() => setIsEditorOpen(true)}
              className="absolute top-4 right-4 p-1.5 text-[#8E8E93] hover:text-[#FF9500] hover:bg-[#FF9500]/10 rounded-full transition-colors cursor-pointer"
              title="แก้ไขเอกสารที่ต้องเตรียม"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-2 text-sm font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
            <div className="w-7 h-7 rounded-[10px] bg-[#FF9500]/12 text-[#FF9500] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span>เอกสารที่ต้องเตรียม (100%)</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#636366]">
            {config.requiredDocuments.map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF9500] mt-1.5 shrink-0"></span>
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Editor Modal for Admin */}
      {isAdminLoggedIn && isEditorOpen && (
        <TimelineEditorModal
          initialConfig={config}
          onSave={handleSaveConfig}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  );
};
