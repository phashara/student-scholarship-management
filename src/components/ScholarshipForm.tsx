/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  Briefcase,
  Building,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  DollarSign,
  Download,
  FileCheck2,
  FileDown,
  FileText,
  FileUp,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  Info,
  Layers,
  Paperclip,
  Printer,
  Save,
  Scale,
  Send,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
  Users,
} from 'lucide-react';
import {
  ACCOMMODATION_OPTIONS,
  ACTIVITY_PARTICIPATION_OPTIONS,
  FAMILY_ILLNESS_OPTIONS,
  GPAX_RANGE_OPTIONS,
  GUARDIAN_RELATION_OPTIONS,
  INCOME_BRACKET_OPTIONS,
  MONTHLY_ALLOWANCE_OPTIONS,
  OCCUPATION_OPTIONS,
  OFFICIAL_DEPARTMENTS_2569,
  PARENTS_MARITAL_OPTIONS,
  PART_TIME_WORK_OPTIONS,
  PAST_SCHOLARSHIP_OPTIONS,
  PERSON_STATUS_OPTIONS,
  SIBLINGS_STUDYING_OPTIONS,
  STUDENT_LOAN_OPTIONS,
  STUDY_YEAR_OPTIONS,
  VOLUNTEER_PARTICIPATION_OPTIONS,
  clearDraft,
  loadDraft,
  saveDraft,
} from '../data/scholarshipData';
import { saveApplicationOnline } from '../services/firebaseService';
import { ScholarshipApplication, TimelineConfig } from '../types';
import { DocumentUploader } from './DocumentUploader';

interface ScholarshipFormProps {
  onSubmitSuccess: (application: ScholarshipApplication) => void;
  timelineConfig?: TimelineConfig;
}

