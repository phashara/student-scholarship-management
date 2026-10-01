/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Coins,
  GraduationCap,
  Heart,
  HelpCircle,
  Info,
  Scale,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { calculateScholarshipScore } from '../data/scholarshipData';
import { ScholarshipApplication } from '../types';

interface ScoringCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoringCriteriaModal: React.FC<ScoringCriteriaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'rubric' | 'tiers' | 'simulator'>('rubric');

  // Interactive Simulator State
  const [simIncome, setSimIncome] = useState('น้อยกว่า 60,000');
  const [simAllowance, setSimAllowance] = useState('น้อยกว่า 3,000');
  const [simLoan, setSimLoan] = useState('ไม่กู้');
  const [simPastScholarship, setSimPastScholarship] = useState('ไม่เคยได้รับทุน');
  const [simIllness, setSimIllness] = useState('โรครุนแรงแต่สามารถทำงานได้');
  const [simParentsStatus, setSimParentsStatus] = useState('อยู่ด้วยกันกับบิดาหรือมารดาในครัวเรือนเดียวกัน');
  const [simSiblings, setSimSiblings] = useState('2 คน');
  const [simPartTime, setSimPartTime] = useState('ทำอยู่');
  const [simVolunteer, setSimVolunteer] = useState('เคยทำ');
  const [simActivity, setSimActivity] = useState('เคยทำ');
  const [simGpax, setSimGpax] = useState('3.00 - 3.49');
  const [simReasonLength, setSimReasonLength] = useState(true);

  if (!isOpen) return null;

  // Run simulator calculation
  const mockApp: Partial<ScholarshipApplication> = {
    familyYearlyIncome: simIncome,
    studentLoanStatus: simLoan,
    pastScholarshipHistory: simPastScholarship,
    monthlyAllowance: simAllowance,
    familyIllnessStatus: simIllness,
    parentsMaritalStatus: simParentsStatus,
    siblingsStudyingCount: simSiblings,
    partTimeWorkHistory: simPartTime,
    volunteerWorkParticipation: simVolunteer,
    studentActivityParticipation: simActivity,
    gpaxRange: simGpax,
    reasonForApplying: simReasonLength
      ? 'มีความจำเป็นเนื่องจากบิดามารดามีภาระค่าใช้จ่ายและการรักษาพยาบาล นิสิตต้องการแบ่งเบาภาระครอบครัว'
      : 'ต้องการทุน',
  };

  const simScore = calculateScholarshipScore(mockApp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl border border-black/[0.08] overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-[#1C1C1E] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#FF9500]/20 text-[#FF9500] flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-['Prompt',sans-serif]">
                  เกณฑ์การให้คะแนนคัดเลือกทุนการศึกษา 100 คะแนนเต็ม
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3B30]/20 text-[#FF453A] border border-[#FF3B30]/30">
                  เฉพาะคณะกรรมการ
                </span>
              </div>
              <p className="text-xs text-white/70">
                เอกสารภายในคณะกรรมการพิจารณาทุน คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร ประจำปีการศึกษา 2569
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="px-6 py-3 bg-[#F2F2F7] border-b border-black/[0.05] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rubric'
                ? 'bg-white text-[#1C1C1E] shadow-xs'
                : 'text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#007AFF]" />
              <span>ตารางเกณฑ์ 7 มิติ (100 คะแนน)</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tiers')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tiers'
                ? 'bg-white text-[#1C1C1E] shadow-xs'
                : 'text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#34C759]" />
              <span>ระดับความจำเป็น</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-white text-[#1C1C1E] shadow-xs'
                : 'text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>เครื่องมือจำลองคำนวณคะแนน (Simulator)</span>
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-sm text-[#1C1C1E]">
          {/* TAB 1: RUBRIC */}
          {activeTab === 'rubric' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#007AFF]/8 border border-[#007AFF]/20 rounded-[20px] p-4 text-xs text-[#004085] flex items-start gap-3">
                <Info className="w-5 h-5 text-[#007AFF] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  ระบบคะแนนนี้ได้รับการออกแบบเพื่อให้ความเป็นธรรม โปร่งใส
                  และสะท้อนสภาพความเดือดร้อนที่แท้จริงของนิสิตคณะสังคมศาสตร์อย่างรอบด้าน โดยพิจารณาจากข้อมูลที่นิสิตกรอกใน Module 1 ถึง Module 8 ครบทุกมิติ
                </p>
              </div>

              {/* Rubric Grid */}
              <div className="space-y-4">
                {/* 1. รายได้ครอบครัว & หลักฐานรับรองรายได้ */}
                <div className="border border-black/[0.08] rounded-[20px] p-4.5 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1C1C1E] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#007AFF]/15 text-[#007AFF] text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <span>รวมรายได้ครอบครัวต่อปี & หลักฐานรับรองรายได้ (ข้อ 15)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#007AFF]/12 text-[#007AFF] text-xs font-bold font-mono">
                      คะแนนเต็ม 30 คะแนน
                    </span>
                  </div>
                  <p className="text-xs text-[#636366]">
                    รายได้น้อยได้รับคะแนนความเดือดร้อนสูงสุด พร้อมแนบหนังสือรับรองรายได้ครอบครัว หรือสลิปเงินเดือนผู้ปกครอง (ใช้แบบฟอร์มเดียวกับ กยศ. ได้)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">&lt; 60,000 บ./ปี</span>
                      <strong className="text-[#007AFF] font-mono font-bold text-sm">30 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">60,001 - 89,999</span>
                      <strong className="text-[#007AFF] font-mono font-bold text-sm">27 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">90,000 - 119,999</span>
                      <strong className="text-[#007AFF] font-mono font-bold text-sm">24 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">120,000 - 149,999</span>
                      <strong className="text-[#007AFF] font-mono font-bold text-sm">21 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">150,000 - 179,999</span>
                      <strong className="text-[#007AFF] font-mono font-bold text-sm">18 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">180,000 - 209,999</span>
                      <strong className="text-[#007AFF] font-mono font-bold text-sm">15 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">210,000 - 239,999</span>
                      <strong className="text-[#007AFF] font-mono font-bold text-sm">12 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">240,000 - 269,999</span>
                      <strong className="text-[#007AFF] font-mono font-bold text-sm">9 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">270,000 - 299,999</span>
                      <strong className="text-[#007AFF] font-mono font-bold text-sm">6 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">300,000 - 329,999</span>
                      <strong className="text-[#007AFF] font-mono font-bold text-sm">3 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px] col-span-2">
                      <span className="text-[#8E8E93] block text-[11px]">&gt; 330,000 บ./ปี</span>
                      <strong className="text-[#8E8E93] font-mono font-bold text-sm">0 คะแนน</strong>
                    </div>
                  </div>
                </div>

                {/* 2. ประวัติการรับทุนการศึกษา */}
                <div className="border border-black/[0.08] rounded-[20px] p-4.5 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1C1C1E] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#00A1F1]/15 text-[#0077B6] text-xs font-bold flex items-center justify-center">
                        2
                      </span>
                      <span>ประวัติการรับทุนการศึกษา & การกู้ยืม กยศ. (ข้อ 18, 19)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#00A1F1]/12 text-[#0077B6] text-xs font-bold font-mono">
                      คะแนนเต็ม 5 คะแนน
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                    <div className="p-2.5 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">ไม่เคยกู้ กยศ. และไม่เคยได้ทุน</span>
                      <strong className="text-[#0077B6] font-mono font-bold text-sm">5 คะแนน</strong>
                    </div>
                    <div className="p-2.5 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">เคยได้รับทุนการศึกษาอื่นปี 68/69</span>
                      <strong className="text-[#0077B6] font-mono font-bold text-sm">3 คะแนน</strong>
                    </div>
                    <div className="p-2.5 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">กู้ยืมเงิน กยศ. / กรอ.</span>
                      <strong className="text-[#FF3B30] font-mono font-bold text-sm">0 คะแนน</strong>
                    </div>
                  </div>
                </div>

                {/* 3. ผลการเรียนเฉลี่ยสะสม (GPAX X2) */}
                <div className="border border-black/[0.08] rounded-[20px] p-4.5 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1C1C1E] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#5856D6]/15 text-[#5856D6] text-xs font-bold flex items-center justify-center">
                        3
                      </span>
                      <span>ผลการเรียนเฉลี่ยสะสม (GPAX) (ข้อ 7) - เพิ่มเป็น X2</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#5856D6]/12 text-[#5856D6] text-xs font-bold font-mono">
                      คะแนนเต็ม 10 คะแนน
                    </span>
                  </div>
                  <p className="text-xs text-[#636366]">
                    ปรับคะแนนเพิ่มขึ้นเป็น 10 คะแนนเต็ม โดยการนำคะแนนเดิมมาคูณสอง (X2) เพื่อส่งเสริมนิสิตที่ตั้งใจเรียน
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="p-2.5 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">มากกว่า 3.50</span>
                      <strong className="text-[#5856D6] font-mono font-bold text-sm">10 คะแนน</strong>
                    </div>
                    <div className="p-2.5 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">3.00 - 3.49</span>
                      <strong className="text-[#5856D6] font-mono font-bold text-sm">8 คะแนน</strong>
                    </div>
                    <div className="p-2.5 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">2.50 - 2.99</span>
                      <strong className="text-[#5856D6] font-mono font-bold text-sm">6 คะแนน</strong>
                    </div>
                    <div className="p-2.5 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">น้อยกว่า 2.50</span>
                      <strong className="text-[#5856D6] font-mono font-bold text-sm">4 คะแนน</strong>
                    </div>
                  </div>
                </div>

                {/* 4. ค่าใช้จ่ายที่นิสิตได้รับต่อเดือน */}
                <div className="border border-black/[0.08] rounded-[20px] p-4.5 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1C1C1E] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#34C759]/15 text-[#248A3D] text-xs font-bold flex items-center justify-center">
                        4
                      </span>
                      <span>จำนวนเงินที่นิสิตได้รับค่าใช้จ่ายต่อเดือน (ข้อ 17)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#34C759]/12 text-[#248A3D] text-xs font-bold font-mono">
                      คะแนนเต็ม 15 คะแนน
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-xs">
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">&lt; 3,000 บ./ด.</span>
                      <strong className="text-[#248A3D] font-mono font-bold text-sm">15 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">3,000 - 3,999 บ.</span>
                      <strong className="text-[#248A3D] font-mono font-bold text-sm">12 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">4,000 - 4,999 บ.</span>
                      <strong className="text-[#248A3D] font-mono font-bold text-sm">8 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">5,000 - 5,999 บ.</span>
                      <strong className="text-[#248A3D] font-mono font-bold text-sm">4 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">&gt; 6,000 บ./ด.</span>
                      <strong className="text-[#8E8E93] font-mono font-bold text-sm">1 คะแนน</strong>
                    </div>
                  </div>
                </div>

                {/* 5. สภาพความยากลำบากและการเจ็บป่วย */}
                <div className="border border-black/[0.08] rounded-[20px] p-4.5 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1C1C1E] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#AF52DE]/15 text-[#AF52DE] text-xs font-bold flex items-center justify-center">
                        5
                      </span>
                      <span>สภาพความเป็นอยู่และการเจ็บป่วยของคนในครอบครัว (ข้อ 11, 12, 13)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#AF52DE]/12 text-[#AF52DE] text-xs font-bold font-mono">
                      คะแนนเต็ม 15 คะแนน
                    </span>
                  </div>
                  <ul className="text-xs text-[#3C4043] space-y-1 list-disc pl-5">
                    <li>
                      <strong>การเจ็บป่วย (สูงสุด 8 คะแนน):</strong> โรครุนแรงจนประกอบอาชีพไม่ได้ (+8), โรครุนแรงแต่ยังทำงานได้ (+5), โรคไม่รุนแรง (+2), ไม่มีโรคประจำตัว (0)
                    </li>
                    <li>
                      <strong>สถานภาพสมรส (สูงสุด 7 คะแนน):</strong> ไม่ได้อยู่กับบิดามารดาและไม่มีสภาพเป็นครอบครัว (+7), แยกกันอยู่แต่ยังมีสภาพครอบครัว (+5), บิดาหรือมารดาคนเดียวเลี้ยงดู (+4), อยู่ด้วยกัน (2)
                    </li>
                  </ul>
                </div>

                {/* 6. ภาระพี่น้องที่กำลังศึกษา */}
                <div className="border border-black/[0.08] rounded-[20px] p-4.5 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1C1C1E] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#5856D6]/15 text-[#5856D6] text-xs font-bold flex items-center justify-center">
                        6
                      </span>
                      <span>จำนวนพี่น้องที่กำลังศึกษา (ไม่รวมตัวนิสิต) (ข้อ 14)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#5856D6]/12 text-[#5856D6] text-xs font-bold font-mono">
                      คะแนนเต็ม 10 คะแนน
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">มากกว่า 3 คน</span>
                      <strong className="text-[#5856D6] font-mono font-bold text-sm">10 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">2 คน</span>
                      <strong className="text-[#5856D6] font-mono font-bold text-sm">7 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">1 คน</span>
                      <strong className="text-[#5856D6] font-mono font-bold text-sm">4 คะแนน</strong>
                    </div>
                    <div className="p-2 bg-[#F2F2F7] rounded-[10px]">
                      <span className="text-[#8E8E93] block text-[11px]">ไม่มี</span>
                      <strong className="text-[#8E8E93] font-mono font-bold text-sm">0 คะแนน</strong>
                    </div>
                  </div>
                </div>

                {/* 7. การพึ่งพาตนเองและกิจกรรม */}
                <div className="border border-black/[0.08] rounded-[20px] p-4.5 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1C1C1E] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#FF2D55]/15 text-[#FF2D55] text-xs font-bold flex items-center justify-center">
                        7
                      </span>
                      <span>การทำงานพิเศษ จิตอาสา และกิจกรรมนิสิต (ข้อ 21, 22, 23)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF2D55]/12 text-[#FF2D55] text-xs font-bold font-mono">
                      คะแนนเต็ม 10 คะแนน
                    </span>
                  </div>
                  <ul className="text-xs text-[#3C4043] space-y-1 list-disc pl-5">
                    <li>ทำงานพิเศษระหว่างเรียน (ทำอยู่: 4 คะแนน, เคยทำ: 2 คะแนน)</li>
                    <li>กิจกรรมจิตอาสา บำเพ็ญประโยชน์ (เคยทำ: 3 คะแนน)</li>
                    <li>กิจกรรมชมรม สโมสรนิสิต องค์การ สภานิสิต (เคยทำ: 3 คะแนน)</li>
                  </ul>
                </div>

                {/* 8. ความจำเป็นและความตั้งใจศึกษา */}
                <div className="border border-black/[0.08] rounded-[20px] p-4.5 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1C1C1E] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#FF9500]/15 text-[#b06000] text-xs font-bold flex items-center justify-center">
                        8
                      </span>
                      <span>เหตุผลความจำเป็นและความตั้งใจศึกษา (ข้อ 24, 25, 26)</span>
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF9500]/12 text-[#b06000] text-xs font-bold font-mono">
                      คะแนนเต็ม 5 คะแนน
                    </span>
                  </div>
                  <p className="text-xs text-[#636366]">
                    ชี้แจงความเดือดร้อน ความจำเป็น และแผนการนำเงินทุนไปใช้อย่างชัดเจน (สูงสุด 5 คะแนน)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIERS */}
          {activeTab === 'tiers' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-[22px] bg-[#fce8e6] border border-[#ea4335]/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#d93025] text-white">
                      ระดับ 1 : ความจำเป็นเร่งด่วนสูงสุด
                    </span>
                    <span className="font-mono font-bold text-sm text-[#d93025]">75 - 100 คะแนน</span>
                  </div>
                  <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif]">
                    พิจารณาจัดสรรทุนอันดับแรก (Priority 1)
                  </h4>
                  <p className="text-xs text-[#491217] leading-relaxed">
                    ครอบครัวมีรายได้ต่ำกว่า 90,000 บ./ปี หรือบุคคลในครอบครัวเจ็บป่วยรุนแรง นิสิตได้รับค่าใช้จ่ายน้อยกว่า 3,000 บ./เดือน
                  </p>
                </div>

                <div className="p-5 rounded-[22px] bg-[#fef7e0] border border-[#f9ab00]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#b06000] text-white">
                      ระดับ 2 : ความจำเป็นสูง
                    </span>
                    <span className="font-mono font-bold text-sm text-[#b06000]">60 - 74 คะแนน</span>
                  </div>
                  <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif]">
                    พิจารณาสัมภาษณ์และจัดสรรทุน (Priority 2)
                  </h4>
                  <p className="text-xs text-[#523300] leading-relaxed">
                    มีภาระค่าใช้จ่ายพอสมควร มีพี่น้องกำลังศึกษาหลายคน หรือทำงานพิเศษช่วยเหลือตนเอง
                  </p>
                </div>

                <div className="p-5 rounded-[22px] bg-[#e8f0fe] border border-[#4285f4]/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1a73e8] text-white">
                      ระดับ 3 : ความจำเป็นปานกลาง
                    </span>
                    <span className="font-mono font-bold text-sm text-[#1a73e8]">45 - 59 คะแนน</span>
                  </div>
                  <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif]">
                    พิจารณาตามโควตาทุนที่เหลือ (Priority 3)
                  </h4>
                  <p className="text-xs text-[#0d3c61] leading-relaxed">
                    ฐานะเศรษฐกิจปานกลาง หรือได้รับความช่วยเหลือจาก กยศ. แล้ว พิจารณาเสริมตามความเหมาะสม
                  </p>
                </div>

                <div className="p-5 rounded-[22px] bg-[#F2F2F7] border border-black/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8E8E93] text-white">
                      ระดับ 4 : ระดับปกติ / ทุนสำรอง
                    </span>
                    <span className="font-mono font-bold text-sm text-[#636366]">&lt; 45 คะแนน</span>
                  </div>
                  <h4 className="font-bold text-[#1C1C1E] text-sm font-['Prompt',sans-serif]">
                    ขึ้นบัญชีสำรอง หรือแนะนำทุนประเภทอื่น
                  </h4>
                  <p className="text-xs text-[#636366] leading-relaxed">
                    ครอบครัวมีรายได้เพียงพอ ไม่มีความจำเป็นเร่งด่วน หรือมีแหล่งทุนอื่นสนับสนุนอยู่แล้ว
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#FFF8EE] border border-[#FF9500]/30 rounded-[20px] p-4 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#b06000] uppercase tracking-wider block">
                    ผลลัพธ์การประเมินจำลอง (Real-Time Result)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono text-[#1C1C1E]">
                      {simScore.totalScore}
                    </span>
                    <span className="text-xs text-[#8E8E93]">/ 100 คะแนน</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold border ${simScore.colorClass}`}>
                      {simScore.priorityLabel}
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs text-[#636366]">
                  <p>รายได้ (มีหลักฐาน): {simScore.incomeScore}/30</p>
                  <p>ทุน/กยศ: {simScore.scholarshipHistoryScore || 0}/5 • ผลการเรียน (GPAX X2): {simScore.gpaxScore || 0}/10</p>
                  <p>ค่าใช้จ่าย: {simScore.allowanceScore}/15 • สภาพครอบครัว: {simScore.familyHardshipScore}/15</p>
                  <p>พี่น้อง: {simScore.siblingsScore}/10 • งานพิเศษ/กิจกรรม: {simScore.selfRelianceScore}/10 • ความจำเป็น: {simScore.needReasonScore || 0}/5</p>
                </div>
              </div>

              {/* Form Controls to tweak inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold block mb-1">รายได้ครอบครัวต่อปี (เต็ม 30 คะแนน)</label>
                  <select
                    value={simIncome}
                    onChange={(e) => setSimIncome(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#F2F2F7] outline-none"
                  >
                    <option value="น้อยกว่า 60,000">น้อยกว่า 60,000 (30 คะแนน)</option>
                    <option value="60,001 - 89,999">60,001 - 89,999 (27 คะแนน)</option>
                    <option value="90,000 - 119,999">90,000 - 119,999 (24 คะแนน)</option>
                    <option value="120,000 - 149,999">120,000 - 149,999 (21 คะแนน)</option>
                    <option value="150,000 - 179,999">150,000 - 179,999 (18 คะแนน)</option>
                    <option value="180,000 - 209,999">180,000 - 209,999 (15 คะแนน)</option>
                    <option value="มากกว่า 330,000">มากกว่า 330,000 (0 คะแนน)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">ผลการเรียนเฉลี่ยสะสม GPAX (X2 เต็ม 10 คะแนน)</label>
                  <select
                    value={simGpax}
                    onChange={(e) => setSimGpax(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#F2F2F7] outline-none"
                  >
                    <option value="มากกว่า 3.50">มากกว่า 3.50 (10 คะแนนเต็ม)</option>
                    <option value="3.00 - 3.49">3.00 - 3.49 (8 คะแนน)</option>
                    <option value="2.50 - 2.99">2.50 - 2.99 (6 คะแนน)</option>
                    <option value="น้อยกว่า 2.50">น้อยกว่า 2.50 (4 คะแนน)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">การกู้ยืม กยศ. (เต็ม 5 คะแนน)</label>
                  <select
                    value={simLoan}
                    onChange={(e) => setSimLoan(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#F2F2F7] outline-none"
                  >
                    <option value="ไม่กู้">ไม่กู้ (นำไปพิจารณารับ 5 หรือ 3 คะแนน)</option>
                    <option value="กู้ค่าเทอมและค่าครองชีพ">กู้ยืม กยศ. (0 คะแนน)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">ประวัติการรับทุนการศึกษาอื่น</label>
                  <select
                    value={simPastScholarship}
                    onChange={(e) => setSimPastScholarship(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#F2F2F7] outline-none"
                  >
                    <option value="ไม่เคยได้รับทุน">ไม่เคยได้รับทุนใดๆ เลย (5 คะแนน)</option>
                    <option value="เคยได้รับและสิ้นสุดแล้ว">เคยได้รับทุนอื่นปี 68/69 (3 คะแนน)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">เงินที่ได้รับต่อเดือน</label>
                  <select
                    value={simAllowance}
                    onChange={(e) => setSimAllowance(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#F2F2F7] outline-none"
                  >
                    <option value="น้อยกว่า 3,000">น้อยกว่า 3,000 (15 คะแนน)</option>
                    <option value="3,000-3,999">3,000 - 3,999 (12 คะแนน)</option>
                    <option value="4,000-4,999">4,000 - 4,999 (8 คะแนน)</option>
                    <option value="มากกว่า 6,000">มากกว่า 6,000 (1 คะแนน)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">การเจ็บป่วยในครอบครัว</label>
                  <select
                    value={simIllness}
                    onChange={(e) => setSimIllness(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#F2F2F7] outline-none"
                  >
                    <option value="โรครุนแรงจนทำให้ประกอบอาชีพไม่ได้หรือต้องดูแลเป็นพิเศษ">
                      โรครุนแรงจนประกอบอาชีพไม่ได้ (+8 คะแนน)
                    </option>
                    <option value="โรครุนแรงแต่สามารถทำงานได้">โรครุนแรงแต่ทำงานได้ (+5 คะแนน)</option>
                    <option value="ไม่มีโรคประจำตัว">ไม่มีโรคประจำตัว (0 คะแนน)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">พี่น้องที่กำลังศึกษา</label>
                  <select
                    value={simSiblings}
                    onChange={(e) => setSimSiblings(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#F2F2F7] outline-none"
                  >
                    <option value="มากกว่า 3 คน">มากกว่า 3 คน (10 คะแนน)</option>
                    <option value="2 คน">2 คน (7 คะแนน)</option>
                    <option value="1 คน">1 คน (4 คะแนน)</option>
                    <option value="ไม่มี">ไม่มี (0 คะแนน)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">การทำงานพิเศษ</label>
                  <select
                    value={simPartTime}
                    onChange={(e) => setSimPartTime(e.target.value)}
                    className="w-full p-2.5 rounded-[12px] bg-[#F2F2F7] outline-none"
                  >
                    <option value="ทำอยู่">ทำอยู่ (+4 คะแนน)</option>
                    <option value="เคยทำ">เคยทำ (+2 คะแนน)</option>
                    <option value="ไม่เคยทำ">ไม่เคยทำ (0 คะแนน)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F2F2F7] border-t border-black/[0.06] flex items-center justify-between">
          <span className="text-xs text-[#8E8E93]">
            คณะกรรมการพิจารณาทุน คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1C1C1E] text-white text-xs font-semibold hover:bg-black transition-all active:scale-95 cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
