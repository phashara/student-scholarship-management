import { AnnouncementItem, ScholarshipApplication, ScoreBreakdown, TimelineConfig } from '../types';

export const ACADEMIC_YEAR = '2569';

// ภาควิชา คณะสังคมศาสตร์ ประจำปีการศึกษา 2569
export const OFFICIAL_DEPARTMENTS_2569 = [
  'จิตวิทยา',
  'ประวัติศาสตร์',
  'รัฐศาสตร์และรัฐประศาสนศาสตร์',
  'สังคมวิทยาและมานุษยวิทยา',
  'สถานประชาคมอาเซียนศึกษา',
];

export const STUDY_YEAR_OPTIONS = [
  'ชั้นปีที่ 1',
  'ชั้นปีที่ 2',
  'ชั้นปีที่ 3',
  'ชั้นปีที่ 4',
  'ชั้นปีที่ 4 ขึ้นไป',
];

export const GPAX_RANGE_OPTIONS = [
  'มากกว่า 3.50',
  '3.00 - 3.49',
  '2.50 - 2.99',
  'น้อยกว่า 2.50',
];

export const PERSON_STATUS_OPTIONS = ['ยังมีชีวิต', 'ถึงแก่กรรม'];

export const OCCUPATION_OPTIONS = [
  'รับราชการ/พนักงานรัฐวิสาหกิจ/พนักงานองค์การของรัฐ/พนักงานบริษัท',
  'ค้าขาย',
  'รับจ้าง',
  'เกษตรกร (ทำนา/ทำสวน/ทำไร่/เลี้ยงสัตว์)',
  'อาชีพอื่น ๆ',
];

export const GUARDIAN_RELATION_OPTIONS = [
  'บิดา',
  'มารดา',
  'ปู่/ย่า/ตา/ยาย',
  'ลุง/ป้า/น้า/อา',
  'พี่/น้อง',
  'อื่น ๆ',
];

export const PARENTS_MARITAL_OPTIONS = [
  'อยู่ด้วยกันกับบิดามารดาในครัวเรือนเดียวกัน',
  'อยู่ด้วยกันกับบิดาหรือมารดาในครัวเรือนเดียวกัน',
  'ไม่ได้อยู่ด้วยกันแต่ยังมีสภาพเป็นครอบครัว',
  'ไม่ได้อยู่กับบิดามารดาและไม่มีสภาพเป็นครอบครัว',
  'อื่น ๆ',
];

export const FAMILY_ILLNESS_OPTIONS = [
  'โรครุนแรงจนทำให้ประกอบอาชีพไม่ได้หรือต้องดูแลเป็นพิเศษ',
  'โรครุนแรงแต่สามารถทำงานได้',
  'โรคไม่รุนแรง',
  'ไม่มีโรคประจำตัว',
];

export const SIBLINGS_STUDYING_OPTIONS = ['ไม่มี', '1 คน', '2 คน', 'มากกว่า 3 คน'];

export const INCOME_BRACKET_OPTIONS = [
  'น้อยกว่า 60,000',
  '60,001 - 89,999',
  '90,000 - 119,999',
  '120,000 - 149,999',
  '150,000 - 179,999',
  '180,000 - 209,999',
  '210,000 - 239,999',
  '240,000 - 269,999',
  '270,000 - 299,999',
  '300,000 - 329,999',
  'มากกว่า 330,000',
];

export const MONTHLY_ALLOWANCE_OPTIONS = [
  'มากกว่า 6,000',
  '5,000-5,999',
  '4,000-4,999',
  '3,000-3,999',
  'น้อยกว่า 3,000',
];

export const STUDENT_LOAN_OPTIONS = [
  'ไม่กู้',
  'กู้ค่าเทอมอย่างเดียว',
  'กู้ค่าครองชีพอย่างเดียว',
  'กู้ค่าเทอมและค่าครองชีพ',
];

export const PAST_SCHOLARSHIP_OPTIONS = [
  'กำลังได้รับทุนอยู่',
  'เคยได้รับและสิ้นสุดแล้ว',
  'ไม่เคยได้รับทุน',
];

