# ระบบรับสมัครและคัดกรองทุนการศึกษา คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
### Faculty of Social Sciences Scholarship Portal — Naresuan University

เว็บแอปพลิเคชันระบบรับสมัครและพิจารณาคัดกรองทุนการศึกษาสำหรับนิสิตที่ขาดแคลนทุนทรัพย์ คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร ประจำปีการศึกษา 2568 - 2569 พัฒนาด้วย **React 19**, **TypeScript**, **Tailwind CSS**, และเชื่อมต่อฐานข้อมูลคลาวด์แบบเรียลไทม์ด้วย **Firebase Firestore**

---

## 🌟 ฟีเจอร์หลัก (Key Features)

### 1. แบบฟอร์มขอรับทุนการศึกษาออนไลน์ 8 มิติ (8-Module Application Form)
- **Module 0: การยืนยันข้อมูล** รับรองความถูกต้องของข้อมูลตามสัจธรรม
- **Module 1: ข้อมูลส่วนตัว** ชื่อ-สกุล, รหัสนิสิต, ภาควิชา, ชั้นปี, เบอร์โทรศัพท์, ที่อยู่ภูมิลำเนา, GPAX
- **Module 2: ข้อมูลครอบครัว** ข้อมูลบิดา มารดา ผู้ปกครอง สถานภาพการสมรส สภาพความเป็นอยู่ และการเจ็บป่วยในครอบครัว
- **Module 3: ฐานะทางเศรษฐกิจ** รายได้ครอบครัวต่อปี พร้อมระบบอัปโหลดหลักฐานหนังสือรับรองรายได้/สลิปเงินเดือน (PDF, PNG, JPG)
- **Module 4: ประวัติการได้รับทุน** ค่าใช้จ่ายที่ได้รับต่อเดือน, การกู้ยืม กยศ./กรอ., ประวัติการรับทุนการศึกษาอื่น
- **Module 5: สภาพความเป็นอยู่และที่พัก** ประเภทที่พักอาศัย (หอพักในมหาวิทยาลัย, หอพักเอกชน, บ้านตนเอง)
- **Module 6: การทำงานพิเศษ** การทำงานพิเศษหารายได้ระหว่างเรียน
- **Module 7: การมีส่วนร่วมและความประพฤติ** กิจกรรมชมรม สโมสรนิสิต สภานิสิต และกิจกรรมจิตอาสาบำเพ็ญประโยชน์
- **Module 8: ความจำเป็นในการรับทุน** สิ่งที่ภาคภูมิใจในตนเอง เหตุผลความเดือดร้อนจำเป็น และแผนการนำเงินทุนไปใช้
- **ระบบบันทึกร่างอัตโนมัติ (Draft Auto-Save)** บันทึกข้อมูลที่กรอกค้างไว้ในเครื่องอัตโนมัติ ป้องกันข้อมูลสูญหาย

### 2. ระบบประเมินและคัดกรองคะแนนอัตโนมัติ 100 คะแนนเต็ม (Algorithmic Scoring Matrix)
- คำนวณคะแนนตามเกณฑ์ 100 คะแนนเต็มอย่างเที่ยงตรง โปร่งใส และตรวจสอบได้
- แบ่งระดับความจำเป็นเป็น 4 ระดับ:
  - 🔴 **ระดับ 1 : ความจำเป็นเร่งด่วนสูงสุด** (75 - 100 คะแนน) — Priority 1
  - 🟡 **ระดับ 2 : ความจำเป็นสูง** (60 - 74 คะแนน) — Priority 2
  - 🔵 **ระดับ 3 : ความจำเป็นปานกลาง** (45 - 59 คะแนน) — Priority 3
  - ⚪ **ระดับ 4 : ระดับปกติ / ทุนสำรอง** (< 45 คะแนน)
- เครื่องมือจำลองคำนวณคะแนน (Interactive Score Simulator) สำหรับทดสอบสมมติฐานเกณฑ์คะแนน

