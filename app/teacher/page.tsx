import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import TeacherDashboardClient from './TeacherDashboardClient'

export default async function TeacherPage() {
  const { sessionClaims } = await auth.protect()
  if (sessionClaims?.metadata?.role !== 'teacher') redirect('/setup-role')
  return <TeacherDashboardClient />
}
