"use client";

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/components/convex-client-provider';
import { ActiveUserProvider } from '@/components/active-user-context';
import { UserSync } from '@/components/user-sync';
import RouteSync from '@/components/route-sync';
import { VersionChecker } from '@/components/version-checker';
import { Toaster } from '@/components/ui/base-toaster';
import { Analytics } from '@vercel/analytics/next';

export function LayoutProviders({ children }: { children: React.ReactNode }) {
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
      <ConvexClientProvider>
        <ActiveUserProvider>
          <UserSync />
          <RouteSync />
          <VersionChecker />
          {children}
          <Toaster />
          <Analytics />
        </ActiveUserProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
}
