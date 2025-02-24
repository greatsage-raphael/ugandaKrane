import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Uganda Crane',
  description: 'Made by the GreatSage',
  generator: 'v0.dev + me on coffee',
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