### 3. ใบคะแนนการประเมินรายข้อ (Officer Score Sheet & Print Mode)
- แสดงคะแนนแจกแจงรายข้อ ละเอียดทุกข้อ พร้อมเกณฑ์และเหตุผลกำกับ
- มีปุ่มพิมพ์ใบคะแนน (Print-Ready) จัดรูปแบบสวยงามสำหรับใช้ประกอบการประชุมคณะกรรมการพิจารณาทุน

### 4. ระบบฐานข้อมูลออนไลน์แบบเรียลไทม์ (Firebase Firestore Real-time Sync)
- ซิงค์ข้อมูลใบสมัครทันทีผ่าน Cloud Firestore
- คณะกรรมการและเจ้าหน้าที่เห็นข้อมูลอัปเดตพร้อมกันแบบ Real-time
- รองรับ Offline Fallback เก็บข้อมูลลง Local Cache หากเครือข่ายขัดข้อง และซิงค์ขึ้น Cloud เมื่อออนไลน์

### 5. ระบบติดตามสถานะการสมัคร (Student Status Tracker)
- นิสิตสามารถตรวจสอบสถานะการสมัคร ผลการพิจารณา และกำหนดการสัมภาษณ์ได้ด้วยตนเองโดยใช้รหัสนิสิตหรือเลขที่ใบสมัคร
- พิมพ์ใบยืนยันการสมัคร (Application Slip) เก็บไว้เป็นหลักฐาน

### 6. แดชบอร์ดสำหรับเจ้าหน้าที่และคณะกรรมการ (Reviewer Dashboard)
- เข้าสู่ระบบปลอดภัยสำหรับเจ้าหน้าที่
- ค้นหา กรองข้อมูลตามภาควิชา ชั้นปี สถานะ และระดับความจำเป็น
- ปรับเปลี่ยนสถานะการพิจารณา (ยื่นใบสมัครแล้ว, มีสิทธิ์เข้าสัมภาษณ์, สัมภาษณ์แล้ว, อนุมัติทุน, ไม่ผ่านการคัดเลือก)
- ระบุจำนวนเงินทุนที่อนุมัติและบันทึกความเห็นคณะกรรมการ
- ระบบแก้ไขกำหนดการและประกาศรับสมัคร (Timeline & Announcement Editor)
- ส่งออกข้อมูลใบสมัครทั้งหมดเป็นไฟล์ **CSV** รองรับภาษาไทยสมบูรณ์แบบ

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** React 19, TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Cloud Database & Auth:** Firebase (Cloud Firestore & Authentication)

---

## 🚀 เริ่มต้นใช้งานบนเครื่องของคุณ (Getting Started)

### 1. โคลนคลังโค้ด (Clone Repository)
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. รันเซิร์ฟเวอร์สำหรับพัฒนา (Development Server)
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### 4. ตรวจสอบโค้ดและสร้างไฟล์สำหรับการใช้งานจริง (Lint & Build)
```bash
# ตรวจสอบ TypeScript syntax
npm run lint

# สร้าง Production Build (ไฟล์จะถูกสร้างในโฟลเดอร์ dist/)
npm run build

# ทดสอบรัน Production Build ในเครื่อง
npm run preview
```

---

## ☁️ การตั้งค่า Firebase (Firebase Configuration)

โครงการนี้ใช้ไฟล์ `firebase-applet-config.json` ใน Root Directory สำหรับตั้งค่าการเชื่อมต่อ Firebase:

```json
{
  "projectId": "your-firebase-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "your-project.firebasestorage.app",
  "messagingSenderId": "your-sender-id"
}
```

