'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabase/useSupabase'

type Role = 'teacher' | 'student'
type MetadataRecord = Record<string, unknown>
type ProfileRow = {
  full_name: string | null
  student_id: string | null
  email: string | null
  avatar_url: string | null
  level: string | null
  room: string | null
  department: string | null
  major: string | null
  position: string | null
}

function firstString(source: MetadataRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

export function UserProfileSummary({ role, compact = false }: { role: Role; compact?: boolean }) {
  const { user } = useUser()
  const supabase = useSupabase()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const metadata = (user?.publicMetadata ?? {}) as MetadataRecord

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    void supabase.from('profiles').select('full_name,student_id,email,avatar_url,level,room,department,major,position').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (!cancelled) setProfile((data as ProfileRow | null) ?? null)
    })
    return () => { cancelled = true }
  }, [supabase, user?.id])

  const name = profile?.full_name || user?.fullName || user?.firstName || (role === 'teacher' ? 'คุณครู' : 'นักเรียน/นักศึกษา')
  const email = profile?.email || user?.primaryEmailAddress?.emailAddress || null
  const studentCode = role === 'student' ? (profile?.student_id || firstString(metadata, ['studentId', 'student_id', 'studentCode', 'student_code', 'code'])) : null
  const level = profile?.level || firstString(metadata, ['level', 'educationLevel', 'education_level', 'grade'])
  const className = profile?.room || firstString(metadata, ['className', 'class_name', 'classroom', 'room'])
  const department = profile?.department || firstString(metadata, ['department', 'departmentName', 'department_name'])
  const major = profile?.major || firstString(metadata, ['major', 'majorName', 'major_name', 'branch', 'program'])
  const position = role === 'teacher' ? (profile?.position || firstString(metadata, ['position', 'title', 'teacherPosition'])) : null
  const imageUrl = profile?.avatar_url || user?.imageUrl
  const extra = [studentCode && `รหัส ${studentCode}`, level, className, department, major, position].filter(Boolean) as string[]

  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={name} imageUrl={imageUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-slate-900">{name}</p>
          <p className="truncate text-xs text-slate-500">{role === 'teacher' ? 'อาจารย์ผู้สอน' : 'นักเรียน/นักศึกษา'}</p>
        </div>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={name} imageUrl={imageUrl} size="lg" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400">ข้อมูลผู้ใช้งาน</p>
            <h2 className="mt-1 truncate text-lg font-black text-slate-950">{name}</h2>
            <p className="mt-0.5 text-sm font-semibold text-slate-600">{role === 'teacher' ? 'อาจารย์ผู้สอน' : 'นักเรียน/นักศึกษา'}</p>
            {email ? <p className="mt-1 truncate text-xs text-slate-400">{email}</p> : null}
          </div>
        </div>
        {extra.length > 0 ? (
          <div className="flex max-w-xl flex-wrap gap-2 sm:justify-end">
            {extra.map((item) => <span key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">{item}</span>)}
          </div>
        ) : (
          <p className="max-w-sm text-xs leading-5 text-slate-400 sm:text-right">สามารถเพิ่มข้อมูลประจำตัวได้จากหน้าโปรไฟล์</p>
        )}
      </div>
    </section>
  )
}

function Avatar({ name, imageUrl, size }: { name: string; imageUrl?: string | null; size: 'sm' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm'
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-orange-200 bg-orange-100 font-black text-orange-700 ${sizeClass}`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : name.slice(0, 1)}
    </div>
  )
}
