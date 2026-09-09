import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/app-shell'

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const { userId, sessionClaims } = await auth()
  if (!userId) redirect('/login')
  if (sessionClaims?.metadata?.role !== 'student') redirect(sessionClaims?.metadata?.role === 'teacher' ? '/teacher' : '/setup-role')
  return <AppShell role="student">{children}</AppShell>
}
