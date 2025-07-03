import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'invoice supernesia',
  description: 'Created by herdiyanitdev',
  generator: 'supernesia.id',
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
