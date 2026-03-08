#!/usr/bin/env bash
#
# Recopied version bump script
# Usage: ./scripts/bump-version.sh <new_version>
# Example: ./scripts/bump-version.sh 1.2.0
#
# Updates version in:
#   - package.json
#   - src-tauri/Cargo.toml
#   - src-tauri/tauri.conf.json
#
# Then creates a git tag and commit for the release.

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <new_version>"
  echo "Example: $0 1.2.0"
  exit 1
fi

NEW_VERSION="$1"

# Validate semver format
if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
  echo "Error: Version must be valid semver (e.g. 1.2.0 or 1.2.0-beta.1)"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Read current version from package.json
CURRENT_VERSION=$(grep -oP '"version": "\K[^"]+' package.json | head -1)
echo "Current version: $CURRENT_VERSION"
echo "New version:     $NEW_VERSION"
echo ""

if [ "$CURRENT_VERSION" = "$NEW_VERSION" ]; then
  echo "Error: New version is the same as current version"
  exit 1
fi

# Update package.json
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
echo "✓ Updated package.json"

# Update src-tauri/Cargo.toml (only the package version, not dependency versions)
sed -i "0,/^version = \"$CURRENT_VERSION\"/s//version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml
echo "✓ Updated src-tauri/Cargo.toml"

# Update src-tauri/tauri.conf.json
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
echo "✓ Updated src-tauri/tauri.conf.json"

# Update Cargo.lock
cd src-tauri && cargo generate-lockfile 2>/dev/null && cd ..
echo "✓ Updated Cargo.lock"

echo ""
echo "Version bumped to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Update CHANGELOG.md with new version notes"
echo "  2. Run: ./scripts/release.sh $NEW_VERSION"
echo "     (builds the app, commits, tags, pushes, and creates a GitHub draft release)"
