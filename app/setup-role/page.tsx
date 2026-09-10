import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function SetupRolePage() {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/login')

  const role = sessionClaims?.metadata?.role
  if (role === 'teacher') redirect('/teacher')
  if (role === 'student') redirect('/student')

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#f6f7f9] p-5 text-slate-950">
      <div className="absolute right-5 top-5"><ThemeToggle /></div>
      <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-orange-100 bg-orange-50"><Image src="/check-ngan-logo.svg" alt="Check Ngan" fill sizes="44px" className="object-cover" /></div>
            <div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-600">Check Ngan</p><p className="mt-0.5 text-sm font-black text-slate-950">การตั้งค่าบัญชีผู้ใช้งาน</p></div>
          </div>
          <UserButton />
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-lg font-black text-orange-700">!</div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950">บัญชียังไม่ได้กำหนดบทบาท</h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">ระบบตรวจพบบัญชีแล้ว แต่ยังไม่มีสิทธิ์เป็นคุณครูหรือนักเรียน จึงยังไม่สามารถเปิดพื้นที่ใช้งานหลักได้</p>

          <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5">
            <h2 className="text-sm font-black text-slate-900">สิ่งที่ต้องดำเนินการ</h2>
            <ol className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-orange-700">1</span><span>ติดต่อผู้ดูแลระบบเพื่อกำหนดสิทธิ์ให้บัญชีนี้</span></li>
              <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-orange-700">2</span><span>ผู้ดูแลต้องกำหนด Clerk <b>publicMetadata.role</b> เป็น <b>teacher</b> หรือ <b>student</b></span></li>
              <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-orange-700">3</span><span>หลังจากกำหนดสิทธิ์แล้ว ให้ออกจากระบบและเข้าสู่ระบบใหม่อีกครั้ง</span></li>
            </ol>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">เหตุผลด้านความปลอดภัย</p><p className="mt-1 text-sm leading-6 text-slate-600">ผู้ใช้ไม่สามารถยกระดับสิทธิ์ของตนเองจากหน้าเว็บได้ เพื่อป้องกันการเข้าถึงข้อมูลผิดบทบาท</p></div>
        </div>
      </section>
    </main>
  )
}
