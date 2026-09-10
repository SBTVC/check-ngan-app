'use client'

import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserProfileSummary } from '@/components/user-profile-summary'
import { ProfileSync } from '@/components/profile-sync'

export type AppRole = 'teacher' | 'student'
type NavItem = { href: string; label: string; description: string; icon: string; match?: string }

const teacherNav: NavItem[] = [
  { href: '/teacher', label: 'ภาพรวม', description: 'แดชบอร์ดและงานสำคัญ', icon: '01' },
  { href: '/teacher/assignments', label: 'งานที่มอบหมาย', description: 'สร้าง แก้ไข และจัดการงาน', icon: '02', match: '/teacher/assignments' },
  { href: '/teacher/submissions', label: 'ตรวจงาน', description: 'ตรวจและให้คะแนน', icon: '03', match: '/teacher/submissions' },
  { href: '/teacher/classes', label: 'ห้องเรียน', description: 'สมาชิก รหัสเข้าห้อง และประกาศ', icon: '04', match: '/teacher/classes' },
  { href: '/teacher/gradebook', label: 'สมุดคะแนน', description: 'คะแนนรวมและส่งออก CSV', icon: '05', match: '/teacher/gradebook' },
  { href: '/teacher/profile', label: 'โปรไฟล์', description: 'ข้อมูลอาจารย์', icon: '06', match: '/teacher/profile' },
  { href: '/teacher/notifications', label: 'แจ้งเตือน', description: 'กิจกรรมล่าสุดของระบบ', icon: '07', match: '/teacher/notifications' },
]

const studentNav: NavItem[] = [
  { href: '/student', label: 'ภาพรวม', description: 'งานและผลการเรียน', icon: '01' },
  { href: '/student/classes', label: 'ห้องเรียน', description: 'ห้องที่เข้าร่วมและประกาศ', icon: '02', match: '/student/classes' },
  { href: '/student/join', label: 'เข้าร่วมห้อง', description: 'กรอกรหัสจากอาจารย์', icon: '03', match: '/student/join' },
  { href: '/student/profile', label: 'โปรไฟล์', description: 'ข้อมูลนักเรียน/นักศึกษา', icon: '04', match: '/student/profile' },
  { href: '/student/notifications', label: 'แจ้งเตือน', description: 'งานใหม่และผลการตรวจ', icon: '05', match: '/student/notifications' },
]

function isActive(pathname: string, item: NavItem, root: string) {
  if (item.href === root) return pathname === root || pathname.startsWith(`${root}/assignments/`)
  return pathname === item.href || Boolean(item.match && pathname.startsWith(`${item.match}/`))
}

export function AppShell({ role, children }: { role: AppRole; children: ReactNode }) {
  const pathname = usePathname()
  const nav = role === 'teacher' ? teacherNav : studentNav
  const root = role === 'teacher' ? '/teacher' : '/student'

  return (
    <div className="app-shell min-h-screen bg-[#f6f7f9] text-slate-950">
      <ProfileSync role={role} />
      <aside className="app-sidebar fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white xl:flex xl:flex-col">
        <div className="border-b border-slate-100 px-6 py-5">
          <Link href={root} className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-orange-100 bg-orange-50"><Image src="/check-ngan-logo.svg" alt="check-ngan System" fill sizes="44px" className="object-cover" priority /></div>
            <div className="min-w-0"><p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">check-ngan System</p><p className="mt-0.5 text-sm font-black leading-5 text-slate-950">ระบบติดตามงานของนักเรียนและนักศึกษา</p></div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">เมนูหลัก</p>
          <nav className="mt-3 space-y-1">
            {nav.map((item) => {
              const active = isActive(pathname, item, root)
              return <Link key={item.href} href={item.href} className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition ${active ? 'bg-orange-50 text-orange-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[11px] font-black ${active ? 'border-orange-200 bg-white text-orange-700' : 'border-slate-200 bg-white text-slate-400'}`}>{item.icon}</span><span className="min-w-0"><span className="block text-sm font-bold">{item.label}</span><span className="mt-0.5 block truncate text-xs text-slate-400">{item.description}</span></span></Link>
            })}
          </nav>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><UserProfileSummary role={role} compact /><UserButton /></div></div>
          <ThemeToggle />
          <p className="mt-3 px-1 text-[11px] leading-5 text-slate-400">check-ngan System · ระบบติดตามงานของนักเรียนและนักศึกษา</p>
        </div>
      </aside>

      <div className="xl:pl-72">
        <header className="app-header sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3"><Link href={root} className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-orange-100 xl:hidden"><Image src="/check-ngan-logo.svg" alt="check-ngan System" fill sizes="36px" className="object-cover" /></Link><div className="min-w-0"><p className="truncate text-sm font-black text-slate-950">{role === 'teacher' ? 'พื้นที่ทำงานสำหรับอาจารย์' : 'พื้นที่ติดตามงานสำหรับนักเรียน/นักศึกษา'}</p><p className="hidden truncate text-xs text-slate-500 sm:block">{nav.find((item) => isActive(pathname, item, root))?.label ?? 'check-ngan System'}</p></div></div>
            <div className="flex items-center gap-2"><ThemeToggle compact /><span className="hidden h-5 w-px bg-slate-200 sm:block"/><div className="hidden sm:block"><UserProfileSummary role={role} compact /></div><UserButton /></div>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 xl:hidden">{nav.map((item) => { const active = isActive(pathname, item, root); return <Link key={`${item.href}-m`} href={item.href} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${active ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{item.label}</Link> })}</nav>
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
