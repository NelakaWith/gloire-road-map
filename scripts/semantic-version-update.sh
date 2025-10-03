#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(pwd)"

# Validate input
if [ ${#} -lt 1 ]; then
  echo "Usage: $0 <semver>"
  echo "Example: $0 1.9.0"
  exit 1
fi

VERSION="$1"
echo "semantic-version-update: setting version $VERSION"

# Basic semver validation (allows optional leading 'v', prerelease and build metadata)
# Note: bash's regex doesn't support non-capturing groups (?:...), so use compatible groups
SEMVER_REGEX='^v?([0-9]+)\.([0-9]+)\.([0-9]+)(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$'
if ! [[ "$VERSION" =~ $SEMVER_REGEX ]]; then
  echo "Error: VERSION '$VERSION' is not a valid semantic version"
  echo "Expected format: MAJOR.MINOR.PATCH (optionally prefixed with v)"
  exit 2
fi

# Ensure npm is available
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm not found in PATH. Install Node.js/npm or ensure npm is available in CI." >&2
  exit 4
fi

# npm prefers versions without a leading 'v'
NPM_VERSION="${VERSION#v}"

# helper: update if package.json exists
update_version() {
  local dir="$1"
  if [ -f "$dir/package.json" ]; then
    echo "Updating package.json in $dir"
    # quick sanity check: package.json should contain a version field
    if ! grep -q '"version"' "$dir/package.json" 2>/dev/null; then
      echo "Warning: $dir/package.json does not contain a \"version\" field or is unreadable"
    fi

    # run npm version without git tag and capture output for diagnostics
    local output
    if ! output=$(cd "$dir" && npm version "$NPM_VERSION" --no-git-tag-version 2>&1); then
      echo "Error: failed to update version in $dir"
      echo "npm output:\n$output"
      echo "Possible causes: invalid version, corrupted package.json, or npm not available in this environment." >&2
      exit 3
    else
      echo "$output"
    fi
  else
    echo "Skipping $dir: package.json not found"
  fi
}

# Update root
update_version "$REPO_ROOT"
# Update frontend
update_version "$REPO_ROOT/frontend"
# Update backend
update_version "$REPO_ROOT/backend"

echo "semantic-version-update: done"
