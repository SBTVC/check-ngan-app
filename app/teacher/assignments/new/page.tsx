'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Breadcrumbs, PageHeader, SecondaryLink } from '@/components/ui'
import { useSupabase } from '@/lib/supabase/useSupabase'

type ClassItem = { id: number; name: string; subject: string | null }

export default function NewAssignmentPage() {
  const { user, isLoaded } = useUser()
  const supabase = useSupabase()
  const router = useRouter()
  const userId = user?.id
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [classId, setClassId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [maxScore, setMaxScore] = useState('10')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [newClassName, setNewClassName] = useState('')
  const [newClassSubject, setNewClassSubject] = useState('')
  const [showClass, setShowClass] = useState(false)

  const loadClasses = useCallback(async () => {
    if (!userId) return
    const r = await supabase.from('classes').select('id,name,subject').eq('teacher_id', userId).order('created_at', { ascending: false })
    if (r.error) setMessage(r.error.message)
    else {
      const rows = (r.data ?? []) as ClassItem[]
      setClasses(rows)
      if (!classId && rows[0]) setClassId(String(rows[0].id))
    }
  }, [supabase, userId, classId])

  useEffect(() => {
    if (!isLoaded || !userId) return
    const t = window.setTimeout(() => void loadClasses(), 0)
    return () => window.clearTimeout(t)
  }, [isLoaded, userId, loadClasses])

  async function createClass() {
    if (!userId || !newClassName.trim()) return setMessage('กรุณากรอกชื่อห้องเรียน')
    setLoading(true)
    const r = await supabase.from('classes').insert({ name: newClassName.trim(), subject: newClassSubject.trim() || null, teacher_id: userId }).select('id,name,subject').single()
    setLoading(false)
    if (r.error) return setMessage(r.error.message)
    const row = r.data as ClassItem
    setClasses((c) => [row, ...c])
    setClassId(String(row.id))
    setNewClassName('')
    setNewClassSubject('')
    setShowClass(false)
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!userId) return
    const score = Number(maxScore)
    if (!classId) return setMessage('กรุณาเลือกห้องเรียน')
    if (!title.trim()) return setMessage('กรุณากรอกชื่องาน')
    if (!Number.isFinite(score) || score <= 0) return setMessage('คะแนนเต็มไม่ถูกต้อง')
    setLoading(true)
    setMessage('')
    const r = await supabase.from('assignments').insert({ title: title.trim(), description: description.trim() || null, due_date: dueDate ? new Date(dueDate).toISOString() : null, teacher_id: userId, class_id: Number(classId), max_score: score, file_path: null, updated_at: new Date().toISOString() }).select('id').single()
    setLoading(false)
    if (r.error) return setMessage(r.error.message)
    router.push(`/teacher/assignments/${r.data.id}`)
    router.refresh()
  }

  const selectedClass = classes.find((c) => String(c.id) === classId)

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: 'ภาพรวม', href: '/teacher' }, { label: 'งานที่มอบหมาย', href: '/teacher/assignments' }, { label: 'สร้างงานใหม่' }]} />
        <PageHeader eyebrow="สร้างงาน" title="มอบหมายงานใหม่" description="กรอกข้อมูลที่นักเรียนจำเป็นต้องรู้ให้ครบ แล้วตรวจทานก่อนเผยแพร่" actions={<SecondaryLink href="/teacher/assignments">← รายการงาน</SecondaryLink>} />
      </div>

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="text-lg font-black text-slate-950">รายละเอียดงาน</h2><p className="mt-1 text-sm text-slate-500">ข้อมูลส่วนนี้จะแสดงให้นักเรียนเห็นในหน้ารายละเอียดงาน</p></div>
          <div className="space-y-6 p-5 sm:p-6">
            <Field label="ห้องเรียน *" hint="เลือกห้องที่ต้องการมอบหมายงานนี้">
              <div className="flex flex-col gap-2 sm:flex-row">
                <select value={classId} onChange={(e) => setClassId(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100">
                  <option value="">-- เลือกห้องเรียน --</option>
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}{c.subject ? ` • ${c.subject}` : ''}</option>)}
                </select>
                <button type="button" onClick={() => setShowClass((v) => !v)} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">{showClass ? 'ปิด' : '+ เพิ่มห้องใหม่'}</button>
              </div>
            </Field>

            {showClass ? (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <div className="mb-3"><h3 className="text-sm font-black text-slate-900">สร้างห้องเรียนแบบรวดเร็ว</h3><p className="mt-1 text-xs text-slate-500">สร้างแล้วระบบจะเลือกห้องนี้ให้อัตโนมัติ</p></div>
                <div className="grid gap-3 sm:grid-cols-2"><input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="ชื่อห้อง เช่น ปวช.3/1" className="rounded-lg border border-orange-200 bg-white px-3 py-2.5 text-sm" /><input value={newClassSubject} onChange={(e) => setNewClassSubject(e.target.value)} placeholder="รายวิชา (ถ้ามี)" className="rounded-lg border border-orange-200 bg-white px-3 py-2.5 text-sm" /></div>
                <button type="button" onClick={() => void createClass()} className="mt-3 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">สร้างห้องเรียน</button>
              </div>
            ) : null}

            <Field label="ชื่องาน *" hint="ตั้งชื่อให้สั้นและสื่อความหมายชัดเจน">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น แบบฝึกหัดเรื่องฐานข้อมูล" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </Field>

            <Field label="รายละเอียดงาน" hint="ระบุโจทย์ ขั้นตอน หรือเงื่อนไขการส่งงาน">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={8} placeholder="อธิบายงานที่ต้องการให้นักเรียนทำ..." className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm leading-7 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="กำหนดส่ง" hint="เว้นว่างได้หากไม่มีวันกำหนดส่ง"><input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /></Field>
              <Field label="คะแนนเต็ม *" hint="ต้องมากกว่า 0"><input type="number" min="1" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" /></Field>
            </div>

            {message ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{message}</div> : null}

            <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-5 sm:flex-row">
              <SecondaryLink href="/teacher/assignments">ยกเลิก</SecondaryLink>
              <button disabled={loading} className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-black text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'กำลังบันทึก...' : 'มอบหมายงาน'}</button>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-24 xl:self-start">
          <div className="border-b border-slate-100 px-5 py-4"><p className="text-xs font-bold text-orange-600">ตัวอย่างก่อนเผยแพร่</p><h2 className="mt-1 text-base font-black text-slate-950">สรุปงาน</h2></div>
          <div className="p-5">
            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">{selectedClass?.name || 'ยังไม่ได้เลือกห้อง'}</span>
            <h3 className="mt-4 break-words text-xl font-black text-slate-950">{title || 'ชื่องานจะแสดงตรงนี้'}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">{description || 'เพิ่มรายละเอียดเพื่อให้นักเรียนเข้าใจงานได้ชัดเจนขึ้น'}</p>
            <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
              <PreviewRow label="คะแนนเต็ม" value={`${maxScore || '-'} คะแนน`} />
              <PreviewRow label="ห้องเรียน" value={selectedClass ? `${selectedClass.name}${selectedClass.subject ? ` • ${selectedClass.subject}` : ''}` : '-'} />
              <PreviewRow label="กำหนดส่ง" value={dueDate ? new Date(dueDate).toLocaleString('th-TH') : 'ไม่กำหนด'} />
            </dl>
          </div>
        </aside>
      </form>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-sm font-black text-slate-800">{label}</span>{hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}<div className="mt-2">{children}</div></label>
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 px-4 py-3"><dt className="text-xs font-bold text-slate-400">{label}</dt><dd className="text-right text-sm font-bold text-slate-700">{value}</dd></div>
}
