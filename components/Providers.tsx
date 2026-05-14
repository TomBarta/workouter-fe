'use client';

import { SessionProvider } from 'next-auth/react';
import { OpenObserveProvider } from './OpenObserveProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OpenObserveProvider>{children}</OpenObserveProvider>
    </SessionProvider>
  );
}
