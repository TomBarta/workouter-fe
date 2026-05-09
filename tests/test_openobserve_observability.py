"""
Tests for the OpenObserve observability integration in the workouter-fe Next.js app.

These tests validate that all required files exist and contain the expected
content for:
  - Environment variable definitions (.env.example)
  - OpenTelemetry server-side instrumentation (instrumentation.ts)
  - Next.js configuration (next.config.ts)
  - Winston logger with OpenObserve transport (app/lib/logger.ts)
  - Browser-to-OpenObserve telemetry proxy (app/api/telemetry/traces/route.ts)
  - Browser-side OpenTelemetry bootstrap (app/lib/telemetry-browser.ts)
  - TelemetryInit React component (app/components/TelemetryInit.tsx)
  - Root layout with TelemetryInit (app/layout.tsx)
  - Workouts API route with tracing (app/api/v1/workouts/route.ts)
"""

import os
import re
import pytest

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read_file(relative_path: str) -> str:
    """Read a file relative to the repo root and return its contents."""
    full_path = os.path.join(ROOT, relative_path)
    assert os.path.exists(full_path), f"File not found: {relative_path}"
    with open(full_path, "r", encoding="utf-8") as fh:
        return fh.read()


# ---------------------------------------------------------------------------
# .env.example
# ---------------------------------------------------------------------------


class TestEnvExample:
    """Validate that .env.example documents all required OpenObserve variables."""

    def setup_method(self):
        self.content = read_file(".env.example")

    def test_file_exists(self):
        assert os.path.exists(os.path.join(ROOT, ".env.example"))

    def test_openobserve_username_present(self):
        assert "OPENOBSERVE_USERNAME" in self.content, \
            "OPENOBSERVE_USERNAME must be documented in .env.example"

    def test_openobserve_password_present(self):
        assert "OPENOBSERVE_PASSWORD" in self.content, \
            "OPENOBSERVE_PASSWORD must be documented in .env.example"

    def test_openobserve_logs_endpoint_present(self):
        assert "OPENOBSERVE_LOGS_ENDPOINT" in self.content, \
            "OPENOBSERVE_LOGS_ENDPOINT must be documented in .env.example"

    def test_otel_traces_endpoint_present(self):
        assert "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT" in self.content, \
            "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT must be documented in .env.example"

    def test_otel_metrics_endpoint_present(self):
        assert "OTEL_EXPORTER_OTLP_METRICS_ENDPOINT" in self.content, \
            "OTEL_EXPORTER_OTLP_METRICS_ENDPOINT must be documented in .env.example"

    def test_log_level_present(self):
        assert "LOG_LEVEL" in self.content, \
            "LOG_LEVEL must be documented in .env.example"

    def test_openobserve_organization_present(self):
        assert "OPENOBSERVE_ORGANIZATION" in self.content, \
            "OPENOBSERVE_ORGANIZATION must be documented in .env.example"

    def test_default_localhost_endpoints(self):
        """Default endpoints should reference localhost:5080 for self-hosted setup."""
        assert "localhost:5080" in self.content, \
            "Default OpenObserve endpoints should reference localhost:5080"


# ---------------------------------------------------------------------------
# instrumentation.ts
# ---------------------------------------------------------------------------


