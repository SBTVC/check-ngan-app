import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'check-ngan System | ระบบติดตามงานของนักเรียนและนักศึกษา',
    template: '%s | check-ngan System',
  },
  description: 'ระบบติดตามงานของนักเรียนและนักศึกษา สำหรับมอบหมายงาน ส่งงาน ตรวจงาน และติดตามผลคะแนน',
}

const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem('check-ngan-theme');
    var theme = saved === 'dark' || saved === 'light'
      ? saved
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.dataset.theme = theme;
  } catch (_) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider dynamic afterSignOutUrl="/login">
      <html lang="th" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