export const ACCOMMODATION_OPTIONS = [
  'อยู่หอในของมหาวิทยาลัย',
  'หอพักเอกชนแต่หารกับเพื่อน',
  'หอพักเอกชนอยู่คนเดียว',
  'อยู่บ้านตนเองหรือบ้านญาติ (ไม่เสียค่าใช้จ่าย)',
];

export const PART_TIME_WORK_OPTIONS = ['ทำอยู่', 'เคยทำ', 'ไม่เคยทำ'];

export const ACTIVITY_PARTICIPATION_OPTIONS = ['เคยทำ', 'ไม่เคยทำ'];

export const VOLUNTEER_PARTICIPATION_OPTIONS = ['เคยทำ', 'ไม่เคยทำ'];

// ระบบคะแนนคัดเลือกทุน (Scoring Matrix 100 คะแนนเต็ม)
// ปรับปรุงเกณฑ์คะแนนใหม่:
// 1. รวมรายได้ครอบครัว / หนังสือรับรองรายได้/สลิปเงินเดือน (เต็ม 30 คะแนน)
// 2. ผลการเรียนเฉลี่ยสะสม (GPAX) เต็ม 10 คะแนน (X2 ของเดิม: >3.50=10, 3.00-3.49=8, 2.50-2.99=6, <2.50=4)
// 3. ประวัติการรับทุนการศึกษา (เต็ม 5 คะแนน: กู้ กยศ.=0, เคยได้ทุนปี 68/69=3, ไม่ได้อะไรเลย=5)
// 4. ค่าใช้จ่ายที่นิสิตได้รับต่อเดือน (เต็ม 15 คะแนน)
// 5. สภาพความยากลำบากและการเจ็บป่วย (เต็ม 15 คะแนน)
// 6. ภาระพี่น้องที่กำลังศึกษา (เต็ม 10 คะแนน)
// 7. การทำงานพิเศษ จิตอาสา และกิจกรรม (เต็ม 10 คะแนน)
// 8. เหตุผลความจำเป็นและความตั้งใจศึกษา (เต็ม 5 คะแนน)
// รวมทั้งสิ้น = 30 + 10 + 5 + 15 + 15 + 10 + 10 + 5 = 100 คะแนนเต็มพอดี
export function calculateScholarshipScore(app: Partial<ScholarshipApplication>): ScoreBreakdown {
  // 1. รายได้ครอบครัว (Max 30 คะแนน)
  let incomeScore = 6;
  switch (app.familyYearlyIncome) {
    case 'น้อยกว่า 60,000':
      incomeScore = 30;
      break;
    case '60,001 - 89,999':
      incomeScore = 27;
      break;
    case '90,000 - 119,999':
      incomeScore = 24;
      break;
    case '120,000 - 149,999':
      incomeScore = 21;
      break;
    case '150,000 - 179,999':
      incomeScore = 18;
      break;
    case '180,000 - 209,999':
      incomeScore = 15;
      break;
    case '210,000 - 239,999':
      incomeScore = 12;
      break;
    case '240,000 - 269,999':
      incomeScore = 9;
      break;
    case '270,000 - 299,999':
      incomeScore = 6;
      break;
    case '300,000 - 329,999':
      incomeScore = 3;
      break;
    case 'มากกว่า 330,000':
      incomeScore = 0;
      break;
    default:
      incomeScore = 15;
  }

  // 2. ประวัติการรับทุนการศึกษา (เต็ม 5 คะแนน)
  // กู้ กยศ. = 0 คะแนน, เคยได้ทุนปี 68/69 = 3 คะแนน, ไม่ได้อะไรเลย = 5 คะแนน
  let scholarshipHistoryScore = 5;
  const isLoan = app.studentLoanStatus && app.studentLoanStatus !== 'ไม่กู้';
  if (isLoan) {
    scholarshipHistoryScore = 0;
  } else if (
    app.pastScholarshipHistory === 'กำลังได้รับทุนอยู่' ||
    app.pastScholarshipHistory === 'เคยได้รับและสิ้นสุดแล้ว'
  ) {
    scholarshipHistoryScore = 3;
  } else {
    scholarshipHistoryScore = 5;
  }

  // 4. ค่าใช้จ่ายที่นิสิตได้รับต่อเดือน (Max 15)
  let allowanceScore = 4;
  switch (app.monthlyAllowance) {
    case 'น้อยกว่า 3,000':
      allowanceScore = 15;
      break;
    case '3,000-3,999':
      allowanceScore = 12;
      break;
    case '4,000-4,999':
      allowanceScore = 8;
      break;
    case '5,000-5,999':
      allowanceScore = 4;
      break;
    case 'มากกว่า 6,000':
      allowanceScore = 1;
      break;
    default:
      allowanceScore = 5;
  }

  // 5. สภาพความยากลำบากของครอบครัวและการเจ็บป่วย (Max 15)
  let illnessScore = 0;
  if (app.familyIllnessStatus === 'โรครุนแรงจนทำให้ประกอบอาชีพไม่ได้หรือต้องดูแลเป็นพิเศษ') {
    illnessScore = 8;
  } else if (app.familyIllnessStatus === 'โรครุนแรงแต่สามารถทำงานได้') {
    illnessScore = 5;
  } else if (app.familyIllnessStatus === 'โรคไม่รุนแรง') {
    illnessScore = 2;
  } else {
    illnessScore = 0;
  }

  let maritalStatusScore = 2;
  if (app.parentsMaritalStatus === 'ไม่ได้อยู่กับบิดามารดาและไม่มีสภาพเป็นครอบครัว') {
    maritalStatusScore = 7;
  } else if (app.parentsMaritalStatus === 'ไม่ได้อยู่ด้วยกันแต่ยังมีสภาพเป็นครอบครัว') {
    maritalStatusScore = 5;
  } else if (app.parentsMaritalStatus === 'อยู่ด้วยกันกับบิดาหรือมารดาในครัวเรือนเดียวกัน') {
    maritalStatusScore = 4;
  } else {
    maritalStatusScore = 2;
  }

  const familyHardshipScore = Math.min(15, illnessScore + maritalStatusScore);

  // 6. ภาระพี่น้องที่กำลังศึกษา (Max 10)
  let siblingsScore = 0;
  switch (app.siblingsStudyingCount) {
    case 'มากกว่า 3 คน':
      siblingsScore = 10;
      break;
    case '2 คน':
      siblingsScore = 7;
      break;
    case '1 คน':
      siblingsScore = 4;
      break;
    default:
      siblingsScore = 0;
  }

  // 7. ที่พักอาศัยของนิสิต (ข้อ 20)
  let accommodationScore = 1;
  if (app.accommodationType === 'อยู่หอในของมหาวิทยาลัย' || app.accommodationType === 'หอพักมหาวิทยาลัย') {
    accommodationScore = 3;
  } else if (app.accommodationType === 'หอพักเอกชนแต่หารกับเพื่อน') {
    accommodationScore = 2;
  } else if (app.accommodationType === 'หอพักเอกชนอยู่คนเดียว' || app.accommodationType === 'หอพักเอกชน') {
    accommodationScore = 1;
  } else if (app.accommodationType === 'อยู่บ้านตนเองหรือบ้านญาติ (ไม่เสียค่าใช้จ่าย)' || app.accommodationType === 'บ้านของนิสิต') {
    accommodationScore = 1;
  } else {
    accommodationScore = 1;
  }

  // 8. การทำงานพิเศษ / จิตอาสา / กิจกรรม (Max 10)
  let partTimeScore = 0;
  if (app.partTimeWorkHistory === 'ทำอยู่') partTimeScore = 4;
  else if (app.partTimeWorkHistory === 'เคยทำ') partTimeScore = 2;

  let volunteerScore = app.volunteerWorkParticipation === 'เคยทำ' ? 3 : 0;
  let activityScore = app.studentActivityParticipation === 'เคยทำ' ? 3 : 0;
  const selfRelianceScore = Math.min(10, partTimeScore + volunteerScore + activityScore);

  // 9. ผลการเรียน (GPAX) ปรับปรุงใหม่เต็ม 10 คะแนน (X2)
  // มากกว่า 3.50 = 10 คะแนน, 3.00-3.49 = 8 คะแนน, 2.50-2.99 = 6 คะแนน, น้อยกว่า 2.50 = 4 คะแนน (หรือ 2)
  let gpaxScore = 4;
  switch (app.gpaxRange) {
    case 'มากกว่า 3.50':
      gpaxScore = 10;
      break;
    case '3.00 - 3.49':
      gpaxScore = 8;
      break;
    case '2.50 - 2.99':
      gpaxScore = 6;
      break;
    case 'น้อยกว่า 2.50':
      gpaxScore = 4;
      break;
    default:
      gpaxScore = 6;
  }

  // 10. เหตุผลความจำเป็นและความตั้งใจศึกษา (เต็ม 5 คะแนน)
  let needReasonScore = 2;
  if (app.reasonForApplying && app.reasonForApplying.trim().length > 30) {
    needReasonScore = 5;
  } else if (app.reasonForApplying && app.reasonForApplying.trim().length > 0) {
    needReasonScore = 3;
  } else {
    needReasonScore = 1;
  }

  const academicAndNeedScore = gpaxScore;

  const totalScore =
    incomeScore +
    scholarshipHistoryScore +
    allowanceScore +
    familyHardshipScore +
    siblingsScore +
    selfRelianceScore +
    gpaxScore +
    needReasonScore;

  let priorityLevel: 'critical' | 'high' | 'moderate' | 'normal' = 'normal';
  let priorityLabel = 'ระดับปกติ';
  let colorClass = 'text-neutral-600 bg-neutral-100 border-neutral-200';

  if (totalScore >= 75) {
    priorityLevel = 'critical';
    priorityLabel = 'ความจำเป็นเร่งด่วนสูงสุด (ระดับ 1)';
    colorClass = 'text-[#d93025] bg-[#fce8e6] border-[#ea4335]/30 font-bold';
  } else if (totalScore >= 60) {
    priorityLevel = 'high';
    priorityLabel = 'ความจำเป็นสูง (ระดับ 2)';
    colorClass = 'text-[#e37400] bg-[#fef7e0] border-[#f9ab00]/40 font-semibold';
  } else if (totalScore >= 45) {
    priorityLevel = 'moderate';
    priorityLabel = 'ความจำเป็นปานกลาง (ระดับ 3)';
    colorClass = 'text-[#1a73e8] bg-[#e8f0fe] border-[#1a73e8]/30';
  }

  // Detailed itemized scores for staff view
  const itemizedScores = [
    {
      id: 'q15_income',
      moduleLabel: 'Module 3',
      questionNumber: 'ข้อ 15',
      title: 'รวมรายได้ครอบครัวบิดา มารดา หรือผู้ปกครอง/ปี (พร้อมหลักฐานแนบ)',
      applicantValue: `${app.familyYearlyIncome || 'ไม่ระบุ'}${app.incomeCertificateDoc ? ' (มีหนังสือรับรองรายได้/สลิปแนบ)' : ''}`,
      score: incomeScore,
      maxScore: 30,
      criteriaNote:
        incomeScore >= 27
          ? 'รายได้ต่ำกว่า 90,000 บ./ปี (ความจำเป็นสูงสุด 27-30 คะแนน)'
          : incomeScore >= 18
          ? 'รายได้ 120,000 - 179,999 บ./ปี (18-21 คะแนน)'
          : 'รายได้มากกว่า 180,000 บ./ปี',
      colorTheme: 'blue',
    },
    {
      id: 'q18_19_scholarship_history',
      moduleLabel: 'Module 4',
      questionNumber: 'ข้อ 18-19',
      title: 'ประวัติการรับทุนการศึกษาและการกู้ยืม กยศ.',
      applicantValue: `กยศ: ${app.studentLoanStatus || 'ไม่กู้'} | ทุนอื่น: ${app.pastScholarshipHistory || 'ไม่เคยได้รับทุน'}`,
      score: scholarshipHistoryScore,
      maxScore: 5,
      criteriaNote:
        scholarshipHistoryScore === 0
          ? 'เป็นผู้กู้ยืม กยศ./กรอ. (0 คะแนน)'
          : scholarshipHistoryScore === 3
          ? 'เคยได้รับทุนการศึกษาอื่นปี 68/69 (3 คะแนน)'
          : 'ไม่เคยกู้ กยศ. และไม่เคยได้รับทุนใดๆ เลย (5 คะแนนเต็ม)',
      colorTheme: 'teal',
    },
    {
      id: 'q7_gpax',
      moduleLabel: 'Module 1',
      questionNumber: 'ข้อ 7',
      title: 'ผลการเรียนเฉลี่ยสะสม (GPAX X2)',
      applicantValue: app.gpaxRange || 'ไม่ระบุ',
      score: gpaxScore,
      maxScore: 10,
      criteriaNote:
        gpaxScore === 10
          ? 'มากกว่า 3.50 (10 คะแนนเต็ม [5x2])'
          : gpaxScore === 8
          ? '3.00 - 3.49 (8 คะแนน [4x2])'
          : gpaxScore === 6
          ? '2.50 - 2.99 (6 คะแนน [3x2])'
          : 'น้อยกว่า 2.50 (4 คะแนน [2x2])',
      colorTheme: 'sky',
    },
    {
      id: 'q17_allowance',
      moduleLabel: 'Module 4',
      questionNumber: 'ข้อ 17',
      title: 'จำนวนเงินที่นิสิตได้รับค่าใช้จ่ายต่อเดือน',
      applicantValue: app.monthlyAllowance ? `${app.monthlyAllowance} บาท` : 'ไม่ระบุ',
      score: allowanceScore,
      maxScore: 15,
      criteriaNote:
        allowanceScore >= 12
          ? 'ได้รับค่าใช้จ่ายน้อยกว่า 4,000 บ./เดือน (ขาดแคลนค่าครองชีพ)'
          : allowanceScore >= 4
          ? 'ได้รับค่าใช้จ่าย 4,000 - 5,999 บ./เดือน'
          : 'ได้รับค่าใช้จ่ายมากกว่า 6,000 บ./เดือน',
      colorTheme: 'green',
    },
    {
      id: 'q13_illness',
      moduleLabel: 'Module 2',
      questionNumber: 'ข้อ 13',
      title: 'การเจ็บป่วยหรือโรคประจำตัวของบุคคลในครอบครัว',
      applicantValue: app.familyIllnessStatus || 'ไม่มีโรคประจำตัว',
      score: illnessScore,
      maxScore: 8,
      criteriaNote:
        illnessScore === 8
          ? 'โรครุนแรงจนทำให้ประกอบอาชีพไม่ได้ (+8)'
          : illnessScore === 5
          ? 'โรครุนแรงแต่สามารถทำงานได้ (+5)'
          : illnessScore === 2
          ? 'โรคไม่รุนแรง (+2)'
          : 'ไม่มีโรคประจำตัว (0)',
      colorTheme: 'purple',
    },
    {
      id: 'q11_marital',
      moduleLabel: 'Module 2',
      questionNumber: 'ข้อ 11',
      title: 'สถานภาพสมรสของบิดา มารดา',
      applicantValue: app.parentsMaritalStatus || 'อยู่ด้วยกันกับบิดามารดาในครัวเรือนเดียวกัน',
      score: maritalStatusScore,
      maxScore: 7,
      criteriaNote:
        maritalStatusScore === 7
          ? 'ไม่ได้อยู่กับบิดามารดาและไม่มีสภาพเป็นครอบครัว (+7)'
          : maritalStatusScore === 5
          ? 'ไม่ได้อยู่ด้วยกันแต่ยังมีสภาพเป็นครอบครัว (+5)'
          : maritalStatusScore === 4
          ? 'อยู่ด้วยกันกับบิดาหรือมารดาคนเดียว (+4)'
          : 'อยู่ด้วยกันในครัวเรือนเดียวกัน (+2)',
      colorTheme: 'purple',
    },
    {
      id: 'q14_siblings',
      moduleLabel: 'Module 2',
      questionNumber: 'ข้อ 14',
      title: 'จำนวนพี่น้องที่กำลังศึกษา (ไม่รวมตัวนิสิต)',
      applicantValue: app.siblingsStudyingCount || 'ไม่มี',
      score: siblingsScore,
      maxScore: 10,
      criteriaNote:
        siblingsScore === 10
          ? 'มีพี่น้องกำลังศึกษามากกว่า 3 คน (ภาระการส่งเสียสูงมาก)'
          : siblingsScore === 7
          ? 'มีพี่น้องกำลังศึกษา 2 คน'
          : siblingsScore === 4
          ? 'มีพี่น้องกำลังศึกษา 1 คน'
          : 'ไม่มีพี่น้องที่กำลังศึกษา (0)',
      colorTheme: 'indigo',
    },
    {
      id: 'q21_parttime',
      moduleLabel: 'Module 6',
      questionNumber: 'ข้อ 21',
      title: 'ประวัติการทำงานพิเศษเพื่อหารายได้',
      applicantValue: app.partTimeWorkHistory || 'ไม่เคยทำ',
      score: partTimeScore,
      maxScore: 4,
      criteriaNote:
        partTimeScore === 4
          ? 'ปัจจุบันทำงานพิเศษอยู่ (พึ่งพาตนเองและขยันอดทน +4)'
          : partTimeScore === 2
          ? 'เคยทำงานพิเศษ (+2)'
          : 'ไม่เคยทำงานพิเศษ (0)',
      colorTheme: 'rose',
    },
    {
      id: 'q23_volunteer',
      moduleLabel: 'Module 7',
      questionNumber: 'ข้อ 23',
      title: 'การทำจิตอาสา จิตสาธารณะ หรือบำเพ็ญประโยชน์',
      applicantValue: app.volunteerWorkParticipation || 'ไม่เคยทำ',
      score: volunteerScore,
      maxScore: 3,
      criteriaNote:
        volunteerScore === 3
          ? 'เคยทำจิตอาสาหรือบำเพ็ญประโยชน์ (+3)'
          : 'ไม่เคยทำ (0)',
      colorTheme: 'rose',
    },
    {
      id: 'q22_activity',
      moduleLabel: 'Module 7',
      questionNumber: 'ข้อ 22',
      title: 'การร่วมกิจกรรมชมรม สโมสรนิสิต องค์การ สภานิสิต',
      applicantValue: app.studentActivityParticipation || 'ไม่เคยทำ',
      score: activityScore,
      maxScore: 3,
      criteriaNote:
        activityScore === 3
          ? 'เคยทำกิจกรรมชมรม/สโมสร/สภานิสิต (+3)'
          : 'ไม่เคยทำ (0)',
      colorTheme: 'rose',
    },
    {
      id: 'q24_26_need',
      moduleLabel: 'Module 8',
      questionNumber: 'ข้อ 24-26',
      title: 'เหตุผลความจำเป็นและความตั้งใจศึกษา',
      applicantValue: app.reasonForApplying
        ? `${app.reasonForApplying.slice(0, 60)}${app.reasonForApplying.length > 60 ? '...' : ''}`
        : 'ระบุความจำเป็นเบื้องต้น',
      score: needReasonScore,
      maxScore: 5,
      criteriaNote:
        needReasonScore === 5
          ? 'ชี้แจงความเดือดร้อนและความจำเป็นชัดเจนเป็นลายลักษณ์อักษร (+5)'
          : 'ชี้แจงความจำเป็นระดับทั่วไป (+3)',
      colorTheme: 'sky',
    },
  ];

  return {
    totalScore,
    maxScore: 100,
    incomeScore,
    scholarshipHistoryScore,
    allowanceScore,
    familyHardshipScore,
    siblingsScore,
    accommodationScore,
    selfRelianceScore,
    academicAndNeedScore,
    priorityLevel,
    priorityLabel,
    colorClass,
    illnessScore,
    maritalStatusScore,
    partTimeScore,
    volunteerScore,
    activityScore,
    gpaxScore,
    needReasonScore,
    itemizedScores,
  };
}

