import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]">
        <section className="relative hidden overflow-hidden lg:block">
          <Image src="/college-campus.svg" alt="วิทยาลัย" fill sizes="55vw" className="object-cover opacity-75" priority />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/65 to-orange-900/35" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-white">
                <Image src="/check-ngan-logo.svg" alt="Check Ngan" fill sizes="56px" className="object-cover" />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-300">Check Ngan</p>
                <p className="mt-1 font-extrabold text-white">ระบบจัดการงานการเรียน</p>
              </div>
            </div>

            <div className="max-w-2xl pb-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-orange-300">Learning workflow</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
                มอบหมาย ส่ง ตรวจ และให้คะแนน
                <span className="block text-orange-300">ครบในระบบเดียว</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-200">
                ระบบสำหรับคุณครูและนักเรียน ช่วยจัดการงานในชั้นเรียน ติดตามการส่งไฟล์ และดูผลคะแนนได้อย่างเป็นระบบ
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[#f7f8fb] p-4 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-orange-100 bg-white">
                <Image src="/check-ngan-logo.svg" alt="Check Ngan" fill sizes="48px" className="object-cover" />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">Check Ngan</p>
                <p className="text-sm font-extrabold text-slate-950">ระบบจัดการงานการเรียน</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">Welcome back</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-950">เข้าสู่ระบบ</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">ใช้บัญชีที่ได้รับสิทธิ์จากระบบเพื่อเข้าสู่หน้าคุณครูหรือนักเรียน</p>
            </div>

            <SignIn routing="hash" forceRedirectUrl="/auth/continue" signUpForceRedirectUrl="/auth/continue" />
          </div>
        </section>
      </div>
    </main>
  )
}
