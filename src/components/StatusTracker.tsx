/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Eye,
  FileText,
  HelpCircle,
  MapPin,
  Phone,
  Search,
  User,
} from 'lucide-react';
import { ScholarshipApplication, TimelineConfig } from '../types';

interface StatusTrackerProps {
  applications: ScholarshipApplication[];
  applicationsAreCurrent?: boolean;
  onViewApplication: (app: ScholarshipApplication) => void;
  initialQuery?: string;
  timelineConfig?: TimelineConfig;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({
  applications,
  applicationsAreCurrent = true,
  onViewApplication,
  initialQuery = '',
  timelineConfig,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));

  const trimmed = query.trim().toLowerCase();
  const matchedApp = applications.find(
    (a) =>
      (a.studentId && a.studentId.toLowerCase() === trimmed) ||
      (a.id && a.id.toLowerCase() === trimmed) ||
      (a.fullName && a.fullName.toLowerCase().includes(trimmed))
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const interviewDateBadge =
    timelineConfig?.criticalNotice?.interviewDate?.split('(')[0]?.replace('เวลา', '')?.trim() ||
    timelineConfig?.steps?.find((s) => s.id === 'step-3')?.dateStr?.split('(')[0]?.trim() ||
    '23 กันยายน 2569';

  const getStatusBadge = (status: ScholarshipApplication['status']) => {
    switch (status) {
      case 'eligible_for_interview':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[#FF9500]/15 text-[#D97706] border border-[#FF9500]/30">
            <span className="w-2 h-2 rounded-full bg-[#FF9500] animate-ping" />
            <span>มีสิทธิ์เข้าสัมภาษณ์ทุนการศึกษา ({interviewDateBadge})</span>
          </div>
        );
      case 'awarded':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[#34C759]/15 text-[#248A3D] border border-[#34C759]/30">
            <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
            <span>ได้รับการจัดสรรทุนการศึกษา ประจำปี {timelineConfig?.academicYear || '2569'}</span>
          </div>
        );
      case 'interviewed':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-[#007AFF]/12 text-[#007AFF] border border-[#007AFF]/25">
            <Clock className="w-4 h-4 text-[#007AFF]" />
            <span>สัมภาษณ์แล้ว (คณะกรรมการกำลังสรุปยอดเงินทุน)</span>
          </div>
        );
      case 'not_selected':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[#767680]/12 text-[#636366]">
            <span>ไม่ผ่านการพิจารณาในรอบนี้</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-[#5856D6]/12 text-[#5856D6] border border-[#5856D6]/20">
            <Clock className="w-4 h-4 text-[#5856D6]" />
            <span>ยื่นใบสมัครแล้ว (รอการตรวจสอบเอกสารและคะแนน)</span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* iOS Search Card */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 shadow-xs border border-black/[0.04]">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-12 h-12 bg-[#007AFF]/10 text-[#007AFF] rounded-[18px] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1C1E] font-['Prompt',sans-serif] tracking-tight">
            ตรวจสอบสถานะการสมัครทุนการศึกษา 2569
          </h2>
          <p className="text-xs sm:text-sm text-[#8E8E93]">
            กรอกรหัสนิสิต (8 หลัก) หรือเลขที่ใบสมัคร เพื่อตรวจสอบผลการคัดเลือกและกำหนดการสัมภาษณ์
          </p>

          <form onSubmit={handleSearch} className="pt-4 flex items-center gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <input
                id="search-student-id-input"
                type="text"
                placeholder="เช่น 66012458 หรือ 65018923"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-[#F2F2F7] focus:bg-white text-sm focus:ring-2 focus:ring-[#007AFF]/25 focus:border-[#007AFF] border border-transparent outline-none font-mono transition-all"
              />
              <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-3.5" />
            </div>
            <button
              id="search-status-submit-btn"
              type="submit"
              className="px-6 py-3 rounded-full bg-[#007AFF] hover:bg-[#0071EB] text-white font-semibold text-sm shadow-md shadow-[#007AFF]/25 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              ค้นหา
            </button>
          </form>

          {/* Quick sample chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-[#8E8E93]">
            <span>ตัวอย่างรหัส:</span>
            {applications.slice(0, 3).map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => {
                  setQuery(app.studentId || app.id);
                  setHasSearched(true);
                }}
                className="px-2.5 py-1 rounded-full bg-[#767680]/10 hover:bg-[#767680]/15 text-[#007AFF] font-mono transition-colors cursor-pointer"
              >
                {app.studentId || app.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Area */}
      {hasSearched && (
        <>
          {matchedApp ? (
            <div className="bg-white rounded-[26px] p-6 sm:p-8 shadow-xs border border-black/[0.04] space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.05]">
                <div className="flex items-center gap-3.5">
                  {matchedApp.studentPhotoDoc?.dataUrl ? (
                    <div className="w-14 h-16 rounded-[14px] overflow-hidden border border-black/10 shadow-xs shrink-0 bg-[#F2F2F7]">
                      <img
                        src={matchedApp.studentPhotoDoc.dataUrl}
                        alt={matchedApp.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-16 rounded-[14px] border border-dashed border-[#8E8E93]/40 flex items-center justify-center shrink-0 bg-[#F8F9FA] text-[#8E8E93]">
                      <User className="w-6 h-6 text-[#8E8E93]/60" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-semibold text-[#8E8E93]">
                        {matchedApp.id}
                      </span>
                      <span className="text-black/20">•</span>
                      <span className="text-xs text-[#8E8E93]">
                        ปีการศึกษา {matchedApp.academicYear || '2569'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                      {matchedApp.fullName}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#636366] mt-0.5">
                      รหัสนิสิต {matchedApp.studentId} • ภาควิชา{matchedApp.department} ({matchedApp.studyYear})
                    </p>
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  {getStatusBadge(matchedApp.status)}
                </div>
              </div>

              {/* Interview Notice for eligible students */}
              {(matchedApp.status === 'eligible_for_interview' || matchedApp.status === 'submitted') && (
                <div className="p-5 rounded-[22px] bg-[#FFF8EE] border border-[#FF9500]/25 text-[#7C4A03] space-y-3">
                  <div className="flex items-center gap-2 text-base font-bold text-[#D97706] font-['Prompt',sans-serif]">
                    <Calendar className="w-5 h-5 text-[#FF9500]" />
                    <span>กำหนดการสัมภาษณ์ทุนการศึกษา ประจำปีการศึกษา {timelineConfig?.academicYear || '2569'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pl-7 text-[#5C3B0E]">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" />
                      <div>
                        <strong>วันและเวลา:</strong>{' '}
                        {timelineConfig?.criticalNotice?.interviewDate ||
                          timelineConfig?.steps?.find((s) => s.id === 'step-3')?.dateStr ||
                          '23 กันยายน 2569 เวลา 17.00 น. เป็นต้นไป'}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" />
                      <div>
                        <strong>สถานที่:</strong>{' '}
                        {timelineConfig?.criticalNotice?.interviewLocation ||
                          'ห้องประชุมราชพฤกษ์ 3 ชั้น 3 อาคารคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร'}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#FF9500]/20 text-xs font-semibold text-[#D70015] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      {timelineConfig?.criticalNotice?.description ||
                        'หมายเหตุ: แต่งกายด้วยเครื่องแบบนิสิตเรียบร้อย หากไม่เข้ารับการสัมภาษณ์จะถือว่าสละสิทธิ์'}
                    </span>
                  </div>
                </div>
              )}

              {/* Awarded Info */}
              {matchedApp.status === 'awarded' && (
                <div className="p-5 rounded-[22px] bg-[#E8F8EE] border border-[#34C759]/30 text-[#14532D] space-y-2">
                  <div className="flex items-center gap-2 text-base font-bold text-[#248A3D] font-['Prompt',sans-serif]">
                    <Award className="w-5 h-5 text-[#34C759]" />
                    <span>ยินดีด้วย! ท่านได้รับการพิจารณาจัดสรรทุนการศึกษา ประจำปี 2569</span>
                  </div>
                  <p className="text-sm text-[#14532D] leading-relaxed">
                    จำนวนทุนการศึกษาที่ได้รับ: <strong>{matchedApp.awardedAmount ? `${matchedApp.awardedAmount.toLocaleString()} บาท` : 'ตามประกาศคณะกรรมการ'}</strong>
                  </p>
                  <p className="text-xs text-[#166534]">
                    พิธีมอบทุนจะจัดขึ้นในเดือนตุลาคม 2569 ณ โถงชั้น 1 อาคารคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
                  </p>
                </div>
              )}

              {/* Application Details Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-[#F2F2F7] rounded-[20px] text-xs sm:text-sm">
                <div>
                  <span className="text-[#8E8E93] block text-[11px]">ภาควิชา</span>
                  <span className="font-semibold text-[#1C1C1E]">{matchedApp.department}</span>
                </div>
                <div>
                  <span className="text-[#8E8E93] block text-[11px]">เกรดเฉลี่ยสะสม (GPAX)</span>
                  <span className="font-semibold text-[#1C1C1E] font-mono">{matchedApp.gpaxRange || matchedApp.gpax || '-'}</span>
                </div>
                <div>
                  <span className="text-[#8E8E93] block text-[11px]">เบอร์โทรศัพท์ติดต่อ</span>
                  <span className="font-semibold text-[#1C1C1E]">{matchedApp.phone}</span>
                </div>
                <div>
                  <span className="text-[#8E8E93] block text-[11px]">สถานะการยื่นคำขอ</span>
                  <span className="font-semibold text-[#007AFF]">
                    {matchedApp.status === 'awarded'
                      ? 'ได้รับการจัดสรรทุน'
                      : matchedApp.status === 'eligible_for_interview'
                      ? 'รอสัมภาษณ์ทุน'
                      : matchedApp.status === 'interviewed'
                      ? 'สัมภาษณ์แล้ว'
                      : matchedApp.status === 'not_selected'
                      ? 'ไม่ผ่านการพิจารณา'
                      : 'ยื่นใบสมัครเรียบร้อย'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => onViewApplication(matchedApp)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1C1C1E] hover:bg-black text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>ดูใบสมัครฉบับเต็ม / พิมพ์เอกสาร</span>
                </button>

                <a
                  href="tel:055961911"
                  className="inline-flex items-center gap-1.5 text-xs text-[#007AFF] hover:underline transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>โทรสอบถาม 055-961911 (งานกิจการนิสิต)</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[26px] p-8 text-center border border-black/[0.04] shadow-xs space-y-3 animate-fadeIn">
              <div className="w-12 h-12 bg-[#FF3B30]/10 text-[#FF3B30] rounded-[18px] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                {applicationsAreCurrent ? 'ไม่พบข้อมูลใบสมัคร' : 'ยังยืนยันผลการค้นหาไม่ได้'}
              </h3>
              <p className="text-xs sm:text-sm text-[#8E8E93] max-w-md mx-auto">
                {applicationsAreCurrent
                  ? `ไม่พบข้อมูลที่ตรงกับคำค้นหา "${query}" โปรดตรวจสอบรหัสนิสิตหรือเลขที่ใบสมัคร หากสมัครแล้วกรุณาติดต่อ 055-961911`
                  : 'ข้อมูลในเครื่องอาจไม่ครบ กรุณารอเชื่อมต่อฐานข้อมูลอีกครั้ง ไม่ต้องสมัครซ้ำเพียงเพราะยังไม่พบชื่อ'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