### การตั้งค่า Security Rules บน Firestore
ไฟล์ `firestore.rules` ได้รับการออกแบบตามมาตรฐาน Zero-Trust ABAC:
- ตรวจสอบชนิดข้อมูล (Type Safety) และความยาวตัวอักษร (Size Boundary) ป้องกันการส่งข้อมูลเกินขนาด
- สามารถ Deploy กฎขึ้น Firebase ได้ด้วย Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── src/
│   ├── components/            # UI Components ทั้งหมด
│   │   ├── AdminLoginModal.tsx         # หน้าต่างเข้าสู่ระบบเจ้าหน้าที่
│   │   ├── ApplicationSlipModal.tsx    # หน้าต่างใบยืนยันการสมัคร
│   │   ├── DocumentUploader.tsx        # คอมโพเนนต์อัปโหลดเอกสาร
│   │   ├── Header.tsx                  # ส่วนหัวเว็บและเมนูนำทาง
│   │   ├── ItemizedScoreModal.tsx      # ใบคะแนนประเมินรายข้อ (Officer Score Sheet)
│   │   ├── ReviewerDashboard.tsx       # แดชบอร์ดพิจารณาทุนของเจ้าหน้าที่
│   │   ├── ScholarshipForm.tsx         # แบบฟอร์มสมัครทุน 8 โมดูล
│   │   ├── ScoringCriteriaModal.tsx    # เกณฑ์ 100 คะแนนและเครื่องมือจำลอง (Simulator)
│   │   ├── StatusTracker.tsx           # ระบบติดตามสถานะนิสิต
│   │   ├── TimelineEditorModal.tsx     # เครื่องมือจัดการกำหนดการสำหรับแอดมิน
│   │   └── TimelineSection.tsx         # ส่วนแสดงกำหนดการและเงื่อนไขทุน
│   ├── data/
│   │   └── scholarshipData.ts          # สูตรคำนวณคะแนน, ข้อมูลตัวเลือก, ข้อมูลจำลอง
│   ├── services/
│   │   └── firebaseService.ts          # บริการเชื่อมต่อและซิงค์ Firebase Firestore
│   ├── firebase.ts                     # การตั้งค่า Firebase SDK & Error Handlers
│   ├── types.ts                        # TypeScript Interfaces & Types
│   ├── App.tsx                         # แอปพลิเคชันหลัก
│   └── main.tsx                        # จุดเริ่มต้น React DOM
├── firebase-applet-config.json         # การตั้งค่า Firebase SDK
├── firebase-blueprint.json             # ผังโครงสร้างข้อมูล Firestore
├── firestore.rules                     # กฎความปลอดภัย Firestore Security Rules
├── security_spec.md                    # เอกสารข้อกำหนดความปลอดภัยข้อมูล
├── package.json                        # รายการ Dependencies และ Scripts
└── README.md                           # คู่มือการใช้งานและรายละเอียดโปรเจกต์
```

---

## 🚢 การนำขึ้นออนไลน์ (Deployment)

คุณสามารถนำเว็บแอปพลิเคชันนี้ขึ้นออนไลน์ได้ง่ายๆ โดยเฉพาะ **GitHub Pages**:

### 1. GitHub Pages (อัตโนมัติผ่าน GitHub Actions)
โปรเจกต์นี้ตั้งค่าระบบ **GitHub Actions** (`.github/workflows/deploy.yml`) และ Base Path ใน `vite.config.ts` ให้พร้อมใช้งานทันที:
1. Push โค้ดขึ้น Repository บน GitHub:
   ```bash
   git add .
   git commit -m "feat: deploy to github pages"
   git push -u origin main
   ```
2. บนหน้าเว็บ GitHub ไปที่แท็บ **Settings** ของ Repository ของคุณ
3. ในเมนูด้านซ้าย เลือก **Pages**
4. ในส่วน **Build and deployment** > **Source** ให้เลือกเป็น:
   👉 **GitHub Actions**
5. ระบบจะ Build และ Deploy เว็บให้อัตโนมัติ สามารถเข้าชมเว็บได้ที่ `https://<YOUR-USERNAME>.github.io/<REPO-NAME>/`

### 2. Vercel
1. นำโค้ดขึ้น GitHub
2. เข้าไปที่ [Vercel](https://vercel.com) และกด **Import Project** จาก GitHub
3. Framework Preset เลือก **Vite**
4. กด **Deploy**

### 3. Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# เลือกโฟลเดอร์ build เป็น dist
npm run build
firebase deploy --only hosting
```

### 4. Netlify
1. ลากโฟลเดอร์ `dist` ไปวางที่ [Netlify Drop](https://app.netlify.com/drop) หรือเชื่อมต่อผ่าน GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`

---

## 📄 ลิขสิทธิ์และการใช้งาน (License)

จัดทำขึ้นเพื่อการใช้งานของ **คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร**  
Faculty of Social Sciences, Naresuan University
