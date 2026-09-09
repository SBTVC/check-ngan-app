'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui'
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
  const studentName = user?.fullName || user?.firstName || 'นักเรียน'

  return <div className="space-y-7">
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 shadow-sm"><Image src="/college-campus.svg" alt="วิทยาลัย" fill sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover opacity-35" priority /><div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-orange-900/40"/><div className="relative grid min-h-[280px] gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-300">Student workspace</p><h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">สวัสดี {studentName}</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">เช็กงานที่ต้องทำ ส่งไฟล์ ติดตามสถานะ และดูคะแนนจากคุณครูได้ในหน้าเดียว</p><div className="mt-5 flex gap-2"><button onClick={() => setFilter('pending')} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-extrabold text-white">ดูงานที่ยังไม่ส่ง</button><button onClick={() => setFilter('graded')} className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-extrabold text-white">ดูคะแนนล่าสุด</button></div></div><div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur"><p className="text-xs font-bold text-white/60">คะแนนเฉลี่ย</p><p className="mt-1 text-4xl font-extrabold">{averageScore == null ? '-' : `${averageScore}%`}</p><p className="mt-2 text-xs text-white/60">ตรวจแล้ว {stats.graded} จาก {stats.all} งาน</p></div></div></section>
    <PageHeader eyebrow="My learning" title="ภาพรวมงานของฉัน" description="กรองงานที่ต้องทำ งานที่ส่งแล้ว และงานที่คุณครูตรวจให้คะแนนแล้ว" actions={<button onClick={() => void loadData()} disabled={loading} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">{loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}</button>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatButton label="งานทั้งหมด" value={stats.all} active={filter==='all'} onClick={() => setFilter('all')} /><StatButton label="ยังไม่ส่ง" value={stats.pending} active={filter==='pending'} onClick={() => setFilter('pending')} tone="orange" /><StatButton label="ส่งแล้ว" value={stats.submitted} active={filter==='submitted'} onClick={() => setFilter('submitted')} tone="blue" /><StatButton label="ตรวจแล้ว" value={stats.graded} active={filter==='graded'} onClick={() => setFilter('graded')} tone="green" /></section>
    {nearestAssignment ? <section className="flex flex-col justify-between gap-4 rounded-3xl border border-orange-200 bg-orange-50 p-5 sm:flex-row sm:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-orange-600">งานใกล้กำหนดส่ง</p><h2 className="mt-2 text-xl font-extrabold">{nearestAssignment.title}</h2><p className="mt-1 text-sm text-slate-600">กำหนดส่ง {formatDateTime(nearestAssignment.due_date)}</p></div><Link href={`/student/assignments/${nearestAssignment.id}`} className="rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-extrabold text-white">เปิดงานและส่งงาน →</Link></section> : null}
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-extrabold">งานที่ได้รับมอบหมาย</h2><p className="mt-1 text-sm text-slate-500">เปิดรายละเอียด แนบไฟล์ และตรวจสอบผลคะแนน</p></div><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="ค้นหางาน..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm sm:w-72"/></div><div className="mt-6">{!loading && filtered.length===0 ? <EmptyState title="ไม่พบงานในหมวดนี้" description="ลองเปลี่ยนตัวกรองหรือคำค้น"/> : <div className="space-y-3">{filtered.map((a)=>{ const s=submissionMap.get(a.id); const g=s?gradeMap.get(s.id):undefined; const overdue=Boolean(!s&&a.due_date&&now!=null&&new Date(a.due_date).getTime()<now); return <Link key={a.id} href={`/student/assignments/${a.id}`} className="group grid gap-4 rounded-2xl border border-slate-200 p-4 hover:border-orange-200 sm:grid-cols-[1fr_auto] sm:items-center"><div className="min-w-0"><div className="flex gap-2">{g?<StatusBadge tone="green">ตรวจแล้ว</StatusBadge>:s?<StatusBadge tone="blue">ส่งแล้ว</StatusBadge>:overdue?<StatusBadge tone="red">เลยกำหนด</StatusBadge>:<StatusBadge tone="orange">ยังไม่ส่ง</StatusBadge>}</div><h3 className="mt-2 truncate font-extrabold group-hover:text-orange-600">{a.title}</h3><p className="mt-1 truncate text-sm text-slate-500">{a.description||'ไม่มีรายละเอียดเพิ่มเติม'}</p><p className="mt-2 text-xs text-slate-400">กำหนดส่ง {formatDateTime(a.due_date)}</p></div><div>{g?<p className="text-2xl font-extrabold text-emerald-700">{g.score} / {a.max_score}</p>:<span className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white">{s?'ดูงานที่ส่ง →':'เปิดงาน →'}</span>}</div></Link>})}</div>}</div></section>
  </div>
}

function StatButton({ label, value, active, onClick, tone='neutral' }: { label:string; value:number; active:boolean; onClick:()=>void; tone?:'neutral'|'orange'|'blue'|'green' }) { const border=tone==='orange'?'border-orange-200':tone==='blue'?'border-blue-200':tone==='green'?'border-emerald-200':'border-slate-200'; return <button onClick={onClick} className={`rounded-2xl border bg-white p-5 text-left shadow-sm ${border} ${active?'ring-2 ring-orange-400 ring-offset-2':''}`}><p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></button> }
