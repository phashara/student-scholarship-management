import React from 'react';
import {
  CheckCircle,
  Users,
  Search,
  X,
  FileCheck2,
  Calendar,
  Building,
} from 'lucide-react';
import { ScholarshipApplication } from '../types';

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ScholarshipApplication | null;
  onViewApplicantList: () => void;
  onTrackStatus: (studentId: string) => void;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  isOpen,
  onClose,
  application,
  onViewApplicantList,
  onTrackStatus,
}) => {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-[26px] shadow-2xl border border-black/[0.08] overflow-hidden text-center p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-[22px] bg-[#34C759]/15 text-[#248A3D] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-9 h-9" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1C1E] tracking-tight">
            ยืนยันการสมัครเรียบร้อยแล้ว!
          </h2>
          <p className="text-xs sm:text-sm text-[#636366]">
            ข้อมูลใบสมัครของท่านถูกบันทึกเข้าสู่ฐานข้อมูลคณะสังคมศาสตร์ เรียบร้อยแล้ว
          </p>
        </div>

        {/* Application Summary Box */}
        <div className="bg-[#F2F2F7] rounded-[20px] p-4 text-left border border-black/[0.04] space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
            <span className="text-xs text-[#8E8E93] font-medium">เลขที่ใบสมัคร</span>
            <span className="font-mono font-bold text-xs break-all max-w-[70%] text-[#007AFF] bg-white px-2.5 py-0.5 rounded-full border border-[#007AFF]/20">
              {application.id}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[#8E8E93] block">ชื่อ-นามสกุล</span>
              <span className="font-bold text-[#1C1C1E] block truncate mt-0.5">
                {application.fullName}
              </span>
            </div>
            <div>
              <span className="text-[#8E8E93] block">รหัสนิสิต</span>
              <span className="font-mono font-bold text-[#1C1C1E] block mt-0.5">
                {application.studentId}
              </span>
            </div>
            <div>
              <span className="text-[#8E8E93] block">ชั้นปี</span>
              <span className="font-medium text-[#1C1C1E] block mt-0.5">
                {application.studyYear}
              </span>
            </div>
            <div>
              <span className="text-[#8E8E93] block">ภาควิชา/สถาน</span>
              <span className="font-medium text-[#1C1C1E] block truncate mt-0.5">
                {application.department}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={onViewApplicantList}
            className="w-full py-3 px-4 rounded-[14px] bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#007AFF]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Users className="w-4 h-4" />
            <span>ตรวจสอบรายชื่อผู้สมัครในระบบ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onTrackStatus(application.studentId)}
              className="flex-1 py-2.5 px-3 rounded-[14px] bg-white hover:bg-[#F2F2F7] text-[#1C1C1E] border border-black/[0.1] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#34C759]" />
              <span>ติดตามสถานะ</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-[14px] bg-black/5 hover:bg-black/10 text-[#636366] text-xs font-semibold transition-all cursor-pointer"
            >
              ตกลง / ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
