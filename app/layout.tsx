import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Samsara Fuel Monitor App',
  description: 'by Islom Khamid',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
