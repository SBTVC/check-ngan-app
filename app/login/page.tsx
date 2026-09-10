import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <Image src="/college-campus.svg" alt="บรรยากาศวิทยาลัย" fill sizes="52vw" className="object-cover opacity-80" priority />
          <div className="absolute inset-0 bg-slate-950/72" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-slate-950 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/20 bg-white"><Image src="/check-ngan-logo.svg" alt="check-ngan System" fill sizes="48px" className="object-cover" /></div>
              <div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">check-ngan System</p><p className="mt-1 text-sm font-black text-white">ระบบติดตามงานของนักเรียนและนักศึกษา</p></div>
            </div>

            <div className="max-w-xl pb-5">
              <p className="text-xs font-bold text-orange-300">ระบบติดตามงานสำหรับสถานศึกษา</p>
              <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl">ติดตามงานในชั้นเรียน<br />อย่างเป็นระบบและชัดเจน</h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-200 xl:text-base">พื้นที่กลางสำหรับอาจารย์และนักเรียน/นักศึกษา ตั้งแต่มอบหมายงาน ส่งไฟล์ ตรวจงาน ไปจนถึงติดตามผลคะแนน</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-300"><span>มอบหมายงาน</span><span>ส่งงาน</span><span>ตรวจและให้คะแนน</span><span>ติดตามสถานะ</span></div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-[#f6f7f9] p-4 sm:p-8">
          <div className="absolute right-4 top-4 sm:right-8 sm:top-6"><ThemeToggle /></div>
          <div className="w-full max-w-md pt-16 sm:pt-8">
            <div className="mb-8 flex items-center gap-3 lg:hidden"><div className="relative h-11 w-11 overflow-hidden rounded-xl border border-orange-100 bg-white"><Image src="/check-ngan-logo.svg" alt="check-ngan System" fill sizes="44px" className="object-cover" /></div><div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-600">check-ngan System</p><p className="text-sm font-black text-slate-950">ระบบติดตามงานของนักเรียนและนักศึกษา</p></div></div>
            <div className="mb-5"><p className="text-xs font-bold text-orange-600">เข้าสู่ระบบ</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">ยินดีต้อนรับ</h2><p className="mt-2 text-sm leading-6 text-slate-500">เข้าสู่ระบบด้วยบัญชีที่ได้รับสิทธิ์ เพื่อไปยังพื้นที่ของอาจารย์หรือนักเรียน/นักศึกษา</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"><SignIn routing="hash" forceRedirectUrl="/auth/continue" signUpForceRedirectUrl="/auth/continue" /></div>
            <p className="mt-5 text-center text-xs leading-5 text-slate-400">สิทธิ์การใช้งานจะอ้างอิงจากบทบาทที่กำหนดไว้ในระบบ</p>
          </div>
        </section>
      </div>
    </main>
  )
}
