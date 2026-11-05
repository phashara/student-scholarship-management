# Student Scholarship Management System

## Project Overview
ระบบรับสมัครทุนการศึกษา คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร (NU SocSci)
- **Repo**: github.com/phashara/student-scholarship-management
- **Stack**: React + TypeScript + Vite (frontend), Firebase Cloud Functions (backend), Cloud Firestore (database)
- **Hosting**: GitHub Pages (frontend), Firebase (functions)
- **Region**: asia-southeast1
- **Firestore DB**: named instance `ai-studio-fe3c4a48-112f-4eaf-a043-a8df974c73b0`

## Architecture

### Collections
- `scholarship_applications` — ข้อมูลใบสมัครฉบับเต็ม (admin-only read/write)
- `public_applications` — projection สาธารณะ (ชื่อ, สาขา, สถานะ) synced by trigger
- `timeline_configs` — กำหนดการและเงื่อนไข (public read, admin write)
- `system_metadata` — internal state (admin-only)
- `audit_logs` — บันทึกการกระทำทั้งหมด (admin read, Cloud Functions write only)
- `api_rate_limits` — rate limiting counters (system-managed)

### Cloud Functions (functions/src/index.ts)
- `submitApplication` — public callable, rate limited 50/hr
- `getApplicationStatus` — public callable, rate limited 60/min
- `deleteApplication` — admin-only callable
- `clearApplications` — admin-only callable
- `backfillPublicApplications` — admin-only migration
- `syncPublicApplication` — Firestore trigger, syncs public projection

### Auth
- Firebase Auth + Google Sign-In
- Single admin: hardcoded email in firestore.rules, functions, and AdminLoginModal.tsx
- No custom claims yet — planned for Phase 1

### Key Files
- `firestore.rules` — Firestore security rules
- `functions/src/index.ts` — Cloud Functions
- `functions/src/validation.ts` — server-side input validation
- `src/services/firebaseService.ts` — client-side Firebase service layer
- `src/components/ReviewerDashboard.tsx` — admin dashboard (largest component)
- `src/components/ScholarshipForm.tsx` — student application form
- `src/utils/applicationSubmission.ts` — submission validation + preparation
- `src/utils/offlineStorage.ts` — LocalStorage/IndexedDB cache management

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — type check (tsc --noEmit)
- `node --test tests/*.cjs` — run tests

## Development Roadmap

### Phase 1: Security Fixes (priority order)
1. **Multi-admin** — Replace hardcoded email with Firebase Auth custom claims
2. **Audit log** — Add audit_logs collection, log all write operations
3. **Migrate client writes to callables** — saveApplicationOnline, deleteApplicationOnline, clearAllApplicationsOnline should use Cloud Functions
4. **PDPA basics** — Privacy Notice, proper consent, clear cache on logout
5. **App Check + reduce status API response** — Enable reCAPTCHA, limit PII in getApplicationStatus

### Phase 2: Donation System
1. Data model (donors, donations, funds)
2. Cloud Functions for donation recording
3. Donation page (PromptPay QR / bank transfer)
4. Donation dashboard
5. Receipt/thank-you letter (PDF)
6. Public fund progress page

## Security Audit
- Audit report v2 completed 2026-11-05
- 6 issues from v1 fixed, 11 remaining (3 High, 5 Medium, 3 Low)
- Full report: security-report.html in project root (also published as Artifact)

## Conventions
- Thai language for UI text and user-facing strings
- English for code, variable names, and comments
- Component files use PascalCase
- Utility files use camelCase
- Tests in tests/ directory as .cjs files
