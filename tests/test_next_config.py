"""
Tests for next.config.ts — verifies Sentry/GlitchTip webpack plugin wiring.
"""

import os
import pytest

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read_file(relative_path: str) -> str:
    full_path = os.path.join(REPO_ROOT, relative_path)
    with open(full_path, "r", encoding="utf-8") as f:
        return f.read()


class TestNextConfig:
    CONFIG_PATH = "next.config.ts"

    def test_file_exists(self):
        path = os.path.join(REPO_ROOT, self.CONFIG_PATH)
        assert os.path.isfile(path), "next.config.ts must exist"

    def test_imports_with_sentry_config(self):
        content = read_file(self.CONFIG_PATH)
        assert 'withSentryConfig' in content, \
            "next.config.ts must import and use withSentryConfig from @sentry/nextjs"

    def test_wraps_next_config_with_sentry(self):
        content = read_file(self.CONFIG_PATH)
        assert 'withSentryConfig(nextConfig' in content or \
               'withSentryConfig(nextConfig,' in content, \
            "Must wrap nextConfig with withSentryConfig()"

    def test_sentry_url_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'SENTRY_URL' in content, \
            "Must configure SENTRY_URL (GlitchTip instance base URL)"

    def test_sentry_org_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'SENTRY_ORG' in content, \
            "Must configure SENTRY_ORG from env var"

    def test_sentry_project_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'SENTRY_PROJECT' in content, \
            "Must configure SENTRY_PROJECT from env var"

    def test_sentry_auth_token_configured(self):
        content = read_file(self.CONFIG_PATH)
        assert 'SENTRY_AUTH_TOKEN' in content, \
            "Must configure SENTRY_AUTH_TOKEN for source-map upload"

    def test_widen_client_file_upload_enabled(self):
        content = read_file(self.CONFIG_PATH)
        assert 'widenClientFileUpload' in content, \
            "Must set widenClientFileUpload: true to upload all client chunks"
        assert 'widenClientFileUpload: true' in content or \
               'widenClientFileUpload:true' in content, \
            "widenClientFileUpload must be set to true"

    def test_hide_source_maps_enabled(self):
        content = read_file(self.CONFIG_PATH)
        assert 'hideSourceMaps' in content, \
            "Must set hideSourceMaps: true to prevent source maps being served to users"
        assert 'hideSourceMaps: true' in content or \
               'hideSourceMaps:true' in content, \
            "hideSourceMaps must be set to true"

    def test_disable_logger_enabled(self):
        content = read_file(self.CONFIG_PATH)
        assert 'disableLogger' in content, \
            "Must set disableLogger: true to tree-shake Sentry logger calls"
        assert 'disableLogger: true' in content or \
               'disableLogger:true' in content, \
            "disableLogger must be set to true"

    def test_react_component_annotation_enabled(self):
        content = read_file(self.CONFIG_PATH)
        assert 'reactComponentAnnotation' in content, \
            "Must configure reactComponentAnnotation for richer breadcrumbs"
        assert 'enabled: true' in content or 'enabled:true' in content, \
            "reactComponentAnnotation.enabled must be true"
