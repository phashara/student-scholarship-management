import React, { useState } from 'react';
import {
  X,
  Save,
  User,
  GraduationCap,
  Building,
  Phone,
  DollarSign,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { ScholarshipApplication } from '../types';

interface AdminEditApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ScholarshipApplication | null;
  onSave: (updatedApp: ScholarshipApplication) => Promise<void> | void;
  onDeleteClick?: () => void;
}

const DEPARTMENTS = [
  'ภาควิชาจิตวิทยา',
  'ภาควิชาประวัติศาสตร์',
  'ภาควิชารัฐศาสตร์และรัฐประศาสนศาสตร์',
  'ภาควิชาสังคมวิทยาและมานุษยวิทยา',
  'สถานประชาคมอาเซียนศึกษา',
];

const STUDY_YEARS = [
  'ชั้นปีที่ 1',
  'ชั้นปีที่ 2',
  'ชั้นปีที่ 3',
  'ชั้นปีที่ 4',
  'ชั้นปีที่ 4 ขึ้นไป',
];

const STATUS_OPTIONS: { value: ScholarshipApplication['status']; label: string; color: string }[] = [
  { value: 'submitted', label: 'ยื่นใบสมัครแล้ว (รอตรวจสอบ)', color: 'bg-[#FF9500]/10 text-[#D97706] border-[#FF9500]/30' },
  { value: 'eligible_for_interview', label: 'มีสิทธิ์เข้ารับการสัมภาษณ์', color: 'bg-[#007AFF]/10 text-[#007AFF] border-[#007AFF]/30' },
  { value: 'interviewed', label: 'ผ่านการสัมภาษณ์แล้ว', color: 'bg-[#5856D6]/10 text-[#5856D6] border-[#5856D6]/30' },
  { value: 'awarded', label: 'ได้รับทุนการศึกษา', color: 'bg-[#34C759]/10 text-[#248A3D] border-[#34C759]/30' },
  { value: 'not_selected', label: 'ไม่ผ่านการคัดเลือก', color: 'bg-[#8E8E93]/10 text-[#636366] border-[#8E8E93]/30' },
];

