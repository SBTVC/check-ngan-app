'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { EmptyState, PageHeader, PrimaryLink, StatCard, StatusBadge } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { useSupabase } from '@/lib/supabase/useSupabase'

type Assignment = { id: number; title: string; description: string | null; due_date: string | null; max_score: number; created_at: string | null }
type Submission = { id: number; assignment_id: number | null; title: string | null; submitted_at: string | null }
type Grade = { submission_id: number; score: number }

export default function TeacherDashboardPage() {
  const { user, isLoaded } = useUser()
  const supabase = useSupabase()
  const userId = user?.id
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const assignmentResult = await supabase.from('assignments').select('id,title,description,due_date,max_score,created_at').eq('teacher_id', userId).order('created_at', { ascending: false })
    if (assignmentResult.error) console.error('assignments:', assignmentResult.error)
    const assignmentRows = (assignmentResult.data ?? []) as Assignment[]
    setAssignments(assignmentRows)
    const ids = assignmentRows.map((item) => item.id)
    if (!ids.length) { setSubmissions([]); setGrades([]); setLoading(false); return }
    const submissionResult = await supabase.from('submissions').select('id,assignment_id,title,submitted_at').in('assignment_id', ids).order('submitted_at', { ascending: false })
    if (submissionResult.error) console.error('submissions:', submissionResult.error)
    const submissionRows = (submissionResult.data ?? []) as Submission[]
    setSubmissions(submissionRows)
    const submissionIds = submissionRows.map((item) => item.id)
    if (submissionIds.length) {
      const gradeResult = await supabase.from('grades').select('submission_id,score').in('submission_id', submissionIds)
      if (gradeResult.error) console.error('grades:', gradeResult.error)
      setGrades((gradeResult.data ?? []) as Grade[])
    } else setGrades([])
    setLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    if (!isLoaded || !userId) return
    const timeout = window.setTimeout(() => void loadDashboard(), 0)
    return () => window.clearTimeout(timeout)
  }, [isLoaded, userId, loadDashboard])

  const gradedIds = useMemo(() => new Set(grades.map((item) => item.submission_id)), [grades])
  const waitingCount = submissions.filter((item) => !gradedIds.has(item.id)).length
  const teacherName = user?.fullName || user?.firstName || 'คุณครู'

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-sm">
        <Image src="/college-campus.svg" alt="วิทยาลัย" fill sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover opacity-55" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-orange-900/35" />
        <div className="relative grid min-h-[330px] gap-8 p-6 sm:p-8 lg:grid-cols-[1.3fr_.7fr] lg:items-center lg:p-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3"><div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-white"><Image src="/check-ngan-logo.svg" alt="Check Ngan" fill sizes="56px" className="object-cover" /></div><div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-orange-300">Teacher workspace</p><p className="mt-1 text-sm font-bold text-white/80">Check Ngan • ระบบจัดการงานการเรียน</p></div></div>
            <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">สวัสดี {teacherName}<span className="block text-orange-300">จัดการงานในชั้นเรียนได้จากจอเดียว</span></h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">มอบหมายงาน ติดตามการส่ง ตรวจไฟล์ และให้คะแนนนักเรียน พร้อมสรุปสถานะล่าสุดแบบเป็นระบบ</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href="/teacher/assignments/new" className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white hover:bg-orange-400">+ มอบหมายงานใหม่</Link><Link href="/teacher/submissions" className="rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-extrabold text-white backdrop-blur hover:bg-white/20">ตรวจงานนักเรียน</Link></div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md"><p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-200">สรุปวันนี้</p><div className="mt-4 grid grid-cols-2 gap-3"><HeroMetric label="งานทั้งหมด" value={assignments.length} /><HeroMetric label="งานที่ส่ง" value={submissions.length} /><HeroMetric label="รอตรวจ" value={waitingCount} /><HeroMetric label="ตรวจแล้ว" value={grades.length} /></div><button type="button" onClick={() => void loadDashboard()} disabled={loading} className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-slate-900 hover:bg-orange-50 disabled:opacity-60">{loading ? 'กำลังอัปเดต...' : 'อัปเดตข้อมูลล่าสุด'}</button></div>
        </div>
      </section>

      <PageHeader eyebrow="Workspace overview" title="ภาพรวมการเรียนการสอน" description="ข้อมูลสำคัญที่ช่วยให้คุณครูเห็นว่างานไหนถูกสร้างแล้ว งานไหนถูกส่ง และงานใดกำลังรอตรวจ" />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="งานที่มอบหมาย" value={assignments.length} note="งานทั้งหมดของบัญชีคุณครู" /><StatCard label="นักเรียนส่งงาน" value={submissions.length} note="Submission ที่ได้รับทั้งหมด" tone="blue" /><StatCard label="รอตรวจ" value={waitingCount} note="ควรตรวจและให้คะแนน" tone="orange" /><StatCard label="ตรวจเสร็จแล้ว" value={grades.length} note="มีผลคะแนนในระบบ" tone="green" /></section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-extrabold">งานล่าสุด</h2><p className="mt-1 text-sm text-slate-500">รายการงานที่คุณครูสร้างล่าสุด</p></div><Link href="/teacher/assignments" className="text-sm font-extrabold text-orange-600 hover:underline">ดูทั้งหมด →</Link></div>
          <div className="mt-5">{assignments.length === 0 ? <EmptyState title="ยังไม่มีงานที่มอบหมาย" description="สร้างงานแรกเพื่อเริ่มใช้งานระบบ" action={<PrimaryLink href="/teacher/assignments/new">+ สร้างงานใหม่</PrimaryLink>} /> : <div className="divide-y divide-slate-100">{assignments.slice(0, 5).map((assignment) => <Link key={assignment.id} href={`/teacher/assignments/${assignment.id}`} className="group flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><StatusBadge tone="orange">งานที่มอบหมาย</StatusBadge><span className="text-xs text-slate-400">#{assignment.id}</span></div><h3 className="mt-2 truncate font-extrabold group-hover:text-orange-600">{assignment.title}</h3><p className="mt-1 truncate text-sm text-slate-500">{assignment.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p></div><div className="shrink-0 sm:text-right"><p className="text-xs font-bold text-slate-400">กำหนดส่ง</p><p className="mt-1 text-sm font-bold text-slate-700">{formatDateTime(assignment.due_date)}</p></div></Link>)}</div>}</div>
        </div>
        <div className="space-y-4"><div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm"><p className="text-xs font-extrabold uppercase tracking-[0.15em] text-orange-600">Priority</p><p className="mt-3 text-4xl font-extrabold">{waitingCount}</p><h2 className="mt-1 text-lg font-extrabold">งานกำลังรอการตรวจ</h2><p className="mt-2 text-sm leading-6 text-slate-600">ตรวจไฟล์ ให้คะแนน และส่งความคิดเห็นกลับให้นักเรียน</p><Link href="/teacher/submissions" className="mt-5 inline-flex rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-orange-600">ไปหน้าตรวจงาน →</Link></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-extrabold uppercase tracking-[0.15em] text-slate-400">Quick action</p><h2 className="mt-3 text-xl font-extrabold">พร้อมสร้างงานใหม่?</h2><p className="mt-2 text-sm leading-6 text-slate-500">กำหนดหัวข้อ รายละเอียด ห้องเรียน วันส่ง และคะแนนเต็มได้ในแบบฟอร์มเดียว</p><div className="mt-5"><PrimaryLink href="/teacher/assignments/new">+ มอบหมายงาน</PrimaryLink></div></div></div>
      </section>
    </div>
  )
}

function HeroMetric({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3"><p className="text-xs font-semibold text-white/65">{label}</p><p className="mt-1 text-2xl font-extrabold">{value}</p></div> }
