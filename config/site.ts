export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "La Chouette",
  description: "Le jeu de golf à 3 ou 4 joueurs",
  /** From package.json, injected at build time by next.config.js. */
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? "dev",
  /** Header color of each theme, used for the phone's status bar. */
  themeColors: {
    light: "#123d30",
    dark: "#0c1322",
  },
};
