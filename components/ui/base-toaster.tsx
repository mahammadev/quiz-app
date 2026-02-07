'use client';

import * as React from 'react';
import { Toast } from '@base-ui/react/toast';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Toast manager for global use
 */
const manager = Toast.createToastManager();

export const toast = {
  success: (title: string, description?: string) => {
    manager.add({ title, description });
  },
  error: (title: string, description?: string) => {
    manager.add({ title, description });
  },
  info: (title: string, description?: string) => {
    manager.add({ title, description });
  },
  promise: async <T,>(
    promise: Promise<T>,
    { loading, success, error }: { loading: string; success: string; error: string }
  ) => {
    // Basic promise implementation for Base UI
    try {
      const res = await promise;
      manager.add({ title: success });
      return res;
    } catch (e) {
      manager.add({ title: error });
      throw e;
    }
  },
  custom: (title: string, description?: string) => {
    manager.add({ title, description });
  }
};

export function Toaster() {
  return (
    <Toast.Provider toastManager={manager}>
      <ToastPortal />
    </Toast.Provider>
  );
}

function ToastPortal() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Portal>
      <Toast.Viewport 
        className={cn(
          "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]",
          "outline-none"
        )}
      >
        {toasts.map((toast) => (
          <Toast.Root 
            key={toast.id} 
            toast={toast}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-[var(--radius)] border border-border bg-popover p-6 pr-8 shadow-lg transition-all",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
              "z-[calc(1000-var(--toast-index))]",
              "translate-y-[calc(var(--toast-index)*16px)] scale-[calc(1-(var(--toast-index)*0.05))]"
            )}
          >
            <Toast.Content className="flex w-full flex-col gap-1">
              <Toast.Title className="text-sm font-semibold text-popover-foreground">
                {toast.title as string}
              </Toast.Title>
              {toast.description && (
                <Toast.Description className="text-sm text-muted-foreground opacity-90">
                  {toast.description as string}
                </Toast.Description>
              )}
            </Toast.Content>
            <Toast.Close 
              className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
              <XIcon className="h-4 w-4" />
            </Toast.Close>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}
