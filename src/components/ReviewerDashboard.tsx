/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  Award,
  BarChart3,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Cloud,
  Coins,
  ClipboardList,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Heart,
  HelpCircle,
  Layers,
  Loader2,
  Megaphone,
  Pencil,
  RotateCcw,
  Save,
  Scale,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Users,
  Zap,
} from 'lucide-react';
import {
  OFFICIAL_DEPARTMENTS_2569,
  calculateScholarshipScore,
  clearAllApplications,
  loadTimelineConfig,
} from '../data/scholarshipData';
import {
  clearAllApplicationsOnline,
  deleteApplicationOnline,
  saveApplicationOnline,
  saveTimelineConfigOnline,
} from '../services/firebaseService';
import { AttachedDoc, ScholarshipApplication, ScoreBreakdown, TimelineConfig } from '../types';
import { formatThaiDateTime, parseDateTimestamp } from '../utils/dateUtils';
import { DocumentViewerModal } from './DocumentViewerModal';
import { AdminEditApplicantModal } from './AdminEditApplicantModal';
import { DeleteApplicantModal } from './DeleteApplicantModal';
import { ItemizedScoreModal } from './ItemizedScoreModal';
import { TimelineEditorModal } from './TimelineEditorModal';
import { LifecyclePhaseControl } from './LifecyclePhaseControl';

interface ReviewerDashboardProps {
  applications: ScholarshipApplication[];
  onRefresh: () => void;
  onViewApplication: (app: ScholarshipApplication) => void;
  onOpenScoringModal?: () => void;
  timelineConfig?: TimelineConfig;
  onUpdateTimelineConfig?: (newConfig: TimelineConfig) => void;
  onDeleteApplication?: (appId: string, studentId?: string) => Promise<void> | void;
  onClearAllApplications?: () => Promise<void> | void;
  onNavigateToAnnouncements?: () => void;
}

interface AllocationRowProps {
  rank: number;
  app: ScholarshipApplication;
  score: ScoreBreakdown;
  isSaving: boolean;
  isSavedSuccess: boolean;
  onSave: (
    app: ScholarshipApplication,
    status: ScholarshipApplication['status'],
    amount?: number,
    notes?: string,
    finalRank?: number
  ) => Promise<void>;
  onViewItemizedScore: () => void;
  onViewFullApplication: () => void;
}

