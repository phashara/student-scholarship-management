import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileText,
  Flame,
  Info,
  Layers,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  Phone,
  Radio,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { ScholarshipApplication, TimelineConfig } from '../types';
import { AdminLoginModal } from './AdminLoginModal';

interface HeaderProps {
  activeTab: 'form' | 'timeline' | 'announcements' | 'status' | 'applicants' | 'admin';
  setActiveTab: (tab: 'form' | 'timeline' | 'announcements' | 'status' | 'applicants' | 'admin') => void;
  applicationCount?: number;
  onOpenScoringModal?: () => void;
  isAdminLoggedIn?: boolean;
  onAdminLogin?: () => void;
  onAdminLogout?: () => void;
  isCloudConnected?: boolean;
  cloudStatusText?: string;
  timelineConfig?: TimelineConfig;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  applicationCount = 0,
  onOpenScoringModal,
  isAdminLoggedIn = false,
  onAdminLogin,
  onAdminLogout,
  isCloudConnected = true,
  cloudStatusText,
  timelineConfig,
}) => {
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleAdminTabClick = () => {
    if (isAdminLoggedIn) {
      setActiveTab('admin');
      setMobileMenuOpen(false);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleNavClick = (tab: 'form' | 'timeline' | 'announcements' | 'status' | 'applicants' | 'admin') => {
    if (tab === 'admin') {
      handleAdminTabClick();
    } else {
      setActiveTab(tab);
      setMobileMenuOpen(false);
    }
  };

  const getClosingDate = () => {
    const raw = timelineConfig?.steps?.[0]?.dateStr;
    if (!raw) return 'ปิด 15 กันยายน 2569';
    const clean = raw.trim();
    if (clean.includes('–')) {
      const parts = clean.split('–');
      return `ปิด ${parts[parts.length - 1].trim()}`;
    }
    if (clean.includes('-')) {
      const parts = clean.split('-');
      return `ปิด ${parts[parts.length - 1].trim()}`;
    }
    if (clean.includes('ถึง')) {
      const parts = clean.split('ถึง');
      return `ปิด ${parts[parts.length - 1].trim()}`;
    }
    return clean.startsWith('ปิด') ? clean : `ปิด ${clean}`;
  };

  const closingDateText = getClosingDate();
  const phoneText = timelineConfig?.contactPhone || '055-961911';

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-2xl border-b border-black/[0.06] shadow-xs transition-all">
        {/* iOS Dynamic Island Capsule */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2.5 pb-1 flex justify-center">
          <div
            onClick={() => setIslandExpanded(!islandExpanded)}
            className={`cursor-pointer group flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-full bg-black text-white text-[12px] font-medium shadow-md shadow-black/10 border border-white/10 transition-all duration-300 select-none ${
              islandExpanded ? 'w-full max-w-lg scale-100' : 'hover:scale-[1.02]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]"></span>
              </span>
              <span className="font-semibold tracking-wide text-white/95">
                ทุนการศึกษา {timelineConfig?.academicYear || '2569'}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/75 text-[11px] truncate max-w-[140px] sm:max-w-none">
                คณะสังคมศาสตร์ ม.นเรศวร
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/70">
              <span className="hidden sm:inline text-[11px] bg-white/15 px-2 py-0.5 rounded-full text-white font-mono">
                {closingDateText}
              </span>
              <a
                href={`tel:${phoneText.replace(/[^0-9]/g, '')}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[11px] text-[#FF9F0A] hover:text-[#FFB340] px-2 py-0.5 rounded-full bg-white/10 transition-colors"
              >
                <Phone className="w-3 h-3" />
                <span>{phoneText}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Brand & Large Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[16px] bg-gradient-to-br from-[#007AFF] via-[#0051D5] to-[#5856D6] p-0.5 shadow-md shadow-[#007AFF]/25 flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#007AFF]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-[#1C1C1E] font-['Prompt',sans-serif]">
                    ทุนการศึกษา คณะสังคมศาสตร์
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#00A1F1]/15 text-[#0077B6] border border-[#00A1F1]/25">
                    ปี {timelineConfig?.academicYear || '2569'}
                  </span>
                  <span
                    className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      isCloudConnected
                        ? 'bg-[#34C759]/10 text-[#248A3D] border-[#34C759]/25'
                        : 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/25'
                    }`}
                    title={cloudStatusText || (isCloudConnected ? 'เชื่อมต่อฐานข้อมูล Firebase Firestore ออนไลน์' : 'ยังยืนยันข้อมูลล่าสุดไม่ได้')}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-[#34C759] animate-pulse' : 'bg-[#FF9500]'}`} />
                    <span>{cloudStatusText || (isCloudConnected ? 'Firebase ออนไลน์' : 'ยังยืนยันข้อมูลล่าสุดไม่ได้')}</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-[12px] text-[#8E8E93] leading-none mt-0.5 sm:mt-1 truncate max-w-[210px] sm:max-w-none">
                  สำหรับนิสิตที่ขาดแคลนทุนทรัพย์ • มหาวิทยาลัยนเรศวร
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden lg:flex bg-[#767680]/12 p-1 rounded-[16px] items-center gap-1 shadow-inner">
              <button
                id="nav-form-tab"
                onClick={() => handleNavClick('form')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'form'
                    ? 'bg-white text-[#1C1C1E] shadow-sm font-bold scale-[1.01]'
                    : 'text-[#636366] hover:text-[#1C1C1E] hover:bg-white/40'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeTab === 'form' ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`} />
                <span>กรอกใบสมัคร</span>
              </button>

              <button
                id="nav-timeline-tab"
                onClick={() => handleNavClick('timeline')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-white text-[#1C1C1E] shadow-sm font-bold scale-[1.01]'
                    : 'text-[#636366] hover:text-[#1C1C1E] hover:bg-white/40'
                }`}
              >
                <Calendar className={`w-4 h-4 ${activeTab === 'timeline' ? 'text-[#FF9500]' : 'text-[#8E8E93]'}`} />
                <span>กำหนดการ</span>
              </button>

              <button
                id="nav-announcements-tab"
                onClick={() => handleNavClick('announcements')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'announcements'
                    ? 'bg-white text-[#1C1C1E] shadow-sm font-bold scale-[1.01]'
                    : 'text-[#636366] hover:text-[#1C1C1E] hover:bg-white/40'
                }`}
              >
                <Megaphone className={`w-4 h-4 ${activeTab === 'announcements' ? 'text-[#AF52DE]' : 'text-[#8E8E93]'}`} />
                <span>ประกาศผล</span>
              </button>

              <button
                id="nav-status-tab"
                onClick={() => handleNavClick('status')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'status'
                    ? 'bg-white text-[#1C1C1E] shadow-sm font-bold scale-[1.01]'
                    : 'text-[#636366] hover:text-[#1C1C1E] hover:bg-white/40'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${activeTab === 'status' ? 'text-[#34C759]' : 'text-[#8E8E93]'}`} />
                <span>เช็กสถานะ</span>
              </button>

              <button
                id="nav-applicants-tab"
                onClick={() => handleNavClick('applicants')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'applicants'
                    ? 'bg-white text-[#1C1C1E] shadow-sm font-bold scale-[1.01]'
                    : 'text-[#636366] hover:text-[#1C1C1E] hover:bg-white/40'
                }`}
              >
                <Users className={`w-4 h-4 ${activeTab === 'applicants' ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`} />
                <span>รายชื่อผู้สมัคร</span>
              </button>

              <button
                id="nav-admin-tab"
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white text-[#1C1C1E] shadow-sm font-bold scale-[1.01]'
                    : 'text-[#636366] hover:text-[#1C1C1E] hover:bg-white/40'
                }`}
              >
                {isAdminLoggedIn ? (
                  <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-[#5856D6]' : 'text-[#8E8E93]'}`} />
                ) : (
                  <Lock className="w-4 h-4 text-[#8E8E93]" />
                )}
                <span>เจ้าหน้าที่ {isAdminLoggedIn && '(แอดมิน)'}</span>
                {applicationCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FF3B30] text-white">
                    {applicationCount}
                  </span>
                )}
              </button>

              {isAdminLoggedIn && onAdminLogout && (
                <button
                  type="button"
                  onClick={onAdminLogout}
                  className="p-1.5 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-white/60 rounded-[10px] transition-colors cursor-pointer"
                  title="ออกจากระบบแอดมิน"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}

              {/* Scoring criteria modal only accessible to admin/committee */}
              {activeTab === 'admin' && onOpenScoringModal && (
                <button
                  type="button"
                  onClick={onOpenScoringModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs sm:text-sm font-semibold text-[#5856D6] bg-[#5856D6]/12 hover:bg-[#5856D6]/20 transition-all cursor-pointer whitespace-nowrap"
                  title="เปิดดูเกณฑ์การให้คะแนน 100 คะแนนเต็ม & เครื่องมือจำลองคะแนน (สำหรับคณะกรรมการ)"
                >
                  <Scale className="w-3.5 h-3.5 text-[#5856D6]" />
                  <span>เกณฑ์คะแนน (กก.)</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-[14px] bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA] transition-all cursor-pointer active:scale-95 border border-black/[0.05]"
                aria-label="Toggle Hamburger Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#1C1C1E]" /> : <Menu className="w-5 h-5 text-[#1C1C1E]" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Hamburger Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-black/[0.06] bg-white/95 backdrop-blur-2xl px-4 py-4 space-y-2 animate-fadeIn shadow-xl">
            <div className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider px-2 pb-1">
              เมนูหลัก
            </div>

            <button
              onClick={() => handleNavClick('form')}
              className={`w-full flex items-center justify-between p-3 rounded-[16px] text-sm font-semibold transition-all ${
                activeTab === 'form' ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'text-[#1C1C1E] hover:bg-[#F2F2F7]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${activeTab === 'form' ? 'bg-[#007AFF] text-white' : 'bg-[#F2F2F7] text-[#007AFF]'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <span>กรอกใบสมัครทุน</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
            </button>

            <button
              onClick={() => handleNavClick('timeline')}
              className={`w-full flex items-center justify-between p-3 rounded-[16px] text-sm font-semibold transition-all ${
                activeTab === 'timeline' ? 'bg-[#FF9500]/10 text-[#FF9500]' : 'text-[#1C1C1E] hover:bg-[#F2F2F7]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${activeTab === 'timeline' ? 'bg-[#FF9500] text-white' : 'bg-[#F2F2F7] text-[#FF9500]'}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <span>กำหนดการสำคัญ</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
            </button>

            <button
              onClick={() => handleNavClick('announcements')}
              className={`w-full flex items-center justify-between p-3 rounded-[16px] text-sm font-semibold transition-all ${
                activeTab === 'announcements' ? 'bg-[#AF52DE]/10 text-[#AF52DE]' : 'text-[#1C1C1E] hover:bg-[#F2F2F7]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${activeTab === 'announcements' ? 'bg-[#AF52DE] text-white' : 'bg-[#F2F2F7] text-[#AF52DE]'}`}>
                  <Megaphone className="w-4 h-4" />
                </div>
                <span>ประกาศผลทางการ</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
            </button>

            <button
              onClick={() => handleNavClick('status')}
              className={`w-full flex items-center justify-between p-3 rounded-[16px] text-sm font-semibold transition-all ${
                activeTab === 'status' ? 'bg-[#34C759]/10 text-[#34C759]' : 'text-[#1C1C1E] hover:bg-[#F2F2F7]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${activeTab === 'status' ? 'bg-[#34C759] text-white' : 'bg-[#F2F2F7] text-[#34C759]'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>ตรวจสอบสถานะ</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
            </button>

            <button
              onClick={() => handleNavClick('applicants')}
              className={`w-full flex items-center justify-between p-3 rounded-[16px] text-sm font-semibold transition-all ${
                activeTab === 'applicants' ? 'bg-[#007AFF]/10 text-[#007AFF]' : 'text-[#1C1C1E] hover:bg-[#F2F2F7]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${activeTab === 'applicants' ? 'bg-[#007AFF] text-white' : 'bg-[#F2F2F7] text-[#007AFF]'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <span>รายชื่อผู้สมัคร</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
            </button>

            <div className="pt-2 border-t border-black/[0.05]">
              <div className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider px-2 pb-1">
                ระบบเจ้าหน้าที่ / แอดมิน
              </div>

              <button
                onClick={() => handleNavClick('admin')}
                className={`w-full flex items-center justify-between p-3 rounded-[16px] text-sm font-semibold transition-all ${
                  activeTab === 'admin' ? 'bg-[#5856D6]/10 text-[#5856D6]' : 'text-[#1C1C1E] hover:bg-[#F2F2F7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${activeTab === 'admin' ? 'bg-[#5856D6] text-white' : 'bg-[#F2F2F7] text-[#5856D6]'}`}>
                    {isAdminLoggedIn ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <div className="leading-tight">แอดมิน (เจ้าหน้าที่)</div>
                    <div className="text-[11px] text-[#8E8E93]">
                      {isAdminLoggedIn ? 'ล็อกอินในชื่อ: phasharak' : 'ต้องเข้าสู่ระบบด้วยรหัสผ่าน'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {applicationCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3B30] text-white">
                      {applicationCount}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#8E8E93]" />
                </div>
              </button>

              {isAdminLoggedIn && onAdminLogout && (
                <button
                  onClick={() => {
                    onAdminLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full mt-1 flex items-center gap-2 p-2.5 rounded-[14px] text-xs font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบแอดมิน</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Admin Login Dialog */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          if (onAdminLogin) onAdminLogin();
          setActiveTab('admin');
          setMobileMenuOpen(false);
        }}
      />
    </>
  );
};