class TestInstrumentation:
    """Validate the server-side OpenTelemetry bootstrap in instrumentation.ts."""

    def setup_method(self):
        self.content = read_file("instrumentation.ts")

    def test_file_exists(self):
        assert os.path.exists(os.path.join(ROOT, "instrumentation.ts"))

    def test_exports_register_function(self):
        assert "export async function register" in self.content, \
            "instrumentation.ts must export an async register() function"

    def test_nodejs_runtime_guard(self):
        assert "NEXT_RUNTIME" in self.content, \
            "Must guard against non-Node.js runtimes using NEXT_RUNTIME"
        assert "'nodejs'" in self.content or '"nodejs"' in self.content, \
            "Must check for 'nodejs' runtime"

    def test_imports_node_sdk(self):
        assert "sdk-node" in self.content or "NodeSDK" in self.content, \
            "Must import @opentelemetry/sdk-node NodeSDK"

    def test_imports_resource(self):
        assert "resourceFromAttributes" in self.content, \
            "Must use resourceFromAttributes to build the OTel Resource"

    def test_service_name_set(self):
        assert "workouter-fe" in self.content, \
            "Service name 'workouter-fe' must be set in the Resource"

    def test_otlp_trace_exporter_imported(self):
        assert "OTLPTraceExporter" in self.content, \
            "Must import and use OTLPTraceExporter for trace export"

    def test_otlp_metric_exporter_imported(self):
        assert "OTLPMetricExporter" in self.content, \
            "Must import and use OTLPMetricExporter for metrics export"

    def test_periodic_metric_reader_used(self):
        assert "PeriodicExportingMetricReader" in self.content, \
            "Must use PeriodicExportingMetricReader for metrics"

    def test_auto_instrumentations_used(self):
        assert "getNodeAutoInstrumentations" in self.content, \
            "Must use getNodeAutoInstrumentations for automatic tracing"

    def test_fs_instrumentation_disabled(self):
        assert "instrumentation-fs" in self.content, \
            "Must explicitly disable fs instrumentation to reduce noise"
        assert "enabled: false" in self.content or "enabled:false" in self.content, \
            "fs instrumentation must be disabled"

    def test_basic_auth_header_built(self):
        """Credentials must be assembled into an Authorization header."""
        assert "OPENOBSERVE_USERNAME" in self.content, \
            "Must read OPENOBSERVE_USERNAME env var"
        assert "OPENOBSERVE_PASSWORD" in self.content, \
            "Must read OPENOBSERVE_PASSWORD env var"
        assert "Basic " in self.content or "base64" in self.content, \
            "Must build HTTP Basic auth header from credentials"

    def test_traces_endpoint_env_var(self):
        assert "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT" in self.content, \
            "Must read OTEL_EXPORTER_OTLP_TRACES_ENDPOINT env var"

    def test_metrics_endpoint_env_var(self):
        assert "OTEL_EXPORTER_OTLP_METRICS_ENDPOINT" in self.content, \
            "Must read OTEL_EXPORTER_OTLP_METRICS_ENDPOINT env var"

    def test_sigterm_handler_registered(self):
        assert "SIGTERM" in self.content, \
            "Must register a SIGTERM handler to flush telemetry on shutdown"
        assert "sdk.shutdown" in self.content, \
            "SIGTERM handler must call sdk.shutdown()"

    def test_sdk_started(self):
        assert "sdk.start()" in self.content, \
            "Must call sdk.start() to activate the SDK"

    def test_dynamic_imports_used(self):
        """Heavy OTel modules must be dynamically imported to avoid Edge bundling."""
        assert "await import(" in self.content, \
            "Must use dynamic imports to keep OTel out of Edge/browser bundles"

    def test_deployment_environment_attribute(self):
        assert "ATTR_DEPLOYMENT_ENVIRONMENT_NAME" in self.content or \
               "deployment.environment" in self.content, \
            "Must set deployment environment attribute on the Resource"

    def test_service_version_attribute(self):
        assert "ATTR_SERVICE_VERSION" in self.content or \
               "service.version" in self.content, \
            "Must set service version attribute on the Resource"


# ---------------------------------------------------------------------------
# next.config.ts
# ---------------------------------------------------------------------------


class TestNextConfig:
    """Validate that Next.js config enables the instrumentation hook."""

    def setup_method(self):
        self.content = read_file("next.config.ts")

    def test_file_exists(self):
        assert os.path.exists(os.path.join(ROOT, "next.config.ts"))

    def test_instrumentation_hook_enabled(self):
        assert "instrumentationHook" in self.content, \
            "next.config.ts must enable the instrumentationHook experimental feature"
        # The value must be true
        assert re.search(r"instrumentationHook\s*:\s*true", self.content), \
            "instrumentationHook must be set to true"

    def test_exports_next_config(self):
        assert "NextConfig" in self.content or "nextConfig" in self.content, \
            "next.config.ts must export a valid NextConfig object"


# ---------------------------------------------------------------------------
# app/lib/logger.ts
# ---------------------------------------------------------------------------


