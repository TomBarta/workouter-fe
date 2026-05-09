"""
Tests for environment variable scaffolding and documentation files:
  - .env.example
  - .gitignore
  - AUTH_SETUP.md
  - README.md
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
# .env.example
# ---------------------------------------------------------------------------

class TestEnvExample:
    FILE_PATH = ".env.example"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.FILE_PATH)
        assert os.path.isfile(path), ".env.example must exist"

    def test_contains_next_public_sentry_dsn(self):
        content = read_file(self.FILE_PATH)
        assert 'NEXT_PUBLIC_SENTRY_DSN' in content, \
            "Must document NEXT_PUBLIC_SENTRY_DSN (browser-visible DSN for GlitchTip)"

    def test_contains_sentry_dsn(self):
        content = read_file(self.FILE_PATH)
        assert 'SENTRY_DSN' in content, \
            "Must document SENTRY_DSN (server-only DSN for GlitchTip)"

    def test_contains_sentry_environment(self):
        content = read_file(self.FILE_PATH)
        assert 'SENTRY_ENVIRONMENT' in content, \
            "Must document SENTRY_ENVIRONMENT"

    def test_contains_next_public_sentry_environment(self):
        content = read_file(self.FILE_PATH)
        assert 'NEXT_PUBLIC_SENTRY_ENVIRONMENT' in content, \
            "Must document NEXT_PUBLIC_SENTRY_ENVIRONMENT for browser SDK"

    def test_contains_sentry_release(self):
        content = read_file(self.FILE_PATH)
        assert 'SENTRY_RELEASE' in content, \
            "Must document SENTRY_RELEASE for suspect-commit tracking"

    def test_contains_next_public_sentry_release(self):
        content = read_file(self.FILE_PATH)
        assert 'NEXT_PUBLIC_SENTRY_RELEASE' in content, \
            "Must document NEXT_PUBLIC_SENTRY_RELEASE for browser SDK"

    def test_contains_sentry_url(self):
        content = read_file(self.FILE_PATH)
        assert 'SENTRY_URL' in content, \
            "Must document SENTRY_URL (GlitchTip base URL for source-map upload)"

    def test_contains_sentry_org(self):
        content = read_file(self.FILE_PATH)
        assert 'SENTRY_ORG' in content, \
            "Must document SENTRY_ORG for source-map upload"

    def test_contains_sentry_project(self):
        content = read_file(self.FILE_PATH)
        assert 'SENTRY_PROJECT' in content, \
            "Must document SENTRY_PROJECT for source-map upload"

    def test_contains_sentry_auth_token(self):
        content = read_file(self.FILE_PATH)
        assert 'SENTRY_AUTH_TOKEN' in content, \
            "Must document SENTRY_AUTH_TOKEN for source-map upload authentication"

    def test_contains_glitchtip_example_dsn(self):
        content = read_file(self.FILE_PATH)
        assert 'glitchtip.com' in content, \
            "Must include a GlitchTip DSN example URL"

    def test_contains_database_url(self):
        content = read_file(self.FILE_PATH)
        assert 'DATABASE_URL' in content, \
            "Must document DATABASE_URL for PostgreSQL connection"

    def test_contains_auth_secret(self):
        content = read_file(self.FILE_PATH)
        assert 'AUTH_SECRET' in content, \
            "Must document AUTH_SECRET for NextAuth.js"


# ---------------------------------------------------------------------------
# .gitignore
# ---------------------------------------------------------------------------

class TestGitIgnore:
    FILE_PATH = ".gitignore"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.FILE_PATH)
        assert os.path.isfile(path), ".gitignore must exist"

    def test_ignores_env_files(self):
        content = read_file(self.FILE_PATH)
        assert '.env' in content, \
            "Must ignore .env files to prevent secret leakage"

    def test_allows_env_example(self):
        content = read_file(self.FILE_PATH)
        assert '.env.example' in content and '!' in content, \
            "Must explicitly allow .env.example (negation rule) while ignoring other .env files"

    def test_ignores_node_modules(self):
        content = read_file(self.FILE_PATH)
        assert 'node_modules' in content, \
            "Must ignore node_modules/"

    def test_ignores_next_build_output(self):
        content = read_file(self.FILE_PATH)
        assert '.next' in content, \
            "Must ignore .next/ build output"

    def test_ignores_pem_files(self):
        content = read_file(self.FILE_PATH)
        assert '*.pem' in content, \
            "Must ignore *.pem certificate/key files"


# ---------------------------------------------------------------------------
# README.md
# ---------------------------------------------------------------------------

class TestReadme:
    FILE_PATH = "README.md"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.FILE_PATH)
        assert os.path.isfile(path), "README.md must exist"

    def test_mentions_glitchtip(self):
        content = read_file(self.FILE_PATH)
        assert 'GlitchTip' in content or 'glitchtip' in content.lower(), \
            "README must document GlitchTip error tracking"

    def test_documents_health_endpoint(self):
        content = read_file(self.FILE_PATH)
        assert '/api/health' in content, \
            "README must document the /api/health endpoint"

    def test_documents_tunnel_endpoint(self):
        content = read_file(self.FILE_PATH)
        assert '/api/tunnel' in content, \
            "README must document the /api/tunnel endpoint"

    def test_documents_sentry_env_vars(self):
        content = read_file(self.FILE_PATH)
        assert 'SENTRY_DSN' in content or 'NEXT_PUBLIC_SENTRY_DSN' in content, \
            "README must document Sentry/GlitchTip environment variables"

    def test_documents_source_map_upload(self):
        content = read_file(self.FILE_PATH)
        assert 'source' in content.lower() and 'map' in content.lower(), \
            "README must describe the source-map upload feature"

    def test_documents_sentry_client_config(self):
        content = read_file(self.FILE_PATH)
        assert 'sentry.client.config' in content or 'sentry.server.config' in content, \
            "README must reference the Sentry config files"

    def test_documents_setup_steps(self):
        content = read_file(self.FILE_PATH)
        assert 'Setup' in content or 'setup' in content, \
            "README must include setup instructions"


# ---------------------------------------------------------------------------
# AUTH_SETUP.md
# ---------------------------------------------------------------------------

class TestAuthSetupMd:
    FILE_PATH = "AUTH_SETUP.md"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.FILE_PATH)
        assert os.path.isfile(path), "AUTH_SETUP.md must exist"

    def test_documents_glitchtip(self):
        content = read_file(self.FILE_PATH)
        assert 'GlitchTip' in content or 'glitchtip' in content.lower(), \
            "AUTH_SETUP.md must include GlitchTip configuration guidance"

    def test_documents_sentry_variables(self):
        content = read_file(self.FILE_PATH)
        assert 'SENTRY' in content, \
            "AUTH_SETUP.md must document Sentry/GlitchTip environment variables"

    def test_documents_health_endpoint(self):
        content = read_file(self.FILE_PATH)
        assert '/api/health' in content, \
            "AUTH_SETUP.md must document the health-check endpoint"

    def test_documents_tunnel_endpoint(self):
        content = read_file(self.FILE_PATH)
        assert '/api/tunnel' in content, \
            "AUTH_SETUP.md must document the tunnel endpoint"

    def test_documents_auth_providers(self):
        content = read_file(self.FILE_PATH)
        assert 'Google' in content or 'GitHub' in content, \
            "AUTH_SETUP.md must document OAuth provider setup"

    def test_documents_protected_routes(self):
        content = read_file(self.FILE_PATH)
        assert 'Protected' in content or 'protected' in content, \
            "AUTH_SETUP.md must document which routes are protected"
