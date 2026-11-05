import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyNoticeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-[28px] shadow-2xl border border-black/[0.08] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 pb-3 border-b border-[#E5E5EA]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-tr from-[#34C759] to-[#30D158] text-white flex items-center justify-center shadow-md shadow-[#34C759]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
              นโยบายคุ้มครองข้อมูลส่วนบุคคล
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 text-[#3C3C43] text-xs sm:text-sm leading-relaxed space-y-4">
          <p className="font-semibold text-[#1C1C1E]">
            คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของท่าน
            ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)
          </p>

          <div>
            <h4 className="font-bold text-[#1C1C1E] mb-1">1. ข้อมูลที่จัดเก็บ</h4>
            <p>ระบบจัดเก็บข้อมูลที่ท่านกรอกในใบสมัครทุนการศึกษา ได้แก่ ชื่อ-สกุล รหัสนิสิต
              ภาควิชา ชั้นปี เบอร์โทรศัพท์ ที่อยู่ ข้อมูลครอบครัว ข้อมูลรายได้
              ผลการเรียน และเอกสารแนบ (รูปถ่าย ใบรายงานผล หนังสือรับรองรายได้)</p>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1C1E] mb-1">2. วัตถุประสงค์การใช้ข้อมูล</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>ประมวลผลใบสมัครทุนการศึกษาและคัดเลือกผู้ได้รับทุน</li>
              <li>ติดต่อสื่อสารเกี่ยวกับผลการพิจารณาทุน</li>
              <li>จัดทำรายงานสถิติและข้อมูลรวม (ไม่ระบุตัวบุคคล)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1C1E] mb-1">3. การเปิดเผยข้อมูล</h4>
            <p>ข้อมูลส่วนบุคคลจะถูกเปิดเผยเฉพาะคณะกรรมการพิจารณาทุนการศึกษาเท่านั้น
              จะไม่เปิดเผยต่อบุคคลภายนอกโดยไม่ได้รับความยินยอม
              ยกเว้นกรณีที่กฎหมายกำหนด</p>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1C1E] mb-1">4. ระยะเวลาจัดเก็บ</h4>
            <p>ข้อมูลจะถูกเก็บรักษาตลอดปีการศึกษาที่สมัคร
              และจะถูกลบหลังสิ้นสุดกระบวนการพิจารณาทุนไม่เกิน 1 ปี</p>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1C1E] mb-1">5. สิทธิของเจ้าของข้อมูล</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>สิทธิในการเข้าถึงและขอสำเนาข้อมูลส่วนบุคคล</li>
              <li>สิทธิในการขอแก้ไขข้อมูลให้ถูกต้อง</li>
              <li>สิทธิในการขอลบข้อมูล</li>
              <li>สิทธิในการถอนความยินยอม</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#1C1C1E] mb-1">6. ช่องทางติดต่อ</h4>
            <p>สำนักงานคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร<br />
              โทร. 055-961911</p>
          </div>
        </div>

        <div className="p-4 border-t border-[#E5E5EA]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#007AFF] hover:bg-[#0066d6] text-white text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer"
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
};
