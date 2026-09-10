'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'
import { Breadcrumbs, EmptyState, PageHeader, SecondaryLink, StatCard, StatusBadge } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { useSupabase } from '@/lib/supabase/useSupabase'

type Assignment = { id: number; title: string; description: string | null; due_date: string | null; max_score: number; class_id: number | null; file_path: string | null; created_at: string | null; updated_at: string | null }
type ClassRow = { id: number; name: string; subject: string | null }
type Submission = { id: number; student_id: string | null; submitted_at: string | null }

export default function Page() {
  const { id } = useParams<{ id: string }>()
  const assignmentId = Number(id)
  const { user, isLoaded } = useUser()
  const supabase = useSupabase()
  const userId = user?.id
  const [a, setA] = useState<Assignment | null>(null)
  const [c, setC] = useState<ClassRow | null>(null)
  const [subs, setSubs] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!userId || !assignmentId) return
    setLoading(true)
    const r = await supabase.from('assignments').select('id,title,description,due_date,max_score,class_id,file_path,created_at,updated_at').eq('id', assignmentId).eq('teacher_id', userId).maybeSingle()
    if (r.error || !r.data) { setError(r.error?.message || 'ไม่พบงาน'); setLoading(false); return }
    const row = r.data as Assignment
    setA(row)
    if (row.class_id) {
      const cr = await supabase.from('classes').select('id,name,subject').eq('id', row.class_id).maybeSingle()
      if (!cr.error) setC((cr.data as ClassRow | null) ?? null)
    }
    const sr = await supabase.from('submissions').select('id,student_id,submitted_at').eq('assignment_id', assignmentId).order('submitted_at', { ascending: false })
    if (!sr.error) setSubs((sr.data ?? []) as Submission[])
    setLoading(false)
  }, [assignmentId, supabase, userId])

  useEffect(() => {
    if (!isLoaded || !userId) return
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [isLoaded, userId, load])

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">กำลังโหลดรายละเอียดงาน...</div>
  if (!a) return <div className="space-y-5"><SecondaryLink href="/teacher/assignments">← กลับรายการงาน</SecondaryLink><EmptyState title="เปิดงานไม่ได้" description={error} /></div>

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'ภาพรวม', href: '/teacher' }, { label: 'งานที่มอบหมาย', href: '/teacher/assignments' }, { label: a.title }]} />
        <PageHeader eyebrow={`งาน #${a.id}`} title={a.title} description="รายละเอียดโจทย์ ข้อมูลกำหนดส่ง และภาพรวมการส่งงานของนักเรียน" actions={<><SecondaryLink href="/teacher/assignments">← รายการงาน</SecondaryLink><Link href={`/teacher/submissions?assignment=${a.id}`} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">ตรวจงานนี้</Link></>} />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="คะแนนเต็ม" value={a.max_score} note="คะแนนสูงสุดของงานนี้" />
        <StatCard label="การส่งงาน" value={subs.length} note="Submission ที่ได้รับ" tone="blue" />
        <StatCard label="ห้องเรียน" value={c?.name ?? (a.class_id ? `#${a.class_id}` : '-')} note={c?.subject || 'ไม่มีรายวิชาระบุ'} tone="orange" />
        <StatCard label="กำหนดส่ง" value={a.due_date ? new Date(a.due_date).toLocaleDateString('th-TH') : '-'} note={formatDateTime(a.due_date)} tone="green" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-black text-slate-950">รายละเอียดโจทย์</h2><p className="mt-1 text-sm text-slate-500">เนื้อหาที่นักเรียนเห็นในหน้างาน</p></div><StatusBadge tone="orange">มอบหมายแล้ว</StatusBadge></div>
          <div className="p-5 sm:p-6">
            <div className="min-h-32 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">{a.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</div>
            <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
              <Info label="สร้างเมื่อ" value={formatDateTime(a.created_at)} />
              <Info label="แก้ไขล่าสุด" value={formatDateTime(a.updated_at)} />
              <Info label="ห้องเรียน" value={c ? `${c.name}${c.subject ? ` • ${c.subject}` : ''}` : '-'} />
              <Info label="ไฟล์ประกอบ" value={a.file_path ? 'มีไฟล์แนบ' : 'ไม่ได้แนบไฟล์'} />
            </dl>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-lg font-black text-slate-950">การส่งงาน</h2><p className="mt-1 text-sm text-slate-500">สถานะล่าสุดของงานชิ้นนี้</p></div>
            <div className="p-5"><p className="text-4xl font-black text-slate-950">{subs.length}</p><p className="mt-1 text-sm text-slate-500">Submission ที่ส่งเข้ามา</p><Link href={`/teacher/submissions?assignment=${a.id}`} className="mt-5 inline-flex rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-black text-white hover:bg-orange-700">เปิดหน้าตรวจงาน →</Link></div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-black text-slate-900">ข้อมูลสำหรับนักเรียน</p><div className="mt-4 space-y-3 text-sm"><Info label="กำหนดส่ง" value={formatDateTime(a.due_date)} /><Info label="คะแนนเต็ม" value={`${a.max_score} คะแนน`} /><Info label="ห้อง" value={c?.name || '-'} /></div></div>
        </aside>
      </section>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold text-slate-400">{label}</dt><dd className="mt-1 text-sm font-black text-slate-800">{value}</dd></div>
}
