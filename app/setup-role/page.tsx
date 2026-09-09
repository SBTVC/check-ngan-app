import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function SetupRolePage() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/login')

  const role = sessionClaims?.metadata?.role
  if (role === 'teacher') redirect('/teacher')
  if (role === 'student') redirect('/student')

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] p-5 text-slate-950">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-orange-100">
              <Image src="/check-ngan-logo.svg" alt="Check Ngan" fill sizes="48px" className="object-cover" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">Account setup</p>
              <h1 className="text-xl font-extrabold">บัญชียังไม่ได้กำหนดบทบาท</h1>
            </div>
          </div>
          <UserButton />
        </div>

        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <p className="font-extrabold text-slate-900">ต้องให้ผู้ดูแลระบบกำหนดสิทธิ์ก่อน</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            ระบบไม่อนุญาตให้ผู้ใช้ยกระดับสิทธิ์ของตนเองจากหน้าเว็บ เพื่อความปลอดภัย ผู้ดูแลต้องกำหนด Clerk publicMetadata.role เป็น <b>teacher</b> หรือ <b>student</b> ก่อนจึงจะเข้าใช้งานได้
          </p>
        </div>
      </section>
    </main>
  )
}
