/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Facebook,
  FileText,
  Globe,
  Lock,
  MapPin,
  Megaphone,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AnnouncementsSection } from './components/AnnouncementsSection';
import { ApplicantListSection } from './components/ApplicantListSection';
import { ApplicationSlipModal } from './components/ApplicationSlipModal';
import { Header } from './components/Header';
import { ReviewerDashboard } from './components/ReviewerDashboard';
import { ScholarshipForm } from './components/ScholarshipForm';
import { ScoringCriteriaModal } from './components/ScoringCriteriaModal';
import { StatusTracker } from './components/StatusTracker';
import { TimelineSection } from './components/TimelineSection';
import { clearAllApplications, loadApplications, loadTimelineConfig } from './data/scholarshipData';
import {
  clearAllApplicationsOnline,
  deleteApplicationOnline,
  saveTimelineConfigOnline,
  subscribeApplications,
  subscribeTimelineConfig,
} from './services/firebaseService';
import { ScholarshipApplication, TimelineConfig } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'timeline' | 'announcements' | 'status' | 'applicants' | 'admin'>('form');
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [timelineConfig, setTimelineConfig] = useState<TimelineConfig>(loadTimelineConfig);
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplication | null>(null);
  const [trackingInitialQuery, setTrackingInitialQuery] = useState<string>('');
  const [isScoringModalOpen, setIsScoringModalOpen] = useState<boolean>(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('socsci_admin_auth') === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Initial immediate load from local storage
    setApplications(loadApplications());
    setTimelineConfig(loadTimelineConfig());

    // Subscribe to real-time live applications from Firebase Firestore
    const unsubscribeApps = subscribeApplications(
      (remoteApps) => {
        setApplications(remoteApps);
        setIsCloudConnected(true);
      },
      () => {
        setIsCloudConnected(false);
      }
    );

    // Subscribe to real-time timeline & schedule configuration from Firebase Firestore
    const unsubscribeTimeline = subscribeTimelineConfig((remoteConfig) => {
      setTimelineConfig(remoteConfig);
    });

    return () => {
      unsubscribeApps();
      unsubscribeTimeline();
    };
  }, []);

  const refreshApplications = () => {
    setApplications(loadApplications());
  };

  const handleDeleteApplication = async (appId: string, studentId?: string) => {
    await deleteApplicationOnline(appId, studentId);
    setApplications(prev => prev.filter(app =>
      !(app.id.replace(/^APP-/, 'FSS-') === appId.replace(/^APP-/, 'FSS-') &&
        (!studentId || app.studentId === studentId))
    ));
  };

  const handleClearAllApplications = async () => {
    await clearAllApplicationsOnline();
    setApplications(loadApplications());
  };

  const handleUpdateTimelineConfig = async (newConfig: TimelineConfig) => {
    setTimelineConfig(newConfig);
    await saveTimelineConfigOnline(newConfig);
  };

  const handleApplicationSubmitted = (newApp: ScholarshipApplication) => {
    setSelectedApplication(newApp);
  };

  const handleTrackStudent = (studentId?: string) => {
    if (studentId) {
      setTrackingInitialQuery(studentId);
    }
    setActiveTab('status');
  };

  const handleAdminTabSelect = () => {
    if (isAdminLoggedIn) {
      setActiveTab('admin');
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('socsci_admin_auth');
    sessionStorage.removeItem('socsci_admin_user');
    setIsAdminLoggedIn(false);
    if (activeTab === 'admin') {
      setActiveTab('form');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F7] text-[#1C1C1E] font-['-apple-system','BlinkMacSystemFont','SF_Pro_Display','SF_Pro_Text','Prompt','Sarabun',sans-serif]">
      {/* iOS Translucent Header with Hamburger & Admin Auth */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applicationCount={applications.length}
        onOpenScoringModal={() => setIsScoringModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogin={() => setIsAdminLoggedIn(true)}
        onAdminLogout={handleAdminLogout}
        isCloudConnected={isCloudConnected}
        timelineConfig={timelineConfig}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-8">
        {activeTab === 'form' && (
          <ScholarshipForm
            onSubmitSuccess={handleApplicationSubmitted}
            timelineConfig={timelineConfig}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineSection
            onStartApplication={() => setActiveTab('form')}
            timelineConfig={timelineConfig}
            onUpdateConfig={handleUpdateTimelineConfig}
            isAdminLoggedIn={isAdminLoggedIn}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsSection
            applications={applications}
            timelineConfig={timelineConfig}
            onViewApplication={(app) => setSelectedApplication(app)}
            isAdminLoggedIn={isAdminLoggedIn}
          />
        )}

        {activeTab === 'status' && (
          <StatusTracker
            applications={applications}
            onViewApplication={(app) => setSelectedApplication(app)}
            initialQuery={trackingInitialQuery}
            timelineConfig={timelineConfig}
          />
        )}

        {activeTab === 'applicants' && (
          <ApplicantListSection
            applications={applications}
            onRefresh={refreshApplications}
            timelineConfig={timelineConfig}
            isAdminLoggedIn={isAdminLoggedIn}
            onDeleteApplication={handleDeleteApplication}
          />
        )}

        {activeTab === 'admin' && (
          isAdminLoggedIn ? (
            <ReviewerDashboard
              applications={applications}
              onRefresh={refreshApplications}
              onViewApplication={(app) => setSelectedApplication(app)}
              onOpenScoringModal={() => setIsScoringModalOpen(true)}
              timelineConfig={timelineConfig}
              onUpdateTimelineConfig={handleUpdateTimelineConfig}
              onDeleteApplication={handleDeleteApplication}
              onClearAllApplications={handleClearAllApplications}
            />
          ) : (
            <div className="bg-white rounded-[24px] p-8 max-w-md mx-auto text-center border border-black/[0.08] shadow-sm space-y-4 my-8">
              <div className="w-14 h-14 rounded-2xl bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                ต้องเข้าสู่ระบบแอดมินก่อน
              </h3>
              <p className="text-xs text-[#8E8E93]">
                กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่เพื่อดูข้อมูลผู้สมัครและคัดกรองทุน
              </p>
              <button
                type="button"
                onClick={() => setIsAdminLoginModalOpen(true)}
                className="w-full py-2.5 rounded-full bg-[#5856D6] text-white text-xs font-bold shadow-md shadow-[#5856D6]/25 cursor-pointer"
              >
                เข้าสู่ระบบเจ้าหน้าที่
              </button>
            </div>
          )
        )}
      </main>

      {/* iOS Mobile Floating Bottom Tab Bar (Dock) */}
      <div className="md:hidden fixed bottom-3 inset-x-4 z-40">
        <div className="bg-white/90 backdrop-blur-2xl border border-black/[0.08] shadow-lg shadow-black/10 rounded-full px-2 py-1.5 flex items-center justify-around">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'form' ? 'text-[#007AFF] font-bold' : 'text-[#8E8E93]'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px]">กรอกใบสมัคร</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'timeline' ? 'text-[#FF9500] font-bold' : 'text-[#8E8E93]'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">กำหนดการ</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'announcements' ? 'text-[#AF52DE] font-bold' : 'text-[#8E8E93]'
            }`}
          >
            <Megaphone className="w-5 h-5" />
            <span className="text-[10px]">ประกาศผล</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'status' ? 'text-[#34C759] font-bold' : 'text-[#8E8E93]'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px]">เช็กสถานะ</span>
          </button>

          <button
            onClick={() => setActiveTab('applicants')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer ${
              activeTab === 'applicants' ? 'text-[#007AFF] font-bold' : 'text-[#8E8E93]'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">รายชื่อ</span>
          </button>

          <button
            onClick={handleAdminTabSelect}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all relative active:scale-95 cursor-pointer ${
              activeTab === 'admin' ? 'text-[#5856D6] font-bold' : 'text-[#8E8E93]'
            }`}
          >
            {isAdminLoggedIn ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            <span className="text-[10px]">แอดมิน</span>
            {applications.length > 0 && (
              <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-[#FF3B30]" />
            )}
          </button>
        </div>
      </div>

      {/* Admin Login Dialog for bottom dock/restricted page */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setActiveTab('admin');
        }}
      />

      {/* Application Slip Modal (iOS Sheet) */}
      {selectedApplication && (
        <ApplicationSlipModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onTrackStatus={() => {
            const sid = selectedApplication.studentId;
            setSelectedApplication(null);
            handleTrackStudent(sid);
          }}
        />
      )}

      {/* Scoring Criteria & Simulator Modal */}
      <ScoringCriteriaModal
        isOpen={isScoringModalOpen}
        onClose={() => setIsScoringModalOpen(false)}
      />

      {/* iOS Styled Footer */}
      <footer className="mt-auto bg-white border-t border-black/[0.05] text-[#8E8E93] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#1C1C1E] font-bold text-sm font-['Prompt',sans-serif]">
                <div className="w-7 h-7 rounded-[10px] bg-[#007AFF] text-white flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <span>คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#636366]">
                Faculty of Social Sciences, Naresuan University
                <br />
                99 หมู่ 9 ถนนพิษณุโลก-นครสวรรค์ ต.ท่าโพธิ์ อ.เมืองพิษณุโลก จ.พิษณุโลก 65000
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[#1C1C1E] font-semibold text-xs font-['Prompt',sans-serif]">
                ช่องทางติดต่อ
              </h4>
              <ul className="space-y-1 text-[11px] text-[#636366]">
                <li className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#FF9500]" />
                  <span>โทร: {timelineConfig.contactPhone || '055-961911'} (งานกิจการนิสิต)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Facebook className="w-3 h-3 text-[#007AFF]" />
                  <span>Facebook: งานกิจการนิสิต คณะสังคมศาสตร์ ม.นเรศวร</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-[#34C759]" />
                  <span>เว็บคณะ: www.socsci.nu.ac.th</span>
                </li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[#1C1C1E] font-semibold text-xs font-['Prompt',sans-serif]">
                กำหนดการสำคัญ ปีการศึกษา {timelineConfig.academicYear || '2569'}
              </h4>
              <p className="text-[11px] text-[#636366] leading-relaxed">
                • {timelineConfig.steps?.[0]?.title || 'ปิดรับสมัคร'}: {timelineConfig.steps?.[0]?.dateStr || '15 กันยายน 2569'}
                <br />
                • {timelineConfig.steps?.[1]?.title || 'ประกาศผู้มีสิทธิ์สัมภาษณ์'}: {timelineConfig.steps?.[1]?.dateStr || '18 กันยายน 2569'}
                <br />
                • {timelineConfig.steps?.[2]?.title || 'สัมภาษณ์ทุน'}: {timelineConfig.steps?.[2]?.dateStr || '23 กันยายน 2569'} {timelineConfig.steps?.[2]?.location ? `ณ ${timelineConfig.steps[2].location}` : ''}
              </p>
              <p className="text-[10px] text-[#FF3B30] font-semibold">
                * {timelineConfig.criticalNotice?.description || 'หากไม่เข้ารับการสัมภาษณ์ จะถือว่าสละสิทธิ์'}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.04] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#8E8E93] gap-2">
            <span>© {timelineConfig.academicYear || '2569'} คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร. All rights reserved.</span>
            <span>Faculty of Social Sciences Scholarship Portal {timelineConfig.academicYear || '2569'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}