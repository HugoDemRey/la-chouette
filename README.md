<p align="center">
  <img src="public/icons/icon-192.png" width="96" height="96" alt="La Chouette logo" />
</p>

<h1 align="center">La Chouette</h1>

<p align="center">
  Mobile scorecard for <strong>La Chouette</strong>, a golf game for 3 or 4 players.<br />
  Installable on your phone, works offline on the course.
</p>

<p align="center">
  <a href="https://github.com/HugoDemRey/la-chouette/actions/workflows/ci.yml"><img src="https://github.com/HugoDemRey/la-chouette/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/HugoDemRey/la-chouette/releases"><img src="https://img.shields.io/github/v/tag/HugoDemRey/la-chouette?label=version" alt="Latest version" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license" /></a>
</p>

---

> The app's interface is in **French**.

## The game

La Chouette is played hole by hole between 3 or 4 golfers. On each hole the
players are ranked by their number of strokes and earn points by place:

| Players | 1st | 2nd | 3rd | 4th |
| :-----: | :-: | :-: | :-: | :-: |
|    3    |  4  |  2  |  0  |  —  |
|    4    |  6  |  4  |  2  |  0  |

Tied players share the points of the places they occupy — two leaders in a
4-player game each get (6 + 4) / 2 = **5**. The running totals are shown
relative to the last player, and whoever has the most points at the end wins.

The full rules are available in the app (*Règles du jeu*). The scoring logic
lives in [`lib/scoring.ts`](lib/scoring.ts).

## Features

- **Made for the phone** — one hole per screen, large tap targets, portrait layout.
- **9 or 18 holes**, 3 or 4 players, par entered on each hole as you reach it.
- **Live standings** and a full scorecard view (birdie, par, bogey… markers).
- **Share the card** as an image at the end of the round.
- **Offline first** — the round keeps working without signal on the course.
- **Nothing to sign up for** — the game is saved on the device only (local storage).
- **Keeps the screen awake** during a round, where the browser allows it.
- **Light and dark themes** (*Club-house* / *Nocturne*) following the phone's setting.

## Install on your phone

La Chouette is a [Progressive Web App](https://developer.mozilla.org/docs/Web/Progressive_web_apps):
there is no app store, you add it from the browser and it then opens full screen
like a native app, with its own icon.

**iPhone / iPad (Safari)**

1. Open the app's URL in **Safari**.
2. Tap the **Share** button, then **Add to Home Screen** (*Sur l'écran d'accueil*).
3. Confirm with **Add**.

**Android (Chrome)**

1. Open the app's URL in **Chrome**.
2. Tap **Install** in the banner, or open the **⋮** menu and choose
   **Install app** (*Installer l'application*).

Open the app once with a connection so it can cache itself; after that it
works offline. Updates are picked up automatically the next time the app is
opened with signal.

## Run it locally

Requirements: [Node.js](https://nodejs.org/) 20.9 or newer, npm.

```bash
git clone https://github.com/HugoDemRey/la-chouette.git
cd la-chouette
npm install
npm run dev
```

The app runs on <http://localhost:3000>. To try it on your phone, open
`http://<your-computer-ip>:3000` on the same Wi-Fi network.

| Script              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Development server with hot reload             |
| `npm run build`     | Production build                               |
| `npm start`         | Serve the production build                     |
| `npm run lint`      | Lint and auto-fix the code                     |
| `npm run lint:check`| Lint without modifying files (used by the CI)  |
| `npm run typecheck` | TypeScript type check                          |

> The service worker ([`public/sw.js`](public/sw.js)) is only registered in
> production. Use `npm run build && npm start` to test installation and offline
> mode.

## Deploy

It is a standard [Next.js](https://nextjs.org/) application: deploy it on
[Vercel](https://vercel.com/new) (zero configuration) or on any host running
Node.js with `npm run build && npm start`.

The site must be served over **HTTPS** for the app to be installable and to
work offline (service workers require a secure context; `localhost` is the
only exception).

## Project structure

```
app/
  page.tsx               New game: players, 9 / 18 holes
  partie/                Round screens: hole view, scorecard, card export
  regles-du-jeu/         Rules of the game
  manifest.ts            PWA manifest
components/              Header, owl logo, avatars, service worker registration
config/site.ts           App name, description, version, theme colors
lib/
  scoring.ts             Points per hole, standings, golf terms
  game.ts, use-game.ts   Saved game and shared state
  card-image.ts          Scorecard export as an image
  use-wake-lock.ts       Keeps the screen on during a round
public/
  sw.js                  Service worker (offline cache)
  icons/                 PWA icons (regular and maskable)
styles/globals.css       Tailwind CSS theme (light and dark tokens)
```

## Tech stack

[Next.js](https://nextjs.org/) · [React](https://react.dev/) ·
[TypeScript](https://www.typescriptlang.org/) ·
[Tailwind CSS v4](https://tailwindcss.com/)

## Versioning and releases

The project follows [Semantic Versioning](https://semver.org/) and
[Conventional Commits](https://www.conventionalcommits.org/) (`feat(...)`,
`fix(...)`, `docs(...)`, `style(...)`, `chore(...)`…). Changes are listed in
the [changelog](CHANGELOG.md).

The version shown in the app comes from `package.json`. To publish a release:

1. Bump `version` in `package.json` and add the entry to `CHANGELOG.md`.
2. Commit: `chore(Release): vX.Y.Z`.
3. Tag and push:

   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```

## License

[MIT](LICENSE) © Hugo Demule
