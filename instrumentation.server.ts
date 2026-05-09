/**
 * instrumentation.server.ts  — Server-only OpenTelemetry bootstrap
 *
 * This file contains all the OpenTelemetry setup logic that should ONLY run
 * on the Node.js server runtime. It is dynamically imported by instrumentation.ts
 * after checking the runtime environment.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from '@opentelemetry/semantic-conventions/incubating';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

let sdk: NodeSDK | undefined;

export async function initServerTelemetry(): Promise<void> {
  // Prevent double initialization
  if (sdk) {
    return;
  }

  // ── Runtime configuration ─────────────────────────────────────────────
  const serviceName = 'workouter-fe';
  const serviceVersion: string = process.env.npm_package_version ?? '0.0.0';
  const deploymentEnvironment: string = process.env.NODE_ENV ?? 'development';

  // ── HTTP Basic authentication header ─────────────────────────────────
  const openObserveUsername: string = process.env.OPENOBSERVE_USERNAME ?? '';
  const openObservePassword: string = process.env.OPENOBSERVE_PASSWORD ?? '';

  const basicAuthHeader =
    'Basic ' +
    Buffer.from(`${openObserveUsername}:${openObservePassword}`).toString(
      'base64'
    );

  const authHeaders: Record<string, string> = {
    Authorization: basicAuthHeader,
  };

  // ── Resource ──────────────────────────────────────────────────────────
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: serviceVersion,
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: deploymentEnvironment,
  });

  // ── Trace exporter ────────────────────────────────────────────────────
  const traceExporter = new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ??
      'http://localhost:5080/api/default/traces',
    headers: authHeaders,
  });

  // ── Metric exporter + periodic reader ────────────────────────────────
  const metricExporter = new OTLPMetricExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ??
      'http://localhost:5080/api/default/metrics',
    headers: authHeaders,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
  });

  // ── Auto-instrumentations ─────────────────────────────────────────────
  const instrumentations = getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-fs': { enabled: false },
  });

  // ── NodeSDK ───────────────────────────────────────────────────────────
  sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReaders: [metricReader],
    instrumentations: [instrumentations],
  });

  sdk.start();

  // ── Graceful shutdown — SIGTERM ───────────────────────────────────────
  process.on('SIGTERM', () => {
    sdk
      ?.shutdown()
      .then(() => {
        console.log('[otel] SDK shut down successfully.');
      })
      .catch((err: unknown) => {
        console.error('[otel] Error shutting down SDK:', err);
      })
      .finally(() => {
        process.exit(0);
      });
  });
}
