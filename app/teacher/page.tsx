'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { EmptyState, PageHeader, PrimaryLink, StatCard, StatusBadge } from '@/components/ui'
import { UserProfileSummary } from '@/components/user-profile-summary'
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
  const waiting = useMemo(() => submissions.filter((item) => !gradedIds.has(item.id)), [submissions, gradedIds])
  const waitingCount = waiting.length
  const teacherName = user?.fullName || user?.firstName || 'คุณครู'

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="แดชบอร์ดอาจารย์"
        title={`สวัสดี ${teacherName}`}
        description="ภาพรวมการติดตามงานของนักเรียนและนักศึกษา พร้อมรายการที่ต้องตรวจและงานล่าสุด"
        actions={
          <>
            <button type="button" onClick={() => void loadDashboard()} disabled={loading} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">
              {loading ? 'กำลังอัปเดต...' : 'รีเฟรชข้อมูล'}
            </button>
            <PrimaryLink href="/teacher/assignments/new">+ มอบหมายงาน</PrimaryLink>
          </>
        }
      />

      <section className="grid gap-5 xl:grid-cols-[1.55fr_.45fr]">
        <UserProfileSummary role="teacher" />
        <div className={`rounded-2xl border p-5 shadow-sm ${waitingCount > 0 ? 'border-orange-200 bg-orange-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-500">งานที่ต้องจัดการ</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{waitingCount}</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{waitingCount > 0 ? 'งานกำลังรอตรวจ' : 'ไม่มีงานค้างตรวจ'}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-current/10 bg-white/70 text-lg">{waitingCount > 0 ? '!' : '✓'}</span>
          </div>
          <Link href="/teacher/submissions" className="mt-4 inline-flex text-sm font-black text-orange-700 hover:underline">เปิดรายการตรวจงาน →</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="งานที่มอบหมาย" value={assignments.length} note="งานทั้งหมดที่สร้างไว้" />
        <StatCard label="งานที่ส่งเข้ามา" value={submissions.length} note="รายการส่งงานทั้งหมด" tone="blue" />
        <StatCard label="รอตรวจ" value={waitingCount} note="ยังไม่มีผลคะแนน" tone="orange" />
        <StatCard label="ตรวจแล้ว" value={grades.length} note="มีผลคะแนนในระบบ" tone="green" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div><h2 className="text-lg font-black text-slate-950">งานล่าสุด</h2><p className="mt-1 text-sm text-slate-500">งานที่สร้างล่าสุด เรียงตามวันที่สร้าง</p></div>
            <Link href="/teacher/assignments" className="text-sm font-black text-orange-700 hover:underline">ดูทั้งหมด</Link>
          </div>
          <div className="p-5 sm:p-6">
            {assignments.length === 0 ? (
              <EmptyState title="ยังไม่มีงานที่มอบหมาย" description="สร้างงานแรกเพื่อเริ่มติดตามงานในระบบ" action={<PrimaryLink href="/teacher/assignments/new">+ สร้างงานใหม่</PrimaryLink>} />
            ) : (
              <div className="divide-y divide-slate-100">
                {assignments.slice(0, 5).map((assignment) => (
                  <Link key={assignment.id} href={`/teacher/assignments/${assignment.id}`} className="group grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><StatusBadge tone="orange">มอบหมายแล้ว</StatusBadge><span className="text-xs text-slate-400">งาน #{assignment.id}</span></div>
                      <h3 className="mt-2 truncate font-black text-slate-900 group-hover:text-orange-700">{assignment.title}</h3>
                      <p className="mt-1 truncate text-sm text-slate-500">{assignment.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                    </div>
                    <div className="shrink-0 sm:text-right"><p className="text-xs font-bold text-slate-400">กำหนดส่ง</p><p className="mt-1 text-sm font-bold text-slate-700">{formatDateTime(assignment.due_date)}</p><p className="mt-1 text-xs text-slate-400">เต็ม {assignment.max_score} คะแนน</p></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-black text-slate-950">งานที่รอตรวจ</h2><p className="mt-1 text-sm text-slate-500">รายการล่าสุดที่ควรจัดการต่อ</p></div><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-black text-orange-700">{waitingCount}</span></div>
          <div className="p-5 sm:p-6">
            {waiting.length === 0 ? (
              <div className="py-6 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-lg font-black text-emerald-700">✓</div><h3 className="mt-3 font-black text-slate-900">ตรวจงานครบแล้ว</h3><p className="mt-1 text-sm text-slate-500">ตอนนี้ไม่มีงานที่รอการตรวจ</p></div>
            ) : (
              <div className="space-y-2">
                {waiting.slice(0, 5).map((submission) => (
                  <Link key={submission.id} href={`/teacher/submissions/${submission.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-orange-200 hover:bg-orange-50/50">
                    <div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{submission.title || `งานส่ง #${submission.id}`}</p><p className="mt-1 text-xs text-slate-500">ส่งเมื่อ {formatDateTime(submission.submitted_at)}</p></div>
                    <span className="shrink-0 text-sm font-black text-orange-700">ตรวจ →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
