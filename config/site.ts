export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "La Chouette",
  description: "Le jeu de golf à 3 ou 4 joueurs",
  /** From package.json, injected at build time by next.config.js. */
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? "dev",
  /**
   * Turns on the dev* shortcuts below, which are ignored while it is off.
   * Shows a DEV badge while on: set it back to false before releasing.
   */
  devMode: false,
  /** Ignores the phone's setting and forces one theme. */
  devForceColorMode: "none" as "none" | "dark" | "light",
  /** Replays the winner reveal on every "Voir la carte", finished or not. */
  devForceWinnerAnimation: false,
  /** Header color of each theme, used for the phone's status bar. */
  themeColors: {
    light: "#123d30",
    dark: "#0f2b21",
  },
};