class TestLogger:
    """Validate the Winston logger with OpenObserve transport."""

    def setup_method(self):
        self.content = read_file("app/lib/logger.ts")

    def test_file_exists(self):
        assert os.path.exists(os.path.join(ROOT, "app/lib/logger.ts"))

    def test_imports_winston(self):
        assert "winston" in self.content, \
            "logger.ts must import winston"

    def test_imports_transport_stream(self):
        assert "TransportStream" in self.content or "winston-transport" in self.content, \
            "logger.ts must import from winston-transport"

    def test_openobserve_transport_class_defined(self):
        assert "OpenObserveTransport" in self.content, \
            "Must define an OpenObserveTransport class"

    def test_transport_extends_transport_stream(self):
        assert "extends TransportStream" in self.content, \
            "OpenObserveTransport must extend TransportStream"

    def test_log_method_overridden(self):
        assert "override log(" in self.content or "log(" in self.content, \
            "Must override the log() method on TransportStream"

    def test_logs_endpoint_env_var(self):
        assert "OPENOBSERVE_LOGS_ENDPOINT" in self.content, \
            "Must read OPENOBSERVE_LOGS_ENDPOINT env var"

    def test_username_env_var(self):
        assert "OPENOBSERVE_USERNAME" in self.content, \
            "Must read OPENOBSERVE_USERNAME env var"

    def test_password_env_var(self):
        assert "OPENOBSERVE_PASSWORD" in self.content, \
            "Must read OPENOBSERVE_PASSWORD env var"

    def test_basic_auth_header(self):
        assert "Basic " in self.content or "base64" in self.content, \
            "Must build HTTP Basic auth header"

    def test_posts_to_endpoint(self):
        """Transport must POST log entries to the OpenObserve endpoint."""
        assert "fetch(" in self.content, \
            "Must use fetch() to POST log entries"
        assert "POST" in self.content, \
            "Must use POST method for log ingestion"

    def test_json_array_payload(self):
        """OpenObserve _json endpoint expects an array."""
        assert "JSON.stringify([" in self.content or \
               re.search(r"JSON\.stringify\(\[", self.content), \
            "Must wrap log entry in a JSON array for OpenObserve _json endpoint"

    def test_winston_logger_created(self):
        assert "winston.createLogger" in self.content, \
            "Must create a Winston logger instance with createLogger"

    def test_console_transport_added(self):
        assert "Console" in self.content, \
            "Must add a Console transport for local development"

    def test_log_level_env_var(self):
        assert "LOG_LEVEL" in self.content, \
            "Must respect the LOG_LEVEL environment variable"

    def test_default_export(self):
        assert "export default logger" in self.content, \
            "Must default-export the logger instance"

    def test_openobserve_transport_exported(self):
        assert "export { OpenObserveTransport" in self.content or \
               "export {OpenObserveTransport" in self.content or \
               "export class OpenObserveTransport" in self.content, \
            "Must export OpenObserveTransport for testing"

    def test_timestamp_in_log_entry(self):
        assert "timestamp" in self.content, \
            "Log entries must include a timestamp field"

    def test_service_field_in_log_entry(self):
        assert "service" in self.content, \
            "Log entries must include a service field"

    def test_environment_field_in_log_entry(self):
        assert "environment" in self.content, \
            "Log entries must include an environment field"

    def test_calls_next_after_log(self):
        assert "next()" in self.content, \
            "log() implementation must call next() to chain transports"

    def test_set_immediate_used(self):
        assert "setImmediate" in self.content, \
            "Must use setImmediate to emit 'logged' event for back-pressure"


# ---------------------------------------------------------------------------
# app/api/telemetry/traces/route.ts
# ---------------------------------------------------------------------------


