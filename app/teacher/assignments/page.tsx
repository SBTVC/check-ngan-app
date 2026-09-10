'use client'

import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Breadcrumbs, EmptyState, PageHeader, PrimaryLink, StatCard, StatusBadge } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { useSupabase } from '@/lib/supabase/useSupabase'

type Assignment = { id: number; title: string; description: string | null; due_date: string | null; max_score: number; class_id: number | null; created_at: string | null }
type Submission = { id: number; assignment_id: number | null }

export default function TeacherAssignmentsPage() {
  const { user, isLoaded } = useUser()
  const supabase = useSupabase()
  const userId = user?.id
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const loadData = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError('')
    const a = await supabase.from('assignments').select('id,title,description,due_date,max_score,class_id,created_at').eq('teacher_id', userId).order('created_at', { ascending: false })
    if (a.error) { setError(a.error.message); setLoading(false); return }
    const rows = (a.data ?? []) as Assignment[]
    setAssignments(rows)
    const ids = rows.map((x) => x.id)
    if (ids.length) {
      const s = await supabase.from('submissions').select('id,assignment_id').in('assignment_id', ids)
      if (!s.error) setSubmissions((s.data ?? []) as Submission[])
    } else setSubmissions([])
    setLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    if (!isLoaded || !userId) return
    const t = window.setTimeout(() => void loadData(), 0)
    return () => window.clearTimeout(t)
  }, [isLoaded, userId, loadData])

  const count = useMemo(() => {
    const m = new Map<number, number>()
    submissions.forEach((s) => { if (s.assignment_id != null) m.set(s.assignment_id, (m.get(s.assignment_id) ?? 0) + 1) })
    return m
  }, [submissions])

  const filtered = useMemo(() => {
    const k = query.trim().toLowerCase()
    return !k ? assignments : assignments.filter((a) => `${a.title} ${a.description ?? ''}`.toLowerCase().includes(k))
  }, [assignments, query])

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'ภาพรวม', href: '/teacher' }, { label: 'งานที่มอบหมาย' }]} />
        <PageHeader eyebrow="การจัดการงาน" title="งานที่มอบหมาย" description="ค้นหาและติดตามงานที่สร้างไว้ พร้อมเปิดดูรายละเอียดหรือไปยังหน้าตรวจงานของแต่ละชิ้น" actions={<><button onClick={() => void loadData()} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">{loading ? 'กำลังโหลด...' : 'รีเฟรช'}</button><PrimaryLink href="/teacher/assignments/new">+ มอบหมายงาน</PrimaryLink></>} />
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="งานทั้งหมด" value={assignments.length} note="งานที่สร้างด้วยบัญชีนี้" />
        <StatCard label="การส่งงาน" value={submissions.length} note="Submission ที่เชื่อมกับงานของคุณ" tone="blue" />
        <StatCard label="งานล่าสุด" value={assignments.length ? `#${assignments[0].id}` : '-'} note={assignments[0]?.title ?? 'ยังไม่มีงาน'} tone="orange" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div><h2 className="text-lg font-black text-slate-950">รายการงาน</h2><p className="mt-1 text-sm text-slate-500">แสดง {filtered.length} จาก {assignments.length} งาน</p></div>
          <div className="flex w-full gap-2 sm:w-auto">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่องาน..." className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-80" />
            {query ? <button onClick={() => setQuery('')} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">ล้าง</button> : null}
          </div>
        </div>

        {error ? <div className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 sm:mx-6">{error}</div> : null}

        <div className="p-5 sm:p-6">
          {!loading && filtered.length === 0 ? (
            <EmptyState title="ยังไม่มีงานในรายการ" description={query ? 'ไม่พบงานที่ตรงกับคำค้น ลองใช้คำอื่น' : 'สร้างงานแรกเพื่อเริ่มใช้งานระบบ'} action={!query ? <PrimaryLink href="/teacher/assignments/new">+ สร้างงาน</PrimaryLink> : undefined} />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="hidden grid-cols-[minmax(0,1fr)_180px_110px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 lg:grid">
                <span>งาน</span><span>กำหนดส่ง</span><span>ส่งแล้ว</span><span className="text-right">การจัดการ</span>
              </div>
              <div className="divide-y divide-slate-100">
                {filtered.map((a) => (
                  <article key={a.id} className="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_180px_110px_150px] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><StatusBadge tone="orange">มอบหมายแล้ว</StatusBadge><span className="text-xs text-slate-400">งาน #{a.id}</span></div>
                      <h3 className="mt-2 truncate font-black text-slate-900">{a.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{a.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
                      <p className="mt-2 text-xs text-slate-400 lg:hidden">คะแนนเต็ม {a.max_score}</p>
                    </div>
                    <div><p className="text-xs font-bold text-slate-400 lg:hidden">กำหนดส่ง</p><p className="mt-1 text-sm font-bold text-slate-700 lg:mt-0">{formatDateTime(a.due_date)}</p><p className="mt-1 text-xs text-slate-400">เต็ม {a.max_score} คะแนน</p></div>
                    <div><p className="text-xs font-bold text-slate-400 lg:hidden">ส่งแล้ว</p><p className="mt-1 text-sm font-black text-slate-900 lg:mt-0">{count.get(a.id) ?? 0} งาน</p></div>
                    <div className="flex gap-2 lg:justify-end"><Link href={`/teacher/assignments/${a.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">รายละเอียด</Link><Link href={`/teacher/submissions?assignment=${a.id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800">ตรวจงาน</Link></div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
