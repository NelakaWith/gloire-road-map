#!/usr/bin/env bash
set -euo pipefail

VERSION="$1"
REPO_ROOT="$(pwd)"

echo "semantic-version-update: setting version $VERSION"

# helper: update if package.json exists
update_version() {
  local dir="$1"
  if [ -f "$dir/package.json" ]; then
    echo "Updating package.json in $dir"
    # run npm version without git tag
    (cd "$dir" && npm version "$VERSION" --no-git-tag-version)
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