const AllocationRow: React.FC<AllocationRowProps> = ({
  rank,
  app,
  score,
  isSaving,
  isSavedSuccess,
  onSave,
  onViewItemizedScore,
  onViewFullApplication,
}) => {
  const [currentStatus, setCurrentStatus] = useState<ScholarshipApplication['status']>(app.status);
  const [amountStr, setAmountStr] = useState<string>(String(app.awardedAmount || 10000));
  const [notesStr, setNotesStr] = useState<string>(app.reviewerNotes || '');
  const [rankInput, setRankInput] = useState<string>(app.finalRank !== undefined ? String(app.finalRank) : '');

  useEffect(() => {
    setCurrentStatus(app.status);
    setAmountStr(String(app.awardedAmount || 10000));
    setNotesStr(app.reviewerNotes || '');
    setRankInput(app.finalRank !== undefined ? String(app.finalRank) : '');
  }, [app]);

  const handleApplyPresetAmount = (val: number) => {
    setAmountStr(String(val));
    if (currentStatus === 'awarded') {
      const finalRankVal = rankInput.trim() ? parseInt(rankInput) : undefined;
      onSave(app, 'awarded', val, notesStr, finalRankVal);
    }
  };

  const handleSaveRow = () => {
    const num = parseFloat(amountStr) || 10000;
    const finalRankVal = rankInput.trim() ? parseInt(rankInput) : undefined;
    onSave(app, currentStatus, num, notesStr, finalRankVal);
  };

  const handleQuickStatusClick = (st: ScholarshipApplication['status']) => {
    setCurrentStatus(st);
    const num = parseFloat(amountStr) || 10000;
    const finalRankVal = rankInput.trim() ? parseInt(rankInput) : undefined;
    onSave(app, st, num, notesStr, finalRankVal);
  };

  return (
    <tr className={`transition-colors ${currentStatus === 'awarded' ? 'bg-[#34C759]/[0.03]' : 'hover:bg-[#F2F2F7]/40'}`}>
      {/* Rank (อันดับมติกรรมการหลังสัมภาษณ์ vs อันดับคะแนนเดิม) */}
      <td className="px-4 py-3.5 text-center">
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            min="1"
            value={rankInput}
            onChange={(e) => setRankInput(e.target.value)}
            onBlur={() => {
              const val = rankInput.trim() ? parseInt(rankInput) : undefined;
              if (val !== app.finalRank) {
                const num = parseFloat(amountStr) || (app.awardedAmount || 10000);
                onSave(app, currentStatus, num, notesStr, val);
              }
            }}
            placeholder={String(rank)}
            title="พิมพ์อันดับมติคณะกรรมการที่นี่ (เช่น 1, 2, 3...)"
            className={`w-12 px-1.5 py-1 text-center font-mono font-bold text-xs rounded-[10px] border outline-none transition-all ${
              rankInput
                ? 'bg-[#FF9500] text-white border-[#E08500] shadow-xs'
                : 'bg-[#F2F2F7] text-[#1C1C1E] border-black/10 focus:bg-white'
            }`}
          />
          {app.finalRank ? (
            <span className="text-[9px] font-bold text-[#b06000] bg-[#FF9500]/15 px-1.5 py-0.2 rounded-full">
              มติ: {app.finalRank}
            </span>
          ) : (
            <span className="text-[9px] text-[#8E8E93]" title="อันดับตามคะแนนความจำเป็นก่อนสัมภาษณ์">
              เดิม: {rank}
            </span>
          )}
        </div>
      </td>

      {/* Student Details */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          {app.studentPhotoDoc?.dataUrl ? (
            <img
              src={app.studentPhotoDoc.dataUrl}
              alt={app.fullName}
              className="w-9 h-11 rounded-[6px] object-cover border border-black/[0.08] shrink-0"
            />
          ) : (
            <div className="w-9 h-11 rounded-[6px] bg-[#F2F2F7] flex items-center justify-center text-[#8E8E93] shrink-0">
              <User className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="font-mono font-bold text-[#007AFF] text-[11px]">
              {app.studentId || '-'}
            </div>
            <div className="font-semibold text-[#1C1C1E] text-xs sm:text-sm">
              {app.fullName}
            </div>
            <div className="text-[11px] text-[#8E8E93]">
              {app.department} • {app.studyYear || '-'}
            </div>
          </div>
        </div>
      </td>

      {/* Score */}
      <td className="px-4 py-3.5 text-center">
        <div className="font-mono font-extrabold text-base text-[#1C1C1E]">
          {score.totalScore}
        </div>
        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border mt-0.5 ${score.colorClass}`}>
          {score.priorityLabel}
        </span>
        <button
          type="button"
          onClick={onViewItemizedScore}
          className="block mx-auto text-[10px] text-[#007AFF] hover:underline mt-1 cursor-pointer"
        >
          ใบคะแนน
        </button>
      </td>

      {/* Decision Status */}
      <td className="px-4 py-3.5">
        <div className="space-y-1.5">
          <select
            value={currentStatus}
            onChange={(e) => handleQuickStatusClick(e.target.value as any)}
            className={`w-full px-2.5 py-1.5 rounded-[12px] font-bold text-xs outline-none border cursor-pointer ${
              currentStatus === 'awarded'
                ? 'bg-[#34C759]/15 text-[#248A3D] border-[#34C759]/30'
                : currentStatus === 'interviewed'
                ? 'bg-[#007AFF]/12 text-[#007AFF] border-[#007AFF]/25'
                : currentStatus === 'eligible_for_interview'
                ? 'bg-[#FF9500]/15 text-[#b06000] border-[#FF9500]/25'
                : 'bg-[#F2F2F7] text-[#636366] border-black/5'
            }`}
          >
            <option value="awarded">🟢 อนุมัติจัดสรรทุน (ได้รับทุน)</option>
            <option value="interviewed">🔵 สัมภาษณ์แล้ว (รอผล/สำรอง)</option>
            <option value="eligible_for_interview">🟡 มีสิทธิ์สัมภาษณ์ (รอข้อสรุป)</option>
            <option value="not_selected">⚪ ไม่ผ่านการคัดเลือก</option>
            <option value="submitted">⏳ ยื่นใบสมัครแล้ว</option>
          </select>

          {currentStatus === 'awarded' && (
            <div className="text-[10px] text-[#248A3D] font-semibold flex items-center gap-1">
              <Check className="w-3 h-3 text-[#34C759]" />
              <span>เชื่อมโยงสู่หน้าประกาศผลแล้ว</span>
            </div>
          )}
        </div>
      </td>

      {/* Grant Amount */}
      <td className="px-4 py-3.5">
        <div className="space-y-1">
          <div className="relative">
            <span className="absolute left-2.5 top-1.5 text-xs text-[#8E8E93] font-bold">฿</span>
            <input
              type="number"
              disabled={currentStatus !== 'awarded'}
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="10000"
              className={`w-full pl-6 pr-2.5 py-1 text-xs font-mono font-bold rounded-[10px] border outline-none ${
                currentStatus === 'awarded'
                  ? 'bg-white text-[#1C1C1E] border-black/10 focus:ring-2 focus:ring-[#34C759]/25'
                  : 'bg-[#F2F2F7] text-[#8E8E93] border-transparent cursor-not-allowed'
              }`}
            />
          </div>

          {currentStatus === 'awarded' && (
            <div className="flex items-center gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => handleApplyPresetAmount(5000)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  amountStr === '5000' ? 'bg-[#34C759] text-white font-bold' : 'bg-[#F2F2F7] text-[#636366] hover:bg-[#E5E5EA]'
                }`}
              >
                5 พัน
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetAmount(10000)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  amountStr === '10000' ? 'bg-[#34C759] text-white font-bold' : 'bg-[#F2F2F7] text-[#636366] hover:bg-[#E5E5EA]'
                }`}
              >
                1 หมื่น
              </button>
              <button
                type="button"
                onClick={() => handleApplyPresetAmount(15000)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  amountStr === '15000' ? 'bg-[#34C759] text-white font-bold' : 'bg-[#F2F2F7] text-[#636366] hover:bg-[#E5E5EA]'
                }`}
              >
                1.5 หมื่น
              </button>
            </div>
          )}
        </div>
      </td>

      {/* Reviewer Notes */}
      <td className="px-4 py-3.5">
        <input
          type="text"
          value={notesStr}
          onChange={(e) => setNotesStr(e.target.value)}
          placeholder="เช่น สำรองอันดับ 1, ทุนเร่งด่วน..."
          className="w-full px-2.5 py-1 text-xs rounded-[10px] bg-[#F2F2F7] border border-transparent focus:bg-white focus:border-black/10 outline-none"
        />
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={handleSaveRow}
            disabled={isSaving}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs ${
              isSavedSuccess
                ? 'bg-[#34C759] text-white'
                : 'bg-[#1C1C1E] hover:bg-black text-white'
            }`}
            title="บันทึกการจัดสรรทุน"
          >
            {isSaving ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : isSavedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>บันทึกแล้ว</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>บันทึก</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onViewFullApplication}
            className="p-1.5 text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#007AFF]/10 rounded-full transition-colors cursor-pointer"
            title="ดูใบสมัครฉบับเต็ม"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export const ReviewerDashboard: React.FC<ReviewerDashboardProps> = ({
  applications,
  onRefresh,
  onViewApplication,
  onOpenScoringModal,
  timelineConfig: propTimelineConfig,
  onUpdateTimelineConfig,
  onDeleteApplication,
  onClearAllApplications,
  onNavigateToAnnouncements,
}) => {
  const [activeView, setActiveView] = useState<'table' | 'itemized' | 'scoring' | 'allocation'>('allocation');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortByScoreDesc, setSortByScoreDesc] = useState<boolean>(true);

  // Status changer modal
  const [editingApp, setEditingApp] = useState<ScholarshipApplication | null>(null);
  const [newStatus, setNewStatus] = useState<ScholarshipApplication['status']>('submitted');
  const [newAwardedAmount, setNewAwardedAmount] = useState<string>('10000');
  const [reviewerNotes, setReviewerNotes] = useState<string>('');

  // Allocation Mode States (มาตรฐานสากล: การจัดสรรทุน & คุมงบประมาณ)
  const [budgetPool, setBudgetPool] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('nu_socsci_grant_budget_pool');
      return stored ? Number(stored) : 150000;
    } catch {
      return 150000;
    }
  });
  const [isEditingBudgetPool, setIsEditingBudgetPool] = useState<boolean>(false);
  const [tempBudgetPool, setTempBudgetPool] = useState<string>('150000');
  const [allocationScopeFilter, setAllocationScopeFilter] = useState<'interview_all' | 'awarded_only' | 'pending_only' | 'all'>('interview_all');
  const [savingAppId, setSavingAppId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Batch Award Modal state
  const [isBatchAwardModalOpen, setIsBatchAwardModalOpen] = useState<boolean>(false);
  const [batchTopCount, setBatchTopCount] = useState<number>(10);
  const [batchAmountPerPerson, setBatchAmountPerPerson] = useState<number>(10000);

  // Admin full edit modal (แก้ไขข้อมูลในฐานข้อมูล)
  const [editApplicantTarget, setEditApplicantTarget] = useState<ScholarshipApplication | null>(null);

  // Secure Delete modal (ยืนยันรหัสผ่าน 07011985 เพื่อลบข้อมูล)
  const [deleteTargetApp, setDeleteTargetApp] = useState<ScholarshipApplication | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState<boolean>(false);

  // Itemized score modal (ใบคะแนนการประเมินรายบุคคลฉบับละเอียด)
  const [selectedItemizedApp, setSelectedItemizedApp] = useState<ScholarshipApplication | null>(null);

  // Timeline Config Editor modal
  const [isTimelineEditorOpen, setIsTimelineEditorOpen] = useState<boolean>(false);
  const [timelineConfig, setTimelineConfig] = useState<TimelineConfig>(loadTimelineConfig);

  // Attached document viewer modal
  const [viewerDocument, setViewerDocument] = useState<{
    doc: AttachedDoc;
    title: string;
    applicantName?: string;
  } | null>(null);

  const currentTimelineConfig = propTimelineConfig || timelineConfig;

  useEffect(() => {
    if (propTimelineConfig) {
      setTimelineConfig(propTimelineConfig);
    }
  }, [propTimelineConfig]);

  const [isSyncingToCloud, setIsSyncingToCloud] = useState(false);

  const handleBatchSyncToCloud = async () => {
    setIsSyncingToCloud(true);
    try {
      let count = 0;
      for (const item of applications) {
        await saveApplicationOnline(item);
        count++;
      }
      if (currentTimelineConfig) {
        await saveTimelineConfigOnline(currentTimelineConfig);
      }
      showToast(`ซิงก์ข้อมูลทั้งหมด ${count} รายการและกำหนดการขึ้น Cloud สำเร็จแล้ว ทุกเครื่องจะเห็นข้อมูลตรงกันทันที`);
    } catch (e) {
      console.error(e);
      showToast('เกิดข้อผิดพลาดในการซิงก์ข้อมูล');
    } finally {
      setIsSyncingToCloud(false);
    }
  };

  const availableAcademicYears = useMemo(() => {
    const years = new Set<string>();
    if (currentTimelineConfig?.academicYear) {
      years.add(currentTimelineConfig.academicYear);
    }
    years.add('2569');
    applications.forEach((a) => {
      if (a.academicYear) years.add(a.academicYear);
    });
    return Array.from(years).sort().reverse();
  }, [applications, currentTimelineConfig?.academicYear]);

  const interviewDateDisplay =
    currentTimelineConfig?.criticalNotice?.interviewDate?.split('(')[0]?.replace('เวลา', '')?.trim() ||
    currentTimelineConfig?.steps?.find((s) => s.id === 'step-3')?.dateStr?.split('(')[0]?.trim() ||
    '15 ตุลาคม 2569';

  const handleSaveScoreNotes = async (appId: string, notes: string) => {
    const target = applications.find((a) => a.id === appId);
    if (!target) return;
    const updated: ScholarshipApplication = {
      ...target,
      reviewerNotes: notes.trim() || undefined,
      updatedAt: new Date().toLocaleString('th-TH'),
    };
    try {
      await saveApplicationOnline(updated);
    } catch (err) {
      console.warn('Could not save score notes online:', err);
    }
    onRefresh();
  };

  const handleSaveEditedApplicant = async (updatedApp: ScholarshipApplication) => {
    try {
      await saveApplicationOnline(updatedApp);
    } catch (err) {
      console.warn('Could not save applicant online:', err);
    }
    onRefresh();
  };

  const handleUpdateTimelineConfigInternal = (newCfg: TimelineConfig) => {
    if (onUpdateTimelineConfig) {
      onUpdateTimelineConfig(newCfg);
    } else {
      saveTimelineConfigOnline(newCfg);
    }
    setTimelineConfig(newCfg);
  };

  const handleConfirmDeleteSingle = async () => {
    if (!deleteTargetApp) return;
    const targetId = deleteTargetApp.id;
    if (onDeleteApplication) {
      await onDeleteApplication(targetId, deleteTargetApp.studentId);
    } else {
      await deleteApplicationOnline(targetId, deleteTargetApp.studentId);
      onRefresh();
    }
    setDeleteTargetApp(null);
  };

  const handleConfirmClearAll = async () => {
    if (onClearAllApplications) {
      await onClearAllApplications();
    } else {
      await clearAllApplicationsOnline();
      clearAllApplications();
      onRefresh();
    }
    setIsClearAllModalOpen(false);
  };

  // Calculate scores for all applications
  const appsWithScores = useMemo(() => {
    return applications.map((app) => ({
      app,
      score: calculateScholarshipScore(app),
    }));
  }, [applications]);

  const filteredApps = useMemo(() => {
    return appsWithScores
      .filter(({ app, score }) => {
        if (selectedAcademicYear !== 'all' && (app.academicYear || '2569') !== selectedAcademicYear) return false;
        if (selectedDept !== 'all' && app.department !== selectedDept) return false;
        if (selectedStatus !== 'all' && app.status !== selectedStatus) return false;
        if (selectedYear !== 'all' && app.studyYear !== selectedYear) return false;
        if (selectedPriority !== 'all' && score.priorityLevel !== selectedPriority) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            (app.studentId || '').toLowerCase().includes(q) ||
            (app.fullName || '').toLowerCase().includes(q) ||
            (app.department || '').toLowerCase().includes(q) ||
            (app.id || '').toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortByScoreDesc) {
          return b.score.totalScore - a.score.totalScore;
        }
        return parseDateTimestamp(b.app.createdAt) - parseDateTimestamp(a.app.createdAt);
      });
  }, [
    appsWithScores,
    selectedAcademicYear,
    selectedDept,
    selectedStatus,
    selectedYear,
    selectedPriority,
    searchQuery,
    sortByScoreDesc,
  ]);

  const handleOpenStatusEdit = (app: ScholarshipApplication) => {
    setEditingApp(app);
    setNewStatus(app.status);
    setNewAwardedAmount(String(app.awardedAmount || 10000));
    setReviewerNotes(app.reviewerNotes || '');
  };

  const handleSaveStatus = async () => {
    if (!editingApp) return;
    const updated: ScholarshipApplication = {
      ...editingApp,
      status: newStatus,
      awardedAmount: newStatus === 'awarded' ? parseFloat(newAwardedAmount) || 10000 : undefined,
      reviewerNotes: reviewerNotes.trim() || undefined,
      updatedAt: new Date().toLocaleString('th-TH'),
    };
    try {
      await saveApplicationOnline(updated);
    } catch (err) {
      console.warn('Could not save status online:', err);
    }
    setEditingApp(null);
    onRefresh();
  };

  // Clear all data with password confirmation
  const handleClearAllData = () => {
    setIsClearAllModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = [
      'เลขที่ใบสมัคร',
      'ปีการศึกษา',
      'วันที่ยื่น',
      'สถานะการพิจารณา',
      'คะแนนประเมินความเดือดร้อน (เต็ม 100)',
      'ระดับความจำเป็น',
      'คะแนน_ข้อ15_รายได้(/30)',
      'คะแนน_ข้อ18และ19_ประวัติทุนและกยศ(/5)',
      'คะแนน_ข้อ7_GPAX_X2(/10)',
      'คะแนน_ข้อ17_ค่าใช้จ่าย(/15)',
      'คะแนน_ข้อ11และ13_ครอบครัวและโรค(/15)',
      'คะแนน_ข้อ14_พี่น้องศึกษา(/10)',
      'คะแนน_ข้อ21ถึง23_งานพิเศษและจิตอาสา(/10)',
      'คะแนน_ข้อ24ถึง26_ความจำเป็น(/5)',
      // Module 1
      '1.ชื่อ-สกุล',
      '2.รหัสนิสิต',
      '3.ภาควิชา',
      '4.ชั้นปี',
      '5.เบอร์โทรศัพท์',
      '6.บ้านเลขที่ภูมิลำเนา',
      '7.ผลการเรียนเฉลี่ยสะสม',
      // Module 2
      '8.ชื่อบิดา',
      '8.1สถานภาพบิดา',
      '8.2อายุบิดา',
      '8.3อาชีพบิดา',
      '8.4รายละเอียดอาชีพบิดา',
      '9.ชื่อมารดา',
      '9.1สถานภาพมารดา',
      '9.2อายุมารดา',
      '9.3อาชีพมารดา',
      '9.4รายละเอียดอาชีพมารดา',
      '10.ชื่อผู้ปกครอง',
      '10.5เกี่ยวข้องกับนิสิต',
      '11.สถานภาพสมรสบิดามารดา',
      '12.สภาพความเป็นอยู่ครอบครัว',
      '13.การเจ็บป่วยในครอบครัว',
      '14.จำนวนพี่น้องที่กำลังศึกษา',
      // Module 3
      '15.รายได้ครอบครัวต่อปี',
      // Module 4
      '17.เงินที่ได้รับต่อเดือน',
      '18.การกู้ยืมกยศ.',
      '19.ประวัติเคยรับทุนอื่น',
      // Module 5
      '20.ที่พักอาศัย',
      // Module 6
      '21.การทำงานพิเศษ',
      // Module 7
      '22.กิจกรรมชมรมสโมสรสภา',
      '23.จิตอาสาบำเพ็ญประโยชน์',
      // Module 8
      '24.สิ่งที่ภูมิใจในตนเอง',
      '25.เหตุผลความจำเป็น',
      '26.แผนการใช้เงินทุน',
      'จำนวนเงินทุนที่อนุมัติ',
      'บันทึกกรรมการ',
    ];

    const rows = filteredApps.map(({ app, score }) => [
      `"${app.id}"`,
      `"${app.academicYear || '2569'}"`,
      `"${formatThaiDateTime(app.createdAt)}"`,
      `"${app.status}"`,
      `"${score.totalScore}"`,
      `"${score.priorityLabel}"`,
      `"${score.incomeScore}"`,
      `"${score.scholarshipHistoryScore || 0}"`,
      `"${score.gpaxScore || 0}"`,
      `"${score.allowanceScore}"`,
      `"${score.familyHardshipScore}"`,
      `"${score.siblingsScore}"`,
      `"${score.selfRelianceScore}"`,
      `"${score.needReasonScore || 0}"`,
      `"${app.fullName}"`,
      `"${app.studentId}"`,
      `"${app.department}"`,
      `"${app.studyYear}"`,
      `"${app.phone}"`,
      `"${app.homeAddress || ''}"`,
      `"${app.gpaxRange || ''}"`,
      `"${app.fatherName || ''}"`,
      `"${app.fatherStatus || ''}"`,
      `"${app.fatherAge || ''}"`,
      `"${app.fatherOccupation || ''}"`,
      `"${app.fatherOccupationDetail || ''}"`,
      `"${app.motherName || ''}"`,
      `"${app.motherStatus || ''}"`,
      `"${app.motherAge || ''}"`,
      `"${app.motherOccupation || ''}"`,
      `"${app.motherOccupationDetail || ''}"`,
      `"${app.guardianName || ''}"`,
      `"${app.guardianRelation || ''}"`,
      `"${app.parentsMaritalStatus || ''}"`,
      `"${app.familyLivingCondition || ''}"`,
      `"${app.familyIllnessStatus || ''}"`,
      `"${app.siblingsStudyingCount || ''}"`,
      `"${app.familyYearlyIncome || ''}"`,
      `"${app.monthlyAllowance || ''}"`,
      `"${app.studentLoanStatus || ''}"`,
      `"${app.pastScholarshipHistory || ''}"`,
      `"${app.accommodationType || ''}"`,
      `"${app.partTimeWorkHistory || ''}"`,
      `"${app.studentActivityParticipation || ''}"`,
      `"${app.volunteerWorkParticipation || ''}"`,
      `"${(app.selfPrideOrTalent || '').replace(/"/g, '""')}"`,
      `"${(app.reasonForApplying || '').replace(/"/g, '""')}"`,
      `"${(app.scholarshipFundUsagePlan || '').replace(/"/g, '""')}"`,
      `"${app.awardedAmount || 0}"`,
      `"${(app.reviewerNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const yrStr = selectedAcademicYear === 'all' ? 'ทุกปีการศึกษา' : selectedAcademicYear;
    link.setAttribute('download', `ทะเบียนผู้สมัครทุน_คณะสังคมศาสตร์_${yrStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats (calculated according to selected academic year)
  const scopedAppsWithScores = useMemo(() => {
    if (selectedAcademicYear === 'all') return appsWithScores;
    return appsWithScores.filter((x) => (x.app.academicYear || '2569') === selectedAcademicYear);
  }, [appsWithScores, selectedAcademicYear]);

  const totalCount = scopedAppsWithScores.length;
  const criticalCount = scopedAppsWithScores.filter((x) => x.score.priorityLevel === 'critical').length;
  const highCount = scopedAppsWithScores.filter((x) => x.score.priorityLevel === 'high').length;
  const awardedCount = scopedAppsWithScores.filter((x) => x.app.status === 'awarded').length;
  const totalAwardedRecipientsCount = awardedCount;

  // Allocation View Computations & Handlers (มาตรฐานสากล)
  const totalAwardedAllocatedBudget = useMemo(() => {
    return scopedAppsWithScores
      .filter((x) => x.app.status === 'awarded')
      .reduce((sum, x) => sum + (Number(x.app.awardedAmount) || 10000), 0);
  }, [scopedAppsWithScores]);

  const totalInterviewEligibleCount = useMemo(() => {
    return scopedAppsWithScores.filter(
      (x) => x.app.status === 'eligible_for_interview' || x.app.status === 'interviewed' || x.app.status === 'awarded'
    ).length;
  }, [scopedAppsWithScores]);

  const budgetRemaining = budgetPool - totalAwardedAllocatedBudget;
  const budgetUtilizationPercent = Math.min(100, Math.round((totalAwardedAllocatedBudget / (budgetPool || 1)) * 100));

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveBudgetPool = () => {
    const val = parseFloat(tempBudgetPool) || 0;
    setBudgetPool(val);
    try {
      localStorage.setItem('nu_socsci_grant_budget_pool', String(val));
    } catch {}
    setIsEditingBudgetPool(false);
    showToast(`บันทึกเพดานงบประมาณทุน ฿${val.toLocaleString()} เรียบร้อยแล้ว`);
  };

  const sortedCandidatesForAllocation = useMemo(() => {
    return appsWithScores
      .filter(({ app, score }) => {
        if (selectedAcademicYear !== 'all' && (app.academicYear || '2569') !== selectedAcademicYear) return false;
        if (selectedDept !== 'all' && app.department !== selectedDept) return false;
        if (selectedYear !== 'all' && app.studyYear !== selectedYear) return false;

        // Allocation scope filter
        if (allocationScopeFilter === 'interview_all') {
          return app.status === 'eligible_for_interview' || app.status === 'interviewed' || app.status === 'awarded';
        }
        if (allocationScopeFilter === 'awarded_only') {
          return app.status === 'awarded';
        }
        if (allocationScopeFilter === 'pending_only') {
          return app.status === 'eligible_for_interview' || app.status === 'interviewed';
        }
        return true;
      })
      .filter(({ app }) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          (app.studentId || '').toLowerCase().includes(q) ||
          (app.fullName || '').toLowerCase().includes(q) ||
          (app.department || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const parseRank = (val: any): number | null => {
          if (val === undefined || val === null || val === '') return null;
          const n = Number(val);
          return isNaN(n) ? null : n;
        };
        // Priority 1: Committee Final Rank (หลังสัมภาษณ์)
        const rankA = parseRank(a.app.finalRank);
        const rankB = parseRank(b.app.finalRank);
        if (rankA !== null && rankB !== null) {
          if (rankA !== rankB) return rankA - rankB;
        } else if (rankA !== null) {
          return -1;
        } else if (rankB !== null) {
          return 1;
        }
        // Priority 2: Document Score descending (คะแนนความจำเป็นเดิม)
        if (b.score.totalScore !== a.score.totalScore) {
          return b.score.totalScore - a.score.totalScore;
        }
        return (a.app.studentId || '').localeCompare(b.app.studentId || '');
      });
  }, [appsWithScores, selectedAcademicYear, selectedDept, selectedYear, allocationScopeFilter, searchQuery]);

  const handleQuickInlineAllocation = async (
    targetApp: ScholarshipApplication,
    status: ScholarshipApplication['status'],
    amount?: number,
    notes?: string,
    finalRank?: number
  ) => {
    setSavingAppId(targetApp.id);
    const resolvedAmount = status === 'awarded' ? (amount !== undefined ? amount : (targetApp.awardedAmount || 10000)) : undefined;
    const updated: ScholarshipApplication = {
      ...targetApp,
      status,
      awardedAmount: resolvedAmount,
      reviewerNotes: notes !== undefined ? notes : targetApp.reviewerNotes,
      finalRank: finalRank !== undefined ? finalRank : targetApp.finalRank,
      updatedAt: new Date().toLocaleString('th-TH'),
    };
    try {
      await saveApplicationOnline(updated);
      setSavedSuccessId(targetApp.id);
      setTimeout(() => setSavedSuccessId(null), 2500);
      showToast(
        status === 'awarded'
          ? `อนุมัติทุน ฿${(resolvedAmount || 10000).toLocaleString()}${finalRank ? ` (อันดับที่ ${finalRank})` : ''} แก่ ${targetApp.fullName} เรียบร้อยแล้ว (เชื่อมต่อหน้าประกาศผลแล้ว)`
          : `บันทึกข้อมูลของ ${targetApp.fullName}${finalRank ? ` (อันดับที่ ${finalRank})` : ''} เรียบร้อยแล้ว`
      );
    } catch (err) {
      console.warn('Could not save inline allocation:', err);
    } finally {
      setSavingAppId(null);
      onRefresh();
    }
  };

  const handleBatchAwardTop = async () => {
    setIsBatchAwardModalOpen(false);
    const candidatesToAward = sortedCandidatesForAllocation
      .map((x) => x.app)
      .slice(0, batchTopCount);

    if (candidatesToAward.length === 0) return;

    showToast(`กำลังบันทึกอนุมัติทุน Top ${candidatesToAward.length} คน คนละ ฿${batchAmountPerPerson.toLocaleString()}...`);

    for (const cand of candidatesToAward) {
      const updated: ScholarshipApplication = {
        ...cand,
        status: 'awarded',
        awardedAmount: batchAmountPerPerson,
        updatedAt: new Date().toLocaleString('th-TH'),
      };
      try {
        await saveApplicationOnline(updated);
      } catch (err) {
        console.warn('Batch save error:', err);
      }
    }
    onRefresh();
    showToast(`อนุมัติทุน Top ${candidatesToAward.length} คนเรียบร้อยแล้ว! ข้อมูลเชื่อมโยงไปหน้าประกาศผลแล้ว`);
  };

  const handlePublishOfficialAnnouncement = () => {
    const confirmMsg =
      'ยืนยันเผยแพร่ผลการคัดเลือกทุนอย่างเป็นทางการ?\n\n' +
      'เมื่อยืนยันแล้ว:\n' +
      '1. สถานะระบบจะเปลี่ยนเป็น "ประกาศผลการคัดเลือกเสร็จสิ้น" (awarded)\n' +
      '2. นิสิตและบุคคลภายนอกจะเข้าดูรายชื่อผู้ได้รับทุนและยอดเงินทุนได้ทันทีที่หน้าประกาศผล';
    if (window.confirm(confirmMsg)) {
      const updatedCfg: TimelineConfig = {
        ...currentTimelineConfig,
        systemPhase: 'awarded',
        lastUpdatedAt: new Date().toLocaleString('th-TH'),
        lastUpdatedBy: 'คณะกรรมการพิจารณาทุน คณะสังคมศาสตร์',
      };
      handleUpdateTimelineConfigInternal(updatedCfg);
      showToast('🚀 เผยแพร่ผลการคัดเลือกทุนสู่หน้าประกาศผลทางการเรียบร้อยแล้ว!');
    }
  };

  const handleExportAllocationCSV = () => {
    const headers = [
      'อันดับมติกรรมการ',
      'อันดับเดิมตามคะแนน',
      'รหัสนิสิต',
      'ชื่อ-นามสกุล',
      'ภาควิชา',
      'ชั้นปี',
      'ผลการเรียนเฉลี่ย (GPAX)',
      'คะแนนความจำเป็น (เต็ม 100)',
      'ระดับความจำเป็น',
      'สถานะผลการพิจารณา',
      'วงเงินทุนที่ได้รับอนุมัติ (บาท)',
      'หมายเหตุ/เงื่อนไขคณะกรรมการ',
      'เบอร์โทรศัพท์',
    ];

    const rows = sortedCandidatesForAllocation.map((item, idx) => [
      `"${item.app.finalRank !== undefined && item.app.finalRank !== null && String(item.app.finalRank).trim() !== '' ? Number(item.app.finalRank) : (idx + 1)}"`,
      `"${idx + 1}"`,
      `"${item.app.studentId || ''}"`,
      `"${item.app.fullName || ''}"`,
      `"${item.app.department || ''}"`,
      `"${item.app.studyYear || ''}"`,
      `"${item.app.gpaxRange || item.app.gpax || ''}"`,
      `"${item.score.totalScore}"`,
      `"${item.score.priorityLabel}"`,
      `"${
        item.app.status === 'awarded'
          ? 'อนุมัติจัดสรรทุน (ได้รับทุน)'
          : item.app.status === 'interviewed'
          ? 'ผ่านสัมภาษณ์/รอผล'
          : item.app.status === 'eligible_for_interview'
          ? 'มีสิทธิ์สัมภาษณ์'
          : item.app.status === 'not_selected'
          ? 'ไม่อยู่ในกลุ่มคัดเลือก'
          : item.app.status
      }"`,
      `"${item.app.status === 'awarded' ? (item.app.awardedAmount || 10000) : 0}"`,
      `"${(item.app.reviewerNotes || '').replace(/"/g, '""')}"`,
      `"${item.app.phone || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const yrStr = selectedAcademicYear === 'all' ? (currentTimelineConfig?.academicYear || '2569') : selectedAcademicYear;
    link.setAttribute('download', `มติการจัดสรรทุนการศึกษา_คณะสังคมศาสตร์_${yrStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* iOS Top Inset Card */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 shadow-xs border border-black/[0.06] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.05]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-[8px] bg-[#5856D6]/15 text-[#5856D6]">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-[#5856D6] uppercase tracking-wider">
                งานกิจการนิสิตและศิษย์เก่าสัมพันธ์
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1C1E] font-['Prompt',sans-serif] tracking-tight">
              ระบบฐานข้อมูลและคัดกรองทุน คณะสังคมศาสตร์ ปีการศึกษา {selectedAcademicYear === 'all' ? (currentTimelineConfig?.academicYear || '2569') : selectedAcademicYear}
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E93] mt-0.5">
              รองรับ Database Table, Web Application Form, Admin Dashboard และระบบคะแนนคัดเลือกทุน 100 คะแนน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTimelineConfig(loadTimelineConfig());
                setIsTimelineEditorOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FF9500]/12 hover:bg-[#FF9500]/20 text-[#b06000] text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="แก้ไขกำหนดการ วันสัมภาษณ์ และเงื่อนไขรับสมัคร"
            >
              <Calendar className="w-4 h-4 text-[#FF9500]" />
              <span>จัดการกำหนดการ</span>
            </button>
            {onOpenScoringModal && (
              <button
                type="button"
                onClick={onOpenScoringModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#5856D6]/12 hover:bg-[#5856D6]/20 text-[#5856D6] text-xs font-bold transition-all active:scale-95 cursor-pointer"
                title="ดูตารางเกณฑ์ 100 คะแนน และโปรแกรมจำลองคำนวณ"
              >
                <Scale className="w-4 h-4 text-[#5856D6]" />
                <span>เกณฑ์คะแนน & Simulator</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#34C759]/12 hover:bg-[#34C759]/20 text-[#248A3D] text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#34C759]" />
              <span>ส่งออก Database (Excel/CSV)</span>
            </button>

            {applications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#D70015] text-xs font-bold transition-all active:scale-95 cursor-pointer"
                title="ล้างข้อมูลใบสมัครทั้งหมดเพื่อเริ่มรับสมัครจริง"
              >
                <Trash2 className="w-4 h-4 text-[#D70015]" />
                <span>ล้างข้อมูล ({applications.length})</span>
              </button>
            )}

            <button
              onClick={onRefresh}
              className="p-2 text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#767680]/10 rounded-full transition-colors cursor-pointer"
              title="รีเฟรชข้อมูล"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Academic Year Lifecycle Control Banner (Annual System Phase Control) */}
        <LifecyclePhaseControl
          timelineConfig={currentTimelineConfig}
          onUpdateConfig={handleUpdateTimelineConfigInternal}
        />

        {/* Metric Widgets (iOS Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-[20px] bg-[#F2F2F7] border border-black/[0.04]">
            <span className="text-xs font-medium text-[#8E8E93] block">ผู้สมัครทั้งหมด</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#1C1C1E] font-mono mt-1 block">
              {totalCount}
            </span>
          </div>

          <div className="p-4 rounded-[20px] bg-[#fce8e6] border border-[#ea4335]/20">
            <span className="text-xs font-bold text-[#d93025] block">
              ความจำเป็นเร่งด่วนสูงสุด (ระดับ 1)
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#d93025] font-mono mt-1 block">
              {criticalCount}
            </span>
          </div>

          <div className="p-4 rounded-[20px] bg-[#fef7e0] border border-[#f9ab00]/30">
            <span className="text-xs font-bold text-[#b06000] block">ความจำเป็นสูง (ระดับ 2)</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#b06000] font-mono mt-1 block">
              {highCount}
            </span>
          </div>

          <div className="p-4 rounded-[20px] bg-[#34C759]/10 border border-[#34C759]/20">
            <span className="text-xs font-bold text-[#248A3D] block">อนุมัติจัดสรรทุนแล้ว</span>
            <span className="text-2xl sm:text-3xl font-bold text-[#248A3D] font-mono mt-1 block">
              {awardedCount}
            </span>
          </div>
        </div>

        {/* View Switcher: Database Table vs Allocation vs Itemized Score Matrix vs Scoring Ranking */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-black/[0.05]">
          <div className="bg-[#F2F2F7] p-1 rounded-[16px] flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveView('allocation')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                activeView === 'allocation' ? 'bg-[#34C759] text-white shadow-xs' : 'text-[#8E8E93] hover:text-[#248A3D]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>จัดสรรทุน & สรุปผลสัมภาษณ์</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${activeView === 'allocation' ? 'bg-white/20 text-white' : 'bg-[#34C759]/15 text-[#248A3D]'}`}>
                สากล
              </span>
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                activeView === 'table' ? 'bg-white text-[#1C1C1E] shadow-xs' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ทะเบียนข้อมูล (Database)</span>
            </button>
            <button
              onClick={() => setActiveView('itemized')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                activeView === 'itemized' ? 'bg-white text-[#007AFF] shadow-xs' : 'text-[#8E8E93] hover:text-[#007AFF]'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>คะแนนแยกแต่ละข้อ (Itemized)</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#007AFF]/12 text-[#007AFF]">
                เมนูเจ้าหน้าที่
              </span>
            </button>
            <button
              onClick={() => setActiveView('scoring')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                activeView === 'scoring' ? 'bg-white text-[#1C1C1E] shadow-xs' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>ระบบจัดอันดับ & เกณฑ์ (100 คะแนน)</span>
            </button>
          </div>

          <button
            onClick={() => setSortByScoreDesc(!sortByScoreDesc)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer self-start sm:self-auto ${
              sortByScoreDesc
                ? 'bg-[#FF9500]/12 text-[#b06000] border-[#FF9500]/30'
                : 'bg-white text-[#636366] border-[#dadce0]'
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{sortByScoreDesc ? 'เรียงตามคะแนนเดือดร้อน (มากไปน้อย)' : 'เรียงตามเวลากรอก'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (iOS Style) */}
      <div className="bg-white rounded-[22px] p-3.5 shadow-xs border border-black/[0.04] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-[#8E8E93] mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>กรอง:</span>
          </div>

          {/* ตัวกรองปีการศึกษา (Multi-Year Ready) */}
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-[#007AFF]/25 bg-[#007AFF]/10 text-xs font-bold text-[#007AFF] outline-none cursor-pointer hover:bg-[#007AFF]/15 transition-colors"
          >
            <option value="all">ปีการศึกษา: ทั้งหมด</option>
            {availableAcademicYears.map((yr) => (
              <option key={yr} value={yr}>
                ปีการศึกษา {yr} {yr === (currentTimelineConfig?.academicYear || '2569') ? '(รอบปัจจุบัน)' : ''}
              </option>
            ))}
          </select>

          {/* ภาควิชา 5 ภาค */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-transparent bg-[#F2F2F7] text-xs font-medium text-[#1C1C1E] outline-none cursor-pointer"
          >
            <option value="all">ทุกภาควิชา (5 ภาควิชา)</option>
            {OFFICIAL_DEPARTMENTS_2569.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* ชั้นปี */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-transparent bg-[#F2F2F7] text-xs font-medium text-[#1C1C1E] outline-none cursor-pointer"
          >
            <option value="all">ทุกชั้นปี</option>
            <option value="ชั้นปีที่ 1">ชั้นปีที่ 1</option>
            <option value="ชั้นปีที่ 2">ชั้นปีที่ 2</option>
            <option value="ชั้นปีที่ 3">ชั้นปีที่ 3</option>
            <option value="ชั้นปีที่ 4">ชั้นปีที่ 4</option>
            <option value="ชั้นปีที่ 4 ขึ้นไป">ชั้นปีที่ 4 ขึ้นไป</option>
          </select>

          {/* ระดับความจำเป็น */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-transparent bg-[#F2F2F7] text-xs font-medium text-[#1C1C1E] outline-none cursor-pointer"
          >
            <option value="all">ทุกระดับความจำเป็น</option>
            <option value="critical">ความจำเป็นเร่งด่วนสูงสุด (75 คะแนนขึ้นไป)</option>
            <option value="high">ความจำเป็นสูง (60-74 คะแนน)</option>
            <option value="moderate">ความจำเป็นปานกลาง (45-59 คะแนน)</option>
            <option value="normal">ระดับปกติ (น้อยกว่า 45 คะแนน)</option>
          </select>

          {/* สถานะ */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-full border border-transparent bg-[#F2F2F7] text-xs font-medium text-[#1C1C1E] outline-none cursor-pointer"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="submitted">ยื่นใบสมัครแล้ว (รอตรวจสอบ)</option>
            <option value="eligible_for_interview">มีสิทธิ์สัมภาษณ์ทุน</option>
            <option value="interviewed">สัมภาษณ์แล้ว</option>
            <option value="awarded">อนุมัติทุนแล้ว</option>
            <option value="not_selected">ไม่อยู่ในกลุ่มผู้ได้รับการคัดเลือกเข้าสัมภาษณ์</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัสนิสิต, เลขที่ใบสมัคร..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#F2F2F7] text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 transition-all font-mono"
          />
          <Search className="w-3.5 h-3.5 text-[#8E8E93] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* ================================================================ */}
      {/* VIEW 1: Database Table View */}
      {/* ================================================================ */}
      {activeView === 'table' && (
        <div className="bg-white rounded-[26px] shadow-xs border border-black/[0.04] overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F2F2F7]/80 border-b border-black/[0.05] text-[#8E8E93] font-semibold text-xs">
                <tr>
                  <th className="px-4 py-3.5">รหัสนิสิต / ผู้สมัคร</th>
                  <th className="px-4 py-3.5">ภาควิชา & ชั้นปี</th>
                  <th className="px-4 py-3.5">GPAX</th>
                  <th className="px-4 py-3.5">รายได้ครอบครัว / หนี้สิน</th>
                  <th className="px-4 py-3.5">คะแนนความเดือดร้อน</th>
                  <th className="px-4 py-3.5">สถานะ</th>
                  <th className="px-4 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-[#1C1C1E]">
                {filteredApps.length > 0 ? (
                  filteredApps.map(({ app, score }) => (
                    <tr key={app.id} className="hover:bg-black/[0.015] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {app.studentPhotoDoc?.dataUrl ? (
                            <div className="w-10 h-12 rounded-[8px] overflow-hidden border border-black/10 shrink-0 bg-[#F2F2F7]">
                              <img
                                src={app.studentPhotoDoc.dataUrl}
                                alt={app.fullName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-12 rounded-[8px] border border-dashed border-[#8E8E93]/40 flex items-center justify-center shrink-0 bg-[#F8F9FA] text-[#8E8E93]">
                              <User className="w-5 h-5 text-[#8E8E93]/60" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-[#007AFF] font-mono text-xs flex items-center gap-1.5">
                              <span>{app.studentId || '-'}</span>
                              <span className="text-[10px] font-sans font-medium px-1.5 py-0.2 rounded-full bg-[#007AFF]/10 text-[#007AFF]">
                                ปี {app.academicYear || '2569'}
                              </span>
                            </div>
                            <div className="font-semibold text-[#1C1C1E] text-xs sm:text-sm">
                              {app.fullName}
                            </div>
                            <div className="text-[11px] text-[#8E8E93] flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span>{app.phone || '-'}</span>
                              <span>•</span>
                              <span>{app.id}</span>
                              <span>•</span>
                              <span>ยื่นเมื่อ: {formatThaiDateTime(app.createdAt)}</span>
                              {applications.some(
                                (other) =>
                                  other.id !== app.id &&
                                  other.studentId === app.studentId &&
                                  (other.academicYear || '2569') !== (app.academicYear || '2569')
                              ) && (
                                <span className="inline-flex items-center text-[10px] font-semibold text-[#5856D6] bg-[#5856D6]/10 px-1.5 py-0.2 rounded">
                                  เคยสมัครหลายปี
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-[#1C1C1E] text-xs sm:text-sm">
                          {app.department}
                        </div>
                        <div className="text-[11px] text-[#8E8E93]">
                          {app.studyYear || '-'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-[#1C1C1E] text-xs px-2 py-0.5 rounded-[6px] bg-[#F2F2F7] block w-fit">
                          {app.gpaxRange || app.gpax || '-'}
                        </span>
                        {app.academicTranscriptDoc ? (
                          <div className="mt-1">
                            {app.academicTranscriptDoc.dataUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setViewerDocument({
                                    doc: app.academicTranscriptDoc!,
                                    title: 'ใบรายงานผลการศึกษา (Transcript / ใบแจ้งเกรด)',
                                    applicantName: app.fullName,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[10px] text-[#5856D6] font-semibold hover:text-[#3634A3] bg-[#5856D6]/10 hover:bg-[#5856D6]/20 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                                title="คลิกเพื่อเปิดอ่านไฟล์ใบเกรด / Transcript"
                              >
                                <span>
                                  {app.academicTranscriptDoc.fileType?.includes('pdf') ||
                                  app.academicTranscriptDoc.fileName?.endsWith('.pdf')
                                    ? '📄 PDF ใบเกรด'
                                    : '🖼️ ภาพใบเกรด'}
                                </span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#5856D6] font-semibold">
                                📄 มีใบเกรด
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#8E8E93] mt-0.5 block">
                            (ไม่มีไฟล์เกรดแนบ)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-[#1C1C1E]">
                          {app.familyYearlyIncome ? `${app.familyYearlyIncome} บ./ปี` : '-'}
                        </div>
                        <div className="mt-1">
                          {app.incomeCertificateDoc ? (
                            app.incomeCertificateDoc.dataUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setViewerDocument({
                                    doc: app.incomeCertificateDoc!,
                                    title: 'หนังสือรับรองรายได้ครอบครัว / สลิปเงินเดือน',
                                    applicantName: app.fullName,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-[10px] text-[#007AFF] font-semibold hover:text-[#0051D5] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                                title="คลิกเพื่อเปิดอ่านหนังสือรับรองรายได้"
                              >
                                <span>
                                  {app.incomeCertificateDoc.fileType?.includes('pdf') ||
                                  app.incomeCertificateDoc.fileName?.endsWith('.pdf')
                                    ? '📎 PDF รับรองรายได้'
                                    : '🖼️ ภาพรับรองรายได้'}
                                </span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#007AFF]">
                                📎 มีเอกสารรับรองรายได้
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] text-[#8E8E93]">ไม่มีเอกสารแนบ</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-sm text-[#1C1C1E]">
                            {score.totalScore}
                          </span>
                          <span className="text-[11px] text-[#8E8E93]">/ 100</span>
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border mt-0.5 ${score.colorClass}`}>
                          {score.priorityLabel}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {app.status === 'eligible_for_interview' && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FF9500]/15 text-[#D97706] border border-[#FF9500]/25">
                            มีสิทธิ์สัมภาษณ์
                          </span>
                        )}
                        {app.status === 'submitted' && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#767680]/12 text-[#636366]">
                            รอตรวจเอกสาร
                          </span>
                        )}
                        {app.status === 'awarded' && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#34C759]/15 text-[#248A3D] border border-[#34C759]/25">
                            อนุมัติทุน ({app.awardedAmount ? `${app.awardedAmount.toLocaleString()} บ.` : ''})
                          </span>
                        )}
                        {app.status === 'interviewed' && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#007AFF]/12 text-[#007AFF]">
                            สัมภาษณ์แล้ว
                          </span>
                        )}
                        {app.status === 'not_selected' && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#8E8E93]/15 text-[#636366]">
                            ไม่อยู่ในกลุ่มผู้ได้รับการคัดเลือกเข้าสัมภาษณ์
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedItemizedApp(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#007AFF]/12 hover:bg-[#007AFF]/20 text-[#007AFF] rounded-full transition-colors cursor-pointer"
                            title="ดูใบคะแนนการประเมินรายข้อ (Officer Score Sheet)"
                          >
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">ใบคะแนน</span>
                          </button>
                          <button
                            onClick={() => setEditApplicantTarget(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#34C759]/15 hover:bg-[#34C759]/25 text-[#248A3D] rounded-full transition-colors cursor-pointer"
                            title="แก้ไขข้อมูลผู้สมัครในฐานข้อมูล (Admin Edit)"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">แก้ไขข้อมูล</span>
                          </button>
                          <button
                            onClick={() => onViewApplication(app)}
                            className="p-1.5 text-[#8E8E93] hover:text-[#007AFF] hover:bg-[#007AFF]/10 rounded-full transition-colors cursor-pointer"
                            title="ดูใบสมัครฉบับเต็ม"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenStatusEdit(app)}
                            className="px-3 py-1 text-xs font-semibold bg-[#007AFF] hover:bg-[#0071EB] text-white rounded-full transition-all active:scale-95 shadow-xs cursor-pointer"
                          >
                            ปรับสถานะ
                          </button>
                          <button
                            onClick={() => setDeleteTargetApp(app)}
                            className="p-1.5 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full transition-colors cursor-pointer"
                            title="ลบข้อมูลผู้สมัครรายนี้ (ต้องใส่รหัสผ่าน 07011985)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#8E8E93] text-sm">
                      ไม่พบข้อมูลผู้สมัครที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW: ตารางคะแนนแยกตามข้อสำหรับเจ้าหน้าที่ (Itemized Score Matrix) */}
      {/* ================================================================ */}
      {activeView === 'itemized' && (
        <div className="bg-white rounded-[26px] shadow-xs border border-black/[0.04] overflow-hidden animate-fadeIn space-y-4">
          <div className="p-5 border-b border-black/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F2F2F7]/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#007AFF]/15 text-[#007AFF]">
                  <ClipboardList className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm sm:text-base text-[#1C1C1E] font-['Prompt',sans-serif]">
                  ตารางแจกแจงคะแนนความเดือดร้อนรายข้อ (Itemized Rubric Matrix - 100 คะแนน)
                </h3>
              </div>
              <p className="text-xs text-[#636366] mt-1">
                เจ้าหน้าที่และกรรมการสามารถดูคะแนนแต่ละข้อของนิสิตได้อย่างชัดเจน หรือคลิก <strong className="text-[#007AFF]">"ใบคะแนน"</strong> เพื่อเปิดใบคะแนนรายบุคคลและบันทึกผลสัมภาษณ์
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white text-xs font-semibold text-[#636366] border border-black/[0.06]">
                แสดง {filteredApps.length} จาก {applications.length} ใบสมัคร
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F2F2F7] border-b border-black/[0.06] text-[#636366] font-semibold">
                <tr>
                  <th className="py-3 px-3.5 whitespace-nowrap">ผู้สมัคร / รหัสนิสิต</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap bg-[#007AFF]/5 text-[#007AFF]">
                    <div>ข้อ 15</div>
                    <div className="text-[10px] font-normal">รายได้ (/30)</div>
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap bg-[#00A1F1]/5 text-[#0077B6]">
                    <div>ข้อ 18,19</div>
                    <div className="text-[10px] font-normal">ทุน&กยศ. (/5)</div>
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap bg-[#5856D6]/5 text-[#5856D6]">
                    <div>ข้อ 7</div>
                    <div className="text-[10px] font-normal">GPAX (X2) (/10)</div>
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap bg-[#34C759]/5 text-[#248A3D]">
                    <div>ข้อ 17</div>
                    <div className="text-[10px] font-normal">ค่าใช้จ่าย (/15)</div>
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap bg-[#AF52DE]/5 text-[#AF52DE]">
                    <div>ข้อ 11,13</div>
                    <div className="text-[10px] font-normal">ครอบครัว&โรค (/15)</div>
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap bg-[#8E8E93]/10 text-[#636366]">
                    <div>ข้อ 14</div>
                    <div className="text-[10px] font-normal">พี่น้อง (/10)</div>
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap bg-[#FF2D55]/5 text-[#FF2D55]">
                    <div>ข้อ 21-23</div>
                    <div className="text-[10px] font-normal">งานพิเศษ&จิตอาสา (/10)</div>
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap bg-[#FF9500]/5 text-[#b06000]">
                    <div>ข้อ 24-26</div>
                    <div className="text-[10px] font-normal">ความจำเป็น (/5)</div>
                  </th>
                  <th className="py-3 px-3 text-center whitespace-nowrap bg-[#1C1C1E] text-white">
                    <div>คะแนนรวม</div>
                    <div className="text-[10px] font-normal">(/100)</div>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-center">ระดับความจำเป็น</th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-right">ใบคะแนน / จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredApps.length > 0 ? (
                  filteredApps.map(({ app, score }) => (
                    <tr
                      key={app.id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedItemizedApp(app)}
                    >
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-[#007AFF] font-mono text-xs flex items-center gap-1.5">
                          <span>{app.studentId || '-'}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#007AFF]/10 text-[#007AFF] font-sans font-medium">
                            ปี {app.academicYear || '2569'}
                          </span>
                        </div>
                        <div className="font-semibold text-[#1C1C1E] text-xs">
                          {app.fullName}
                        </div>
                        <div className="text-[10px] text-[#8E8E93]">
                          {app.department} • {app.studyYear}
                        </div>
                      </td>

                      {/* ข้อ 15: รายได้ */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                          score.incomeScore >= 24 ? 'bg-[#007AFF]/15 text-[#007AFF]' : 'bg-[#F2F2F7] text-[#1C1C1E]'
                        }`}>
                          {score.incomeScore}
                        </span>
                        <div className="text-[10px] text-[#8E8E93] truncate max-w-[90px] mx-auto mt-0.5">
                          {app.familyYearlyIncome || '-'} {app.incomeCertificateDoc ? '📎' : ''}
                        </div>
                      </td>

                      {/* ข้อ 18,19: ทุน & กยศ. */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                          (score.scholarshipHistoryScore || 0) === 5 ? 'bg-[#0077B6]/15 text-[#0077B6]' : 'bg-[#F2F2F7] text-[#1C1C1E]'
                        }`}>
                          {score.scholarshipHistoryScore || 0}
                        </span>
                        <div className="text-[10px] text-[#8E8E93] truncate max-w-[90px] mx-auto mt-0.5">
                          {app.studentLoanStatus === 'ไม่กู้' ? 'ไม่กู้' : 'กู้ กยศ.'}
                        </div>
                      </td>

                      {/* ข้อ 7: เกรดเฉลี่ย (GPAX X2) */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                          (score.gpaxScore || 0) >= 8 ? 'bg-[#5856D6]/15 text-[#5856D6]' : 'bg-[#F2F2F7] text-[#1C1C1E]'
                        }`}>
                          {score.gpaxScore || 0}
                        </span>
                        <div className="text-[10px] text-[#8E8E93] truncate max-w-[90px] mx-auto mt-0.5">
                          {app.gpaxRange || '-'}
                        </div>
                      </td>

                      {/* ข้อ 17: ค่าใช้จ่าย */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                          score.allowanceScore >= 12 ? 'bg-[#34C759]/15 text-[#248A3D]' : 'bg-[#F2F2F7] text-[#1C1C1E]'
                        }`}>
                          {score.allowanceScore}
                        </span>
                        <div className="text-[10px] text-[#8E8E93] truncate max-w-[90px] mx-auto mt-0.5">
                          {app.monthlyAllowance ? `${app.monthlyAllowance} บ.` : '-'}
                        </div>
                      </td>

                      {/* ข้อ 11, 13: ครอบครัวและโรค */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                          score.familyHardshipScore >= 10 ? 'bg-[#AF52DE]/15 text-[#AF52DE]' : 'bg-[#F2F2F7] text-[#1C1C1E]'
                        }`}>
                          {score.familyHardshipScore}
                        </span>
                        <div className="text-[9px] text-[#8E8E93] mt-0.5">
                          โรค +{score.illnessScore || 0} / สมรส +{score.maritalStatusScore || 0}
                        </div>
                      </td>

                      {/* ข้อ 14: พี่น้องศึกษา */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                          score.siblingsScore >= 7 ? 'bg-[#5856D6]/15 text-[#5856D6]' : 'bg-[#F2F2F7] text-[#1C1C1E]'
                        }`}>
                          {score.siblingsScore}
                        </span>
                        <div className="text-[10px] text-[#8E8E93] truncate max-w-[70px] mx-auto mt-0.5">
                          {app.siblingsStudyingCount || '-'}
                        </div>
                      </td>

                      {/* ข้อ 21-23: งานพิเศษและจิตอาสา */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                          score.selfRelianceScore >= 6 ? 'bg-[#FF2D55]/15 text-[#FF2D55]' : 'bg-[#F2F2F7] text-[#1C1C1E]'
                        }`}>
                          {score.selfRelianceScore}
                        </span>
                        <div className="text-[9px] text-[#8E8E93] mt-0.5">
                          งาน +{score.partTimeScore || 0} / จิตอาสา +{score.volunteerScore || 0}
                        </div>
                      </td>

                      {/* ข้อ 24-26: ความจำเป็น */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-xs ${
                          (score.needReasonScore || 0) >= 3 ? 'bg-[#FF9500]/15 text-[#b06000]' : 'bg-[#F2F2F7] text-[#1C1C1E]'
                        }`}>
                          {score.needReasonScore || 0}
                        </span>
                        <div className="text-[9px] text-[#8E8E93] mt-0.5">
                          ข้อความจำเป็น
                        </div>
                      </td>

                      {/* คะแนนรวม */}
                      <td className="py-3 px-3 text-center font-mono bg-black/[0.02]">
                        <span className="text-base font-extrabold text-[#1C1C1E]">
                          {score.totalScore}
                        </span>
                      </td>

                      {/* ระดับความจำเป็น */}
                      <td className="py-3 px-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${score.colorClass}`}>
                          {score.priorityLabel}
                        </span>
                      </td>

                      {/* การจัดการ */}
                      <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedItemizedApp(app)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#007AFF]/12 hover:bg-[#007AFF]/20 text-[#007AFF] transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-2xs"
                            title="เปิดใบคะแนนรายบุคคลฉบับละเอียด & บันทึกสัมภาษณ์"
                          >
                            <ClipboardList className="w-3.5 h-3.5" />
                            <span>ใบคะแนน</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditApplicantTarget(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#34C759]/15 hover:bg-[#34C759]/25 text-[#248A3D] rounded-full transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                            title="แก้ไขข้อมูลผู้สมัครในฐานข้อมูล (Admin Edit)"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenStatusEdit(app)}
                            className="px-2.5 py-1 text-xs font-semibold bg-[#1C1C1E] hover:bg-black text-white rounded-full transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            สถานะ
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetApp(app)}
                            className="p-1.5 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full transition-colors cursor-pointer"
                            title="ลบข้อมูลผู้สมัครรายนี้ (ต้องใส่รหัสผ่าน 07011985)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-[#8E8E93] text-sm">
                      ไม่พบข้อมูลผู้สมัครที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 2: ระบบคะแนนคัดเลือกทุน (Scoring Matrix View) */}
      {/* ================================================================ */}
      {activeView === 'scoring' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-[24px] p-6 shadow-xs border border-black/[0.06] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-bold text-[#1C1C1E] font-['Prompt',sans-serif] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FF9500]" />
                <span>เกณฑ์การให้คะแนนความเดือดร้อนและความจำเป็น (100 คะแนนเต็ม)</span>
              </h3>
              {onOpenScoringModal && (
                <button
                  type="button"
                  onClick={onOpenScoringModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FF9500] hover:bg-[#E08500] text-white transition-all active:scale-95 shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>ดูเกณฑ์ละเอียด & ทดลองจำลองคะแนน</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#636366] leading-relaxed">
              เกณฑ์การประเมินคำนวณจาก 7 มิติสำคัญ: รายได้ครอบครัว (25 คะแนน) + ภาระหนี้สินครอบครัว (15 คะแนน) + เงินค่าใช้จ่ายที่นิสิตได้รับต่อเดือน (15 คะแนน) + สภาพความยากลำบากและการเจ็บป่วย (15 คะแนน) + ภาระพี่น้องกำลังศึกษา (10 คะแนน) + การพึ่งพาตนเอง/งานพิเศษ/จิตอาสา (10 คะแนน) + ผลการเรียนและความพร้อม (10 คะแนน)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map(({ app, score }) => (
              <div
                key={app.id}
                className="bg-white rounded-[22px] p-5 shadow-xs border border-black/[0.06] space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#007AFF]">
                        {app.studentId}
                      </span>
                      <span className="text-[11px] text-[#8E8E93]">• {app.department}</span>
                    </div>
                    <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif]">
                      {app.fullName} ({app.studyYear})
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-extrabold text-2xl text-[#1C1C1E]">
                      {score.totalScore}
                    </span>
                    <span className="text-xs text-[#8E8E93]">/100</span>
                    <span className={`block px-2 py-0.5 rounded-full text-[10px] border mt-1 font-bold ${score.colorClass}`}>
                      {score.priorityLabel}
                    </span>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="space-y-2 pt-2 border-t border-black/[0.05] text-xs">
                  <div className="flex items-center justify-between text-[#636366]">
                    <span>1. รายได้ครอบครัว ({app.familyYearlyIncome || '-'}) {app.incomeCertificateDoc ? '📎' : ''}</span>
                    <span className="font-mono font-bold text-[#1C1C1E]">{score.incomeScore}/30</span>
                  </div>

                  <div className="flex items-center justify-between text-[#636366]">
                    <span>2. ประวัติรับทุน & กยศ. ({app.studentLoanStatus || 'ไม่กู้'})</span>
                    <span className="font-mono font-bold text-[#1C1C1E]">{score.scholarshipHistoryScore || 0}/5</span>
                  </div>

                  <div className="flex items-center justify-between text-[#636366]">
                    <span>3. ผลการเรียน ({app.gpaxRange || '-'}) (GPAX X2)</span>
                    <span className="font-mono font-bold text-[#1C1C1E]">{score.gpaxScore || 0}/10</span>
                  </div>

                  <div className="flex items-center justify-between text-[#636366]">
                    <span>4. เงินค่าใช้จ่ายได้รับต่อเดือน ({app.monthlyAllowance || '-'})</span>
                    <span className="font-mono font-bold text-[#1C1C1E]">{score.allowanceScore}/15</span>
                  </div>

                  <div className="flex items-center justify-between text-[#636366]">
                    <span>5. สภาพความยากลำบาก & การเจ็บป่วย</span>
                    <span className="font-mono font-bold text-[#1C1C1E]">{score.familyHardshipScore}/15</span>
                  </div>

                  <div className="flex items-center justify-between text-[#636366]">
                    <span>6. ภาระพี่น้องกำลังศึกษา ({app.siblingsStudyingCount || '-'})</span>
                    <span className="font-mono font-bold text-[#1C1C1E]">{score.siblingsScore}/10</span>
                  </div>

                  <div className="flex items-center justify-between text-[#636366]">
                    <span>7. ทำงานพิเศษ / จิตอาสา / กิจกรรม</span>
                    <span className="font-mono font-bold text-[#1C1C1E]">{score.selfRelianceScore}/10</span>
                  </div>

                  <div className="flex items-center justify-between text-[#636366]">
                    <span>8. ความจำเป็นและความตั้งใจศึกษา</span>
                    <span className="font-mono font-bold text-[#1C1C1E]">{score.needReasonScore || 0}/5</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/[0.05]">
                  <span className="text-[11px] text-[#8E8E93]">
                    สถานะ: <strong className="text-[#1C1C1E]">{app.status}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewApplication(app)}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] cursor-pointer"
                    >
                      ดูใบสมัครฉบับเต็ม
                    </button>
                    <button
                      onClick={() => handleOpenStatusEdit(app)}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-[#007AFF] text-white hover:bg-[#0071EB] cursor-pointer"
                    >
                      ปรับสถานะ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-[#1C1C1E] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 4: ระบบจัดสรรทุนการศึกษา & สรุปผลสัมภาษณ์ (Standard Grant Award Allocation) */}
      {/* ================================================================ */}
      {activeView === 'allocation' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Executive Header Banner */}
          <div className="bg-gradient-to-br from-white via-white to-[#34C759]/[0.04] rounded-[26px] p-6 sm:p-7 shadow-xs border border-[#34C759]/20 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1 rounded-[8px] bg-[#34C759]/15 text-[#248A3D]">
                    <Award className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-[#248A3D] uppercase tracking-wider">
                    มาตรฐานสากล • แดชบอร์ดสรุปผลและจัดสรรทุนการศึกษา
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1C1C1E] font-['Prompt',sans-serif] tracking-tight">
                  ระบบจัดสรรทุน & สรุปผลสัมภาษณ์ (Grant Award Allocation)
                </h3>
                <p className="text-xs sm:text-sm text-[#636366] mt-1 leading-relaxed">
                  พิจารณาเคาะมติสัมภาษณ์รายบุคคล กำหนดวงเงินทุน ควบคุมเพดานงบประมาณแบบเรียลไทม์ และเชื่อมโยงข้อมูลสู่หน้าประกาศผลอย่างเป็นทางการ
                </p>
              </div>

              {/* Action Buttons: Publish, Preview, Export */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePublishOfficialAnnouncement}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#34C759] to-[#248A3D] hover:from-[#2db24f] hover:to-[#1e7e34] text-white text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
                  title="เผยแพร่ผลการคัดเลือกสู่หน้าประกาศผลเพื่อให้นิสิตเข้าดูได้"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>เผยแพร่ผลสู่หน้าประกาศ</span>
                </button>

                {onNavigateToAnnouncements && (
                  <button
                    type="button"
                    onClick={onNavigateToAnnouncements}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#007AFF]/12 hover:bg-[#007AFF]/20 text-[#007AFF] text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    title="เปิดดูหน้าประกาศผลแบบที่นิสิตและบุคคลภายนอกมองเห็น"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ดูหน้าประกาศผลนิสิต</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleExportAllocationCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  title="ส่งออกมติการจัดสรรทุนเป็นไฟล์ Excel/CSV สำหรับแนบรายงานการประชุม"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#34C759]" />
                  <span>ส่งออกมติ (CSV)</span>
                </button>
              </div>
            </div>

            {/* Official Announcement Status Callout */}
            <div className={`p-4 rounded-[18px] border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              currentTimelineConfig.systemPhase === 'awarded'
                ? 'bg-[#34C759]/10 border-[#34C759]/25 text-[#1e7e34]'
                : 'bg-[#FF9500]/10 border-[#FF9500]/25 text-[#b06000]'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="p-1 rounded-full bg-white shadow-xs">
                  {currentTimelineConfig.systemPhase === 'awarded' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#FF9500]" />
                  )}
                </span>
                <div>
                  <strong className="block text-[13px]">
                    {currentTimelineConfig.systemPhase === 'awarded'
                      ? 'สถานะระบบ: ประกาศผลการคัดเลือกอย่างเป็นทางการแล้ว (Public Phase)'
                      : 'สถานะระบบ: ขั้นตอนการสัมภาษณ์ & เตรียมจัดสรรทุน (Internal Evaluation)'}
                  </strong>
                  <span className="opacity-90">
                    {currentTimelineConfig.systemPhase === 'awarded'
                      ? 'นิสิตและบุคคลทั่วไปสามารถดูรายชื่อผู้ได้รับทุนและยอดเงินได้แล้วที่แท็บ "ประกาศผล"'
                      : 'ข้อมูลการจัดสรรทุนนี้ยังอยู่ระหว่างการประชุมลับของคณะกรรมการ เมื่อพร้อมให้กดปุ่ม "เผยแพร่ผลสู่หน้าประกาศ" ด้านบน'}
                  </span>
                </div>
              </div>

              {currentTimelineConfig.systemPhase !== 'awarded' && (
                <button
                  type="button"
                  onClick={handlePublishOfficialAnnouncement}
                  className="px-3.5 py-1.5 rounded-full bg-[#FF9500] hover:bg-[#e08500] text-white font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  เปิดประกาศผลทันที
                </button>
              )}
            </div>

            {/* Budget Governance Matrix (4 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Card 1: Budget Pool */}
              <div className="p-4 rounded-[20px] bg-white border border-black/[0.06] shadow-xs">
                <div className="flex items-center justify-between text-[#8E8E93] text-xs">
                  <span>เพดานงบประมาณทุน</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempBudgetPool(String(budgetPool));
                      setIsEditingBudgetPool(!isEditingBudgetPool);
                    }}
                    className="text-[#007AFF] hover:underline flex items-center gap-0.5 text-[11px] font-semibold cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>แก้ไขวงเงิน</span>
                  </button>
                </div>
                {isEditingBudgetPool ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <input
                      type="number"
                      value={tempBudgetPool}
                      onChange={(e) => setTempBudgetPool(e.target.value)}
                      className="w-full px-2.5 py-1 text-sm font-mono font-bold rounded-lg bg-[#F2F2F7] border border-black/10 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveBudgetPool}
                      className="px-2.5 py-1 text-xs font-bold bg-[#007AFF] text-white rounded-lg cursor-pointer"
                    >
                      บันทึก
                    </button>
                  </div>
                ) : (
                  <div className="text-2xl font-extrabold text-[#1C1C1E] font-mono mt-1">
                    ฿{budgetPool.toLocaleString()}
                  </div>
                )}
                <div className="text-[11px] text-[#8E8E93] mt-1">วงเงินที่คณะจัดสรรในรอบปี</div>
              </div>

              {/* Card 2: Allocated Budget */}
              <div className="p-4 rounded-[20px] bg-[#34C759]/10 border border-[#34C759]/20 shadow-xs">
                <div className="text-xs font-bold text-[#248A3D]">งบประมาณที่จัดสรรแล้ว</div>
                <div className="text-2xl font-extrabold text-[#248A3D] font-mono mt-1">
                  ฿{totalAwardedAllocatedBudget.toLocaleString()}
                </div>
                <div className="text-[11px] text-[#248A3D] font-medium mt-1">
                  อนุมัติแล้ว {totalAwardedRecipientsCount} คน ({budgetUtilizationPercent}% ของงบ)
                </div>
              </div>

              {/* Card 3: Remaining Balance */}
              <div className={`p-4 rounded-[20px] border shadow-xs ${
                budgetRemaining >= 0
                  ? 'bg-white border-black/[0.06]'
                  : 'bg-[#FF3B30]/10 border-[#FF3B30]/25'
              }`}>
                <div className="text-xs font-medium text-[#8E8E93]">
                  {budgetRemaining >= 0 ? 'งบประมาณคงเหลือ' : 'จัดสรรเกินเพดานงบ'}
                </div>
                <div className={`text-2xl font-extrabold font-mono mt-1 ${
                  budgetRemaining >= 0 ? 'text-[#007AFF]' : 'text-[#FF3B30]'
                }`}>
                  {budgetRemaining >= 0 ? `฿${budgetRemaining.toLocaleString()}` : `-฿${Math.abs(budgetRemaining).toLocaleString()}`}
                </div>
                <div className="text-[11px] text-[#8E8E93] mt-1">
                  {budgetRemaining >= 0 ? 'งบประมาณเพียงพอต่อการจัดสรร' : 'กรุณาปรับลดจำนวนเงินหรือจำนวนผู้รับทุน'}
                </div>
              </div>

              {/* Card 4: Progress */}
              <div className="p-4 rounded-[20px] bg-white border border-black/[0.06] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-medium text-[#8E8E93]">ความคืบหน้าการคัดเลือก</div>
                  <div className="text-2xl font-extrabold text-[#1C1C1E] font-mono mt-1">
                    {totalAwardedRecipientsCount} <span className="text-sm font-normal text-[#8E8E93]">/ {totalInterviewEligibleCount} คน</span>
                  </div>
                </div>
                <div className="w-full bg-[#F2F2F7] h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="bg-[#34C759] h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${totalInterviewEligibleCount ? Math.min(100, (totalAwardedRecipientsCount / totalInterviewEligibleCount) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Toolbar: Filter Scope & Quick Batch Tools */}
          <div className="bg-white rounded-[22px] p-4 shadow-xs border border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#8E8E93] mr-1">แสดงกลุ่ม:</span>
              <button
                type="button"
                onClick={() => setAllocationScopeFilter('interview_all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  allocationScopeFilter === 'interview_all'
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : 'bg-[#F2F2F7] text-[#636366] hover:text-[#1C1C1E]'
                }`}
              >
                ผู้มีสิทธิ์/เข้าสัมภาษณ์ทั้งหมด ({totalInterviewEligibleCount})
              </button>

              <button
                type="button"
                onClick={() => setAllocationScopeFilter('awarded_only')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  allocationScopeFilter === 'awarded_only'
                    ? 'bg-[#34C759] text-white shadow-xs'
                    : 'bg-[#F2F2F7] text-[#636366] hover:text-[#248A3D]'
                }`}
              >
                เฉพาะผู้อนุมัติทุนแล้ว ({totalAwardedRecipientsCount})
              </button>

              <button
                type="button"
                onClick={() => setAllocationScopeFilter('pending_only')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  allocationScopeFilter === 'pending_only'
                    ? 'bg-[#FF9500] text-white shadow-xs'
                    : 'bg-[#F2F2F7] text-[#636366] hover:text-[#b06000]'
                }`}
              >
                รอการตัดสินผล ({Math.max(0, totalInterviewEligibleCount - totalAwardedRecipientsCount)})
              </button>

              <button
                type="button"
                onClick={() => setAllocationScopeFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  allocationScopeFilter === 'all'
                    ? 'bg-[#1C1C1E] text-white shadow-xs'
                    : 'bg-[#F2F2F7] text-[#8E8E93] hover:text-[#1C1C1E]'
                }`}
              >
                ผู้สมัครทั้งหมด ({totalCount})
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleBatchSyncToCloud}
                disabled={isSyncingToCloud}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#34C759] hover:bg-[#28A745] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title="ซิงก์ข้อมูลใบสมัคร อันดับ และกำหนดการทั้งหมดขึ้น Cloud Firestore ทันที เพื่อให้ทุกเครื่องแสดงผลตรงกัน"
              >
                {isSyncingToCloud ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังซิงก์ขึ้นคลาวด์...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>ซิงก์ข้อมูลขึ้นคลาวด์</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsBatchAwardModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF9500] to-[#E08500] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                title="อนุมัติทุนแบบกลุ่มตามลำดับคะแนนความจำเป็น"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>อนุมัติด่วนตามคะแนน (Batch)</span>
              </button>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8E8E93]" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ / รหัส / ภาควิชา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-full bg-[#F2F2F7] text-xs outline-none focus:bg-white focus:ring-2 focus:ring-[#007AFF]/30 border border-transparent w-44 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Allocation Table (Matrix View) */}
          <div className="bg-white rounded-[24px] shadow-xs border border-black/[0.06] overflow-hidden">
            <div className="p-4 border-b border-black/[0.05] bg-[#F2F2F7]/40 flex items-center justify-between text-xs text-[#8E8E93]">
              <span className="font-semibold text-[#1C1C1E]">
                รายชื่อนิสิตเรียงตามคะแนนความจำเป็น (พิจารณาจากอันดับ 1 ลงมา)
              </span>
              <span>พบ {sortedCandidatesForAllocation.length} รายการ</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#F8F9FA] text-[#8E8E93] font-semibold">
                    <th className="px-4 py-3 w-14 text-center">อันดับ</th>
                    <th className="px-4 py-3 min-w-[200px]">ข้อมูลนิสิต</th>
                    <th className="px-4 py-3 text-center min-w-[110px]">คะแนน (/100)</th>
                    <th className="px-4 py-3 min-w-[210px]">มติสัมภาษณ์ / สถานะ</th>
                    <th className="px-4 py-3 min-w-[190px]">วงเงินทุน (บาท)</th>
                    <th className="px-4 py-3 min-w-[200px]">หมายเหตุ / เงื่อนไข</th>
                    <th className="px-4 py-3 text-right min-w-[130px]">การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {sortedCandidatesForAllocation.length > 0 ? (
                    sortedCandidatesForAllocation.map((item, index) => (
                      <AllocationRow
                        key={item.app.id}
                        rank={index + 1}
                        app={item.app}
                        score={item.score}
                        isSaving={savingAppId === item.app.id}
                        isSavedSuccess={savedSuccessId === item.app.id}
                        onSave={handleQuickInlineAllocation}
                        onViewItemizedScore={() => setSelectedItemizedApp(item.app)}
                        onViewFullApplication={() => onViewApplication(item.app)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-[#8E8E93]">
                        ไม่พบรายชื่อในเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Batch Award Modal Dialog */}
      {isBatchAwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl p-6 border border-black/[0.06] space-y-4">
            <div className="flex items-center gap-2 text-[#FF9500]">
              <Zap className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                อนุมัติด่วนตามลำดับคะแนนความจำเป็น
              </h3>
            </div>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              ระบบจะจัดสรรทุนให้อัตโนมัติโดยเรียงจากผู้สมัครที่ได้คะแนนประเมินสูงสุดลงมาตามจำนวนที่กำหนด
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                  จำนวนผู้รับทุน (Top N คน)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBatchTopCount(num)}
                      className={`py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                        batchTopCount === num
                          ? 'bg-[#FF9500] text-white shadow-xs'
                          : 'bg-[#F2F2F7] text-[#636366]'
                      }`}
                    >
                      Top {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                  จำนวนเงินทุนต่อคน (บาท)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5000, 10000, 15000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBatchAmountPerPerson(amt)}
                      className={`py-2 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                        batchAmountPerPerson === amt
                          ? 'bg-[#34C759] text-white shadow-xs'
                          : 'bg-[#F2F2F7] text-[#636366]'
                      }`}
                    >
                      ฿{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-[14px] bg-[#F8F9FA] border border-black/5 text-xs space-y-1">
                <div className="flex items-center justify-between text-[#8E8E93]">
                  <span>งบประมาณที่จะใช้:</span>
                  <strong className="font-mono text-[#1C1C1E] text-sm">
                    ฿{(batchTopCount * batchAmountPerPerson).toLocaleString()}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[#8E8E93]">
                  <span>เพดานงบประมาณทุน:</span>
                  <span className="font-mono">฿{budgetPool.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.05]">
              <button
                type="button"
                onClick={() => setIsBatchAwardModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#8E8E93] hover:bg-[#767680]/10 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleBatchAwardTop}
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#34C759] hover:bg-[#2db24f] text-white transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                ยืนยันอนุมัติ Top {batchTopCount} คน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Modal Sheet for Status Change */}
      {editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl p-6 border border-black/[0.06] space-y-4">
            <h3 className="text-base font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
              ปรับสถานะการพิจารณาทุนการศึกษา 2569
            </h3>
            <p className="text-xs text-[#8E8E93]">
              {editingApp.fullName} (รหัสนิสิต {editingApp.studentId})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                  สถานะการพิจารณา
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#F2F2F7] text-sm outline-none border border-transparent focus:bg-white focus:ring-2 focus:ring-[#007AFF]/25 cursor-pointer"
                >
                  <option value="submitted">ยื่นใบสมัครแล้ว (รอตรวจสอบ)</option>
                  <option value="eligible_for_interview">มีสิทธิ์สอบสัมภาษณ์</option>
                  <option value="interviewed">สัมภาษณ์แล้ว (รอผลพิจารณาจำนวนทุน)</option>
                  <option value="awarded">อนุมัติจัดสรรทุนการศึกษา</option>
                  <option value="not_selected">ไม่อยู่ในกลุ่มผู้ได้รับการคัดเลือกเข้าสัมภาษณ์</option>
                </select>
              </div>

              {newStatus === 'awarded' && (
                <div>
                  <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                    จำนวนเงินทุนที่จัดสรร (บาท)
                  </label>
                  <input
                    type="number"
                    value={newAwardedAmount}
                    onChange={(e) => setNewAwardedAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#F2F2F7] text-sm outline-none font-mono font-bold border border-transparent focus:bg-white focus:ring-2 focus:ring-[#007AFF]/25"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                  บันทึกความเห็นคณะกรรมการ (หมายเหตุภายใน)
                </label>
                <textarea
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="เช่น สัมภาษณ์ผ่านเกณฑ์ ความจำเป็นเร่งด่วนตามข้อ 25..."
                  className="w-full p-3 rounded-[14px] bg-[#F2F2F7] text-xs outline-none border border-transparent focus:bg-white focus:ring-2 focus:ring-[#007AFF]/25"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-black/[0.05]">
              <button
                type="button"
                onClick={() => setEditingApp(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#8E8E93] hover:bg-[#767680]/10 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="px-5 py-2 rounded-full bg-[#007AFF] hover:bg-[#0071EB] text-white text-xs font-semibold shadow-md shadow-[#007AFF]/25 transition-all active:scale-95 cursor-pointer"
              >
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Itemized Score Sheet Modal (เมนูใบคะแนนรายบุคคลฉบับละเอียดสำหรับเจ้าหน้าที่) */}
      {selectedItemizedApp && (
        <ItemizedScoreModal
          application={selectedItemizedApp}
          onClose={() => setSelectedItemizedApp(null)}
          onSaveNotes={handleSaveScoreNotes}
        />
      )}

      {/* Timeline Config Editor Modal for Admin */}
      {isTimelineEditorOpen && (
        <TimelineEditorModal
          initialConfig={currentTimelineConfig}
          onSave={(newCfg) => {
            if (onUpdateTimelineConfig) {
              onUpdateTimelineConfig(newCfg);
            } else {
              saveTimelineConfigOnline(newCfg);
            }
            setTimelineConfig(newCfg);
            setIsTimelineEditorOpen(false);
          }}
          onClose={() => setIsTimelineEditorOpen(false)}
        />
      )}

      {/* Admin Full Edit Applicant Modal */}
      {editApplicantTarget && (
        <AdminEditApplicantModal
          isOpen={!!editApplicantTarget}
          onClose={() => setEditApplicantTarget(null)}
          application={editApplicantTarget}
          onSave={handleSaveEditedApplicant}
          onDeleteClick={() => {
            const target = editApplicantTarget;
            setEditApplicantTarget(null);
            setDeleteTargetApp(target);
          }}
        />
      )}

      {/* Delete Single Applicant Modal (ยืนยันรหัสผ่าน 07011985) */}
      <DeleteApplicantModal
        isOpen={!!deleteTargetApp}
        onClose={() => setDeleteTargetApp(null)}
        application={deleteTargetApp}
        onConfirmDelete={handleConfirmDeleteSingle}
      />

      {/* Clear All Applicants Modal (ยืนยันรหัสผ่าน 07011985) */}
      <DeleteApplicantModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        application={null}
        isClearAll={true}
        totalCount={applications.length}
        onConfirmDelete={handleConfirmClearAll}
      />

      {/* Document Viewer Modal for Reviewers */}
      {viewerDocument && (
        <DocumentViewerModal
          isOpen={!!viewerDocument}
          onClose={() => setViewerDocument(null)}
          document={viewerDocument.doc}
          title={viewerDocument.title}
          applicantName={viewerDocument.applicantName}
        />
      )}
    </div>
  );
};