export const TIMELINE_2569: AnnouncementItem[] = [
  {
    id: 'step-1',
    dateStr: 'ตั้งแต่บัดนี้ – 15 กันยายน 2569',
    title: 'กรอกใบสมัครขอรับทุนการศึกษาออนไลน์ (Module 0-8)',
    subtitle: 'นิสิตกรอกข้อมูลยืนยัน ข้อมูลส่วนตัว ครอบครัว ฐานะ และความจำเป็นให้ครบถ้วน 100%',
    iconName: 'FilePenLine',
    highlight: true,
  },
  {
    id: 'step-2',
    dateStr: '18 กันยายน 2569',
    title: 'ประกาศรายชื่อนิสิตผู้มีสิทธิเข้าสัมภาษณ์ทุน',
    subtitle: 'ตรวจสอบรายชื่อผ่านระบบนี้ และทางเพจเฟซบุ๊ก "งานกิจการนิสิต คณะสังคมศาสตร์ ม.นเรศวร"',
    iconName: 'Megaphone',
  },
  {
    id: 'step-3',
    dateStr: '23 กันยายน 2569 (เวลา 17.00 น. เป็นต้นไป)',
    title: 'สัมภาษณ์ทุนการศึกษา',
    subtitle: 'ณ ห้องประชุมราชพฤกษ์ 3 ชั้น 3 อาคารคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร (แต่งกายด้วยชุดเครื่องแบบนิสิตเรียบร้อย)',
    location: 'ห้องประชุมราชพฤกษ์ 3 ชั้น 3 อาคารคณะสังคมศาสตร์',
    iconName: 'Users',
    highlight: true,
  },
  {
    id: 'step-4',
    dateStr: 'สิ้นเดือนกันยายน 2569',
    title: 'คณะกรรมการประจำคณะฯ พิจารณาการจัดสรรทุน',
    subtitle: 'คณะกรรมการสรุปคะแนนประเมินและประกาศผลผู้ได้รับทุนอย่างเป็นทางการ',
    iconName: 'Award',
  },
  {
    id: 'step-5',
    dateStr: 'เดือนตุลาคม 2569 (เวลา 08.30 - 11.30 น.)',
    title: 'พิธีมอบทุนการศึกษา ในวันสถาปนาคณะสังคมศาสตร์',
    subtitle: 'ณ โถงชั้น 1 อาคารคณะสังคมศาสตร์ นิสิตรับมอบทุนและส่งเอกสารเบิกจ่ายเงินเข้าบัญชี',
    location: 'โถงชั้น 1 อาคารคณะสังคมศาสตร์',
    iconName: 'GraduationCap',
  },
];

