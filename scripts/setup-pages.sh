#!/usr/bin/env bash
#
# Configure GitHub Pages for this repository and trigger the first deploy.
#
# Everything this does needs your GitHub credentials, which is why it is a
# script you run rather than something already applied. It is idempotent —
# re-running it is safe.
#
#   ./scripts/setup-pages.sh
#
# Requires: gh (https://cli.github.com), authenticated via `gh auth login`.

set -euo pipefail

REPO="${REPO:-techmuch/nexus-shell}"
WORKFLOW="deploy-pages.yml"

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }
die()  { printf '  \033[31m✗\033[0m %s\n' "$1" >&2; exit 1; }

# ---------------------------------------------------------------- preflight --

bold "Checking prerequisites"

command -v gh >/dev/null 2>&1 || die "gh is not installed — see https://cli.github.com"
ok "gh $(gh --version | head -1 | awk '{print $3}')"

gh auth status >/dev/null 2>&1 || die "gh is not authenticated — run: gh auth login"
ok "authenticated as $(gh api user --jq .login)"

gh repo view "$REPO" >/dev/null 2>&1 || die "cannot access $REPO"
ok "repository $REPO"

# Pages deployment needs Actions to be able to write. Warn rather than fail:
# the setting lives at the org level for some accounts.
if ! gh api "repos/$REPO/actions/permissions" --jq '.enabled' 2>/dev/null | grep -q true; then
  warn "GitHub Actions may be disabled for this repository"
fi

# ------------------------------------------------------------------- enable --

bold "Configuring Pages"

# `build_type: workflow` is what makes Pages serve the artifact uploaded by
# actions/deploy-pages instead of a branch. This is the setting shown in the UI
# as Settings → Pages → Source → "GitHub Actions".
if gh api "repos/$REPO/pages" >/dev/null 2>&1; then
  current="$(gh api "repos/$REPO/pages" --jq '.build_type // "legacy"')"
  if [ "$current" = "workflow" ]; then
    ok "Pages already builds from GitHub Actions"
  else
    gh api -X PUT "repos/$REPO/pages" -f build_type=workflow >/dev/null
    ok "switched Pages source from '$current' to GitHub Actions"
  fi
else
  gh api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null
  ok "enabled Pages with GitHub Actions as the source"
fi

# Pages serves over HTTPS once the certificate is provisioned; requesting it up
# front avoids a mixed-content window on first publish.
gh api -X PUT "repos/$REPO/pages" -F https_enforced=true >/dev/null 2>&1 \
  && ok "HTTPS enforced" \
  || warn "could not enforce HTTPS yet (certificate may still be provisioning)"

# ------------------------------------------------------------------- deploy --

bold "Triggering the first deploy"

if ! gh workflow view "$WORKFLOW" --repo "$REPO" >/dev/null 2>&1; then
  die "workflow $WORKFLOW not found on the default branch — push it first"
fi

gh workflow run "$WORKFLOW" --repo "$REPO" >/dev/null
ok "dispatched $WORKFLOW"

printf '\n  Waiting for the run to start'
for _ in $(seq 1 20); do
  sleep 3
  printf '.'
  run_id="$(gh run list --repo "$REPO" --workflow "$WORKFLOW" --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null || true)"
  [ -n "${run_id:-}" ] && break
done
printf '\n'

if [ -n "${run_id:-}" ]; then
  ok "run #$run_id started"
  printf '\n'
  bold "Following the run (Ctrl-C to stop watching; the deploy continues)"
  gh run watch "$run_id" --repo "$REPO" --exit-status || warn "run did not succeed — see the log above"
else
  warn "could not find the run; check: gh run list --repo $REPO"
fi

# -------------------------------------------------------------------- done --

url="$(gh api "repos/$REPO/pages" --jq .html_url 2>/dev/null || true)"

printf '\n'
bold "Done"
if [ -n "${url:-}" ]; then
  ok "site:      $url"
  ok "storybook: ${url%/}/storybook/"
else
  ok "Pages is configured; the URL appears under Settings → Pages once the first deploy finishes"
fi
printf '\n  Every push to main redeploys automatically.\n\n'
