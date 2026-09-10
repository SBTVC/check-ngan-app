'use client'

import { useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCallback, useEffect, useState } from 'react'
import { Breadcrumbs, EmptyState, PageHeader, SecondaryLink, StatusBadge } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { useSupabase } from '@/lib/supabase/useSupabase'

type Submission = { id: number; assignment_id: number | null; student_id: string | null; content: string | null; file_path: string | null; submitted_at: string | null }
type Assignment = { id: number; title: string; description: string | null; max_score: number; due_date: string | null; teacher_id: string | null }
type Grade = { submission_id: number; score: number; feedback: string | null; graded_at: string | null }

export default function SubmissionDetail() {
  const { id } = useParams<{ id: string }>()
  const submissionId = Number(id)
  const { user, isLoaded } = useUser()
  const supabase = useSupabase()
  const userId = user?.id
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [score, setScore] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId || !submissionId) return
    setLoading(true)
    const sr = await supabase.from('submissions').select('id,assignment_id,student_id,content,file_path,submitted_at').eq('id', submissionId).maybeSingle()
    if (sr.error || !sr.data) { setSubmission(null); setLoading(false); return }
    const s = sr.data as Submission
    setSubmission(s)
    if (!s.assignment_id) { setLoading(false); return }
    const ar = await supabase.from('assignments').select('id,title,description,max_score,due_date,teacher_id').eq('id', s.assignment_id).eq('teacher_id', userId).maybeSingle()
    if (ar.error || !ar.data) { setAssignment(null); setLoading(false); return }
    setAssignment(ar.data as Assignment)
    const gr = await supabase.from('grades').select('submission_id,score,feedback,graded_at').eq('submission_id', submissionId).maybeSingle()
    if (!gr.error && gr.data) {
      const g = gr.data as Grade
      setGrade(g)
      setScore(String(g.score))
      setFeedback(g.feedback ?? '')
    } else {
      setGrade(null)
      setScore('')
      setFeedback('')
    }
    setLoading(false)
  }, [submissionId, supabase, userId])

  useEffect(() => {
    if (!isLoaded || !userId) return
    const t = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(t)
  }, [isLoaded, userId, load])

  useEffect(() => {
    const p = submission?.file_path
    if (!p) {
      const t = window.setTimeout(() => setFileUrl(null), 0)
      return () => window.clearTimeout(t)
    }
    let cancelled = false
    void (async () => {
      const r = await supabase.storage.from('submissions').createSignedUrl(p, 3600)
      if (!cancelled) setFileUrl(r.data?.signedUrl ?? null)
    })()
    return () => { cancelled = true }
  }, [submission?.file_path, supabase])

  async function save() {
    if (!userId || !submission || !assignment) return
    const n = Number(score)
    if (!Number.isFinite(n) || n < 0 || n > Number(assignment.max_score)) return setMessage(`คะแนนต้องอยู่ระหว่าง 0 ถึง ${assignment.max_score}`)
    setSaving(true)
    setMessage('')
    const now = new Date().toISOString()
    const r = await supabase.from('grades').upsert({ submission_id: submission.id, score: n, feedback: feedback.trim() || null, graded_by: userId, graded_at: now, updated_at: now }, { onConflict: 'submission_id' }).select('submission_id,score,feedback,graded_at').single()
    setSaving(false)
    if (r.error) return setMessage(r.error.message)
    setGrade(r.data as Grade)
    setMessage('บันทึกคะแนนเรียบร้อยแล้ว')
  }

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">กำลังเปิดงาน...</div>
  if (!submission || !assignment) return <div className="space-y-5"><SecondaryLink href="/teacher/submissions">← กลับหน้าตรวจงาน</SecondaryLink><EmptyState title="เปิดงานไม่ได้" description="ไม่พบ Submission หรือไม่มีสิทธิ์ตรวจงาน" /></div>

  const studentLabel = submission.student_id || '-'

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'ภาพรวม', href: '/teacher' }, { label: 'ตรวจงาน', href: '/teacher/submissions' }, { label: assignment.title }]} />
        <PageHeader eyebrow={`Submission #${submission.id}`} title={assignment.title} description="ตรวจคำตอบและไฟล์ที่ส่ง แล้วบันทึกคะแนนพร้อมความคิดเห็นให้นักเรียน" actions={<SecondaryLink href="/teacher/submissions">← รายการตรวจงาน</SecondaryLink>} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-700">{studentLabel.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0"><p className="text-xs font-bold text-slate-400">ผู้ส่งงาน</p><p className="mt-1 truncate text-sm font-black text-slate-900">{studentLabel}</p></div>
              </div>
              <StatusBadge tone={grade ? 'green' : 'orange'}>{grade ? 'ตรวจแล้ว' : 'รอการตรวจ'}</StatusBadge>
            </div>
            <dl className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
              <Info label="ส่งเมื่อ" value={formatDateTime(submission.submitted_at)} />
              <Info label="กำหนดส่ง" value={formatDateTime(assignment.due_date)} />
              <Info label="คะแนนเต็ม" value={`${assignment.max_score} คะแนน`} />
              <Info label="ไฟล์แนบ" value={submission.file_path ? 'มีไฟล์' : 'ไม่มีไฟล์'} />
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="text-lg font-black text-slate-950">รายละเอียดโจทย์</h2><p className="mt-1 text-sm text-slate-500">โจทย์ที่นักเรียนได้รับ</p></div>
            <div className="p-5 sm:p-6"><div className="min-h-28 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">{assignment.description || 'ไม่มีรายละเอียด'}</div></div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="text-lg font-black text-slate-950">คำตอบของนักเรียน</h2><p className="mt-1 text-sm text-slate-500">ข้อความและไฟล์ที่แนบมากับ Submission</p></div>
            <div className="space-y-4 p-5 sm:p-6">
              <div className="min-h-28 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">{submission.content || 'ไม่มีข้อความเพิ่มเติม'}</div>
              {fileUrl ? <a href={fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-orange-300 hover:bg-orange-50/50"><div><p className="text-sm font-black text-slate-900">ไฟล์งานที่นักเรียนแนบ</p><p className="mt-1 text-xs text-slate-500">ลิงก์เปิดไฟล์มีอายุจำกัดเพื่อความปลอดภัย</p></div><span className="shrink-0 text-sm font-black text-orange-700">เปิดไฟล์ ↗</span></a> : <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center"><p className="text-sm font-black text-slate-700">ไม่มีไฟล์แนบ</p><p className="mt-1 text-xs text-slate-500">Submission นี้มีเฉพาะข้อความหรือไม่ได้แนบไฟล์</p></div>}
            </div>
          </section>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-24 xl:self-start">
          <div className="border-b border-slate-100 px-5 py-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-orange-600">การให้คะแนน</p><h2 className="mt-1 text-lg font-black text-slate-950">ผลการตรวจ</h2></div>{grade ? <StatusBadge tone="green">บันทึกแล้ว</StatusBadge> : null}</div></div>
          <div className="p-5">
            <label className="block"><span className="text-sm font-black text-slate-800">คะแนน</span><span className="mt-1 block text-xs text-slate-400">กรอกได้ตั้งแต่ 0 ถึง {assignment.max_score}</span><div className="mt-2 flex items-center gap-3"><input type="number" min="0" max={assignment.max_score} value={score} onChange={(e) => setScore(e.target.value)} className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-3 text-lg font-black outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /><span className="text-sm font-bold text-slate-500">/ {assignment.max_score}</span></div></label>
            <label className="mt-5 block"><span className="text-sm font-black text-slate-800">ความคิดเห็น</span><span className="mt-1 block text-xs text-slate-400">คำแนะนำนี้จะแสดงให้นักเรียนเห็น</span><textarea rows={7} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="เขียนข้อเสนอแนะเกี่ยวกับงาน..." className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /></label>
            {message ? <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm font-bold text-orange-700">{message}</div> : null}
            {grade?.graded_at ? <p className="mt-4 text-xs text-slate-400">บันทึกล่าสุด {formatDateTime(grade.graded_at)}</p> : null}
            <button onClick={() => void save()} disabled={saving} className="mt-5 w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-black text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'กำลังบันทึก...' : grade ? 'บันทึกการแก้ไขคะแนน' : 'บันทึกผลการตรวจ'}</button>
          </div>
        </aside>
      </section>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm font-black text-slate-800">{value}</dd></div>
}
