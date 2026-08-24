'use client'

import { useAuth } from '@clerk/nextjs'
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
      // Force Clerk to resolve the active session token before we make a
      // document-level navigation to a protected server route.
      await getToken()
      if (cancelled) return

      const role = sessionClaims?.metadata?.role
      const destination =
        role === 'teacher'
          ? '/teacher'
          : role === 'student'
            ? '/student'
            : '/setup-role'

      window.location.replace(destination)
    }

    void continueToApp()

    return () => {
      cancelled = true
    }
  }, [getToken, isLoaded, isSignedIn, sessionClaims])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 text-gray-900">
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <p className="font-semibold">กำลังเข้าสู่ระบบ...</p>
        <p className="mt-1 text-sm text-gray-600">กำลังตรวจสอบบัญชีและสิทธิ์การใช้งาน</p>
      </div>
    </main>
  )
}
