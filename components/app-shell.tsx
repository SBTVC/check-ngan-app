'use client'

import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export type AppRole = 'teacher' | 'student'

type NavItem = { href: string; label: string; description: string; icon: string }

const teacherNav: NavItem[] = [
  { href: '/teacher', label: 'ภาพรวม', description: 'แดชบอร์ดคุณครู', icon: '⌂' },
  { href: '/teacher/assignments', label: 'งานที่มอบหมาย', description: 'สร้างและจัดการงาน', icon: '▤' },
  { href: '/teacher/submissions', label: 'ตรวจงาน', description: 'ตรวจและให้คะแนน', icon: '✓' },
]

const studentNav: NavItem[] = [
  { href: '/student', label: 'ภาพรวม', description: 'แดชบอร์ดนักเรียน', icon: '⌂' },
  { href: '/student', label: 'งานของฉัน', description: 'งานที่ได้รับมอบหมาย', icon: '▤' },
]

export function AppShell({ role, children }: { role: AppRole; children: ReactNode }) {
  const pathname = usePathname()
  const nav = role === 'teacher' ? teacherNav : studentNav
  const root = role === 'teacher' ? '/teacher' : '/student'

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white xl:flex xl:flex-col">
        <div className="border-b border-slate-100 px-6 py-6">
          <Link href={root} className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-orange-100 bg-orange-50">
              <Image src="/check-ngan-logo.svg" alt="Check Ngan" fill sizes="48px" className="object-cover" priority />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600">Check Ngan</p>
              <p className="truncate text-base font-extrabold">ระบบจัดการงานการเรียน</p>
            </div>
          </Link>
        </div>

        <div className="px-4 py-5">
          <p className="px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">เมนูหลัก</p>
          <nav className="mt-3 space-y-1.5">
            {nav.map((item, index) => {
              const active = pathname === item.href || (item.href !== root && pathname.startsWith(`${item.href}/`)) || (role === 'student' && index === 1 && pathname.startsWith('/student/assignments/'))
              return (
                <Link key={`${item.href}-${index}`} href={item.href} className={`flex items-center gap-3 rounded-2xl px-3 py-3 transition ${active ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black ${active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'}`}>{item.icon}</span>
                  <span className="min-w-0"><span className="block text-sm font-bold">{item.label}</span><span className="block truncate text-xs text-slate-400">{item.description}</span></span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-100 p-5">
          <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 p-4 text-white shadow-sm">
            <p className="text-xs font-semibold text-orange-50">สถานะระบบ</p>
            <p className="mt-1 text-sm font-extrabold">พร้อมใช้งาน</p>
            <p className="mt-1 text-xs leading-5 text-orange-50/90">เชื่อมต่อ Clerk และ Supabase</p>
          </div>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Link href={root} className="relative h-10 w-10 overflow-hidden rounded-xl border border-orange-100 xl:hidden"><Image src="/check-ngan-logo.svg" alt="Check Ngan" fill sizes="40px" className="object-cover" /></Link>
              <div><p className="text-sm font-extrabold">{role === 'teacher' ? 'ระบบสำหรับคุณครู' : 'ระบบสำหรับนักเรียน'}</p><p className="hidden text-xs text-slate-500 sm:block">ระบบติดตามงาน มอบหมายงาน และการให้คะแนน</p></div>
            </div>
            <div className="flex items-center gap-3"><span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:inline-flex">● ออนไลน์</span><UserButton /></div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 xl:hidden">
            {nav.map((item, index) => {
              const active = pathname === item.href || (item.href !== root && pathname.startsWith(`${item.href}/`)) || (role === 'student' && index === 1 && pathname.startsWith('/student/assignments/'))
              return <Link key={`${item.href}-m-${index}`} href={item.href} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{item.label}</Link>
            })}
          </nav>
        </header>
        <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</div>
      </div>
    </div>
  )
}