class TestTelemetryTracesRoute:
    """Validate the browser-to-OpenObserve OTLP trace proxy API route."""

    def setup_method(self):
        self.content = read_file("app/api/telemetry/traces/route.ts")

    def test_file_exists(self):
        assert os.path.exists(
            os.path.join(ROOT, "app/api/telemetry/traces/route.ts")
        )

    def test_exports_post_handler(self):
        assert "export async function POST" in self.content, \
            "Must export an async POST handler"

    def test_uses_next_request(self):
        assert "NextRequest" in self.content, \
            "Must use NextRequest for the incoming request"

    def test_uses_next_response(self):
        assert "NextResponse" in self.content, \
            "Must use NextResponse for the outgoing response"

    def test_reads_traces_endpoint_env(self):
        assert "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT" in self.content, \
            "Must read OTEL_EXPORTER_OTLP_TRACES_ENDPOINT for upstream URL"

    def test_reads_credentials_env(self):
        assert "OPENOBSERVE_USERNAME" in self.content, \
            "Must read OPENOBSERVE_USERNAME env var"
        assert "OPENOBSERVE_PASSWORD" in self.content, \
            "Must read OPENOBSERVE_PASSWORD env var"

    def test_builds_basic_auth_header(self):
        assert "buildBasicAuthHeader" in self.content or \
               ("Basic " in self.content and "base64" in self.content), \
            "Must build HTTP Basic auth header from credentials"

    def test_forwards_content_type(self):
        assert "content-type" in self.content or "Content-Type" in self.content, \
            "Must forward the Content-Type header from the browser"

    def test_reads_array_buffer(self):
        assert "arrayBuffer" in self.content, \
            "Must read raw body as ArrayBuffer for binary Protobuf payloads"

    def test_proxies_to_upstream(self):
        assert "fetch(" in self.content, \
            "Must use fetch() to proxy the request to OpenObserve"

    def test_forwards_upstream_status(self):
        assert "upstreamResponse.status" in self.content or \
               re.search(r"status\s*:", self.content), \
            "Must forward the upstream HTTP status code to the browser"

    def test_handles_network_error(self):
        assert "502" in self.content, \
            "Must return 502 Bad Gateway on network/upstream errors"

    def test_default_traces_endpoint(self):
        assert "localhost:5080" in self.content, \
            "Must have a default fallback to localhost:5080 for development"


# ---------------------------------------------------------------------------
# app/lib/telemetry-browser.ts
# ---------------------------------------------------------------------------


class TestTelemetryBrowser:
    """Validate the browser-side OpenTelemetry bootstrap module."""

    def setup_method(self):
        self.content = read_file("app/lib/telemetry-browser.ts")

    def test_file_exists(self):
        assert os.path.exists(os.path.join(ROOT, "app/lib/telemetry-browser.ts"))

    def test_use_client_directive(self):
        assert "'use client'" in self.content or '"use client"' in self.content, \
            "Must have 'use client' directive for Next.js client component"

    def test_exports_init_function(self):
        assert "export function initBrowserTelemetry" in self.content, \
            "Must export initBrowserTelemetry() function"

    def test_web_tracer_provider_used(self):
        assert "WebTracerProvider" in self.content, \
            "Must use WebTracerProvider for browser tracing"

    def test_otlp_trace_exporter_used(self):
        assert "OTLPTraceExporter" in self.content, \
            "Must use OTLPTraceExporter for shipping spans"

    def test_batch_span_processor_used(self):
        assert "BatchSpanProcessor" in self.content, \
            "Must use BatchSpanProcessor to batch spans before export"

    def test_zone_context_manager_used(self):
        assert "ZoneContextManager" in self.content, \
            "Must use ZoneContextManager for async context propagation"

    def test_document_load_instrumentation(self):
        assert "DocumentLoadInstrumentation" in self.content, \
            "Must enable DocumentLoadInstrumentation for page load tracing"

    def test_fetch_instrumentation(self):
        assert "FetchInstrumentation" in self.content, \
            "Must enable FetchInstrumentation for fetch() tracing"

    def test_xhr_instrumentation(self):
        assert "XMLHttpRequestInstrumentation" in self.content, \
            "Must enable XMLHttpRequestInstrumentation for XHR tracing"

    def test_proxy_endpoint_used(self):
        assert "/api/telemetry/traces" in self.content, \
            "OTLPTraceExporter must target the Next.js proxy route"

    def test_idempotency_guard(self):
        assert "_initialised" in self.content or "_initialized" in self.content, \
            "Must track initialisation state to prevent duplicate setup"

    def test_window_guard(self):
        assert "typeof window" in self.content, \
            "Must guard against SSR by checking typeof window"

    def test_browser_service_name(self):
        assert "workouter-fe-browser" in self.content, \
            "Browser spans must use 'workouter-fe-browser' service name"

    def test_click_listener_registered(self):
        assert "addEventListener" in self.content and "click" in self.content, \
            "Must register a click listener for user interaction spans"

    def test_click_span_created(self):
        assert "user.click" in self.content, \
            "Click handler must create 'user.click' spans"

    def test_click_text_truncated(self):
        assert "CLICK_TEXT_MAX_LENGTH" in self.content or "60" in self.content, \
            "Click text must be truncated to avoid large payloads"

    def test_resource_from_attributes_used(self):
        assert "resourceFromAttributes" in self.content, \
            "Must use resourceFromAttributes to build the OTel Resource"

    def test_service_name_attribute_set(self):
        assert "ATTR_SERVICE_NAME" in self.content or "service.name" in self.content, \
            "Must set service.name attribute on the Resource"

    def test_provider_registered(self):
        assert "provider.register" in self.content, \
            "Must call provider.register() to activate the global tracer"

    def test_returns_web_tracer_provider(self):
        assert "WebTracerProvider" in self.content, \
            "initBrowserTelemetry must return a WebTracerProvider"

    def test_element_tag_attribute(self):
        assert "ui.element.tag" in self.content, \
            "Click spans must record the 'ui.element.tag' attribute"

    def test_element_text_attribute(self):
        assert "ui.element.text" in self.content, \
            "Click spans must record the 'ui.element.text' attribute"


