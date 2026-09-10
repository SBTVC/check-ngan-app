'use client'

import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabase/useSupabase'

export function StorageFileLink({ bucket, path, label = 'เปิดไฟล์' }: { bucket: string; path: string | null; label?: string }) {
  const supabase = useSupabase()
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(Boolean(path))

  useEffect(() => {
    if (!path) {
      const timeout = window.setTimeout(() => {
        setUrl(null)
        setLoading(false)
      }, 0)
      return () => window.clearTimeout(timeout)
    }

    let cancelled = false
    const startTimeout = window.setTimeout(() => setLoading(true), 0)
    void supabase.storage.from(bucket).createSignedUrl(path, 3600).then(({ data, error }) => {
      if (cancelled) return
      setUrl(error ? null : data?.signedUrl ?? null)
      setLoading(false)
    })

    return () => {
      cancelled = true
      window.clearTimeout(startTimeout)
    }
  }, [bucket, path, supabase])

  if (!path) return null
  if (loading) return <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-500">กำลังเตรียมไฟล์...</span>
  if (!url) return <span className="inline-flex rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700">เปิดไฟล์ไม่ได้</span>
  return <a href={url} target="_blank" rel="noreferrer" className="inline-flex rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-black text-orange-700 hover:bg-orange-100">{label} ↗</a>
}
