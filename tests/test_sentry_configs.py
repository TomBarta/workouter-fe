"""
Tests for GlitchTip / Sentry configuration files.

Verifies that sentry.client.config.ts, sentry.server.config.ts, and
sentry.edge.config.ts exist and contain the expected configuration.
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
# sentry.client.config.ts
# ---------------------------------------------------------------------------

class TestSentryClientConfig:
    CONFIG_PATH = "sentry.client.config.ts"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.CONFIG_PATH)
        assert os.path.isfile(path), f"{self.CONFIG_PATH} must exist"

    def test_imports_sentry_nextjs(self):
        content = read_file(self.CONFIG_PATH)
        assert '@sentry/nextjs' in content, "Must import from @sentry/nextjs"

    def test_calls_sentry_init(self):
        content = read_file(self.CONFIG_PATH)
        assert 'Sentry.init(' in content, "Must call Sentry.init()"

    def test_uses_next_public_sentry_dsn(self):
        content = read_file(self.CONFIG_PATH)
        assert 'NEXT_PUBLIC_SENTRY_DSN' in content, \
            "Client config must use NEXT_PUBLIC_SENTRY_DSN (browser-visible env var)"

    def test_tunnel_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'tunnel' in content and '/api/tunnel' in content, \
            "Client config must set tunnel: '/api/tunnel' to bypass ad-blockers"

    def test_environment_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'environment' in content, "Must set environment field"
        assert 'NEXT_PUBLIC_SENTRY_ENVIRONMENT' in content, \
            "Must read environment from NEXT_PUBLIC_SENTRY_ENVIRONMENT"

    def test_traces_sample_rate_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'tracesSampleRate' in content, "Must configure tracesSampleRate"

    def test_replay_integration_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'replaysSessionSampleRate' in content, \
            "Must configure replaysSessionSampleRate for session replay"
        assert 'replaysOnErrorSampleRate' in content, \
            "Must configure replaysOnErrorSampleRate for error replays"
        assert 'replayIntegration' in content, \
            "Must include replayIntegration()"

    def test_before_send_filters_401(self):
        content = read_file(self.CONFIG_PATH)
        assert 'beforeSend' in content, "Must define beforeSend hook"
        assert '401' in content, "beforeSend must filter 401 responses"
        assert re.search(r'return\s+null', content), \
            "beforeSend must return null to drop events"

    def test_masks_pii_in_replay(self):
        content = read_file(self.CONFIG_PATH)
        assert 'maskAllText' in content, \
            "Must set maskAllText: true to protect PII in session replay"


# ---------------------------------------------------------------------------
# sentry.server.config.ts
# ---------------------------------------------------------------------------

class TestSentryServerConfig:
    CONFIG_PATH = "sentry.server.config.ts"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.CONFIG_PATH)
        assert os.path.isfile(path), f"{self.CONFIG_PATH} must exist"

    def test_imports_sentry_nextjs(self):
        content = read_file(self.CONFIG_PATH)
        assert '@sentry/nextjs' in content, "Must import from @sentry/nextjs"

    def test_calls_sentry_init(self):
        content = read_file(self.CONFIG_PATH)
        assert 'Sentry.init(' in content, "Must call Sentry.init()"

    def test_uses_server_only_dsn(self):
        content = read_file(self.CONFIG_PATH)
        # Server config should use SENTRY_DSN (no NEXT_PUBLIC_ prefix)
        assert 'SENTRY_DSN' in content, \
            "Server config must reference SENTRY_DSN"

    def test_no_next_public_dsn_as_primary(self):
        content = read_file(self.CONFIG_PATH)
        # The dsn: field should point to process.env.SENTRY_DSN not NEXT_PUBLIC_SENTRY_DSN
        dsn_line = [l for l in content.splitlines() if 'dsn:' in l and 'process.env' in l]
        assert dsn_line, "Must set dsn from process.env"
        # The actual dsn assignment should use SENTRY_DSN
        assert any('SENTRY_DSN' in l and 'NEXT_PUBLIC' not in l for l in dsn_line), \
            "Server dsn field must use SENTRY_DSN (not NEXT_PUBLIC_SENTRY_DSN)"

    def test_traces_sample_rate_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'tracesSampleRate' in content, "Must configure tracesSampleRate"

    def test_prisma_integration_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'prismaIntegration' in content, \
            "Server config must include prismaIntegration() for DB query tracing"

    def test_before_send_filters_401(self):
        content = read_file(self.CONFIG_PATH)
        assert 'beforeSend' in content, "Must define beforeSend hook"
        assert '401' in content, "beforeSend must filter 401 responses"

    def test_environment_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'SENTRY_ENVIRONMENT' in content, \
            "Must read environment from SENTRY_ENVIRONMENT"


# ---------------------------------------------------------------------------
# sentry.edge.config.ts
# ---------------------------------------------------------------------------

class TestSentryEdgeConfig:
    CONFIG_PATH = "sentry.edge.config.ts"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.CONFIG_PATH)
        assert os.path.isfile(path), f"{self.CONFIG_PATH} must exist"

    def test_imports_sentry_nextjs(self):
        content = read_file(self.CONFIG_PATH)
        assert '@sentry/nextjs' in content, "Must import from @sentry/nextjs"

    def test_calls_sentry_init(self):
        content = read_file(self.CONFIG_PATH)
        assert 'Sentry.init(' in content, "Must call Sentry.init()"

    def test_uses_server_dsn(self):
        content = read_file(self.CONFIG_PATH)
        assert 'SENTRY_DSN' in content, "Edge config must reference SENTRY_DSN"

    def test_no_prisma_integration(self):
        content = read_file(self.CONFIG_PATH)
        # Edge runtime cannot use Node.js APIs like Prisma
        assert 'prismaIntegration' not in content, \
            "Edge config must NOT include prismaIntegration (Edge runtime has no Node.js APIs)"

    def test_traces_sample_rate_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'tracesSampleRate' in content, "Must configure tracesSampleRate"

    def test_before_send_filters_401(self):
        content = read_file(self.CONFIG_PATH)
        assert 'beforeSend' in content, "Must define beforeSend hook"
        assert '401' in content, "beforeSend must filter 401 responses"

    def test_environment_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'SENTRY_ENVIRONMENT' in content, \
            "Must read environment from SENTRY_ENVIRONMENT"
