'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/useSupabase'

export function ProfileSync({ role }: { role: 'teacher' | 'student' }) {
  const { user, isLoaded } = useUser()
  const supabase = useSupabase()

  useEffect(() => {
    if (!isLoaded || !user) return
    const timeout = window.setTimeout(() => {
      void supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.fullName || user.firstName || null,
        role,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        avatar_url: user.imageUrl || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' }).then(({ error }) => {
        if (error) console.error('profile sync:', error)
      })
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [isLoaded, role, supabase, user])

  return null
}
