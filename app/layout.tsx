import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { LayoutProviders } from '@/components/layout-providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'Qavra',
  description: 'İmtahana hazırlanma',
  icons: {
    icon: '/icon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="az" className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        <LayoutProviders>
          {children}
        </LayoutProviders>
      </body>
    </html>
  )
}
