# Changelog — Aurora Hotel

All notable changes are recorded here. Entries must link to the task/evidence
that proves them and must not claim an unreleased or unverified behavior.

## Unreleased

### Added
- Created `docs/superpowers/plans/2026-08-01-aurora-hotel-p0-completion-master-plan.md` for P0 graduation demo release.
- Added 13 high-resolution local hospitality images under `public/images/aurora/`.

### Changed
- Stabilized luxury UI redesign across homepage, rooms, room detail, and booking components.
- Configured explicit `dynamic = "force-dynamic"` on authenticated admin pages to ensure clean production builds.

### Fixed
- Fixed broken image references on `/rooms` and `/rooms/[slug]` pages.
- Corrected import paths across Next.js app pages and Node ESM test suites.

### Security
- Verified RBAC guards, Content Security Policy, static security headers, and webhook signature verification.