export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  academicYear: '2569',
  heroTitle: 'เปิดรับสมัครทุนการศึกษา ประจำปีการศึกษา 2569',
  heroSubtitle:
    'สำหรับนิสิตคณะสังคมศาสตร์ที่ขาดแคลนทุนทรัพย์ เพื่อแบ่งเบาภาระค่าใช้จ่ายทางการศึกษา และส่งเสริมให้นิสิตสำเร็จการศึกษาอย่างมีคุณภาพ',
  contactPhone: '055-961911',
  criticalNotice: {
    title: 'หมายเหตุสำคัญมาก (เงื่อนไขการสละสิทธิ์)',
    description:
      'หากนิสิตไม่เข้ารับการสัมภาษณ์ตามวันและเวลาที่กำหนด จะถือว่าสละสิทธิ์การพิจารณาทุนครั้งนี้',
    interviewDate: '23 กันยายน 2569 เวลา 17.00 น. เป็นต้นไป',
    interviewLocation:
      'ห้องประชุมราชพฤกษ์ 3 ชั้น 3 อาคารคณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร',
  },
  steps: TIMELINE_2569,
  qualifications: [
    'นิสิตระดับปริญญาตรี คณะสังคมศาสตร์ ม.นเรศวร (ชั้นปีที่ 1 - 4)',
    'เป็นผู้ที่ขาดแคลนทุนทรัพย์ หรือครอบครัวมีปัญหาเศรษฐกิจ',
    'มีความประพฤติดี ไม่เคยมีประวัติความผิดวินัยนิสิต',
    'เข้ารับการสัมภาษณ์ตามวันและเวลาที่คณะกรรมการกำหนด',
  ],
  requiredDocuments: [
    'รูปถ่ายหน้าตรงในเครื่องแบบนิสิต',
    'สำเนาบัตรประจำตัวนิสิต หรือบัตรประชาชน',
    'ใบรายงานผลการศึกษา (GPAX จาก REG NU)',
    'หนังสือรับรองรายได้ครอบครัว / สลิปเงินเดือน',
    'บัญชีธนาคารกรุงไทยสำหรับรับเงินทุน',
  ],
  lastUpdatedAt: '2026-08-01 09:00',
  lastUpdatedBy: 'งานกิจการนิสิตและศิษย์เก่าสัมพันธ์ คณะสังคมศาสตร์',
};

