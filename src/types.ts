export interface ScholarshipApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  academicYear: string; // "2569"
  status: 'submitted' | 'eligible_for_interview' | 'interviewed' | 'awarded' | 'not_selected';
  awardedAmount?: number;
  reviewerNotes?: string;

  // Module 0 : การยืนยันข้อมูล
  agreedToTerms: boolean; // 1. ข้าพเจ้าขอรับรองว่าข้อมูลตามแบบคำขอสมัครทุนการศึกษาเป็นข้อมูลที่ถูกต้องตามความเป็นจริงทุกประการ (Checkbox)

  // Module 1 : ข้อมูลส่วนตัวของนิสิต
  fullName: string; // 1. ชื่อ-สกุล (ใส่คำนำหน้า)
  studentId: string; // 2. รหัสนิสิต
  department: string; // 3. ภาควิชา (จิตวิทยา, ประวัติศาสตร์, รัฐศาสตร์และรัฐประศาสนศาสตร์, สังคมวิทยาและมานุษยวิทยา, สถานประชาคมอาเซียนศึกษา)
  studyYear: string; // 4. ชั้นปี (ชั้นปีที่ 1, ชั้นปีที่ 2, ชั้นปีที่ 3, ชั้นปีที่ 4, ชั้นปีที่ 4 ขึ้นไป)
  phone: string; // 5. เบอร์โทรศัพท์
  homeAddress: string; // 6. บ้านเลขที่ ภูมิลำเนาของนิสิต
  gpaxRange: string; // 7. ผลการเรียนเฉลี่ยสะสม (มากกว่า 3.50, 3.00 - 3.49, 2.50 - 2.99, น้อยกว่า 2.50)
  studentPhotoDoc?: AttachedDoc; // รูปถ่ายหน้าตรงชุดนิสิต
  academicTranscriptDoc?: AttachedDoc; // เอกสารใบรายงานผลการศึกษา (Transcript / ใบแจ้งเกรด)

  // Module 2 : ข้อมูลครอบครัว
  // ข้อมูลบิดา
  fatherName?: string; // 8. ชื่อบิดา
  fatherStatus?: 'ยังมีชีวิต' | 'ถึงแก่กรรม' | string; // 8.1 สถานภาพบุคคล
  fatherAge?: string; // 8.2 อายุ
  fatherOccupation?: string; // 8.3 อาชีพ
  fatherOccupationDetail?: string; // 8.4 รายละเอียดเพิ่มเติมของอาชีพ

  // ข้อมูลมารดา
  motherName?: string; // 9. ชื่อมารดา
  motherStatus?: 'ยังมีชีวิต' | 'ถึงแก่กรรม' | string; // 9.1 สถานภาพบุคคล
  motherAge?: string; // 9.2 อายุ
  motherOccupation?: string; // 9.3 อาชีพ
  motherOccupationDetail?: string; // 9.4 รายละเอียดเพิ่มเติมของอาชีพ

  // ข้อมูลผู้ปกครอง
  guardianName?: string; // 10. ชื่อผู้ปกครอง
  guardianStatus?: 'ยังมีชีวิต' | 'ถึงแก่กรรม' | string; // 10.1 สถานภาพบุคคล
  guardianAge?: string; // 10.2 อายุ
  guardianOccupation?: string; // 10.3 อาชีพ
  guardianOccupationDetail?: string; // 10.4 รายละเอียดเพิ่มเติมของอาชีพ
  guardianRelation?: string; // 10.5 เกี่ยวข้องกับนิสิต (บิดา, มารดา, ปู่/ย่า/ตา/ยาย, ลุง/ป้า/น้า/อา, พี่/น้อง, อื่น ๆ)

  // สถานภาพครอบครัว
  parentsMaritalStatus?: string; // 11. สถานภาพสมรสของบิดา มารดา

  // สภาพครอบครัว
  familyLivingCondition?: string; // 12. สภาพความเป็นอยู่ในครอบครัว
  familyIllnessStatus?: string; // 13. การเจ็บป่วยหรือโรคประจำตัวของบุคคลในครอบครัวนิสิต
  siblingsStudyingCount?: string; // 14. จำนวนพี่น้องที่กำลังศึกษา (ไม่รวมตัวนิสิต) (ไม่มี, 1 คน, 2 คน, มากกว่า 3 คน)

  // Module 3 : ฐานะทางเศรษฐกิจ
  // รายได้ครอบครัว
  familyYearlyIncome?: string; // 15. รวมรายได้ครอบครัวบิดา มารดา หรือผู้ปกครองที่สนับสนุนค่าใช้จ่ายในการศึกษา/ปี
  incomeCertificateDoc?: AttachedDoc; // หลักฐานหนังสือรับรองรายได้ / สลิปเงินเดือนผู้ปกครอง

  // Module 4 : ประวัติการได้รับทุนการศึกษา
  monthlyAllowance?: string; // 17. จำนวนเงินที่นิสิตได้รับค่าใช้จ่าย/เดือน
  studentLoanStatus?: string; // 18. การกู้ยืม กยศ.
  pastScholarshipHistory?: string; // 19. นิสิตเคยได้รับทุนการศึกษาอื่น ๆ หรือไม่
  pastScholarshipName?: string; // 19.1 ชื่อทุนที่ได้รับ
  pastScholarshipAmount?: string; // 19.2 จำนวนเงินทุนที่ได้รับ

  // Module 5 : สภาพความเป็นอยู่และที่พัก
  accommodationType?: string; // 20. ที่พักอาศัยของนิสิต (หอพักมหาวิทยาลัย, หอพักเอกชน, บ้านของนิสิต)

  // Module 6 : การทำงานพิเศษ
  partTimeWorkHistory?: string; // 21. ประวัติการทำงานพิเศษ (ทำอยู่, เคยทำ, ไม่เคยทำ)

  // Module 7 : การมีส่วนร่วมและความประพฤติ
  studentActivityParticipation?: string; // 22. นิสิตทำกิจกรรมชมรม สโมสรนิสิต องค์การนิสิต สภานิสิต (เคยทำ, ไม่เคยทำ)
  volunteerWorkParticipation?: string; // 23. นิสิตทำจิตอาสา จิตสาธารณะ หรือบำเพ็ญประโยชน์ (ไม่รวมจิตอาสาเพื่อกู้ กยศ.) (เคยทำ, ไม่เคยทำ)

  // Module 8 : ความจำเป็นในการรับทุน
  selfPrideOrTalent?: string; // 24. สิ่งที่นิสิตภูมิใจในตนเอง หรือความสามารถของนิสิต (Text Area)
  reasonForApplying?: string; // 25. เหตุผลและความจำเป็นในการรับทุนการศึกษา (Text Area)
  scholarshipFundUsagePlan?: string; // 26. หากได้รับทุนการศึกษา จะนำเงินทุนไปใช้ประโยชน์ในด้านใด อย่างไร (Text Area)

  // Compatibility fields (optional for display / old records)
  prefix?: string;
  major?: string;
  gpax?: string;
  email?: string;
  currentAddress?: string;
  domicileProvince?: string;
  currentResidenceType?: string;
  advisorName?: string;
  birthDate?: string;
  age?: string;
}

