import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="th">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