export const TIMELINE_STORAGE_KEY = 'nu_socsci_scholarship_timeline_config_2569';

export function loadTimelineConfig(): TimelineConfig {
  try {
    const raw = localStorage.getItem(TIMELINE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(DEFAULT_TIMELINE_CONFIG));
      return DEFAULT_TIMELINE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(DEFAULT_TIMELINE_CONFIG));
      return DEFAULT_TIMELINE_CONFIG;
    }
    return {
      ...DEFAULT_TIMELINE_CONFIG,
      ...parsed,
      criticalNotice: {
        ...DEFAULT_TIMELINE_CONFIG.criticalNotice,
        ...(parsed.criticalNotice || {}),
      },
    };
  } catch (e) {
    console.error('Failed to load timeline config', e);
    return DEFAULT_TIMELINE_CONFIG;
  }
}

export function saveTimelineConfig(config: TimelineConfig): void {
  try {
    const updated: TimelineConfig = {
      ...config,
      lastUpdatedAt: new Date().toLocaleString('th-TH'),
      lastUpdatedBy: config.lastUpdatedBy || 'ผู้ดูแลระบบ (Admin)',
    };
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save timeline config', e);
  }
}

export function resetTimelineConfig(): TimelineConfig {
  try {
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(DEFAULT_TIMELINE_CONFIG));
    return DEFAULT_TIMELINE_CONFIG;
  } catch (e) {
    console.error('Failed to reset timeline config', e);
    return DEFAULT_TIMELINE_CONFIG;
  }
}

