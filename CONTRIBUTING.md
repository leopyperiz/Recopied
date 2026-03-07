# Contributing to Recopied

Thank you for your interest in contributing to Recopied! This guide will help you get started.

## Development Setup

### Prerequisites

- **Rust** ≥ 1.77 — [Install via rustup](https://rustup.rs)
- **Node.js** ≥ 18 — [Install](https://nodejs.org)
- **Tauri v2 CLI** — `cargo install tauri-cli --version "^2"`
- **System libraries** (Debian/Ubuntu/Mint):

  ```bash
  sudo apt install libgtk-3-dev libwebkit2gtk-4.1-dev librsvg2-dev patchelf xclip
  ```

### Running Locally

```bash
git clone https://github.com/YOUR_USERNAME/recopied.git
cd recopied
npm install
cargo tauri dev
```

## How to Contribute

### Reporting Bugs

1. Check existing [issues](https://github.com/YOUR_USERNAME/recopied/issues) to avoid duplicates
2. Open a new issue using the **Bug Report** template
3. Include:
   - Linux distribution and desktop environment
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Open an issue using the **Feature Request** template
2. Describe the use case and proposed behavior

### Submitting Code

1. **Fork** the repository
2. Create a **feature branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes
4. **Test** your changes with `cargo tauri dev`
5. **Commit** with a clear message:

   ```text
   feat: add Wayland clipboard support
   fix: prevent duplicate items on rapid copy
   ```

6. **Push** to your fork and open a **Pull Request** against `main`

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
| -------- | ------- |
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | CSS/formatting (no logic change) |
| `refactor:` | Code restructure (no behavior change) |
| `perf:` | Performance improvement |
| `test:` | Adding tests |
| `chore:` | Build/tooling changes |

## Code Style

- **Rust**: Follow standard `rustfmt` conventions. Run `cargo fmt` before committing.
- **TypeScript/React**: Prettier is configured — run `npx prettier --write .` or use your editor's formatter.
- **Tailwind CSS**: Use utility classes; avoid custom CSS unless necessary.

## Project Architecture

| Directory | Description |
| ----------- | ------------- |
| `src/` | React frontend (components, types, IPC wrappers) |
| `src-tauri/src/` | Rust backend (clipboard watcher, DB, commands, settings) |
| `src-tauri/src/clipboard/` | Clipboard monitoring via `xclip` |
| `src-tauri/src/db/` | SQLite database layer |
| `src-tauri/src/commands/` | Tauri IPC command handlers |

## Areas for Contribution

Here are some areas where help is especially welcome:

- **Wayland support** — Testing and improving clipboard monitoring on Wayland compositors
- **Packaging** — Flatpak, Snap, AUR packages
- **Accessibility** — Screen reader support, high contrast themes
- **i18n** — Internationalization and translations
- **Performance** — Optimizing for large clipboard histories
- **Tests** — Unit and integration tests for Rust and TypeScript

## Versioning & Releases

Recopied follows [Semantic Versioning](https://semver.org/). The version is tracked in three files:

- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

Use the bump script to keep them in sync:

```bash
./scripts/bump-version.sh 1.2.0
```

Then update `CHANGELOG.md`, commit, tag (`git tag v1.2.0`), and push. Pushing a `v*` tag triggers the GitHub Actions release workflow.

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We are committed to maintaining a welcoming and inclusive community.
