'use client'

import { UserButton } from '@clerk/nextjs'

export default function TeacherDashboardClient() {
  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">ระบบจัดการสำหรับคุณครู</h1>
            <p className="mt-1 text-sm font-medium text-gray-600">Foundation พร้อมสำหรับเชื่อมระบบห้องเรียน งาน และการให้คะแนน</p>
          </div>
          <UserButton />
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['ห้องเรียน', 'งานที่มอบหมาย', 'งานที่นักเรียนส่ง', 'ตรวจและให้คะแนน'].map((title) => (
            <div key={title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold">{title}</h2>
              <p className="mt-2 text-sm font-medium text-gray-600">กำลังเชื่อมกับ Database Foundation</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
