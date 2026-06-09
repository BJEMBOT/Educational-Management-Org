import type { Metadata } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

const sourceSerif = Source_Serif_4({
  variable: '--font-heading',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'EMO Platform',
  description: 'Education Management Organization — Professional Development & Operations',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
