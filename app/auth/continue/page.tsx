'use client'

import { useAuth } from '@clerk/nextjs'
import Image from 'next/image'
import { useEffect } from 'react'

export default function AuthContinuePage() {
  const { isLoaded, isSignedIn, sessionClaims, getToken } = useAuth({
    treatPendingAsSignedOut: false,
  })

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      window.location.replace('/login')
      return
    }

    let cancelled = false

    const continueToApp = async () => {
      await getToken()
      if (cancelled) return

      const role = sessionClaims?.metadata?.role
      const destination = role === 'teacher' ? '/teacher' : role === 'student' ? '/student' : '/setup-role'
      window.location.replace(destination)
    }

    void continueToApp()
    return () => { cancelled = true }
  }, [getToken, isLoaded, isSignedIn, sessionClaims])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] p-5 text-slate-950">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="relative mx-auto h-12 w-12 overflow-hidden rounded-xl border border-orange-100 bg-orange-50"><Image src="/check-ngan-logo.svg" alt="check-ngan System" fill sizes="48px" className="object-cover" /></div>
        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.16em] text-orange-600">check-ngan System</p>
        <div className="mx-auto mt-5 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-600" aria-hidden="true" />
        <h1 className="mt-5 text-lg font-black text-slate-950">กำลังพาคุณเข้าสู่ระบบ</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">กำลังตรวจสอบบัญชีและสิทธิ์การใช้งาน กรุณารอสักครู่</p>
      </section>
    </main>
  )
}
