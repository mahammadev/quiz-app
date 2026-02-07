import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: "Admin Portal | Qavra",
  description: "Platform Administration Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: 'hsl(252 85% 60%)',
          colorBackground: 'hsl(0 0% 100%)',
          colorText: 'hsl(240 10% 4%)',
          colorTextSecondary: 'hsl(240 4% 46%)',
          colorInputBackground: 'hsl(0 0% 100%)',
          colorInputText: 'hsl(240 10% 4%)',
          borderRadius: '0.625rem',
          fontFamily: 'var(--font-inter)',
        },
        elements: {
          modalBackdrop: 'bg-black/40',
          modalContent: 'rounded-xl border border-border bg-card shadow-lg',
          card: 'rounded-xl border border-border bg-card shadow-lg',
          headerTitle: 'text-foreground font-display',
          formButtonPrimary: 'rounded-lg bg-primary text-primary-foreground hover:bg-primary/90',
        },
      }}
    >
      <html lang="en" className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}>
        <body className="font-sans antialiased">
          <ConvexClientProvider>
            {children}
            <Toaster />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
