'use client'

import { useSession } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'
import { useMemo } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase environment variables')
const configuredSupabaseUrl: string = supabaseUrl
const configuredSupabaseKey: string = supabaseKey

export function useSupabase() {
  const { session } = useSession()
  return useMemo(() => createClient(configuredSupabaseUrl, configuredSupabaseKey, { accessToken: async () => session?.getToken() ?? null }), [session])
}
