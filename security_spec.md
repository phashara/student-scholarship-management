# Security Specification for Scholarship Portal

## 1. Data Invariants
1. `scholarship_applications`:
   - Application ID must be valid string format matching `^[a-zA-Z0-9_\\-]+$` up to 64 chars.
   - Applications must have required identity fields: `fullName`, `studentId`, `department`, `studyYear`, `phone`, `academicYear`, `status`.
   - String sizes must be bounded (`fullName` <= 200, `studentId` <= 30, `phone` <= 30, `reasonForApplying` <= 3000).
   - Status transitions must be strictly valid (`submitted`, `eligible_for_interview`, `interviewed`, `awarded`, `not_selected`).
2. `timeline_configs`:
   - Read is public so all students can view scholarship deadlines and qualifications.
   - Updates require valid string bounds on title, subtitle, and contact information.

## 2. The "Dirty Dozen" Payloads
1. **Dirty Payload 1 (Massive Student ID)**: `studentId` with 10,000 characters to trigger denial of wallet / storage abuse. -> Expected: PERMISSION_DENIED.
2. **Dirty Payload 2 (Invalid Status)**: `status: 'superuser_auto_grant'` outside allowed status enum. -> Expected: PERMISSION_DENIED.
3. **Dirty Payload 3 (Negative Awarded Amount)**: `awardedAmount: -999999`. -> Expected: PERMISSION_DENIED.
4. **Dirty Payload 4 (Massive Reason text)**: `reasonForApplying` with 50,000 characters. -> Expected: PERMISSION_DENIED.
5. **Dirty Payload 5 (Invalid Path ID)**: Document ID containing path traversal `../../passwords`. -> Expected: PERMISSION_DENIED.
6. **Dirty Payload 6 (Empty Required Fields)**: Application with missing `fullName` or `studentId`. -> Expected: PERMISSION_DENIED.
7. **Dirty Payload 7 (Non-string Phone)**: `phone: 1234567890` (numeric instead of string). -> Expected: PERMISSION_DENIED.
8. **Dirty Payload 8 (Disallowed Keys injection)**: Injecting system-level keys `{ isAdmin: true, role: 'root' }`. -> Expected: PERMISSION_DENIED.
9. **Dirty Payload 9 (Arbitrary Collection Write)**: Write to `system_secrets/{secretId}`. -> Expected: PERMISSION_DENIED by global deny.
10. **Dirty Payload 10 (Timeline Config with invalid academic year)**: `academicYear` exceeding character limit. -> Expected: PERMISSION_DENIED.
11. **Dirty Payload 11 (Oversized Timeline Notice)**: Injecting 2MB payload into timeline steps. -> Expected: PERMISSION_DENIED.
12. **Dirty Payload 12 (Direct Delete of Application by unauthorized party)**: Attempting bulk wipe. -> Expected: PERMISSION_DENIED.
