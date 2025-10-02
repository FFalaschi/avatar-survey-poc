import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Avatar Survey POC',
  description: 'Conversational AI survey platform powered by Anam.ai',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
