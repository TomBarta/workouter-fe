'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { openobserveRum } from '@openobserve/browser-rum';
import { openobserveLogs } from '@openobserve/browser-logs';
import { rumConfig, logsConfig } from '@/lib/openobserve';

let isInitialized = false;

export function OpenObserveProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only initialize once and only in browser
    if (typeof window === 'undefined' || isInitialized) return;

    // Only initialize if we have required credentials
    if (!rumConfig.clientToken || !rumConfig.organizationIdentifier) {
      console.warn('OpenObserve credentials not configured. Skipping RUM initialization.');
      return;
    }

    try {
      // Initialize RUM
      openobserveRum.init(rumConfig);

      // Initialize Logs
      openobserveLogs.init(logsConfig);

      // Start session replay recording
      openobserveRum.startSessionReplayRecording();

      isInitialized = true;
      console.log('OpenObserve RUM initialized');
    } catch (error) {
      console.error('Failed to initialize OpenObserve RUM:', error);
    }
  }, []);

  // Update user context when session changes
  useEffect(() => {
    if (!isInitialized || status === 'loading') return;

    if (status === 'authenticated' && session?.user) {
      try {
        openobserveRum.setUser({
          id: session.user.id || session.user.email || 'unknown',
          name: session.user.name || undefined,
          email: session.user.email || undefined,
        });
      } catch (error) {
        console.error('Failed to set OpenObserve user context:', error);
      }
    } else if (status === 'unauthenticated') {
      try {
        // Clear user context on logout
        openobserveRum.clearUser();
      } catch (error) {
        console.error('Failed to clear OpenObserve user context:', error);
      }
    }
  }, [session, status]);

  return <>{children}</>;
}