export const INITIAL_APPLICATIONS_2569: ScholarshipApplication[] = [];

export const STORAGE_KEY = 'nu_socsci_scholarship_applications_2569';
export const DRAFT_STORAGE_KEY = 'nu_socsci_scholarship_draft_2569';

export function loadApplications(): ScholarshipApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    // Update any legacy APP-2569 prefix to FSS-2569
    const updated = parsed.map((item: ScholarshipApplication) => {
      if (item.id && item.id.startsWith('APP-2569-')) {
        return { ...item, id: item.id.replace('APP-2569-', 'FSS-2569-') };
      }
      return item;
    });
    return updated;
  } catch (e) {
    console.error('Failed to load applications from localStorage', e);
    return [];
  }
}

export function clearAllApplications(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to clear applications', e);
  }
}

export function saveApplication(app: ScholarshipApplication): void {
  try {
    const apps = loadApplications();
    const existingIndex = apps.findIndex(
      (a) => a.id === app.id || (app.studentId && a.studentId === app.studentId)
    );
    if (existingIndex >= 0) {
      apps[existingIndex] = { ...app, updatedAt: new Date().toISOString() };
    } else {
      apps.unshift({ ...app, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save application', e);
  }
}

export function saveDraft(data: Partial<ScholarshipApplication>): boolean {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save draft', e);
    return false;
  }
}

export function loadDraft(): Partial<ScholarshipApplication> | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (e) {
    // ignore
  }
}
