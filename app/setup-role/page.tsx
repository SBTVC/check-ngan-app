import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function SetupRolePage() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/login')

  const role = sessionClaims?.metadata?.role
  if (role === 'teacher') redirect('/teacher')
  if (role === 'student') redirect('/student')

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <section className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">บัญชียังไม่ได้กำหนดบทบาท</h1>
          <UserButton />
        </div>
        <p className="font-medium text-gray-700">
          ระบบไม่อนุญาตให้ผู้ใช้ยกระดับตัวเองเป็นคุณครูจากหน้าเว็บ ให้ผู้ดูแลกำหนด Clerk publicMetadata.role เป็น teacher หรือ student
        </p>
      </section>
    </main>
  )
}