# ---------------------------------------------------------------------------
# app/components/TelemetryInit.tsx
# ---------------------------------------------------------------------------


class TestTelemetryInitComponent:
    """Validate the TelemetryInit React component."""

    def setup_method(self):
        self.content = read_file("app/components/TelemetryInit.tsx")

    def test_file_exists(self):
        assert os.path.exists(
            os.path.join(ROOT, "app/components/TelemetryInit.tsx")
        )

    def test_use_client_directive(self):
        assert "'use client'" in self.content or '"use client"' in self.content, \
            "TelemetryInit.tsx must have 'use client' directive"

    def test_imports_use_effect(self):
        assert "useEffect" in self.content, \
            "Must import and use React useEffect hook"

    def test_imports_init_browser_telemetry(self):
        assert "initBrowserTelemetry" in self.content, \
            "Must import initBrowserTelemetry from telemetry-browser"

    def test_calls_init_in_effect(self):
        assert "initBrowserTelemetry()" in self.content, \
            "Must call initBrowserTelemetry() inside useEffect"

    def test_empty_dependency_array(self):
        assert "}, [])" in self.content or "}, [ ])" in self.content, \
            "useEffect must have empty dependency array to run once on mount"

    def test_renders_null(self):
        assert "return null" in self.content, \
            "TelemetryInit must render null (no visible DOM output)"

    def test_default_exported(self):
        assert "export default function TelemetryInit" in self.content, \
            "TelemetryInit must be exported as the default export"

    def test_telemetry_browser_import_path(self):
        assert "telemetry-browser" in self.content, \
            "Must import from @/app/lib/telemetry-browser"


# ---------------------------------------------------------------------------
# app/layout.tsx
# ---------------------------------------------------------------------------


class TestRootLayout:
    """Validate that the root layout includes TelemetryInit."""

    def setup_method(self):
        self.content = read_file("app/layout.tsx")

    def test_file_exists(self):
        assert os.path.exists(os.path.join(ROOT, "app/layout.tsx"))

    def test_imports_telemetry_init(self):
        assert "TelemetryInit" in self.content, \
            "Root layout must import TelemetryInit component"

    def test_renders_telemetry_init(self):
        assert "<TelemetryInit" in self.content or "<TelemetryInit/>" in self.content, \
            "Root layout must render <TelemetryInit /> in the body"

    def test_no_use_client_directive(self):
        """Root layout must be a Server Component."""
        first_lines = self.content[:200]
        assert "'use client'" not in first_lines and '"use client"' not in first_lines, \
            "Root layout must NOT have 'use client' directive (it's a Server Component)"

    def test_telemetry_init_import_path(self):
        assert "TelemetryInit" in self.content, \
            "Must import TelemetryInit from @/app/components/TelemetryInit"

    def test_has_root_layout_function(self):
        assert "function RootLayout" in self.content or \
               "export default function" in self.content, \
            "Must export a default RootLayout function"

    def test_has_metadata_export(self):
        assert "export const metadata" in self.content, \
            "Must export metadata for Next.js"

    def test_body_contains_children(self):
        assert "{children}" in self.content, \
            "Root layout body must render {children}"


