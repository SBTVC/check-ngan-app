import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/login')
  }

  const role = sessionClaims?.metadata?.role

  if (role === 'teacher') {
    redirect('/teacher')
  }

  if (role === 'student') {
    redirect('/student')
  }

  redirect('/setup-role')
}
