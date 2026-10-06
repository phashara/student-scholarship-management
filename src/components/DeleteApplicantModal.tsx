import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  KeyRound,
  Lock,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { ScholarshipApplication } from '../types';

interface DeleteApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ScholarshipApplication | null;
  isClearAll?: boolean;
  totalCount?: number;
  onConfirmDelete: () => Promise<void> | void;
}

const REQUIRED_DELETE_PASSWORD = '07011985';

export const DeleteApplicantModal: React.FC<DeleteApplicantModalProps> = ({
  isOpen,
  onClose,
  application,
  isClearAll = false,
  totalCount = 0,
  onConfirmDelete,
}) => {
  if (!isOpen) return null;

  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    if (isDeleting) return;
    setPassword('');
    setErrorMsg('');
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== REQUIRED_DELETE_PASSWORD) {
      setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านและลองใหม่อีกครั้ง');
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirmDelete();
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 700);
    } catch (err) {
      console.error('Error during deletion:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-black/[0.08] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-black/[0.06] bg-[#FF3B30]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#FF3B30]/15 text-[#D70015] flex items-center justify-center shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1C1E]">
                {isClearAll ? 'ลบข้อมูลผู้สมัครทั้งหมด' : 'ลบข้อมูลผู้สมัคร'}
              </h3>
              <p className="text-xs text-[#8E8E93]">
                ระบบความปลอดภัยต้องยืนยันรหัสผ่าน
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSuccess ? (
            <div className="p-4 bg-[#34C759]/15 border border-[#34C759]/30 rounded-[16px] text-center space-y-1 text-[#248A3D] animate-fade-in">
              <CheckCircle className="w-8 h-8 mx-auto" />
              <p className="font-bold text-sm">ลบข้อมูลออกจากฐานข้อมูลสำเร็จเรียบร้อย</p>
            </div>
          ) : (
            <>
              {/* Target info card */}
              {isClearAll ? (
                <div className="p-4 rounded-[16px] bg-[#FF3B30]/10 border border-[#FF3B30]/25 text-[#D70015] space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>คำเตือน: กำลังจะลบข้อมูลทั้งหมด {totalCount} รายการ</span>
                  </div>
                  <p className="text-xs text-[#636366] mt-1">
                    ข้อมูลใบสมัครทั้งหมดบน Cloud Firestore จะถูกลบถาวร ไม่สามารถกู้คืนได้
                  </p>
                </div>
              ) : application ? (
                <div className="p-3.5 rounded-[16px] bg-[#F2F2F7] border border-black/[0.05] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#007AFF]">
                      {application.studentId}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 text-[#636366]">
                      {application.studyYear}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#1C1C1E]">
                    {application.fullName}
                  </p>
                  <p className="text-xs text-[#636366]">
                    {application.department}
                  </p>
                </div>
              ) : null}

              {/* Password Input */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-[#1C1C1E] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#FF3B30]" />
                    รหัสผ่านยืนยันการลบข้อมูล (Password) <span className="text-[#FF3B30]">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="กรอกรหัสผ่าน 8 หลัก..."
                    autoFocus
                    required
                    className={`w-full px-3.5 py-2.5 rounded-[12px] border text-sm font-mono tracking-wider outline-none transition-all ${
                      errorMsg
                        ? 'border-[#FF3B30] bg-[#FF3B30]/5 focus:ring-2 focus:ring-[#FF3B30]/20'
                        : 'border-black/[0.12] focus:border-[#FF3B30] focus:ring-2 focus:ring-[#FF3B30]/20'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-[#8E8E93] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errorMsg && (
                  <p className="text-xs font-semibold text-[#FF3B30] flex items-center gap-1 mt-1 animate-fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </p>
                )}
              </div>

              <div className="text-[11px] text-[#8E8E93] bg-[#F2F2F7]/60 p-2.5 rounded-[10px] border border-black/[0.04]">
                🛡️ การลบนี้จะมีผลทันทีต่อฐานข้อมูล Cloud Firestore และไม่สามารถกู้คืนได้
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-[12px] text-xs sm:text-sm font-semibold text-[#636366] hover:bg-black/5 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isDeleting || !password}
                  className="px-5 py-2.5 rounded-[12px] bg-[#FF3B30] hover:bg-[#d70015] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#FF3B30]/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'กำลังลบข้อมูล...' : 'ยืนยันลบข้อมูล'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
