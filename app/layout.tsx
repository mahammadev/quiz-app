import type { Metadata } from 'next'

import { Analytics } from '@vercel/analytics/next'
import '@/styles/globals.css'
import { Poppins, Inter } from 'next/font/google'
import RouteSync from '@/components/route-sync'
import { ActiveUserProvider } from '@/components/active-user-context'
import { VersionChecker } from '@/components/version-checker'
import { Toaster } from '@/components/ui/sonner'
import { ConvexClientProvider } from '@/components/convex-client-provider'
import { ClerkProvider } from '@clerk/nextjs'

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
  title: 'İmtahanly',
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
    <html lang="az">
      <body className={`${poppins.variable} ${inter.variable} font-poppins antialiased`}>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: 'hsl(var(--primary))',
              colorBackground: 'hsl(var(--card))',
              colorText: 'hsl(var(--foreground))',
              colorTextSecondary: 'hsl(var(--muted-foreground))',
              colorInputBackground: 'hsl(var(--background))',
              colorInputText: 'hsl(var(--foreground))',
              colorNeutral: 'var(--border-neutral)',
              colorTextOnPrimary: 'hsl(var(--primary-foreground))',
              borderRadius: '0.625rem',
              fontFamily: 'var(--font-poppins)',
            },
            elements: {
              modalBackdrop: 'bg-black/40',
              modalContent: 'rounded-xl border border-[var(--border-container)] bg-card shadow-lg',
              card: 'rounded-xl border border-[var(--border-container)] bg-card shadow-lg',
              headerTitle: 'text-foreground',
              headerSubtitle: 'text-muted-foreground',
              socialButtonsBlockButton: 'rounded-lg !border !border-[var(--border-container)] !bg-card !text-foreground shadow-sm hover:!bg-muted/40 focus-visible:!border-[var(--border-container-active)]',
              socialButtonsBlockButtonText: '!text-foreground',
              socialButtonsBlock: 'space-y-3',
              socialButtonsProviderIcon: 'opacity-90',
              socialButtonsBlockButton__google: '!border !border-[var(--border-container)] !bg-card !text-foreground shadow-sm hover:!bg-muted/40',
              socialButtonsBlockButtonText__google: '!text-foreground',
              formButtonPrimary: 'rounded-lg bg-primary text-primary-foreground hover:bg-primary/90',
              footerActionLink: 'text-primary hover:text-primary/80',
              footerActionText: 'text-muted-foreground',
              dividerLine: 'bg-[var(--border-container)]',
              input: 'rounded-lg border-[var(--border-container)] bg-background focus-visible:border-[var(--border-container-active)]',
            },
          }}
        >
          <ConvexClientProvider>
            <ActiveUserProvider>
              <RouteSync />
              <VersionChecker />
              {children}
              <Toaster />
              <Analytics />
            </ActiveUserProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
