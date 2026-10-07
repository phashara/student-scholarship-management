import React, { useMemo, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  GraduationCap,
  Calendar,
  Sparkles,
  RefreshCw,
  FileText,
  AlertCircle,
  Award,
  Trash2,
} from 'lucide-react';
import { ScholarshipApplication, TimelineConfig } from '../types';
import { DeleteApplicantModal } from './DeleteApplicantModal';

interface ApplicantListSectionProps {
  applications: ScholarshipApplication[];
  onRefresh?: () => void;
  timelineConfig?: TimelineConfig;
  isAdminLoggedIn?: boolean;
  onDeleteApplication?: (appId: string, studentId?: string) => Promise<void> | void;
}

export const ApplicantListSection: React.FC<ApplicantListSectionProps> = ({
  applications,
  onRefresh,
  timelineConfig,
  isAdminLoggedIn = false,
  onDeleteApplication,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<ScholarshipApplication | null>(null);

  const academicYear = timelineConfig?.academicYear || '2569';

  const departments = [
    'ทั้งหมด',
    'ภาควิชาจิตวิทยา',
    'ภาควิชาประวัติศาสตร์',
    'ภาควิชารัฐศาสตร์และรัฐประศาสนศาสตร์',
    'ภาควิชาสังคมวิทยาและมานุษยวิทยา',
    'สถานประชาคมอาเซียนศึกษา',
  ];

  const studyYears = [
    'ทั้งหมด',
    'ชั้นปีที่ 1',
    'ชั้นปีที่ 2',
    'ชั้นปีที่ 3',
    'ชั้นปีที่ 4',
  ];

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Search query (Student ID or Name or Department)
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        app.studentId?.toLowerCase().includes(q) ||
        app.fullName?.toLowerCase().includes(q) ||
        app.department?.toLowerCase().includes(q);

      // Filter Year
      const matchYear =
        selectedYear === 'all' ||
        selectedYear === 'ทั้งหมด' ||
        app.studyYear === selectedYear;

      // Filter Dept
      const matchDept =
        selectedDept === 'all' ||
        selectedDept === 'ทั้งหมด' ||
        app.department === selectedDept;

      return matchSearch && matchYear && matchDept;
    });
  }, [applications, searchQuery, selectedYear, selectedDept]);

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    const year1 = applications.filter((a) => a.studyYear?.includes('1')).length;
    const year2 = applications.filter((a) => a.studyYear?.includes('2')).length;
    const year3 = applications.filter((a) => a.studyYear?.includes('3')).length;
    const year4 = applications.filter((a) => a.studyYear?.includes('4')).length;
    return { total, year1, year2, year3, year4 };
  }, [applications]);

  const handleRefreshClick = () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const getStatusBadge = (status: ScholarshipApplication['status']) => {
    switch (status) {
      case 'awarded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#34C759]/15 text-[#248A3D] border border-[#34C759]/30">
            <CheckCircle2 className="w-3 h-3" />
            ได้รับอนุมัติทุน
          </span>
        );
      case 'eligible_for_interview':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#007AFF]/15 text-[#007AFF] border border-[#007AFF]/30">
            <Clock className="w-3 h-3" />
            มีสิทธิ์สัมภาษณ์
          </span>
        );
      case 'interviewed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5856D6]/15 text-[#5856D6] border border-[#5856D6]/30">
            <Sparkles className="w-3 h-3" />
            สัมภาษณ์แล้ว
          </span>
        );
      case 'not_selected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8E8E93]/15 text-[#636366] border border-[#8E8E93]/30">
            ไม่ผ่านการคัดเลือก
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF9500]/15 text-[#D97706] border border-[#FF9500]/30">
            <CheckCircle2 className="w-3 h-3" />
            ยื่นใบสมัครแล้ว
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-[#007AFF]/10 via-white to-[#5856D6]/10 rounded-[24px] p-6 sm:p-8 border border-[#007AFF]/20 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#007AFF]/15 text-[#007AFF] mb-1">
              <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
              <span>ฐานข้อมูล Cloud Firestore Real-time</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] tracking-tight">
              ตรวจสอบรายชื่อผู้สมัครรับทุนการศึกษา
            </h1>
            <p className="text-sm text-[#636366]">
              คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร • ประจำปีการศึกษา {academicYear}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshClick}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[14px] bg-white hover:bg-black/5 text-[#1C1C1E] border border-black/[0.08] text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="ดึงข้อมูลล่าสุดจาก Cloud Firestore"
            >
              <RefreshCw className={`w-4 h-4 text-[#007AFF] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>รีเฟรชข้อมูล</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-black/[0.06]">
          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-[16px] border border-black/[0.06]">
            <p className="text-xs text-[#8E8E93] font-medium">ผู้สมัครทั้งหมด</p>
            <p className="text-xl sm:text-2xl font-black text-[#007AFF] mt-0.5">{stats.total} คน</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-[16px] border border-black/[0.06]">
            <p className="text-xs text-[#8E8E93] font-medium">ชั้นปีที่ 1</p>
            <p className="text-lg sm:text-xl font-bold text-[#1C1C1E] mt-0.5">{stats.year1} คน</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-[16px] border border-black/[0.06]">
            <p className="text-xs text-[#8E8E93] font-medium">ชั้นปีที่ 2</p>
            <p className="text-lg sm:text-xl font-bold text-[#1C1C1E] mt-0.5">{stats.year2} คน</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-[16px] border border-black/[0.06]">
            <p className="text-xs text-[#8E8E93] font-medium">ชั้นปีที่ 3</p>
            <p className="text-lg sm:text-xl font-bold text-[#1C1C1E] mt-0.5">{stats.year3} คน</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-3.5 rounded-[16px] border border-black/[0.06] col-span-2 sm:col-span-1">
            <p className="text-xs text-[#8E8E93] font-medium">ชั้นปีที่ 4</p>
            <p className="text-lg sm:text-xl font-bold text-[#1C1C1E] mt-0.5">{stats.year4} คน</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-[20px] p-4 sm:p-5 border border-black/[0.08] shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาด้วยรหัสนิสิต (เช่น 65xxxxxx) หรือชื่อ..."
              className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-[#F2F2F7]/70 border border-black/[0.06] text-xs sm:text-sm text-[#1C1C1E] focus:bg-white focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8E8E93] hover:text-[#1C1C1E]"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Filter Year */}
          <div className="md:col-span-3">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#F2F2F7]/70 border border-black/[0.06] text-xs sm:text-sm text-[#1C1C1E] outline-none cursor-pointer focus:border-[#007AFF]"
            >
              <option value="all">ชั้นปี: ทั้งหมด</option>
              {studyYears.filter((y) => y !== 'ทั้งหมด').map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Department */}
          <div className="md:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#F2F2F7]/70 border border-black/[0.06] text-xs sm:text-sm text-[#1C1C1E] outline-none cursor-pointer focus:border-[#007AFF]"
            >
              <option value="all">ภาควิชา/สถาน: ทั้งหมด</option>
              {departments.filter((d) => d !== 'ทั้งหมด').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#8E8E93] px-1 pt-1">
          <span>
            แสดงรายชื่อ {filteredApps.length} จากทั้งหมด {applications.length} คน
          </span>
          {searchQuery && (
            <span className="text-[#007AFF] font-medium">
              กำลังค้นหา: "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[24px] border border-black/[0.08] shadow-sm overflow-hidden">
        {filteredApps.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2F2F7]/80 border-b border-black/[0.06] text-[12px] font-bold text-[#636366] uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-16">1. ลำดับ</th>
                  <th className="py-3.5 px-4">2. รหัสนิสิต</th>
                  <th className="py-3.5 px-4 min-w-[180px]">3. ชื่อ-สกุล</th>
                  <th className="py-3.5 px-4">4. ชั้นปี</th>
                  <th className="py-3.5 px-4">5. ภาควิชา/สถาน</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">วันที่ยื่นใบสมัคร</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  {isAdminLoggedIn && <th className="py-3.5 px-4 text-center">การจัดการ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] text-xs sm:text-sm text-[#1C1C1E]">
                {filteredApps.map((app, index) => {
                  const submitDate = app.createdAt
                    ? new Date(app.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-';

                  return (
                    <tr
                      key={app.id || index}
                      className="hover:bg-[#007AFF]/[0.02] transition-colors"
                    >
                      {/* 1. ลำดับ */}
                      <td className="py-4 px-4 text-center font-bold text-[#8E8E93]">
                        {index + 1}
                      </td>

                      {/* 2. รหัสนิสิต */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#007AFF] text-sm sm:text-base">
                            {app.studentId || '-'}
                          </span>
                        </div>
                      </td>

                      {/* 3. ชื่อ-สกุล */}
                      <td className="py-4 px-4 min-w-[180px]">
                        <div className="flex items-center gap-2 font-semibold text-[#1C1C1E]">
                          <Users className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
                          <span>{app.fullName || '-'}</span>
                        </div>
                      </td>

                      {/* 4. ชั้นปี */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-[#F2F2F7] text-[#1C1C1E] font-medium text-xs">
                          <GraduationCap className="w-3.5 h-3.5 text-[#8E8E93]" />
                          {app.studyYear || '-'}
                        </span>
                      </td>

                      {/* 5. ภาควิชา/สถาน */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-[#1C1C1E]">
                          <Building className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
                          <span>{app.department || '-'}</span>
                        </div>
                      </td>

                      {/* วันที่ยื่นใบสมัคร */}
                      <td className="py-4 px-4 hidden sm:table-cell text-[#8E8E93] text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{submitDate}</span>
                        </div>
                      </td>

                      {/* สถานะ */}
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(app.status)}
                      </td>

                      {/* การจัดการ (แอดมินเท่านั้น) */}
                      {isAdminLoggedIn && (
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(app)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full transition-colors cursor-pointer"
                            title="ลบข้อมูลผู้สมัครรายนี้ (ต้องใส่รหัสผ่าน 07011985)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบ</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#F2F2F7] text-[#8E8E93] flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#1C1C1E]">ไม่พบรายชื่อผู้สมัคร</h3>
            <p className="text-xs sm:text-sm text-[#8E8E93] max-w-sm mx-auto">
              {searchQuery || selectedYear !== 'all' || selectedDept !== 'all'
                ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหาหรือตัวกรองที่เลือก ลองเปลี่ยนคำค้นหา'
                : 'ยังไม่มีข้อมูลการสมัครในระบบ หรือกำลังเชื่อมต่อฐานข้อมูล'}
            </p>
            {(searchQuery || selectedYear !== 'all' || selectedDept !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedYear('all');
                  setSelectedDept('all');
                }}
                className="px-4 py-2 rounded-[12px] bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold hover:bg-[#007AFF]/20 transition-all cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info notice box */}
      <div className="p-4 bg-[#F2F2F7]/80 rounded-[18px] border border-black/[0.04] flex items-start gap-3 text-xs text-[#636366]">
        <AlertCircle className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#1C1C1E]">ข้อแนะนำในการตรวจสอบรายชื่อ:</p>
          <p className="mt-0.5">
            ข้อมูลรายชื่อในหน้านี้จะอัปเดตแบบเรียลไทม์ทันทีที่นิสิตส่งใบสมัคร หากกรอกใบสมัครเสร็จแล้วแต่ยังไม่พบรหัสนิสิตของตนเอง
            สามารถกดปุ่ม <b>"รีเฟรชข้อมูล"</b> หรือติดต่อหน่วยกิจการนิสิต คณะสังคมศาสตร์ โทร {timelineConfig?.contactPhone || '055-961911'}
          </p>
        </div>
      </div>

      {/* Delete Applicant Modal with password 07011985 */}
      {isAdminLoggedIn && (
        <DeleteApplicantModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          application={deleteTarget}
          onConfirmDelete={async () => {
            if (!deleteTarget) return;
            if (onDeleteApplication) {
              await onDeleteApplication(deleteTarget.id, deleteTarget.studentId);
            }
            if (onRefresh) onRefresh();
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
};
