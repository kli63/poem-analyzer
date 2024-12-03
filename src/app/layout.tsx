import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Poem Analyzer',
  description: 'Analyze poems with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}