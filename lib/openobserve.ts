/**
 * OpenObserve RUM configuration
 * Real User Monitoring and logging setup
 */

export const openobserveConfig = {
  clientToken: process.env.NEXT_PUBLIC_OPENOBSERVE_RUM_CLIENT_TOKEN || '',
  applicationId: process.env.NEXT_PUBLIC_OPENOBSERVE_APPLICATION_ID || 'workouter-web',
  site: process.env.NEXT_PUBLIC_OPENOBSERVE_SITE || 'api.openobserve.ai',
  organizationIdentifier: process.env.NEXT_PUBLIC_OPENOBSERVE_ORG_ID || '',
  service: 'workouter-web',
  env: process.env.NODE_ENV || 'development',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.1',
  insecureHTTP: false,
  apiVersion: 'v1' as const,
};

export const rumConfig = {
  applicationId: openobserveConfig.applicationId,
  clientToken: openobserveConfig.clientToken,
  site: openobserveConfig.site,
  organizationIdentifier: openobserveConfig.organizationIdentifier,
  service: openobserveConfig.service,
  env: openobserveConfig.env,
  version: openobserveConfig.version,
  trackResources: true,
  trackLongTasks: true,
  trackUserInteractions: true,
  apiVersion: openobserveConfig.apiVersion,
  insecureHTTP: openobserveConfig.insecureHTTP,
  defaultPrivacyLevel: 'mask-user-input' as const,
  sessionSampleRate: 100,
  sessionReplaySampleRate: openobserveConfig.env === 'production' ? 50 : 100,
};

export const logsConfig = {
  clientToken: openobserveConfig.clientToken,
  site: openobserveConfig.site,
  organizationIdentifier: openobserveConfig.organizationIdentifier,
  service: openobserveConfig.service,
  env: openobserveConfig.env,
  version: openobserveConfig.version,
  forwardErrorsToLogs: true,
  insecureHTTP: openobserveConfig.insecureHTTP,
  apiVersion: openobserveConfig.apiVersion,
};
