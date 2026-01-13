import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import '@/styles/globals.css'
import { Poppins, Inter } from 'next/font/google'
import RouteSync from '@/components/route-sync'
import { ActiveUserProvider } from '@/components/active-user-context'
import { VersionChecker } from '@/components/version-checker'
import { Toaster } from '@/components/ui/sonner'

// Initialize fonts
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Quiz Generator',
  description: 'Create and take quizzes from JSON files',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${inter.variable} font-poppins antialiased`}>
        <ActiveUserProvider>
          <RouteSync />
          <VersionChecker />
          {children}
          <Toaster />
          <Analytics />
        </ActiveUserProvider>
      </body>
    </html>
  )
}
