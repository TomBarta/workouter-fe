"""
Tests for API route implementations:
  - app/api/health/route.ts   — health-check endpoint
  - app/api/tunnel/route.ts   — Sentry envelope tunnel
  - app/api/v1/workouts/route.ts — workouts endpoint with Sentry instrumentation
"""

import os
import re
import pytest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read_file(relative_path: str) -> str:
    full_path = os.path.join(REPO_ROOT, relative_path)
    with open(full_path, "r", encoding="utf-8") as f:
        return f.read()


# ---------------------------------------------------------------------------
# /api/health
# ---------------------------------------------------------------------------

class TestHealthRoute:
    ROUTE_PATH = "app/api/health/route.ts"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.ROUTE_PATH)
        assert os.path.isfile(path), f"{self.ROUTE_PATH} must exist"

    def test_exports_get_handler(self):
        content = read_file(self.ROUTE_PATH)
        assert 'export async function GET' in content or \
               'export function GET' in content, \
            "Health route must export a GET handler"

    def test_uses_next_response(self):
        content = read_file(self.ROUTE_PATH)
        assert 'NextResponse' in content, \
            "Must use NextResponse for response construction"

    def test_returns_healthy_status(self):
        content = read_file(self.ROUTE_PATH)
        assert '"healthy"' in content or "'healthy'" in content, \
            "Must return status: 'healthy' on success"

    def test_returns_unhealthy_status(self):
        content = read_file(self.ROUTE_PATH)
        assert '"unhealthy"' in content or "'unhealthy'" in content, \
            "Must return status: 'unhealthy' on failure"

    def test_returns_503_on_failure(self):
        content = read_file(self.ROUTE_PATH)
        assert '503' in content, \
            "Must return HTTP 503 when database is unreachable"

    def test_returns_200_on_success(self):
        content = read_file(self.ROUTE_PATH)
        assert '200' in content, \
            "Must return HTTP 200 when database probe succeeds"

    def test_probes_database(self):
        content = read_file(self.ROUTE_PATH)
        assert 'prisma' in content, \
            "Health route must use Prisma to probe the database"
        # Should run a simple query like SELECT 1
        assert 'queryRaw' in content or 'SELECT 1' in content or \
               '$queryRaw' in content, \
            "Must run a raw SELECT query to probe the database"

    def test_includes_timestamp(self):
        content = read_file(self.ROUTE_PATH)
        assert 'timestamp' in content, \
            "Health response must include a timestamp field"

    def test_includes_services_field(self):
        content = read_file(self.ROUTE_PATH)
        assert 'services' in content, \
            "Healthy response must include a services field"
        assert 'database' in content, \
            "services field must indicate database status"

    def test_force_dynamic_export(self):
        content = read_file(self.ROUTE_PATH)
        assert 'force-dynamic' in content, \
            "Must export dynamic = 'force-dynamic' to prevent static caching"

    def test_no_auth_required(self):
        content = read_file(self.ROUTE_PATH)
        # Health checks are intentionally public — they should not call auth()
        assert 'validateAccessToken' not in content, \
            "Health endpoint must not require authentication"


# ---------------------------------------------------------------------------
# /api/tunnel
# ---------------------------------------------------------------------------

