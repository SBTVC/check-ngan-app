import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Check Ngan | ระบบจัดการงานการเรียน',
    template: '%s | Check Ngan',
  },
  description: 'ระบบมอบหมายงาน ส่งงาน ตรวจงาน และให้คะแนนสำหรับคุณครูและนักเรียน',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider dynamic afterSignOutUrl="/login">
      <html lang="th">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
