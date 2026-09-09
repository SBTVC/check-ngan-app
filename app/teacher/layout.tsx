import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/app-shell'

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/login')
  if (sessionClaims?.metadata?.role !== 'teacher') redirect(sessionClaims?.metadata?.role === 'student' ? '/student' : '/setup-role')
  return <AppShell role="teacher">{children}</AppShell>
}