class TestTunnelRoute:
    ROUTE_PATH = "app/api/tunnel/route.ts"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.ROUTE_PATH)
        assert os.path.isfile(path), f"{self.ROUTE_PATH} must exist"

    def test_exports_post_handler(self):
        content = read_file(self.ROUTE_PATH)
        assert 'export async function POST' in content or \
               'export function POST' in content, \
            "Tunnel route must export a POST handler"

    def test_reads_envelope_as_text(self):
        content = read_file(self.ROUTE_PATH)
        assert 'request.text()' in content or '.text()' in content, \
            "Must read request body as text (not JSON) — Sentry envelopes are newline-delimited"

    def test_validates_dsn_host(self):
        content = read_file(self.ROUTE_PATH)
        assert 'NEXT_PUBLIC_SENTRY_DSN' in content, \
            "Must validate envelope DSN host against NEXT_PUBLIC_SENTRY_DSN to prevent open-proxy abuse"

    def test_rejects_mismatched_host(self):
        content = read_file(self.ROUTE_PATH)
        # Should return 400 when hosts don't match
        assert '400' in content, \
            "Must return HTTP 400 when DSN host does not match allowed host"

    def test_forwards_to_glitchtip(self):
        content = read_file(self.ROUTE_PATH)
        assert 'fetch(' in content, \
            "Must fetch() to forward the envelope to the upstream GlitchTip ingest endpoint"

    def test_uses_envelope_content_type(self):
        content = read_file(self.ROUTE_PATH)
        assert 'application/x-sentry-envelope' in content, \
            "Must set Content-Type: application/x-sentry-envelope when forwarding"

    def test_builds_upstream_url(self):
        content = read_file(self.ROUTE_PATH)
        assert 'envelope' in content.lower(), \
            "Must build the upstream URL with /envelope/ path"
        # Should construct something like https://<host>/api/<projectId>/envelope/
        assert '/api/' in content or 'projectId' in content, \
            "Must construct the correct GlitchTip ingest URL"

    def test_returns_502_on_upstream_failure(self):
        content = read_file(self.ROUTE_PATH)
        assert '502' in content, \
            "Must return HTTP 502 when the upstream GlitchTip endpoint is unreachable"

    def test_returns_400_on_empty_body(self):
        content = read_file(self.ROUTE_PATH)
        assert '400' in content, \
            "Must return HTTP 400 for malformed requests"

    def test_refuses_without_dsn_in_production(self):
        content = read_file(self.ROUTE_PATH)
        assert 'production' in content, \
            "Must refuse to forward in production when NEXT_PUBLIC_SENTRY_DSN is not set"
        assert '500' in content, \
            "Must return HTTP 500 when tunnel cannot be configured in production"

    def test_parses_envelope_header(self):
        content = read_file(self.ROUTE_PATH)
        # The first line of a Sentry envelope is the envelope header JSON
        assert 'JSON.parse' in content, \
            "Must JSON.parse the envelope header from the first line"

    def test_extracts_dsn_from_envelope(self):
        content = read_file(self.ROUTE_PATH)
        assert 'dsn' in content, \
            "Must extract the DSN from the parsed envelope header"


# ---------------------------------------------------------------------------
# /api/v1/workouts
# ---------------------------------------------------------------------------

class TestWorkoutsRoute:
    ROUTE_PATH = "app/api/v1/workouts/route.ts"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.ROUTE_PATH)
        assert os.path.isfile(path), f"{self.ROUTE_PATH} must exist"

    def test_exports_get_handler(self):
        content = read_file(self.ROUTE_PATH)
        assert 'export async function GET' in content or \
               'export function GET' in content, \
            "Workouts route must export a GET handler"

    def test_exports_post_handler(self):
        content = read_file(self.ROUTE_PATH)
        assert 'export async function POST' in content or \
               'export function POST' in content, \
            "Workouts route must export a POST handler"

    def test_imports_sentry(self):
        content = read_file(self.ROUTE_PATH)
        assert '@sentry/nextjs' in content, \
            "Workouts route must import @sentry/nextjs for error capture"

    def test_captures_exceptions_with_sentry(self):
        content = read_file(self.ROUTE_PATH)
        assert 'captureException' in content, \
            "Must call Sentry.captureException() to report unexpected errors to GlitchTip"

    def test_requires_bearer_token_get(self):
        content = read_file(self.ROUTE_PATH)
        assert 'Bearer' in content, \
            "Must check for Bearer token in Authorization header"
        assert '401' in content, \
            "Must return 401 for unauthenticated requests"

    def test_checks_read_workouts_scope(self):
        content = read_file(self.ROUTE_PATH)
        assert 'read:workouts' in content, \
            "GET /api/v1/workouts must require read:workouts scope"

    def test_checks_write_workouts_scope(self):
        content = read_file(self.ROUTE_PATH)
        assert 'write:workouts' in content, \
            "POST /api/v1/workouts must require write:workouts scope"

    def test_returns_403_for_insufficient_scope(self):
        content = read_file(self.ROUTE_PATH)
        assert '403' in content, \
            "Must return HTTP 403 when the token lacks the required scope"

    def test_returns_500_on_unexpected_error(self):
        content = read_file(self.ROUTE_PATH)
        assert '500' in content, \
            "Must return HTTP 500 for unexpected runtime errors"

    def test_tags_sentry_events(self):
        content = read_file(self.ROUTE_PATH)
        assert 'tags' in content, \
            "Must tag Sentry events with endpoint/method metadata for easy filtering"

    def test_get_returns_workouts_list(self):
        content = read_file(self.ROUTE_PATH)
        assert 'workouts' in content, \
            "GET response must include a workouts field"

    def test_validates_access_token(self):
        content = read_file(self.ROUTE_PATH)
        assert 'validateAccessToken' in content, \
            "Must call validateAccessToken to verify the Bearer token"
