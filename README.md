# La Chouette

Feuille de score mobile pour La Chouette, un jeu de golf à 3 ou 4 joueurs où
les points de chaque trou se partagent selon le classement des coups.

- Application web installable (PWA), utilisable hors ligne sur le parcours.
- Thème clair « Club-house » et thème sombre « Nocturne », selon le réglage du téléphone.
- La partie est enregistrée sur le téléphone (local storage).

## Développement

```bash
npm install
npm run dev
```

`npm run build && npm start` pour tester la version installable : le service
worker (`public/sw.js`) n'est enregistré qu'en production.

## Organisation

- `lib/scoring.ts` : règle de calcul des points (partagée avec la page des règles).
- `lib/game.ts`, `lib/use-game.ts` : partie enregistrée et état partagé.
- `app/partie` : écrans « Trou » et « Carte ».
- Icônes : `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`, `public/icons/`.

## Stack

Next.js, React, Tailwind CSS v4, TypeScript.
