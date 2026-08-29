import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function StudentPage() {
  const { sessionClaims } = await auth.protect()
  if (sessionClaims?.metadata?.role !== 'student') redirect('/setup-role')

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold">ระบบสำหรับนักเรียน</h1>
            <p className="mt-1 text-sm font-medium text-gray-600">Foundation พร้อมสำหรับรายการงาน การส่งงาน และคะแนน</p>
          </div>
          <UserButton />
        </header>
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Student Dashboard</h2>
          <p className="mt-2 font-medium text-gray-700">บัญชีนี้ผ่านการตรวจ role ฝั่ง server แล้ว</p>
        </section>
      </div>
    </main>
  )
}
