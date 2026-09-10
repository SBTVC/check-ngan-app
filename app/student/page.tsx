'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui'
import { UserProfileSummary } from '@/components/user-profile-summary'
import { formatDateTime, percent } from '@/lib/format'
import { useSupabase } from '@/lib/supabase/useSupabase'

type Assignment = { id: number; title: string; description: string | null; due_date: string | null; max_score: number; class_id: number | null; created_at: string | null }
type Submission = { id: number; assignment_id: number | null; status: string | null; submitted_at: string | null }
type Grade = { submission_id: number; score: number; feedback: string | null; graded_at: string | null }
type Filter = 'all' | 'pending' | 'submitted' | 'graded'

export default function StudentDashboardPage() {
  const { user, isLoaded } = useUser()
  const supabase = useSupabase()
  const userId = user?.id
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [now, setNow] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const assignmentResult = await supabase.from('assignments').select('id,title,description,due_date,max_score,class_id,created_at').order('created_at', { ascending: false })
    if (assignmentResult.error) console.error('assignments:', assignmentResult.error)
    setAssignments((assignmentResult.data ?? []) as Assignment[])
    const submissionResult = await supabase.from('submissions').select('id,assignment_id,status,submitted_at').eq('student_id', userId)
    if (submissionResult.error) console.error('submissions:', submissionResult.error)
    const submissionRows = (submissionResult.data ?? []) as Submission[]
    setSubmissions(submissionRows)
    const ids = submissionRows.map((item) => item.id)
    if (ids.length) {
      const gradeResult = await supabase.from('grades').select('submission_id,score,feedback,graded_at').in('submission_id', ids)
      if (gradeResult.error) console.error('grades:', gradeResult.error)
      setGrades((gradeResult.data ?? []) as Grade[])
    } else setGrades([])
    setLoading(false)
  }, [supabase, userId])

  useEffect(() => { const t = window.setTimeout(() => setNow(Date.now()), 0); const i = window.setInterval(() => setNow(Date.now()), 60000); return () => { window.clearTimeout(t); window.clearInterval(i) } }, [])
  useEffect(() => { if (!isLoaded || !userId) return; const t = window.setTimeout(() => void loadData(), 0); return () => window.clearTimeout(t) }, [isLoaded, userId, loadData])

  const submissionMap = useMemo(() => new Map(submissions.filter((item) => item.assignment_id != null).map((item) => [item.assignment_id as number, item])), [submissions])
  const gradeMap = useMemo(() => new Map(grades.map((item) => [item.submission_id, item])), [grades])
  const stats = useMemo(() => { let pending = 0, submitted = 0, graded = 0; assignments.forEach((a) => { const s = submissionMap.get(a.id); if (!s) pending += 1; else if (gradeMap.has(s.id)) graded += 1; else submitted += 1 }); return { all: assignments.length, pending, submitted, graded } }, [assignments, submissionMap, gradeMap])
  const averageScore = useMemo(() => { const values: number[] = []; assignments.forEach((a) => { const s = submissionMap.get(a.id); const g = s ? gradeMap.get(s.id) : undefined; if (g) values.push(percent(Number(g.score), Number(a.max_score))) }); return values.length ? Math.round(values.reduce((x, y) => x + y, 0) / values.length) : null }, [assignments, submissionMap, gradeMap])
  const nearestAssignment = useMemo(() => { if (now == null) return undefined; return assignments.filter((a) => !submissionMap.has(a.id) && a.due_date && new Date(a.due_date).getTime() >= now).sort((a, b) => new Date(a.due_date as string).getTime() - new Date(b.due_date as string).getTime())[0] }, [assignments, submissionMap, now])
  const filtered = useMemo(() => { const key = query.trim().toLowerCase(); return assignments.filter((a) => { const s = submissionMap.get(a.id); const g = s ? gradeMap.get(s.id) : undefined; const status: Filter = !s ? 'pending' : g ? 'graded' : 'submitted'; if (filter !== 'all' && status !== filter) return false; return !key || `${a.title} ${a.description ?? ''}`.toLowerCase().includes(key) }) }, [assignments, submissionMap, gradeMap, filter, query])
  const studentName = user?.fullName || user?.firstName || 'นักเรียน/นักศึกษา'

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="แดชบอร์ดนักเรียน/นักศึกษา" title={`สวัสดี ${studentName}`} description="ติดตามงานที่ต้องทำ งานที่ส่งแล้ว และผลคะแนนล่าสุดจากอาจารย์" actions={<button onClick={() => void loadData()} disabled={loading} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}</button>} />

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div>
          <UserProfileSummary role="student" />
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-4">
            <MiniMetric label="งานทั้งหมด" value={stats.all} />
            <MiniMetric label="ยังไม่ส่ง" value={stats.pending} emphasis />
            <MiniMetric label="ตรวจแล้ว" value={stats.graded} />
            <MiniMetric label="คะแนนเฉลี่ย" value={averageScore == null ? '-' : `${averageScore}%`} />
          </div>
        </div>

        <div className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${nearestAssignment ? 'border-orange-200 bg-orange-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <p className="text-xs font-bold text-slate-500">งานที่ต้องทำต่อ</p>
          {nearestAssignment ? (
            <>
              <div className="mt-2 flex items-start justify-between gap-4"><div className="min-w-0"><h2 className="truncate text-xl font-black text-slate-950">{nearestAssignment.title}</h2><p className="mt-2 text-sm text-slate-600">กำหนดส่ง {formatDateTime(nearestAssignment.due_date)}</p><p className="mt-1 text-xs text-slate-500">คะแนนเต็ม {nearestAssignment.max_score} คะแนน</p></div><StatusBadge tone="orange">ยังไม่ส่ง</StatusBadge></div>
              <Link href={`/student/assignments/${nearestAssignment.id}`} className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-black text-white hover:bg-orange-700">เปิดงานและส่งงาน →</Link>
            </>
          ) : (
            <div className="mt-4"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-black text-emerald-700">✓</div><h2 className="mt-3 text-lg font-black text-slate-950">ยังไม่มีงานค้างส่ง</h2><p className="mt-1 text-sm text-slate-600">ตอนนี้ไม่มีงานที่ยังไม่ส่งและกำลังใกล้ถึงกำหนด</p></div>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatButton label="งานทั้งหมด" value={stats.all} active={filter === 'all'} onClick={() => setFilter('all')} />
        <StatButton label="ยังไม่ส่ง" value={stats.pending} active={filter === 'pending'} onClick={() => setFilter('pending')} tone="orange" />
        <StatButton label="ส่งแล้ว" value={stats.submitted} active={filter === 'submitted'} onClick={() => setFilter('submitted')} tone="blue" />
        <StatButton label="ตรวจแล้ว" value={stats.graded} active={filter === 'graded'} onClick={() => setFilter('graded')} tone="green" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div><h2 className="text-lg font-black text-slate-950">งานที่ได้รับมอบหมาย</h2><p className="mt-1 text-sm text-slate-500">ค้นหา เปิดรายละเอียด ส่งงาน และตรวจสอบผลคะแนน</p></div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่องาน..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-72" />
            {query ? <button onClick={() => setQuery('')} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">ล้างคำค้น</button> : null}
          </div>
        </div>
        <div className="p-5 sm:p-6">
          {!loading && filtered.length === 0 ? <EmptyState title="ไม่พบงานในหมวดนี้" description="ลองเปลี่ยนตัวกรองหรือคำค้นหา แล้วตรวจสอบอีกครั้ง" /> : (
            <div className="divide-y divide-slate-100">
              {filtered.map((a) => {
                const s = submissionMap.get(a.id)
                const g = s ? gradeMap.get(s.id) : undefined
                const overdue = Boolean(!s && a.due_date && now != null && new Date(a.due_date).getTime() < now)
                return (
                  <Link key={a.id} href={`/student/assignments/${a.id}`} className="group grid gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">{g ? <StatusBadge tone="green">ตรวจแล้ว</StatusBadge> : s ? <StatusBadge tone="blue">ส่งแล้ว</StatusBadge> : overdue ? <StatusBadge tone="red">เลยกำหนด</StatusBadge> : <StatusBadge tone="orange">ยังไม่ส่ง</StatusBadge>}<span className="text-xs text-slate-400">งาน #{a.id}</span></div>
                      <h3 className="mt-2 truncate font-black text-slate-900 group-hover:text-orange-700">{a.title}</h3>
                      <p className="mt-1 truncate text-sm text-slate-500">{a.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                      <p className="mt-2 text-xs text-slate-400">กำหนดส่ง {formatDateTime(a.due_date)} · เต็ม {a.max_score} คะแนน</p>
                    </div>
                    <div className="shrink-0 sm:text-right">{g ? <><p className="text-xs font-bold text-slate-400">คะแนน</p><p className="mt-1 text-xl font-black text-emerald-700">{g.score} / {a.max_score}</p></> : <span className="inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-700 group-hover:border-orange-300 group-hover:text-orange-700">{s ? 'ดูงานที่ส่ง →' : 'เปิดงาน →'}</span>}</div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function MiniMetric({ label, value, emphasis = false }: { label: string; value: string | number; emphasis?: boolean }) {
  return <div><p className="text-xs font-bold text-slate-400">{label}</p><p className={`mt-1 text-xl font-black ${emphasis ? 'text-orange-700' : 'text-slate-950'}`}>{value}</p></div>
}

function StatButton({ label, value, active, onClick, tone = 'neutral' }: { label: string; value: number; active: boolean; onClick: () => void; tone?: 'neutral' | 'orange' | 'blue' | 'green' }) {
  const marker = tone === 'orange' ? 'bg-orange-500' : tone === 'blue' ? 'bg-blue-500' : tone === 'green' ? 'bg-emerald-500' : 'bg-slate-400'
  return <button onClick={onClick} className={`rounded-xl border bg-white p-4 text-left transition ${active ? 'border-orange-300 ring-2 ring-orange-100' : 'border-slate-200 hover:border-slate-300'}`}><div className="flex items-center justify-between"><p className="text-sm font-bold text-slate-600">{label}</p><span className={`h-2.5 w-2.5 rounded-full ${marker}`} /></div><p className="mt-2 text-2xl font-black text-slate-950">{value}</p></button>
}