export interface AttachedDoc {
  fileName: string;
  fileSize: number;
  fileType: string;
  dataUrl?: string;
  uploadedAt: string;
}

export interface ItemizedScore {
  id: string;
  moduleLabel: string;
  questionNumber: string;
  title: string;
  applicantValue: string;
  score: number;
  maxScore: number;
  criteriaNote: string;
  colorTheme: string;
}

export interface ScoreBreakdown {
  totalScore: number;
  maxScore: number;
  incomeScore: number;
  scholarshipHistoryScore?: number;
  allowanceScore: number;
  familyHardshipScore: number;
  siblingsScore: number;
  selfRelianceScore: number;
  academicAndNeedScore: number;
  accommodationScore?: number;
  priorityLevel: 'critical' | 'high' | 'moderate' | 'normal';
  priorityLabel: string;
  colorClass: string;

  // Sub-item scores for detailed officer review
  illnessScore?: number;
  maritalStatusScore?: number;
  partTimeScore?: number;
  volunteerScore?: number;
  activityScore?: number;
  gpaxScore?: number;
  needReasonScore?: number;
  itemizedScores?: ItemizedScore[];
}

export interface AnnouncementItem {
  id: string;
  dateStr: string;
  title: string;
  subtitle: string;
  location?: string;
  iconName: string;
  highlight?: boolean;
  isImportantNote?: boolean;
}

export interface TimelineCriticalNotice {
  title: string;
  description: string;
  interviewDate: string;
  interviewLocation: string;
}

export interface TimelineConfig {
  academicYear: string;
  heroTitle: string;
  heroSubtitle: string;
  contactPhone: string;
  criticalNotice: TimelineCriticalNotice;
  steps: AnnouncementItem[];
  qualifications: string[];
  requiredDocuments: string[];
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}
