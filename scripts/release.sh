#!/usr/bin/env bash
#
# Recopied manual release script
# Usage: ./scripts/release.sh <new_version>
# Example: ./scripts/release.sh 1.2.0
#
# What this does:
#   1. Bumps the version in package.json, Cargo.toml, and tauri.conf.json
#   2. Builds the Tauri app (produces .deb + .AppImage)
#   3. Commits, tags, and pushes to GitHub
#   4. Creates a GitHub Release and uploads the artifacts
#
# Requirements:
#   - gh (GitHub CLI) — https://cli.github.com — must be authenticated (`gh auth login`)
#   - cargo tauri build dependencies (libwebkit2gtk-4.1-dev, xclip, etc.)

set -euo pipefail

# ── helpers ───────────────────────────────────────────────────────────────────
bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '  \033[34m→\033[0m %s\n' "$*"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; }
die()  { printf '\033[31mError:\033[0m %s\n' "$*" >&2; exit 1; }

# ── args ──────────────────────────────────────────────────────────────────────
if [ $# -ne 1 ]; then
  die "Usage: $0 <new_version>  (e.g. $0 1.2.0)"
fi

NEW_VERSION="$1"

if ! [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
  die "Version must be valid semver (e.g. 1.2.0 or 1.2.0-beta.1)"
fi

# ── dependencies ──────────────────────────────────────────────────────────────
command -v gh >/dev/null 2>&1     || die "gh (GitHub CLI) not found. Install: https://cli.github.com"
command -v cargo >/dev/null 2>&1  || die "cargo not found. Install Rust: https://rustup.rs"
command -v npm >/dev/null 2>&1    || die "npm not found."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
cd "$ROOT"

# ── confirm clean working tree ─────────────────────────────────────────────────
if [ -n "$(git status --porcelain)" ]; then
  die "Working tree is dirty. Commit or stash your changes before releasing."
fi

CURRENT_VERSION=$(grep -oP '"version": "\K[^"]+' package.json | head -1)
bold "Releasing Recopied: $CURRENT_VERSION → $NEW_VERSION"
echo ""

# ── 1. bump versions ──────────────────────────────────────────────────────────
info "Bumping version in config files..."
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
ok "package.json"
sed -i "0,/^version = \"$CURRENT_VERSION\"/s//version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml
ok "src-tauri/Cargo.toml"
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
ok "src-tauri/tauri.conf.json"
cd src-tauri && cargo generate-lockfile 2>/dev/null && cd "$ROOT"
ok "Cargo.lock updated"

# ── 2. install frontend deps ──────────────────────────────────────────────────
info "Installing frontend dependencies..."
npm ci --silent
ok "npm ci done"

# ── 3. build ──────────────────────────────────────────────────────────────────
bold ""
bold "Building Recopied v$NEW_VERSION..."
cargo tauri build
ok "Build complete"

# ── 4. locate artifacts ───────────────────────────────────────────────────────
BUNDLE_DIR="src-tauri/target/release/bundle"
DEB_FILE=$(find "$BUNDLE_DIR/deb" -name "*.deb" 2>/dev/null | head -1)
APPIMAGE_FILE=$(find "$BUNDLE_DIR/appimage" -name "*.AppImage" 2>/dev/null | head -1)

echo ""
[ -n "$DEB_FILE" ]      && ok "Found: $DEB_FILE"      || info "Warning: .deb not found"
[ -n "$APPIMAGE_FILE" ] && ok "Found: $APPIMAGE_FILE" || info "Warning: .AppImage not found"

# ── 5. commit + tag ───────────────────────────────────────────────────────────
echo ""
info "Committing version bump..."
git add package.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json
git commit -m "chore: bump version to $NEW_VERSION"
git tag "v$NEW_VERSION"
ok "Tagged v$NEW_VERSION"

info "Pushing to GitHub..."
git push origin main
git push origin "v$NEW_VERSION"
ok "Pushed main + tag"

# ── 6. create GitHub release ──────────────────────────────────────────────────
echo ""
info "Creating GitHub Release v$NEW_VERSION..."

RELEASE_NOTES="See [CHANGELOG.md](https://github.com/mrbeandev/Recopied/blob/main/CHANGELOG.md) for what's new in this release."
ARTIFACTS=()
[ -n "$DEB_FILE" ]      && ARTIFACTS+=("$DEB_FILE")
[ -n "$APPIMAGE_FILE" ] && ARTIFACTS+=("$APPIMAGE_FILE")

gh release create "v$NEW_VERSION" \
  --title "Recopied v$NEW_VERSION" \
  --notes "$RELEASE_NOTES" \
  --draft \
  "${ARTIFACTS[@]}"

ok "Draft release created on GitHub"
echo ""
bold "Done! Open the draft release, add proper notes, then publish it:"
gh release view "v$NEW_VERSION" --web 2>/dev/null || echo "  https://github.com/mrbeandev/Recopied/releases"
