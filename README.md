# Check Ngan

เว็บแอปจัดการการบ้านและการเรียนการสอนสำหรับคุณครูและนักเรียน พัฒนาด้วย Next.js, Clerk และ Supabase

## ฟีเจอร์หลัก

### คุณครู
- Teacher Dashboard แบบเต็มหน้าจอ พร้อมสรุปงานทั้งหมด งานที่ส่ง งานรอตรวจ และงานที่ตรวจแล้ว
- สร้างห้องเรียนพื้นฐานและมอบหมายงาน
- ดูรายการงานและรายละเอียดงานแบบแยก Route ชัดเจน
- ดู Submission แบบ Real-time
- เปิดไฟล์งานนักเรียนด้วย Signed URL
- ให้คะแนนและ Feedback ผ่านตาราง `grades`

### นักเรียน
- Student Dashboard พร้อมตัวกรองงานทั้งหมด / ยังไม่ส่ง / ส่งแล้ว / ตรวจแล้ว
- ค้นหางานและดูงานใกล้กำหนดส่ง
- เปิดรายละเอียดงาน
- ส่งข้อความและอัปโหลดไฟล์ได้สูงสุด 20 MB
- ส่งงานใหม่อีกครั้งโดยอัปเดต Submission เดิม
- ดูคะแนนและ Feedback จากคุณครู

## Tech Stack

- Next.js 16 App Router + React 19 + TypeScript
- Tailwind CSS 4
- Clerk Authentication
- Supabase Postgres, RLS, Storage และ Realtime

## Route หลัก

```text
/
├─ /login
├─ /auth/continue
├─ /setup-role
├─ /teacher
│  ├─ /assignments
│  │  ├─ /new
│  │  └─ /[id]
│  └─ /submissions
│     └─ /[id]
└─ /student
   └─ /assignments/[id]
```

`app/teacher/layout.tsx` และ `app/student/layout.tsx` ตรวจ Role ที่ฝั่ง Server เพื่อป้องกันการเปิดหน้าอีก Role โดยตรง

## ติดตั้ง

```bash
npm install
```

คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ Key ของ Clerk และ Supabase

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/auth/continue
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/auth/continue

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

> ห้าม Commit `.env.local` ขึ้น GitHub

## Clerk Role

Session token ของ Clerk ต้องมี `metadata.role` เป็น `teacher` หรือ `student` และ Supabase ต้องเชื่อม Clerk เป็น Third-Party Auth provider

## ตั้งค่า Supabase

เปิด Supabase SQL Editor แล้ว Run ตามลำดับ:

1. `supabase/foundation.sql`
2. `supabase/owner-defaults.sql`
3. `supabase/production-hardening.sql`

ไฟล์ hardening จะลบ policy ชั่วคราวสำหรับ Demo, เปลี่ยน Storage เป็น private, จำกัดไฟล์ 20 MB, ตั้ง Storage RLS และเปิด Realtime สำหรับ `submissions`

> Production RLS ใช้ `class_members` เพื่อกำหนดว่านักเรียนเห็นงานของห้องใด หากนักเรียนไม่เห็นงาน ให้ตรวจว่ามี Clerk User ID ของนักเรียนอยู่ใน `class_members` ของห้องนั้น

## รันโปรเจกต์

```bash
npm run dev
```

เปิด `http://localhost:3000`

## ตรวจคุณภาพโค้ด

```bash
npm run lint
npx tsc --noEmit
npm run build
```

GitHub Actions ใน `.github/workflows/ci.yml` จะตรวจ lint, TypeScript และ production build ทุกครั้งที่ push หรือเปิด Pull Request

## Branding

ไฟล์ภาพระบบอยู่ใน `public/`:

```text
public/check-ngan-logo.svg
public/college-campus.svg
```

สามารถเปลี่ยนเป็นโลโก้หรือภาพวิทยาลัยจริงได้โดยคงชื่อไฟล์เดิม

---

Check Ngan — ระบบจัดการงานการเรียนสำหรับ Teacher / Student workflow
