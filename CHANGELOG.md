# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-29

### Added

- New artistic direction and logo (golf-ball owl), *Club-house* light theme and
  *Nocturne* dark theme.
- Hole-by-hole view with the score of every player on each hole.
- Full scorecard view and export of the card as an image.
- Offline support through a service worker, installable PWA icons
  (regular and maskable).
- Screen kept awake during a round.
- Project documentation (README, changelog) and CI workflow.

### Changed

- Upgraded to Next.js 16, React 19 and Tailwind CSS v4; dropped NextUI.
- Better mobile layout; player names are no longer cropped.
- The theme now follows the phone's setting (the light/dark toggle was removed).
- Larger fonts on the scoreboard.
- The version displayed in the app is read from `package.json`.

### Fixed

- Wrong point distribution in some 4-player games.

## [1.1.0] - 2025-03-29

### Added

- Owl app icon, Apple touch icon and favicon.
- Layout adapted to 3 or 4 players.

### Changed

- Only the *chouette* score is shown at the bottom of the table; the per-player
  stroke sum was removed.
- Margins and spacing reworked across pages, dark/light colors on the rules page.

## [1.0.0] - 2024-12-25

### Added

- Dynamic scoreboard with score computation for 3 and 4 players.
- 9 or 18 hole games.
- Rules of the game page.
- Web app manifest to install the app on a phone.

[2.0.0]: https://github.com/HugoDemRey/la-chouette/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/HugoDemRey/la-chouette/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/HugoDemRey/la-chouette/releases/tag/v1.0.0