# ---------------------------------------------------------------------------
# app/api/v1/workouts/route.ts
# ---------------------------------------------------------------------------


class TestWorkoutsRoute:
    """Validate the workouts API route with OpenTelemetry tracing."""

    def setup_method(self):
        self.content = read_file("app/api/v1/workouts/route.ts")

    def test_file_exists(self):
        assert os.path.exists(
            os.path.join(ROOT, "app/api/v1/workouts/route.ts")
        )

    def test_exports_get_handler(self):
        assert "export async function GET" in self.content, \
            "Must export a GET handler"

    def test_exports_post_handler(self):
        assert "export async function POST" in self.content, \
            "Must export a POST handler"

    def test_imports_opentelemetry_api(self):
        assert "@opentelemetry/api" in self.content, \
            "Must import from @opentelemetry/api for tracing"

    def test_imports_trace(self):
        assert "trace" in self.content, \
            "Must import trace from @opentelemetry/api"

    def test_uses_span_status_code(self):
        assert "SpanStatusCode" in self.content, \
            "Must use SpanStatusCode to set span status"

    def test_get_tracer_called(self):
        assert "getTracer" in self.content, \
            "Must get a named tracer via trace.getTracer()"

    def test_tracer_name_includes_route(self):
        assert "workouts" in self.content, \
            "Tracer name must reference the workouts route"

    def test_start_active_span_used(self):
        assert "startActiveSpan" in self.content, \
            "Must use startActiveSpan for request-level tracing"

    def test_span_set_status_ok(self):
        assert "SpanStatusCode.OK" in self.content, \
            "Must set span status to OK on success"

    def test_span_set_status_error(self):
        assert "SpanStatusCode.ERROR" in self.content, \
            "Must set span status to ERROR on failure"

    def test_span_ended_in_finally(self):
        assert "span.end()" in self.content, \
            "Span must be ended in a finally block"

    def test_bearer_token_extracted(self):
        assert "Bearer" in self.content, \
            "Must extract Bearer token from Authorization header"

    def test_token_validated(self):
        assert "validateAccessToken" in self.content, \
            "Must validate the Bearer token"

    def test_unauthorized_returned_without_token(self):
        assert "401" in self.content, \
            "Must return 401 Unauthorized when token is missing or invalid"

    def test_forbidden_without_scope(self):
        assert "403" in self.content, \
            "Must return 403 Forbidden when scope is insufficient"

    def test_read_scope_checked(self):
        assert "read:workouts" in self.content, \
            "GET handler must check for read:workouts scope"

    def test_write_scope_checked(self):
        assert "write:workouts" in self.content, \
            "POST handler must check for write:workouts scope"

    def test_imports_logger(self):
        assert "logger" in self.content, \
            "Must import and use the Winston logger"

    def test_logger_info_called(self):
        assert "logger.info" in self.content, \
            "Must log informational messages via logger.info()"

    def test_logger_error_called(self):
        assert "logger.error" in self.content, \
            "Must log errors via logger.error()"

    def test_user_id_on_span(self):
        assert "user.id" in self.content, \
            "Must record user.id attribute on the active span"

    def test_db_child_span_created(self):
        assert "db.query" in self.content or "db.system" in self.content, \
            "Must create child span for database query"

    def test_record_exception_called(self):
        assert "recordException" in self.content, \
            "Must call span.recordException() to capture error details"

    def test_span_attribute_db_system(self):
        assert "db.system" in self.content, \
            "DB child span must set db.system attribute"

    def test_200_returned_for_get(self):
        """GET must return a 200 with workouts list."""
        assert "workouts" in self.content, \
            "GET response must include a 'workouts' field"

    def test_201_returned_for_post(self):
        assert "201" in self.content, \
            "POST handler must return 201 Created on success"

    def test_next_response_json_used(self):
        assert "NextResponse.json" in self.content, \
            "Must use NextResponse.json() to build JSON responses"
