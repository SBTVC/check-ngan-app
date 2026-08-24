# check-ngan-app

ระบบจัดการการบ้านและการเรียนการสอนสำหรับคุณครูและนักเรียน พัฒนาด้วย Next.js, Clerk และ Supabase

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Clerk Authentication
- Supabase Database / Storage / Realtime

## Local setup

1. คัดลอก `.env.example` เป็น `.env.local`
2. ใส่ Clerk และ Supabase keys
3. ติดตั้ง dependencies ด้วย `npm install`
4. รัน `npm run dev`

## Authentication roles

Clerk `publicMetadata.role` รองรับ:

- `teacher`
- `student`

Session token ต้อง expose metadata และ Supabase ต้องเชื่อม Clerk ผ่าน Third-Party Auth ก่อนเปิดใช้ RLS ชุด production

## Development status

Foundation แยก route ครู/นักเรียนและ Supabase authenticated client แล้ว ขั้นต่อไปคือ apply database foundation, classes, assignments, submissions และ grading