export const ScholarshipForm: React.FC<ScholarshipFormProps> = ({
  onSubmitSuccess,
  timelineConfig,
}) => {
  const [activeModule, setActiveModule] = useState<number>(0);
  const totalModules = 9; // 0 to 8

  const [formData, setFormData] = useState<Partial<ScholarshipApplication>>({
    academicYear: '2569',
    status: 'submitted',
    agreedToTerms: false,

    // Module 1
    fullName: '',
    studentId: '',
    department: '',
    studyYear: '',
    phone: '',
    homeAddress: '',
    gpaxRange: '',
    studentPhotoDoc: undefined,
    academicTranscriptDoc: undefined,

    // Module 2
    fatherName: '',
    fatherStatus: 'ยังมีชีวิต',
    fatherAge: '',
    fatherOccupation: '',
    fatherOccupationDetail: '',

    motherName: '',
    motherStatus: 'ยังมีชีวิต',
    motherAge: '',
    motherOccupation: '',
    motherOccupationDetail: '',

    guardianName: '',
    guardianStatus: 'ยังมีชีวิต',
    guardianAge: '',
    guardianOccupation: '',
    guardianOccupationDetail: '',
    guardianRelation: '',

    parentsMaritalStatus: '',
    familyLivingCondition: '',
    familyIllnessStatus: '',
    siblingsStudyingCount: '',

    // Module 3
    familyYearlyIncome: '',

    // Module 4
    monthlyAllowance: '',
    studentLoanStatus: '',
    pastScholarshipHistory: 'ไม่เคยได้รับทุน',
    pastScholarshipName: '',
    pastScholarshipAmount: '',

    // Module 5
    accommodationType: '',

    // Module 6
    partTimeWorkHistory: '',

    // Module 7
    studentActivityParticipation: '',
    volunteerWorkParticipation: '',

    // Module 8
    selfPrideOrTalent: '',
    reasonForApplying: '',
    scholarshipFundUsagePlan: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [draftSavedAlert, setDraftSavedAlert] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setFormData((prev) => ({ ...prev, ...draft }));
    }
  }, []);

  const handleInputChange = (field: keyof ScholarshipApplication, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      saveDraft(updated);
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleAutoFillDemo = () => {
    const demoData: Partial<ScholarshipApplication> = {
      academicYear: '2569',
      agreedToTerms: true,

      // Module 1
      fullName: 'นายณภัทร วัฒนโกศล',
      studentId: '66014529',
      department: 'รัฐศาสตร์และรัฐประศาสนศาสตร์',
      studyYear: 'ชั้นปีที่ 2',
      phone: '0891234567',
      homeAddress: '45/2 หมู่ 3 ต.สมอแข อ.เมือง จ.พิษณุโลก 65000',
      gpaxRange: '3.00 - 3.49',

      // Module 2
      fatherName: 'นายประสิทธิ์ วัฒนโกศล',
      fatherStatus: 'ยังมีชีวิต',
      fatherAge: '54',
      fatherOccupation: 'รับจ้าง',
      fatherOccupationDetail: 'รับจ้างก่อสร้างรายวัน รายได้ขึ้นอยู่กับสภาพอากาศ',

      motherName: 'นางรัตนา วัฒนโกศล',
      motherStatus: 'ยังมีชีวิต',
      motherAge: '51',
      motherOccupation: 'ค้าขาย',
      motherOccupationDetail: 'ช่วยขายอาหารตามสั่ง รายได้ไม่แน่นอน',

      guardianName: 'นายประสิทธิ์ วัฒนโกศล',
      guardianStatus: 'ยังมีชีวิต',
      guardianAge: '54',
      guardianOccupation: 'รับจ้าง',
      guardianOccupationDetail: 'หัวหน้าครอบครัว',
      guardianRelation: 'บิดา',

      parentsMaritalStatus: 'อยู่ด้วยกันกับบิดามารดาในครัวเรือนเดียวกัน',
      familyLivingCondition: 'บ้านพักไม้ชั้นเดียวสภาพทรุดโทรม อาศัยอยู่รวมกัน 5 คน',
      familyIllnessStatus: 'โรครุนแรงแต่สามารถทำงานได้',
      siblingsStudyingCount: '2 คน',

      // Module 3
      familyYearlyIncome: '90,000 - 119,999',

      // Module 4
      monthlyAllowance: '3,000-3,999',
      studentLoanStatus: 'กู้ค่าเทอมและค่าครองชีพ',
      pastScholarshipHistory: 'ไม่เคยได้รับทุน',
      pastScholarshipName: '',
      pastScholarshipAmount: '',

      // Module 5
      accommodationType: 'หอพักมหาวิทยาลัย',

      // Module 6
      partTimeWorkHistory: 'ทำอยู่',

      // Module 7
      studentActivityParticipation: 'เคยทำ',
      volunteerWorkParticipation: 'เคยทำ',

      // Module 8
      selfPrideOrTalent:
        'เป็นผู้ช่วยกิจกรรมงานวิชาการของภาควิชา และมีความตั้งใจศึกษาหาความรู้ด้านการบริหารงานภาครัฐ มีความซื่อสัตย์ มีวินัย และพร้อมช่วยเหลือส่วนรวม',
      reasonForApplying:
        'เนื่องจากครอบครัวมีภาระหนี้สินจากการกู้ยืมเพื่อการศึกษาและการประกอบอาชีพ บิดาและมารดามีรายได้ไม่แน่นอน บางเดือนไม่เพียงพอต่อค่าใช้จ่ายในครัวเรือน นิสิตมีน้องกำลังศึกษาอีก 2 คน จึงอยากขอรับทุนการศึกษานี้เพื่อแบ่งเบาภาระครอบครัวและนำไปใช้ในการเรียนให้สำเร็จการศึกษา',
      scholarshipFundUsagePlan:
        'จะนำเงินทุนการศึกษาไปชำระค่าธรรมเนียมหอพักในมหาวิทยาลัย ค่าอุปกรณ์และเอกสารประกอบการเรียน และสำรองไว้เป็นค่าครองชีพรายเดือน โดยไม่รบกวนเงินจากทางบ้าน',
    };

    setFormData((prev) => ({ ...prev, ...demoData }));
    saveDraft({ ...formData, ...demoData });
    setDraftSavedAlert(true);
    setTimeout(() => setDraftSavedAlert(false), 3000);
  };

  const copyFatherToGuardian = () => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        guardianName: prev.fatherName || '',
        guardianStatus: prev.fatherStatus || 'ยังมีชีวิต',
        guardianAge: prev.fatherAge || '',
        guardianOccupation: prev.fatherOccupation || '',
        guardianOccupationDetail: prev.fatherOccupationDetail || '',
        guardianRelation: 'บิดา',
      };
      saveDraft(updated);
      return updated;
    });
  };

  const copyMotherToGuardian = () => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        guardianName: prev.motherName || '',
        guardianStatus: prev.motherStatus || 'ยังมีชีวิต',
        guardianAge: prev.motherAge || '',
        guardianOccupation: prev.motherOccupation || '',
        guardianOccupationDetail: prev.motherOccupationDetail || '',
        guardianRelation: 'มารดา',
      };
      saveDraft(updated);
      return updated;
    });
  };

  const validateModule = (mod: number): boolean => {
    const errs: { [key: string]: string } = {};

    if (mod === 0) {
      if (!formData.agreedToTerms) {
        errs.agreedToTerms = 'กรุณากดรับรองว่าข้อมูลเป็นความจริงทุกประการเพื่อดำเนินการต่อ';
      }
    } else if (mod === 1) {
      if (!formData.fullName?.trim()) errs.fullName = 'กรุณากรอกชื่อ-สกุล พร้อมคำนำหน้า';
      if (!formData.studentId?.trim()) errs.studentId = 'กรุณากรอกรหัสนิสิต';
      if (!formData.department?.trim()) errs.department = 'กรุณาเลือกภาควิชา';
      if (!formData.studyYear?.trim()) errs.studyYear = 'กรุณาเลือกชั้นปี';
      if (!formData.phone?.trim()) errs.phone = 'กรุณากรอกเบอร์โทรศัพท์';
      if (!formData.homeAddress?.trim()) errs.homeAddress = 'กรุณากรอกบ้านเลขที่ ภูมิลำเนา';
      if (!formData.gpaxRange?.trim()) errs.gpaxRange = 'กรุณาเลือกผลการเรียนเฉลี่ยสะสม';
    } else if (mod === 2) {
      if (!formData.fatherName?.trim()) errs.fatherName = 'กรุณากรอกชื่อบิดา (หรือระบุ -)';
      if (!formData.motherName?.trim()) errs.motherName = 'กรุณากรอกชื่อมารดา (หรือระบุ -)';
      if (!formData.guardianName?.trim()) errs.guardianName = 'กรุณากรอกชื่อผู้ปกครอง';
      if (!formData.guardianRelation?.trim()) errs.guardianRelation = 'กรุณาเลือกความเกี่ยวข้องกับนิสิต';
      if (!formData.parentsMaritalStatus?.trim()) errs.parentsMaritalStatus = 'กรุณาเลือกสถานภาพสมรสของบิดามารดา';
      if (!formData.familyIllnessStatus?.trim()) errs.familyIllnessStatus = 'กรุณาเลือกการเจ็บป่วยหรือโรคประจำตัว';
      if (!formData.siblingsStudyingCount?.trim()) errs.siblingsStudyingCount = 'กรุณาเลือกจำนวนพี่น้องที่กำลังศึกษา';
    } else if (mod === 3) {
      if (!formData.familyYearlyIncome?.trim()) errs.familyYearlyIncome = 'กรุณาเลือกรวมรายได้ครอบครัวต่อปี';
      if (!formData.incomeCertificateDoc) {
        errs.incomeCertificateDoc = 'กรุณาแนบหนังสือรับรองรายได้ หรือ สลิปเงินเดือนผู้ปกครอง (ใช้แบบฟอร์มเดียวกับ กยศ. ได้)';
      }
    } else if (mod === 4) {
      if (!formData.monthlyAllowance?.trim()) errs.monthlyAllowance = 'กรุณาเลือกจำนวนเงินค่าใช้จ่ายที่ได้รับต่อเดือน';
      if (!formData.studentLoanStatus?.trim()) errs.studentLoanStatus = 'กรุณาเลือกสถานะการกู้ยืม กยศ.';
    } else if (mod === 5) {
      if (!formData.accommodationType?.trim()) errs.accommodationType = 'กรุณาเลือกที่พักอาศัยของนิสิต';
    } else if (mod === 6) {
      if (!formData.partTimeWorkHistory?.trim()) errs.partTimeWorkHistory = 'กรุณาเลือกประวัติการทำงานพิเศษ';
    } else if (mod === 7) {
      if (!formData.studentActivityParticipation?.trim()) errs.studentActivityParticipation = 'กรุณาเลือกการทำกิจกรรมชมรม/สโมสร/สภา';
      if (!formData.volunteerWorkParticipation?.trim()) errs.volunteerWorkParticipation = 'กรุณาเลือกการทำจิตอาสา/บำเพ็ญประโยชน์';
    } else if (mod === 8) {
      if (!formData.selfPrideOrTalent?.trim()) errs.selfPrideOrTalent = 'กรุณาระบุสิ่งที่นิสิตภูมิใจในตนเอง';
      if (!formData.reasonForApplying?.trim()) errs.reasonForApplying = 'กรุณาระบุเหตุผลและความจำเป็นในการรับทุน';
      if (!formData.scholarshipFundUsagePlan?.trim()) errs.scholarshipFundUsagePlan = 'กรุณาระบุแผนการนำเงินทุนไปใช้ประโยชน์';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateModule(activeModule)) {
      if (activeModule < totalModules - 1) {
        setActiveModule((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (activeModule > 0) {
      setActiveModule((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validate all modules
    for (let i = 0; i < totalModules; i++) {
      if (!validateModule(i)) {
        setActiveModule(i);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    const activeYear = timelineConfig?.academicYear || '2569';
    const newApp: ScholarshipApplication = {
      ...(formData as ScholarshipApplication),
      id: `FSS-${activeYear}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toLocaleString('th-TH'),
      updatedAt: new Date().toLocaleString('th-TH'),
      status: 'submitted',
      academicYear: activeYear,
    };

    saveApplicationOnline(newApp);
    clearDraft();
    onSubmitSuccess(newApp);
  };

  const handleDownloadPdf = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    try {
      const response = await fetch('./docs/income-certificate-form.pdf');
      if (!response.ok) throw new Error('File fetch error');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Income_Certificate_NU_SocSci.pdf';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 1500);
    } catch {
      window.open('./docs/income-certificate-form.pdf', '_blank');
    }
  };

  const moduleNames = [
    { num: 0, title: 'การยืนยันข้อมูล', icon: ShieldAlert },
    { num: 1, title: 'ข้อมูลส่วนตัว', icon: User },
    { num: 2, title: 'ข้อมูลครอบครัว', icon: Users },
    { num: 3, title: 'ฐานะเศรษฐกิจ', icon: DollarSign },
    { num: 4, title: 'ประวัติรับทุน', icon: Award },
    { num: 5, title: 'ที่พักอาศัย', icon: Home },
    { num: 6, title: 'งานพิเศษ', icon: Briefcase },
    { num: 7, title: 'การมีส่วนร่วม', icon: HeartHandshake },
    { num: 8, title: 'ความจำเป็น', icon: FileCheck2 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner with iOS 27 Glass Appearance */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-[24px] p-5 sm:p-6 border border-black/[0.08] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-[#007AFF] to-[#00C7BE] p-0.5 shadow-md shadow-[#007AFF]/25 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-white rounded-[16px] flex items-center justify-center text-[#007AFF]">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#007AFF]/12 text-[#007AFF]">
                  ประจำปีการศึกษา {timelineConfig?.academicYear || '2569'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF9500]/12 text-[#b06000]">
                  {timelineConfig?.steps?.[0]?.dateStr || 'รับสมัครถึง 15 กันยายน 2569'}
                </span>
                <span className="text-xs text-[#8E8E93]">คณะสังคมศาสตร์ ม.นเรศวร</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                ระบบรับสมัครทุนการศึกษาสำหรับนิสิตที่ขาดแคลนทุนทรัพย์
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {draftSavedAlert && (
              <span className="text-xs text-[#34C759] font-semibold flex items-center gap-1 bg-[#34C759]/10 px-3 py-1.5 rounded-full animate-fadeIn">
                <Check className="w-3.5 h-3.5" /> บันทึกแบบร่างแล้ว
              </span>
            )}

            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-[#007AFF] hover:bg-[#0066d6] text-white transition-all active:scale-95 cursor-pointer shadow-md shadow-[#007AFF]/25"
              title="เติมข้อมูลจำลองอัตโนมัติเพื่อทดสอบทุกโมดูลทันที"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>กรอกข้อมูลตัวอย่าง (Demo Auto-Fill)</span>
            </button>
          </div>
        </div>

        {/* Application Progress Bar for Applicants (ไม่แสดงคะแนนเกณฑ์แก่นิสิตผู้สมัคร) */}
        <div className="bg-[#F2F2F7] rounded-[18px] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#1C1C1E] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
              <span>ความคืบหน้าการกรอกข้อมูล:</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#007AFF]/12 text-[#007AFF]">
              ส่วนที่ {activeModule + 1} จาก {totalModules} ({moduleNames[activeModule]?.title})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#636366]">
              กรอกสำเร็จประมาณ{' '}
              <strong className="text-[#1C1C1E] font-mono text-sm">
                {Math.round(((activeModule + 1) / totalModules) * 100)}%
              </strong>
            </span>
            <div className="w-28 sm:w-36 h-2.5 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#007AFF] to-[#34C759] rounded-full transition-all duration-300"
                style={{ width: `${Math.round(((activeModule + 1) / totalModules) * 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-[#8E8E93] hidden md:inline">
              *ข้อมูลจะถูกส่งตรงถึงคณะกรรมการพิจารณาทุน
            </span>
          </div>
        </div>

        {/* Module Stepper Bar (Modules 0 - 8) - Enhanced for Mobile Touch & Scroll */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] pb-1 px-1 sm:hidden">
            <span>เลื่อนแถบนี้เพื่อเลือกโมดูล (Mod 0 - 8):</span>
            <span className="font-bold text-[#007AFF]">{activeModule + 1}/{totalModules}</span>
          </div>
          <div className="overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth touch-pan-x -mx-2 px-2 flex items-center gap-1.5 sm:gap-2">
            {moduleNames.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeModule === mod.num;
              const isPassed = activeModule > mod.num;

              return (
                <button
                  key={mod.num}
                  type="button"
                  onClick={() => {
                    setActiveModule(mod.num);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#1C1C1E] text-white shadow-md font-bold scale-[1.02]'
                      : isPassed
                      ? 'bg-[#34C759]/15 text-[#1e7e34] hover:bg-[#34C759]/25 font-medium'
                      : 'bg-[#F2F2F7] text-[#636366] hover:text-[#1C1C1E] hover:bg-[#e5e5ea]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#007AFF]' : ''}`} />
                  <span className="whitespace-nowrap">
                    Mod {mod.num}: {mod.title}
                  </span>
                  {isPassed && <Check className="w-3 h-3 text-[#28a745] stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Form Content Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============================================================== */}
        {/* Module 0 : การยืนยันข้อมูล */}
        {/* ============================================================== */}
        {activeModule === 0 && (
          <div className="bg-white rounded-[24px] border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
              <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider">
                  Module 0
                </span>
                <h2 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                  การยืนยันข้อมูล
                </h2>
              </div>
            </div>

            <div className="bg-[#F8F9FA] rounded-[18px] p-5 border border-black/[0.05] space-y-4">
              <p className="text-xs sm:text-sm text-[#3C4043] leading-relaxed">
                📢 นิสิตคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร ที่ประสงค์จะขอรับทุนการศึกษาสำหรับนิสิตที่ขาดแคลนทุนทรัพย์
                ประจำปีการศึกษา 2569 ต้องให้ข้อมูลตามความเป็นจริงทุกประการ
                เพื่อเป็นข้อมูลประกอบการพิจารณาคัดเลือกของคณะกรรมการ
              </p>

              <div
                onClick={() => handleInputChange('agreedToTerms', !formData.agreedToTerms)}
                className={`cursor-pointer flex items-start gap-3 p-4 rounded-[16px] border transition-all ${
                  formData.agreedToTerms
                    ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                    : 'border-[#dadce0] bg-white hover:bg-[#F2F2F7] text-[#202124]'
                }`}
              >
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={formData.agreedToTerms}
                  onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                  className="mt-1 w-5 h-5 rounded accent-[#007AFF] cursor-pointer"
                />
                <label
                  htmlFor="agree-checkbox"
                  className="text-xs sm:text-sm font-semibold cursor-pointer leading-relaxed"
                >
                  1. ข้าพเจ้าขอรับรองว่าข้อมูลตามแบบคำขอสมัครทุนการศึกษาเป็นข้อมูลที่ถูกต้องตามความเป็นจริงทุกประการ{' '}
                  <span className="text-[#d93025] font-bold">*</span>
                </label>
              </div>

              {errors.agreedToTerms && (
                <p className="text-xs text-[#d93025] flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.agreedToTerms}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Module 1 : ข้อมูลส่วนตัวของนิสิต */}
        {/* ============================================================== */}
        {activeModule === 1 && (
          <div className="bg-white rounded-[24px] border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
              <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider">
                  Module 1
                </span>
                <h2 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                  ข้อมูลส่วนตัวของนิสิต
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 1. ชื่อ-สกุล (ใส่คำนำหน้า) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  1. ชื่อ-สกุล (ใส่คำนำหน้า) <span className="text-[#d93025]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น นายสมคิด จิตมั่นคง หรือ นางสาวกานดา ศรีสะอาด"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-[12px] border text-sm outline-none transition-all ${
                    errors.fullName ? 'border-[#d93025] bg-[#d93025]/5' : 'border-[#dadce0] focus:border-[#007AFF]'
                  }`}
                />
                {errors.fullName && <p className="text-xs text-[#d93025]">{errors.fullName}</p>}
              </div>

              {/* 2. รหัสนิสิต */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  2. รหัสนิสิต <span className="text-[#d93025]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="เช่น 66012458"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-[12px] border text-sm font-mono outline-none transition-all ${
                    errors.studentId ? 'border-[#d93025] bg-[#d93025]/5' : 'border-[#dadce0] focus:border-[#007AFF]'
                  }`}
                />
                {errors.studentId && <p className="text-xs text-[#d93025]">{errors.studentId}</p>}
              </div>

              {/* 3. ภาควิชา (Dropdown: 5 official depts) */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  3. ภาควิชา <span className="text-[#d93025]">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-[12px] border text-sm outline-none transition-all bg-white cursor-pointer ${
                    errors.department ? 'border-[#d93025] bg-[#d93025]/5' : 'border-[#dadce0] focus:border-[#007AFF]'
                  }`}
                >
                  <option value="">-- กรุณาเลือกภาควิชา --</option>
                  {OFFICIAL_DEPARTMENTS_2569.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && <p className="text-xs text-[#d93025]">{errors.department}</p>}
              </div>

              {/* 4. ชั้นปี (Dropdown) */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  4. ชั้นปี <span className="text-[#d93025]">*</span>
                </label>
                <select
                  value={formData.studyYear}
                  onChange={(e) => handleInputChange('studyYear', e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-[12px] border text-sm outline-none transition-all bg-white cursor-pointer ${
                    errors.studyYear ? 'border-[#d93025] bg-[#d93025]/5' : 'border-[#dadce0] focus:border-[#007AFF]'
                  }`}
                >
                  <option value="">-- กรุณาเลือกชั้นปี --</option>
                  {STUDY_YEAR_OPTIONS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                {errors.studyYear && <p className="text-xs text-[#d93025]">{errors.studyYear}</p>}
              </div>

              {/* 5. เบอร์โทรศัพท์ */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  5. เบอร์โทรศัพท์ <span className="text-[#d93025]">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="เช่น 0812345678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-[12px] border text-sm font-mono outline-none transition-all ${
                    errors.phone ? 'border-[#d93025] bg-[#d93025]/5' : 'border-[#dadce0] focus:border-[#007AFF]'
                  }`}
                />
                {errors.phone && <p className="text-xs text-[#d93025]">{errors.phone}</p>}
              </div>

              {/* 6. บ้านเลขที่ ภูมิลำเนาของนิสิต */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  6. บ้านเลขที่ ภูมิลำเนาของนิสิต <span className="text-[#d93025]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น 99/2 หมู่ 5 ต.ท่าทอง อ.เมือง จ.พิษณุโลก 65000"
                  value={formData.homeAddress}
                  onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-[12px] border text-sm outline-none transition-all ${
                    errors.homeAddress ? 'border-[#d93025] bg-[#d93025]/5' : 'border-[#dadce0] focus:border-[#007AFF]'
                  }`}
                />
                {errors.homeAddress && <p className="text-xs text-[#d93025]">{errors.homeAddress}</p>}
              </div>

              {/* 7. ผลการเรียนเฉลี่ยสะสม (Dropdown) */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  7. ผลการเรียนเฉลี่ยสะสม <span className="text-[#d93025]">*</span>
                </label>
                <select
                  value={formData.gpaxRange}
                  onChange={(e) => handleInputChange('gpaxRange', e.target.value)}
                  className={`w-full py-2.5 px-3 rounded-[12px] border text-sm outline-none transition-all bg-white cursor-pointer ${
                    errors.gpaxRange ? 'border-[#d93025] bg-[#d93025]/5' : 'border-[#dadce0] focus:border-[#007AFF]'
                  }`}
                >
                  <option value="">-- กรุณาเลือกผลการเรียนเฉลี่ยสะสม --</option>
                  {GPAX_RANGE_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                {errors.gpaxRange && <p className="text-xs text-[#d93025]">{errors.gpaxRange}</p>}
              </div>

              {/* 1.1 Upload รูปภาพนิสิต */}
              <div className="space-y-1.5 sm:col-span-2 pt-2">
                <DocumentUploader
                  id="student-photo-uploader"
                  label="1.1 รูปถ่ายหน้าตรงชุดนิสิต (Upload รูปภาพนิสิต)"
                  description="รูปถ่ายหน้าตรง สวมเครื่องแบบนิสิตมหาวิทยาลัยนเรศวรที่ถูกต้องตามระเบียบ สำหรับติดใบสมัครและตรวจสอบตัวตน"
                  accept="image/png,image/jpeg,image/jpg"
                  isPhoto={true}
                  required={false}
                  doc={formData.studentPhotoDoc}
                  onChange={(doc) => handleInputChange('studentPhotoDoc', doc)}
                />
              </div>

              {/* 7.1 Upload ผลการศึกษา (Academic Transcript / ใบแจ้งเกรด) */}
              <div className="space-y-1.5 sm:col-span-2">
                <DocumentUploader
                  id="academic-transcript-uploader"
                  label="7.1 ใบรายงานผลการศึกษา (Upload ผลการศึกษา / Transcript)"
                  description="เอกสารใบรายงานผลการศึกษา (GPAX) หรือภาพถ่ายหน้าจอผลการเรียนจากระบบ REG NU เพื่อประกอบการพิจารณาคะแนนผลการเรียน"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  required={false}
                  doc={formData.academicTranscriptDoc}
                  onChange={(doc) => handleInputChange('academicTranscriptDoc', doc)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Module 2 : ข้อมูลครอบครัว */}
        {/* ============================================================== */}
        {activeModule === 2 && (
          <div className="bg-white rounded-[24px] border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-8 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
              <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider">
                  Module 2
                </span>
                <h2 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                  ข้อมูลครอบครัว
                </h2>
              </div>
            </div>

            {/* ข้อมูลบิดา */}
            <div className="bg-[#F8F9FA] rounded-[20px] p-5 border border-black/[0.06] space-y-4">
              <h3 className="text-sm font-bold text-[#1C1C1E] font-['Prompt',sans-serif] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                <span>ข้อมูลบิดา</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">
                    8. ชื่อบิดา <span className="text-[#d93025]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น นายประสิทธิ์ วัฒนโกศล"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                  />
                  {errors.fatherName && <p className="text-xs text-[#d93025]">{errors.fatherName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">8.1 สถานภาพบุคคล</label>
                  <div className="flex items-center gap-4 pt-1.5">
                    {PERSON_STATUS_OPTIONS.map((status) => (
                      <label key={status} className="flex items-center gap-1.5 text-xs text-[#1C1C1E] cursor-pointer">
                        <input
                          type="radio"
                          name="fatherStatus"
                          value={status}
                          checked={formData.fatherStatus === status}
                          onChange={(e) => handleInputChange('fatherStatus', e.target.value)}
                          className="accent-[#007AFF]"
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">8.2 อายุ (ปี)</label>
                  <input
                    type="text"
                    placeholder="เช่น 54"
                    value={formData.fatherAge}
                    onChange={(e) => handleInputChange('fatherAge', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm font-mono bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">8.3 อาชีพ</label>
                  <select
                    value={formData.fatherOccupation}
                    onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                  >
                    <option value="">-- กรุณาเลือกอาชีพ --</option>
                    {OCCUPATION_OPTIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1C1C1E]">
                    8.4 รายละเอียดเพิ่มเติมของอาชีพ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ทำนาบนที่ดินเช่า หรือ รับจ้างทั่วไปไม่มีรายได้ประจำ"
                    value={formData.fatherOccupationDetail}
                    onChange={(e) => handleInputChange('fatherOccupationDetail', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* ข้อมูลมารดา */}
            <div className="bg-[#F8F9FA] rounded-[20px] p-5 border border-black/[0.06] space-y-4">
              <h3 className="text-sm font-bold text-[#1C1C1E] font-['Prompt',sans-serif] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF2D55]" />
                <span>ข้อมูลมารดา</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">
                    9. ชื่อมารดา <span className="text-[#d93025]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น นางรัตนา วัฒนโกศล"
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                  />
                  {errors.motherName && <p className="text-xs text-[#d93025]">{errors.motherName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">9.1 สถานภาพบุคคล</label>
                  <div className="flex items-center gap-4 pt-1.5">
                    {PERSON_STATUS_OPTIONS.map((status) => (
                      <label key={status} className="flex items-center gap-1.5 text-xs text-[#1C1C1E] cursor-pointer">
                        <input
                          type="radio"
                          name="motherStatus"
                          value={status}
                          checked={formData.motherStatus === status}
                          onChange={(e) => handleInputChange('motherStatus', e.target.value)}
                          className="accent-[#007AFF]"
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">9.2 อายุ (ปี)</label>
                  <input
                    type="text"
                    placeholder="เช่น 51"
                    value={formData.motherAge}
                    onChange={(e) => handleInputChange('motherAge', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm font-mono bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">9.3 อาชีพ</label>
                  <select
                    value={formData.motherOccupation}
                    onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                  >
                    <option value="">-- กรุณาเลือกอาชีพ --</option>
                    {OCCUPATION_OPTIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1C1C1E]">
                    9.4 รายละเอียดเพิ่มเติมของอาชีพ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น ขายของชำหน้าบ้าน กำไรไม่แน่นอน"
                    value={formData.motherOccupationDetail}
                    onChange={(e) => handleInputChange('motherOccupationDetail', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* ข้อมูลผู้ปกครอง */}
            <div className="bg-[#F8F9FA] rounded-[20px] p-5 border border-black/[0.06] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[#1C1C1E] font-['Prompt',sans-serif] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5856D6]" />
                  <span>ข้อมูลผู้ปกครอง</span>
                </h3>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={copyFatherToGuardian}
                    className="px-2.5 py-1 rounded-full bg-white border border-[#dadce0] text-[#007AFF] hover:bg-[#007AFF]/10 cursor-pointer"
                  >
                    คัดลอกจากบิดา
                  </button>
                  <button
                    type="button"
                    onClick={copyMotherToGuardian}
                    className="px-2.5 py-1 rounded-full bg-white border border-[#dadce0] text-[#007AFF] hover:bg-[#007AFF]/10 cursor-pointer"
                  >
                    คัดลอกจากมารดา
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">
                    10. ชื่อผู้ปกครอง <span className="text-[#d93025]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น นายประสิทธิ์ วัฒนโกศล"
                    value={formData.guardianName}
                    onChange={(e) => handleInputChange('guardianName', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                  />
                  {errors.guardianName && <p className="text-xs text-[#d93025]">{errors.guardianName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">10.1 สถานภาพบุคคล</label>
                  <div className="flex items-center gap-4 pt-1.5">
                    {PERSON_STATUS_OPTIONS.map((status) => (
                      <label key={status} className="flex items-center gap-1.5 text-xs text-[#1C1C1E] cursor-pointer">
                        <input
                          type="radio"
                          name="guardianStatus"
                          value={status}
                          checked={formData.guardianStatus === status}
                          onChange={(e) => handleInputChange('guardianStatus', e.target.value)}
                          className="accent-[#007AFF]"
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">10.2 อายุ (ปี)</label>
                  <input
                    type="text"
                    placeholder="เช่น 54"
                    value={formData.guardianAge}
                    onChange={(e) => handleInputChange('guardianAge', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm font-mono bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">
                    10.5 เกี่ยวข้องกับนิสิต (Dropdown) <span className="text-[#d93025]">*</span>
                  </label>
                  <select
                    value={formData.guardianRelation}
                    onChange={(e) => handleInputChange('guardianRelation', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                  >
                    <option value="">-- กรุณาเลือกความเกี่ยวข้อง --</option>
                    {GUARDIAN_RELATION_OPTIONS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                  {errors.guardianRelation && <p className="text-xs text-[#d93025]">{errors.guardianRelation}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1C1C1E]">10.3 อาชีพ</label>
                  <select
                    value={formData.guardianOccupation}
                    onChange={(e) => handleInputChange('guardianOccupation', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                  >
                    <option value="">-- กรุณาเลือกอาชีพ --</option>
                    {OCCUPATION_OPTIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-[#1C1C1E]">
                    10.4 รายละเอียดเพิ่มเติมของอาชีพ
                  </label>
                  <input
                    type="text"
                    placeholder="รายละเอียดเพิ่มเติมของอาชีพผู้ปกครอง"
                    value={formData.guardianOccupationDetail}
                    onChange={(e) => handleInputChange('guardianOccupationDetail', e.target.value)}
                    className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* สถานภาพครอบครัว & สภาพครอบครัว */}
            <div className="space-y-5 pt-2">
              {/* 11. สถานภาพสมรสของบิดา มารดา */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  11. สถานภาพสมรสของบิดา มารดา <span className="text-[#d93025]">*</span>
                </label>
                <div className="space-y-1.5">
                  {PARENTS_MARITAL_OPTIONS.map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2.5 p-2.5 rounded-[10px] border cursor-pointer text-xs sm:text-sm transition-all ${
                        formData.parentsMaritalStatus === item
                          ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF] font-medium'
                          : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="parentsMaritalStatus"
                        value={item}
                        checked={formData.parentsMaritalStatus === item}
                        onChange={(e) => handleInputChange('parentsMaritalStatus', e.target.value)}
                        className="accent-[#007AFF]"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
                {errors.parentsMaritalStatus && <p className="text-xs text-[#d93025]">{errors.parentsMaritalStatus}</p>}
              </div>

              {/* 12. สภาพความเป็นอยู่ในครอบครัว */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  12. สภาพความเป็นอยู่ในครอบครัว
                </label>
                <input
                  type="text"
                  placeholder="เช่น พักอาศัยร่วมกันในบ้านไม้ยกสูง หรือ เช่าบ้านอยู่ร่วมกัน 4 คน"
                  value={formData.familyLivingCondition}
                  onChange={(e) => handleInputChange('familyLivingCondition', e.target.value)}
                  className="w-full py-2.5 px-3 rounded-[12px] border border-[#dadce0] text-sm focus:border-[#007AFF] outline-none"
                />
              </div>

              {/* 13. การเจ็บป่วยหรือโรคประจำตัวของบุคคลในครอบครัวนิสิต */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  13. การเจ็บป่วยหรือโรคประจำตัวของบุคคลในครอบครัวนิสิต <span className="text-[#d93025]">*</span>
                </label>
                <div className="space-y-1.5">
                  {FAMILY_ILLNESS_OPTIONS.map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2.5 p-2.5 rounded-[10px] border cursor-pointer text-xs sm:text-sm transition-all ${
                        formData.familyIllnessStatus === item
                          ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF] font-medium'
                          : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="familyIllnessStatus"
                        value={item}
                        checked={formData.familyIllnessStatus === item}
                        onChange={(e) => handleInputChange('familyIllnessStatus', e.target.value)}
                        className="accent-[#007AFF]"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
                {errors.familyIllnessStatus && <p className="text-xs text-[#d93025]">{errors.familyIllnessStatus}</p>}
              </div>

              {/* 14. จำนวนพี่น้องที่กำลังศึกษา (ไม่รวมตัวนิสิต) */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  14. จำนวนพี่น้องที่กำลังศึกษา (ไม่รวมตัวนิสิต) <span className="text-[#d93025]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SIBLINGS_STUDYING_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center justify-center p-2.5 rounded-[10px] border cursor-pointer text-xs font-semibold transition-all ${
                        formData.siblingsStudyingCount === opt
                          ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                          : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="siblingsStudyingCount"
                        value={opt}
                        checked={formData.siblingsStudyingCount === opt}
                        onChange={(e) => handleInputChange('siblingsStudyingCount', e.target.value)}
                        className="hidden"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {errors.siblingsStudyingCount && <p className="text-xs text-[#d93025]">{errors.siblingsStudyingCount}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Module 3 : ฐานะทางเศรษฐกิจ */}
        {/* ============================================================== */}
        {activeModule === 3 && (
          <div className="bg-white rounded-[24px] border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
              <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider">
                  Module 3
                </span>
                <h2 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                  ฐานะทางเศรษฐกิจ
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              {/* 15. รวมรายได้ครอบครัวบิดา มารดา หรือผู้ปกครองที่สนับสนุนค่าใช้จ่ายในการศึกษา/ปี */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  15. รวมรายได้ครอบครัวบิดา มารดา หรือผู้ปกครองที่สนับสนุนค่าใช้จ่ายในการศึกษา/ปี (บาท){' '}
                  <span className="text-[#d93025]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {INCOME_BRACKET_OPTIONS.map((range) => (
                    <label
                      key={range}
                      className={`flex items-center gap-2.5 p-3 rounded-[12px] border cursor-pointer text-xs font-medium transition-all ${
                        formData.familyYearlyIncome === range
                          ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] font-bold'
                          : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="familyYearlyIncome"
                        value={range}
                        checked={formData.familyYearlyIncome === range}
                        onChange={(e) => handleInputChange('familyYearlyIncome', e.target.value)}
                        className="accent-[#007AFF]"
                      />
                      <span>{range} บาท/ปี</span>
                    </label>
                  ))}
                </div>
                {errors.familyYearlyIncome && <p className="text-xs text-[#d93025]">{errors.familyYearlyIncome}</p>}
              </div>

              {/* 15.1 เอกสารแนบหลักฐาน: หนังสือรับรองรายได้ / สลิปเงินเดือนผู้ปกครอง (คะแนนเต็ม 30 คะแนน) */}
              <div className={`p-4 rounded-[16px] transition-all space-y-3 ${
                errors.incomeCertificateDoc
                  ? 'bg-[#FF3B30]/5 border-2 border-[#FF3B30]/40'
                  : 'bg-[#007AFF]/5 border border-[#007AFF]/20'
              }`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-0.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#007AFF] text-white">
                        คะแนนเต็ม 30 คะแนน
                      </span>
                      <label className="text-xs sm:text-sm font-bold text-[#1C1C1E]">
                        หลักฐานหนังสือรับรองรายได้ / สลิปเงินเดือนผู้ปกครอง <span className="text-[#007AFF] font-medium text-xs">(ใช้แบบฟอร์มเดียวกับ กยศ. ได้)</span> <span className="text-[#d93025]">* (จำเป็นต้องแนบเพื่อไปต่อ)</span>
                      </label>
                    </div>
                    <p className="text-xs text-[#636366]">
                      แนบหนังสือรับรองเงินเดือน/สลิปเงินเดือน หรือหนังสือรับรองรายได้ครอบครัว (สามารถใช้แบบฟอร์มเดียวกับ กยศ. ได้ หรือออกโดยผู้นำชุมชน/กำนัน/ผู้ใหญ่บ้าน/ข้าราชการ) ไฟล์ PDF, JPG, PNG (ไม่เกิน 10MB)
                    </p>
                  </div>

                  <div className="shrink-0">
                    <a
                      href="./docs/income-certificate-form.pdf"
                      download="Income_Certificate_NU_SocSci.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleDownloadPdf}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] bg-[#007AFF] hover:bg-[#0062cc] text-white shadow-md shadow-[#007AFF]/25 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
                      title="ดาวน์โหลดแบบฟอร์มหนังสือรับรองรายได้ครอบครัว (PDF)"
                    >
                      <FileDown className="w-4 h-4 text-white" />
                      <span>ดาวน์โหลดแบบฟอร์ม (PDF)</span>
                    </a>
                  </div>
                </div>

                {formData.incomeCertificateDoc ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-[12px] border border-black/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[10px] bg-[#34C759]/15 text-[#248A3D] flex items-center justify-center">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#1C1C1E] truncate max-w-[200px] sm:max-w-xs">
                          {formData.incomeCertificateDoc.fileName}
                        </div>
                        <div className="text-[10px] text-[#248A3D] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#34C759]" />
                          <span>{(formData.incomeCertificateDoc.fileSize / 1024).toFixed(1)} KB • แนบเอกสารเรียบร้อยแล้ว</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('incomeCertificateDoc', undefined)}
                      className="p-1.5 text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full transition-colors cursor-pointer"
                      title="ลบไฟล์และอัปโหลดใหม่"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className={`relative border-2 border-dashed rounded-[14px] p-5 text-center transition-colors cursor-pointer group ${
                    errors.incomeCertificateDoc
                      ? 'border-[#d93025] bg-white'
                      : 'border-[#007AFF]/30 hover:border-[#007AFF] bg-white'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 10 * 1024 * 1024) {
                          alert('ขนาดไฟล์ต้องไม่เกิน 10MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          handleInputChange('incomeCertificateDoc', {
                            fileName: file.name,
                            fileSize: file.size,
                            fileType: file.type,
                            dataUrl: event.target?.result as string,
                            uploadedAt: new Date().toISOString(),
                          });
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        errors.incomeCertificateDoc
                          ? 'bg-[#d93025]/10 text-[#d93025]'
                          : 'bg-[#007AFF]/10 group-hover:bg-[#007AFF]/20 text-[#007AFF]'
                      }`}>
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold ${errors.incomeCertificateDoc ? 'text-[#d93025]' : 'text-[#007AFF]'}`}>
                        คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                      </span>
                      <span className="text-[11px] text-[#8E8E93]">
                        รองรับไฟล์ PDF, JPG, PNG ขนาดไม่เกิน 10MB
                      </span>
                    </div>
                  </div>
                )}

                {errors.incomeCertificateDoc && (
                  <p className="text-xs font-semibold text-[#d93025] flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.incomeCertificateDoc}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Module 4 : ประวัติการได้รับทุนการศึกษา */}
        {/* ============================================================== */}
        {activeModule === 4 && (
          <div className="bg-white rounded-[24px] border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
              <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider">
                  Module 4
                </span>
                <h2 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                  ประวัติการได้รับทุนการศึกษา
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              {/* 17. จำนวนเงินที่นิสิตได้รับค่าใช้จ่าย/เดือน */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  17. จำนวนเงินที่นิสิตได้รับค่าใช้จ่าย/เดือน (บาท){' '}
                  <span className="text-[#d93025]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {MONTHLY_ALLOWANCE_OPTIONS.map((amt) => (
                    <label
                      key={amt}
                      className={`flex items-center justify-center p-3 rounded-[12px] border cursor-pointer text-xs font-semibold text-center transition-all ${
                        formData.monthlyAllowance === amt
                          ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                          : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="monthlyAllowance"
                        value={amt}
                        checked={formData.monthlyAllowance === amt}
                        onChange={(e) => handleInputChange('monthlyAllowance', e.target.value)}
                        className="hidden"
                      />
                      <span>{amt} บาท</span>
                    </label>
                  ))}
                </div>
                {errors.monthlyAllowance && <p className="text-xs text-[#d93025]">{errors.monthlyAllowance}</p>}
              </div>

              {/* 18. การกู้ยืม กยศ. */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  18. การกู้ยืม กยศ. <span className="text-[#d93025]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {STUDENT_LOAN_OPTIONS.map((loan) => (
                    <label
                      key={loan}
                      className={`flex items-center gap-2.5 p-3 rounded-[12px] border cursor-pointer text-xs font-medium transition-all ${
                        formData.studentLoanStatus === loan
                          ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] font-bold'
                          : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="studentLoanStatus"
                        value={loan}
                        checked={formData.studentLoanStatus === loan}
                        onChange={(e) => handleInputChange('studentLoanStatus', e.target.value)}
                        className="accent-[#007AFF]"
                      />
                      <span>{loan}</span>
                    </label>
                  ))}
                </div>
                {errors.studentLoanStatus && <p className="text-xs text-[#d93025]">{errors.studentLoanStatus}</p>}
              </div>

              {/* 19. นิสิตเคยได้รับทุนการศึกษาอื่น ๆ หรือไม่ */}
              <div className="space-y-3 pt-2 border-t border-black/[0.06]">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  19. นิสิตเคยได้รับทุนการศึกษาอื่น ๆ หรือไม่
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {PAST_SCHOLARSHIP_OPTIONS.map((st) => (
                    <label
                      key={st}
                      className={`flex items-center gap-2 p-2.5 px-3 rounded-[10px] border cursor-pointer text-xs font-medium transition-all ${
                        formData.pastScholarshipHistory === st
                          ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] font-bold'
                          : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pastScholarshipHistory"
                        value={st}
                        checked={formData.pastScholarshipHistory === st}
                        onChange={(e) => handleInputChange('pastScholarshipHistory', e.target.value)}
                        className="accent-[#007AFF]"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>

                {formData.pastScholarshipHistory && formData.pastScholarshipHistory !== 'ไม่เคยได้รับทุน' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#F8F9FA] rounded-[14px] border border-black/[0.06]">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1C1C1E]">19.1 ชื่อทุนที่ได้รับ</label>
                      <input
                        type="text"
                        placeholder="เช่น ทุนสนับสนุนการศึกษาต่อเนื่อง ม.นเรศวร"
                        value={formData.pastScholarshipName}
                        onChange={(e) => handleInputChange('pastScholarshipName', e.target.value)}
                        className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#1C1C1E]">19.2 จำนวนเงินทุนที่ได้รับ (บาท)</label>
                      <input
                        type="text"
                        placeholder="เช่น 10,000"
                        value={formData.pastScholarshipAmount}
                        onChange={(e) => handleInputChange('pastScholarshipAmount', e.target.value)}
                        className="w-full py-2 px-3 rounded-[10px] border border-[#dadce0] text-sm font-mono bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Module 5 : สภาพความเป็นอยู่และที่พัก */}
        {/* ============================================================== */}
        {activeModule === 5 && (
          <div className="bg-white rounded-[24px] border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
              <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider">
                  Module 5
                </span>
                <h2 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                  สภาพความเป็นอยู่และที่พัก
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                20. ที่พักอาศัยของนิสิต <span className="text-[#d93025]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ACCOMMODATION_OPTIONS.map((acc) => (
                  <label
                    key={acc}
                    className={`flex items-center justify-center p-4 rounded-[16px] border cursor-pointer text-xs sm:text-sm font-semibold transition-all ${
                      formData.accommodationType === acc
                        ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] shadow-xs'
                        : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="accommodationType"
                      value={acc}
                      checked={formData.accommodationType === acc}
                      onChange={(e) => handleInputChange('accommodationType', e.target.value)}
                      className="hidden"
                    />
                    <span>{acc}</span>
                  </label>
                ))}
              </div>
              {errors.accommodationType && <p className="text-xs text-[#d93025]">{errors.accommodationType}</p>}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Module 6 : การทำงานพิเศษ */}
        {/* ============================================================== */}
        {activeModule === 6 && (
          <div className="bg-white rounded-[24px] border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
              <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider">
                  Module 6
                </span>
                <h2 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                  การทำงานพิเศษ
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                21. ประวัติการทำงานพิเศษ <span className="text-[#d93025]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PART_TIME_WORK_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center justify-center p-4 rounded-[16px] border cursor-pointer text-xs sm:text-sm font-semibold transition-all ${
                      formData.partTimeWorkHistory === opt
                        ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF] shadow-xs'
                        : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="partTimeWorkHistory"
                      value={opt}
                      checked={formData.partTimeWorkHistory === opt}
                      onChange={(e) => handleInputChange('partTimeWorkHistory', e.target.value)}
                      className="hidden"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
              {errors.partTimeWorkHistory && <p className="text-xs text-[#d93025]">{errors.partTimeWorkHistory}</p>}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Module 7 : การมีส่วนร่วมและความประพฤติ */}
        {/* ============================================================== */}
        {activeModule === 7 && (
          <div className="bg-white rounded-[24px] border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
              <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider">
                  Module 7
                </span>
                <h2 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                  การมีส่วนร่วมและความประพฤติ
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              {/* 22. นิสิตทำกิจกรรมชมรม สโมสรนิสิต องค์การนิสิต สภานิสิต */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  22. นิสิตทำกิจกรรมชมรม สโมสรนิสิต องค์การนิสิต สภานิสิต <span className="text-[#d93025]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {ACTIVITY_PARTICIPATION_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center justify-center p-3 rounded-[12px] border cursor-pointer text-xs sm:text-sm font-semibold transition-all ${
                        formData.studentActivityParticipation === opt
                          ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                          : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="studentActivityParticipation"
                        value={opt}
                        checked={formData.studentActivityParticipation === opt}
                        onChange={(e) => handleInputChange('studentActivityParticipation', e.target.value)}
                        className="hidden"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {errors.studentActivityParticipation && (
                  <p className="text-xs text-[#d93025]">{errors.studentActivityParticipation}</p>
                )}
              </div>

              {/* 23. นิสิตทำจิตอาสา จิตสาธารณะ หรือบำเพ็ญประโยชน์ (ไม่รวมจิตอาสาเพื่อกู้ กยศ.) */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  23. นิสิตทำจิตอาสา จิตสาธารณะ หรือบำเพ็ญประโยชน์ (ไม่รวมจิตอาสาเพื่อกู้ กยศ.){' '}
                  <span className="text-[#d93025]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  {VOLUNTEER_PARTICIPATION_OPTIONS.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center justify-center p-3 rounded-[12px] border cursor-pointer text-xs sm:text-sm font-semibold transition-all ${
                        formData.volunteerWorkParticipation === opt
                          ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                          : 'border-[#dadce0] hover:bg-[#F8F9FA] text-[#1C1C1E]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="volunteerWorkParticipation"
                        value={opt}
                        checked={formData.volunteerWorkParticipation === opt}
                        onChange={(e) => handleInputChange('volunteerWorkParticipation', e.target.value)}
                        className="hidden"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {errors.volunteerWorkParticipation && (
                  <p className="text-xs text-[#d93025]">{errors.volunteerWorkParticipation}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* Module 8 : ความจำเป็นในการรับทุน */}
        {/* ============================================================== */}
        {activeModule === 8 && (
          <div className="bg-white rounded-[24px] border border-black/[0.08] p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
              <div className="w-10 h-10 rounded-[14px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#007AFF] uppercase tracking-wider">
                  Module 8
                </span>
                <h2 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                  ความจำเป็นในการรับทุน
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              {/* 24. สิ่งที่นิสิตภูมิใจในตนเอง หรือความสามารถของนิสิต (Text Area) */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  24. สิ่งที่นิสิตภูมิใจในตนเอง หรือความสามารถของนิสิต <span className="text-[#d93025]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุสิ่งที่นิสิตภูมิใจในตนเอง เช่น ผลการเรียน ความกตัญญู ความขยัน หรือความสามารถพิเศษ..."
                  value={formData.selfPrideOrTalent}
                  onChange={(e) => handleInputChange('selfPrideOrTalent', e.target.value)}
                  className={`w-full p-3 rounded-[14px] border text-sm outline-none transition-all ${
                    errors.selfPrideOrTalent ? 'border-[#d93025] bg-[#d93025]/5' : 'border-[#dadce0] focus:border-[#007AFF]'
                  }`}
                />
                {errors.selfPrideOrTalent && <p className="text-xs text-[#d93025]">{errors.selfPrideOrTalent}</p>}
              </div>

              {/* 25. เหตุผลและความจำเป็นในการรับทุนการศึกษา (Text Area) */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  25. เหตุผลและความจำเป็นในการรับทุนการศึกษา <span className="text-[#d93025]">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="อธิบายสภาพปัญหาความเดือดร้อน ภาระครอบครัว และเหตุผลที่จำเป็นต้องได้รับทุนการศึกษาอย่างละเอียด..."
                  value={formData.reasonForApplying}
                  onChange={(e) => handleInputChange('reasonForApplying', e.target.value)}
                  className={`w-full p-3 rounded-[14px] border text-sm outline-none transition-all ${
                    errors.reasonForApplying ? 'border-[#d93025] bg-[#d93025]/5' : 'border-[#dadce0] focus:border-[#007AFF]'
                  }`}
                />
                {errors.reasonForApplying && <p className="text-xs text-[#d93025]">{errors.reasonForApplying}</p>}
              </div>

              {/* 26. หากได้รับทุนการศึกษา จะนำเงินทุนไปใช้ประโยชน์ในด้านใด อย่างไร (Text Area) */}
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C1C1E]">
                  26. หากได้รับทุนการศึกษา จะนำเงินทุนไปใช้ประโยชน์ในด้านใด อย่างไร <span className="text-[#d93025]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="ระบุแผนการบริหารและจัดสรรเงินทุนการศึกษาเพื่อการเรียนและค่าครองชีพ..."
                  value={formData.scholarshipFundUsagePlan}
                  onChange={(e) => handleInputChange('scholarshipFundUsagePlan', e.target.value)}
                  className={`w-full p-3 rounded-[14px] border text-sm outline-none transition-all ${
                    errors.scholarshipFundUsagePlan
                      ? 'border-[#d93025] bg-[#d93025]/5'
                      : 'border-[#dadce0] focus:border-[#007AFF]'
                  }`}
                />
                {errors.scholarshipFundUsagePlan && (
                  <p className="text-xs text-[#d93025]">{errors.scholarshipFundUsagePlan}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stepper Navigation Buttons (iOS 27 Pill) */}
        <div className="flex items-center justify-between pt-2">
          {activeModule > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-white hover:bg-[#F2F2F7] text-[#1C1C1E] text-xs sm:text-sm font-semibold border border-[#dadce0] shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ย้อนกลับ (Mod {activeModule - 1})</span>
            </button>
          ) : (
            <div />
          )}

          {activeModule < totalModules - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-8 py-2.5 rounded-full bg-[#007AFF] hover:bg-[#0066d6] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#007AFF]/25 transition-all active:scale-95 cursor-pointer"
            >
              <span>ถัดไป (Mod {activeModule + 1})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-9 py-3 rounded-full bg-[#34C759] hover:bg-[#2fb350] text-white text-sm font-bold shadow-lg shadow-[#34C759]/25 transition-all active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ส่งใบสมัครขอรับทุน (Submit Application)</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
