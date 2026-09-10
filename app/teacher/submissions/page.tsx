'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Breadcrumbs, EmptyState, PageHeader, StatCard, StatusBadge } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { useSupabase } from '@/lib/supabase/useSupabase'

type Assignment = { id: number; title: string; max_score: number }
type Submission = { id: number; assignment_id: number | null; student_id: string | null; content: string | null; file_path: string | null; submitted_at: string | null }
type Grade = { submission_id: number; score: number; feedback: string | null }

export default function TeacherSubmissionsPage() {
  const { user, isLoaded } = useUser()
  const supabase = useSupabase()
  const userId = user?.id
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'waiting' | 'graded'>('all')
  const [assignmentFilter, setAssignmentFilter] = useState('')

  const loadData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const ar = await supabase.from('assignments').select('id,title,max_score').eq('teacher_id', userId).order('created_at', { ascending: false })
    if (ar.error) { console.error(ar.error); setLoading(false); return }
    const arows = (ar.data ?? []) as Assignment[]
    setAssignments(arows)
    const ids = arows.map((a) => a.id)
    if (!ids.length) { setSubmissions([]); setGrades([]); setLoading(false); return }
    const sr = await supabase.from('submissions').select('id,assignment_id,student_id,content,file_path,submitted_at').in('assignment_id', ids).order('submitted_at', { ascending: false })
    if (sr.error) console.error(sr.error)
    const srows = (sr.data ?? []) as Submission[]
    setSubmissions(srows)
    const sids = srows.map((s) => s.id)
    if (sids.length) {
      const gr = await supabase.from('grades').select('submission_id,score,feedback').in('submission_id', sids)
      if (gr.error) console.error(gr.error)
      setGrades((gr.data ?? []) as Grade[])
    } else setGrades([])
    setLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    if (!isLoaded || !userId) return
    const t = window.setTimeout(() => void loadData(), 0)
    return () => window.clearTimeout(t)
  }, [isLoaded, userId, loadData])

  useEffect(() => {
    if (!userId) return
    const channel = supabase.channel(`teacher-submissions-${userId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, () => void loadData()).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [supabase, userId, loadData])

  const amap = useMemo(() => new Map(assignments.map((a) => [a.id, a])), [assignments])
  const gmap = useMemo(() => new Map(grades.map((g) => [g.submission_id, g])), [grades])
  const waiting = submissions.filter((s) => !gmap.has(s.id)).length
  const filtered = useMemo(() => {
    const k = query.trim().toLowerCase()
    return submissions.filter((s) => {
      const a = s.assignment_id ? amap.get(s.assignment_id) : undefined
      const g = gmap.get(s.id)
      if (filter === 'waiting' && g) return false
      if (filter === 'graded' && !g) return false
      if (assignmentFilter && String(s.assignment_id ?? '') !== assignmentFilter) return false
      if (k && !`${a?.title ?? ''} ${s.student_id ?? ''}`.toLowerCase().includes(k)) return false
      return true
    })
  }, [submissions, amap, gmap, filter, assignmentFilter, query])

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'ภาพรวม', href: '/teacher' }, { label: 'ตรวจงาน' }]} />
        <PageHeader eyebrow="กล่องงานที่ส่ง" title="ตรวจงานนักเรียน" description="ค้นหา กรอง และเปิดตรวจ Submission ที่นักเรียนส่งเข้ามา พร้อมติดตามว่างานใดตรวจแล้วหรือยัง" actions={<button onClick={() => void loadData()} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">{loading ? 'กำลังโหลด...' : 'รีเฟรช'}</button>} />
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="ส่งทั้งหมด" value={submissions.length} note="Submission ทั้งหมดของงานคุณ" />
        <StatCard label="รอตรวจ" value={waiting} note="ยังไม่มีผลคะแนน" tone="orange" />
        <StatCard label="ตรวจแล้ว" value={grades.length} note="มีคะแนนหรือความคิดเห็นแล้ว" tone="green" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="grid gap-3 lg:grid-cols-[1fr_240px_auto]">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่องานหรือรหัสนักเรียน..." className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            <select value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
              <option value="">ทุกงาน</option>
              {assignments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {(['all', 'waiting', 'graded'] as const).map((v) => <button key={v} onClick={() => setFilter(v)} className={`rounded-md px-3 py-2 text-xs font-black transition ${filter === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{v === 'all' ? 'ทั้งหมด' : v === 'waiting' ? 'รอตรวจ' : 'ตรวจแล้ว'}</button>)}
            </div>
          </div>
          {(query || assignmentFilter || filter !== 'all') ? <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500"><span>พบ {filtered.length} รายการ</span><button onClick={() => { setQuery(''); setAssignmentFilter(''); setFilter('all') }} className="font-bold text-orange-700 hover:underline">ล้างตัวกรอง</button></div> : null}
        </div>

        <div className="p-5 sm:p-6">
          {!loading && filtered.length === 0 ? (
            <EmptyState title="ยังไม่มีงานในรายการนี้" description="เมื่อนักเรียนส่งงานเข้ามา ระบบจะแสดงที่นี่อัตโนมัติ" />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="hidden grid-cols-[minmax(0,1fr)_220px_160px_120px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 lg:grid"><span>งาน</span><span>นักเรียน</span><span>ส่งเมื่อ</span><span className="text-right">สถานะ</span></div>
              <div className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const a = s.assignment_id ? amap.get(s.assignment_id) : undefined
                  const g = gmap.get(s.id)
                  const studentLabel = s.student_id || '-'
                  return (
                    <Link key={s.id} href={`/teacher/submissions/${s.id}`} className="group grid gap-4 px-4 py-4 transition hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_220px_160px_120px] lg:items-center">
                      <div className="min-w-0"><div className="flex flex-wrap gap-2"><StatusBadge tone={g ? 'green' : 'orange'}>{g ? 'ตรวจแล้ว' : 'รอตรวจ'}</StatusBadge>{s.file_path ? <StatusBadge tone="blue">มีไฟล์แนบ</StatusBadge> : null}</div><h3 className="mt-2 truncate font-black text-slate-900 group-hover:text-orange-700">{a?.title || `งาน #${s.assignment_id ?? '-'}`}</h3><p className="mt-1 line-clamp-1 text-sm text-slate-500 lg:hidden">นักเรียน: {studentLabel}</p></div>
                      <div className="min-w-0"><p className="text-xs font-bold text-slate-400 lg:hidden">นักเรียน</p><div className="mt-1 flex items-center gap-2 lg:mt-0"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-black text-orange-700">{studentLabel.slice(0, 1).toUpperCase()}</span><span className="truncate text-sm font-bold text-slate-700">{studentLabel}</span></div></div>
                      <div><p className="text-xs font-bold text-slate-400 lg:hidden">ส่งเมื่อ</p><p className="mt-1 text-sm font-bold text-slate-700 lg:mt-0">{formatDateTime(s.submitted_at)}</p></div>
                      <div className="lg:text-right">{g ? <><p className="text-xs font-bold text-slate-400">คะแนน</p><p className="mt-1 text-lg font-black text-emerald-700">{g.score} / {a?.max_score ?? '-'}</p></> : <span className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-black text-white group-hover:bg-orange-600">เปิดตรวจ →</span>}</div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
