'use client'

import { useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Breadcrumbs, EmptyState, PageHeader, SecondaryLink, StatusBadge } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { useSupabase } from '@/lib/supabase/useSupabase'

type Assignment = { id: number; title: string; description: string | null; due_date: string | null; max_score: number; file_path: string | null }
type Submission = { id: number; assignment_id: number | null; student_id: string | null; status: string | null; content: string | null; file_path: string | null; submitted_at: string | null }
type Grade = { submission_id: number; score: number; feedback: string | null; graded_at: string | null }
const MAX = 20 * 1024 * 1024
const EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip']

export default function StudentAssignmentPage() {
  const { id } = useParams<{ id: string }>()
  const assignmentId = Number(id)
  const { user, isLoaded } = useUser()
  const supabase = useSupabase()
  const userId = user?.id
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorTone, setErrorTone] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId || !assignmentId) return
    setLoading(true)
    const ar = await supabase.from('assignments').select('id,title,description,due_date,max_score,file_path').eq('id', assignmentId).maybeSingle()
    if (ar.error || !ar.data) { setAssignment(null); setLoading(false); return }
    setAssignment(ar.data as Assignment)
    const sr = await supabase.from('submissions').select('id,assignment_id,student_id,status,content,file_path,submitted_at').eq('assignment_id', assignmentId).eq('student_id', userId).maybeSingle()
    if (sr.error) console.error(sr.error)
    const s = (sr.data as Submission | null) ?? null
    setSubmission(s)
    setContent(s?.content ?? '')
    if (s) {
      const gr = await supabase.from('grades').select('submission_id,score,feedback,graded_at').eq('submission_id', s.id).maybeSingle()
      if (!gr.error) setGrade((gr.data as Grade | null) ?? null)
    } else setGrade(null)
    setLoading(false)
  }, [assignmentId, supabase, userId])

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

  function choose(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage('')
    const f = e.target.files?.[0]
    if (!f) { setFile(null); return }
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!ext || !EXT.includes(ext)) { e.target.value = ''; setFile(null); setErrorTone(true); setMessage('ชนิดไฟล์ไม่รองรับ'); return }
    if (f.size > MAX) { e.target.value = ''; setFile(null); setErrorTone(true); setMessage('ไฟล์มีขนาดใหญ่เกิน 20 MB'); return }
    setFile(f)
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!userId || !assignment) return
    if (!file && !submission?.file_path && !content.trim()) { setErrorTone(true); setMessage('กรุณาแนบไฟล์หรือพิมพ์ข้อความก่อนส่งงาน'); return }
    setSaving(true)
    setMessage('')
    let path = submission?.file_path ?? null
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'file'
      const safe = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50)
      const newPath = `${userId}/${assignmentId}/${crypto.randomUUID()}-${safe}.${ext}`
      const up = await supabase.storage.from('submissions').upload(newPath, file, { upsert: false, cacheControl: '3600' })
      if (up.error) { setSaving(false); setErrorTone(true); setMessage(up.error.message); return }
      path = newPath
    }
    const now = new Date().toISOString()
    if (submission) {
      const r = await supabase.from('submissions').update({ content: content.trim() || null, file_path: path, status: 'submitted', submitted_at: now, updated_at: now }).eq('id', submission.id).select('id,assignment_id,student_id,status,content,file_path,submitted_at').single()
      setSaving(false)
      if (r.error) { setErrorTone(true); setMessage(r.error.message); return }
      setSubmission(r.data as Submission)
      setFile(null)
      setErrorTone(false)
      setMessage('ส่งงานใหม่เรียบร้อยแล้ว')
      return
    }
    const r = await supabase.from('submissions').insert({ assignment_id: assignment.id, student_id: userId, status: 'submitted', title: assignment.title, detail: content.trim() || null, content: content.trim() || null, file_path: path, submitted_at: now, updated_at: now }).select('id,assignment_id,student_id,status,content,file_path,submitted_at').single()
    setSaving(false)
    if (r.error) { setErrorTone(true); setMessage(r.error.message); return }
    setSubmission(r.data as Submission)
    setFile(null)
    setErrorTone(false)
    setMessage('ส่งงานเรียบร้อยแล้ว')
  }

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm font-bold text-slate-500 shadow-sm">กำลังเปิดงาน...</div>
  if (!assignment) return <div className="space-y-5"><SecondaryLink href="/student">← กลับหน้างานของฉัน</SecondaryLink><EmptyState title="เปิดงานไม่ได้" description="ไม่พบงานหรือไม่มีสิทธิ์เข้าถึง" /></div>

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'ภาพรวม', href: '/student' }, { label: 'งานของฉัน', href: '/student' }, { label: assignment.title }]} />
        <PageHeader eyebrow={`งาน #${assignment.id}`} title={assignment.title} description="อ่านรายละเอียดงาน ตรวจสอบกำหนดส่ง และส่งไฟล์หรือข้อความให้คุณครู" actions={<SecondaryLink href="/student">← งานของฉัน</SecondaryLink>} />
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div><h2 className="text-lg font-black text-slate-950">รายละเอียดงาน</h2><p className="mt-1 text-sm text-slate-500">ข้อมูลที่คุณครูมอบหมาย</p></div>
              {grade ? <StatusBadge tone="green">ตรวจแล้ว</StatusBadge> : submission ? <StatusBadge tone="blue">ส่งแล้ว</StatusBadge> : <StatusBadge tone="orange">ยังไม่ส่ง</StatusBadge>}
            </div>
            <div className="p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2"><InfoBox label="กำหนดส่ง" value={formatDateTime(assignment.due_date)} /><InfoBox label="คะแนนเต็ม" value={`${assignment.max_score} คะแนน`} /></div>
              <div className="mt-5"><p className="text-sm font-black text-slate-800">โจทย์และคำอธิบาย</p><div className="mt-2 min-h-36 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">{assignment.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</div></div>
            </div>
          </section>

          {submission ? (
            <section className="rounded-2xl border border-blue-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="text-lg font-black text-slate-950">งานที่ส่งล่าสุด</h2><p className="mt-1 text-sm text-slate-500">ส่งเมื่อ {formatDateTime(submission.submitted_at)}</p></div><StatusBadge tone="blue">ส่งแล้ว</StatusBadge></div>
              <div className="p-5 sm:p-6"><p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{submission.content || 'ไม่มีข้อความเพิ่มเติม'}</p>{fileUrl ? <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-black text-blue-700 hover:bg-blue-100">เปิดไฟล์ที่ส่ง ↗</a> : <p className="mt-4 text-sm text-slate-400">ไม่มีไฟล์แนบ</p>}</div>
            </section>
          ) : null}

          {grade ? (
            <section className="rounded-2xl border border-emerald-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><p className="text-xs font-bold text-emerald-700">ผลการตรวจ</p><h2 className="mt-1 text-lg font-black text-slate-950">คะแนนและความคิดเห็น</h2></div><StatusBadge tone="green">ตรวจแล้ว</StatusBadge></div>
              <div className="p-5 sm:p-6"><div className="flex items-end gap-2"><p className="text-4xl font-black text-emerald-700">{grade.score}</p><p className="pb-1 text-sm font-bold text-slate-500">/ {assignment.max_score} คะแนน</p></div><div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">ความคิดเห็นจากคุณครู</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{grade.feedback || 'ไม่มีความคิดเห็นเพิ่มเติม'}</p></div>{grade.graded_at ? <p className="mt-3 text-xs text-slate-400">ตรวจเมื่อ {formatDateTime(grade.graded_at)}</p> : null}</div>
            </section>
          ) : null}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-24 xl:self-start">
          <form onSubmit={submit}>
            <div className="border-b border-slate-100 px-5 py-4"><p className="text-xs font-bold text-orange-600">พื้นที่ส่งงาน</p><h2 className="mt-1 text-lg font-black text-slate-950">{submission ? 'ส่งงานใหม่อีกครั้ง' : 'ส่งงานให้คุณครู'}</h2><p className="mt-1 text-sm text-slate-500">แนบไฟล์หรือเขียนข้อความประกอบได้</p></div>
            <div className="p-5">
              <label className="block"><span className="text-sm font-black text-slate-800">ไฟล์งาน</span><span className="mt-1 block text-xs leading-5 text-slate-400">รองรับ PDF, Office, รูปภาพ และ ZIP ขนาดไม่เกิน 20 MB</span><div className="mt-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4"><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" onChange={choose} className="w-full text-sm" />{file ? <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3"><p className="truncate text-sm font-black text-slate-800">{file.name}</p><p className="mt-1 text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div> : submission?.file_path ? <p className="mt-3 text-xs font-bold text-blue-700">หากไม่เลือกไฟล์ใหม่ ระบบจะใช้ไฟล์เดิม</p> : null}</div></label>
              <label className="mt-5 block"><span className="text-sm font-black text-slate-800">ข้อความถึงคุณครู</span><textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="อธิบายงานหรือฝากข้อความเพิ่มเติม..." className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /></label>
              {message ? <div className={`mt-4 rounded-xl border p-3 text-sm font-bold ${errorTone ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{message}</div> : null}
              <button disabled={saving} className="mt-5 w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-black text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'กำลังอัปโหลด...' : submission ? 'ยืนยันส่งงานใหม่' : 'ส่งงาน'}</button>
              <p className="mt-3 text-center text-xs leading-5 text-slate-400">ตรวจสอบไฟล์และข้อความให้เรียบร้อยก่อนกดส่ง</p>
            </div>
          </form>
        </aside>
      </section>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 text-sm font-black text-slate-800">{value}</p></div>
}