export const AdminEditApplicantModal: React.FC<AdminEditApplicantModalProps> = ({
  isOpen,
  onClose,
  application,
  onSave,
  onDeleteClick,
}) => {
  if (!isOpen || !application) return null;

  const [formData, setFormData] = useState<ScholarshipApplication>({ ...application });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'student' | 'family' | 'status'>('student');

  const handleChange = (field: keyof ScholarshipApplication, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated: ScholarshipApplication = {
        ...formData,
        updatedAt: new Date().toLocaleString('th-TH'),
      };
      await onSave(updated);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } catch (err) {
      console.error('Error saving application changes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({ ...application });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-[24px] shadow-2xl border border-black/[0.08] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-black/[0.06] bg-[#F2F2F7]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#007AFF] text-white flex items-center justify-center shadow-md shadow-[#007AFF]/25">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#1C1C1E]">
                  แก้ไขข้อมูลผู้สมัครในฐานข้อมูล
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#007AFF]/10 text-[#007AFF]">
                  {formData.id}
                </span>
              </div>
              <p className="text-xs text-[#8E8E93]">
                รหัสนิสิต: {formData.studentId} • {formData.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-black/[0.06] px-6 bg-white gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'student'
                ? 'border-[#007AFF] text-[#007AFF]'
                : 'border-transparent text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
          >
            <User className="w-4 h-4" />
            ข้อมูลส่วนตัวและการศึกษา
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('family')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'family'
                ? 'border-[#007AFF] text-[#007AFF]'
                : 'border-transparent text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            ข้อมูลครอบครัวและรายได้
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'status'
                ? 'border-[#007AFF] text-[#007AFF]'
                : 'border-transparent text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            สถานะและการอนุมัติทุน
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {saveSuccess && (
            <div className="p-3.5 bg-[#34C759]/15 border border-[#34C759]/30 rounded-[14px] flex items-center gap-2.5 text-[#248A3D] text-sm font-bold animate-fade-in">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <span>บันทึกข้อมูลลงฐานข้อมูล Cloud Firestore สำเร็จเรียบร้อย!</span>
            </div>
          )}

          {/* TAB 1: ข้อมูลส่วนตัวและการศึกษา */}
          {activeTab === 'student' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1C1E] mb-1.5">
                    ชื่อ-นามสกุล (ใส่คำนำหน้า) <span className="text-[#FF3B30]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-black/[0.12] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1E] mb-1.5">
                    รหัสนิสิต (8 หลัก) <span className="text-[#FF3B30]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentId || ''}
                    onChange={(e) => handleChange('studentId', e.target.value)}
                    maxLength={8}
                    required
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-black/[0.12] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 text-sm font-mono font-bold outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1E] mb-1.5">
                    ชั้นปี <span className="text-[#FF3B30]">*</span>
                  </label>
                  <select
                    value={formData.studyYear || ''}
                    onChange={(e) => handleChange('studyYear', e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-black/[0.12] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 text-sm outline-none bg-white transition-all"
                  >
                    {STUDY_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1E] mb-1.5">
                    ภาควิชา / สถาน <span className="text-[#FF3B30]">*</span>
                  </label>
                  <select
                    value={formData.department || ''}
                    onChange={(e) => handleChange('department', e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-black/[0.12] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 text-sm outline-none bg-white transition-all"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1E] mb-1.5">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-black/[0.12] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1E] mb-1.5">
                    เกรดเฉลี่ยสะสม (GPAX)
                  </label>
                  <select
                    value={formData.gpaxRange || ''}
                    onChange={(e) => handleChange('gpaxRange', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-black/[0.12] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 text-sm outline-none bg-white transition-all"
                  >
                    <option value="มากกว่า 3.50">มากกว่า 3.50</option>
                    <option value="3.00 - 3.49">3.00 - 3.49</option>
                    <option value="2.50 - 2.99">2.50 - 2.99</option>
                    <option value="น้อยกว่า 2.50">น้อยกว่า 2.50</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-1.5">
                  ที่อยู่ภูมิลำเนาของนิสิต
                </label>
                <textarea
                  value={formData.homeAddress || ''}
                  onChange={(e) => handleChange('homeAddress', e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-[12px] border border-black/[0.12] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 text-sm outline-none transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ข้อมูลครอบครัวและรายได้ */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F2F2F7]/60 rounded-[16px] border border-black/[0.04]">
                <h4 className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider mb-3 flex items-center gap-1.5 text-[#007AFF]">
                  <DollarSign className="w-4 h-4" />
                  รายได้ครอบครัว
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                      รวมรายได้ครอบครัวต่อปี (บาท)
                    </label>
                    <input
                      type="text"
                      value={formData.familyYearlyIncome || ''}
                      onChange={(e) => handleChange('familyYearlyIncome', e.target.value)}
                      placeholder="เช่น 120,000"
                      className="w-full px-3.5 py-2.5 rounded-[12px] border border-black/[0.12] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 text-sm outline-none bg-white transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
                      สถานภาพสมรสบิดา-มารดา
                    </label>
                    <input
                      type="text"
                      value={formData.parentsMaritalStatus || ''}
                      onChange={(e) => handleChange('parentsMaritalStatus', e.target.value)}
                      placeholder="เช่น อยู่ด้วยกัน, หย่าร้าง, แยกกันอยู่"
                      className="w-full px-3.5 py-2.5 rounded-[12px] border border-black/[0.12] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 text-sm outline-none bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ข้อมูลบิดา */}
                <div className="p-4 bg-white rounded-[16px] border border-black/[0.08]">
                  <h4 className="text-xs font-bold text-[#1C1C1E] mb-2.5">ข้อมูลบิดา</h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] text-[#636366] mb-1">ชื่อบิดา</label>
                      <input
                        type="text"
                        value={formData.fatherName || ''}
                        onChange={(e) => handleChange('fatherName', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-[10px] border border-black/[0.1] text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#636366] mb-1">สถานภาพ</label>
                      <select
                        value={formData.fatherStatus || 'ยังมีชีวิต'}
                        onChange={(e) => handleChange('fatherStatus', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-[10px] border border-black/[0.1] text-xs outline-none bg-white"
                      >
                        <option value="ยังมีชีวิต">ยังมีชีวิต</option>
                        <option value="ถึงแก่กรรม">ถึงแก่กรรม</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#636366] mb-1">อาชีพ</label>
                      <input
                        type="text"
                        value={formData.fatherOccupation || ''}
                        onChange={(e) => handleChange('fatherOccupation', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-[10px] border border-black/[0.1] text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ข้อมูลมารดา */}
                <div className="p-4 bg-white rounded-[16px] border border-black/[0.08]">
                  <h4 className="text-xs font-bold text-[#1C1C1E] mb-2.5">ข้อมูลมารดา</h4>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] text-[#636366] mb-1">ชื่อมารดา</label>
                      <input
                        type="text"
                        value={formData.motherName || ''}
                        onChange={(e) => handleChange('motherName', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-[10px] border border-black/[0.1] text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#636366] mb-1">สถานภาพ</label>
                      <select
                        value={formData.motherStatus || 'ยังมีชีวิต'}
                        onChange={(e) => handleChange('motherStatus', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-[10px] border border-black/[0.1] text-xs outline-none bg-white"
                      >
                        <option value="ยังมีชีวิต">ยังมีชีวิต</option>
                        <option value="ถึงแก่กรรม">ถึงแก่กรรม</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#636366] mb-1">อาชีพ</label>
                      <input
                        type="text"
                        value={formData.motherOccupation || ''}
                        onChange={(e) => handleChange('motherOccupation', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-[10px] border border-black/[0.1] text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: สถานะและการอนุมัติทุน */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-2">
                  สถานะการพิจารณาทุนการศึกษา <span className="text-[#FF3B30]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STATUS_OPTIONS.map((st) => {
                    const isSelected = formData.status === st.value;
                    return (
                      <button
                        type="button"
                        key={st.value}
                        onClick={() => handleChange('status', st.value)}
                        className={`p-3 rounded-[14px] border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? `${st.color} border-current ring-2 ring-current/20 shadow-xs`
                            : 'bg-white border-black/[0.08] hover:bg-[#F2F2F7]/50 text-[#1C1C1E]'
                        }`}
                      >
                        <span className="text-xs font-bold">{st.label}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.status === 'awarded' && (
                <div className="p-4 bg-[#34C759]/10 rounded-[16px] border border-[#34C759]/30 animate-fade-in">
                  <label className="block text-xs font-bold text-[#248A3D] mb-1.5">
                    จำนวนเงินทุนการศึกษาที่ได้รับอนุมัติ (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.awardedAmount || 10000}
                    onChange={(e) => handleChange('awardedAmount', Number(e.target.value))}
                    min={1000}
                    step={500}
                    className="w-full px-3.5 py-2.5 rounded-[12px] border border-[#34C759]/40 bg-white text-[#1C1C1E] text-base font-bold font-mono outline-none"
                  />
                  <p className="text-[11px] text-[#248A3D] mt-1">
                    * ทุนการศึกษาคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร โดยทั่วไปอยู่ที่ 5,000 - 15,000 บาท
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-1.5">
                  บันทึกข้อความ / ความเห็นของคณะกรรมการ (Reviewer Notes)
                </label>
                <textarea
                  value={formData.reviewerNotes || ''}
                  onChange={(e) => handleChange('reviewerNotes', e.target.value)}
                  rows={3}
                  placeholder="เช่น เอกสารครบถ้วน, นัดสัมภาษณ์เพิ่มเติม, ข้อมูลรายได้ครอบครัวตรงตามหลักฐาน"
                  className="w-full px-3.5 py-2.5 rounded-[12px] border border-black/[0.12] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 text-sm outline-none transition-all resize-none"
                />
              </div>

              <div className="p-3 bg-[#FF9500]/10 rounded-[12px] border border-[#FF9500]/25 flex items-start gap-2 text-[12px] text-[#D97706]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  การแก้ไขข้อมูลนี้จะมีผลทันทีต่อฐานข้อมูล Cloud Firestore และสถานะที่นิสิตตรวจสอบผ่านระบบออนไลน์
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-black/5 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                รีเซ็ตค่าเดิม
              </button>

              {onDeleteClick && (
                <button
                  type="button"
                  onClick={onDeleteClick}
                  disabled={isSaving}
                  className="px-3 py-2 rounded-[12px] text-xs font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="ลบข้อมูลผู้สมัครรายนี้ (ต้องใส่รหัสผ่าน 07011985)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ลบใบสมัครนี้</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-[12px] text-xs sm:text-sm font-semibold text-[#636366] hover:bg-black/5 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-[12px] bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#007AFF]/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'กำลังบันทึกลงฐานข้อมูล...' : 'บันทึกการแก้ไขในฐานข้อมูล'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
