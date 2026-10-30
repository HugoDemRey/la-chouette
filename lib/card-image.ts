import type { Game } from "@/lib/game";

import { siteConfig } from "@/config/site";
import {
  OWL_BEAK,
  OWL_BELLY,
  OWL_BODY,
  OWL_DIMPLES,
  OWL_EYES,
  OWL_EYE_RADIUS,
  OWL_EYE_Y,
  OWL_PUPIL_RADIUS,
} from "@/lib/owl";
import {
  completedHoles,
  formatStrokes,
  holePoints,
  isHoleComplete,
  scoreMark,
  standings,
} from "@/lib/scoring";

/*
 * Keepsake picture of a game, drawn like a paper scorecard: owl header,
 * standings, then the card with holes as columns (front and back nine).
 * Colors and fonts are read from the theme the player is using.
 */

const WIDTH = 1080;
const PAD = 56;
const SCALE = 1.5;
const NINE = 9;

const HEADER_H = 330;
const SECTION_TITLE_H = 112;
const STANDING_H = 104;
const STANDING_GAP = 12;
const NAME_COL = 250;
const CARD_HEAD_H = 54;
const CARD_PAR_H = 50;
const CARD_ROW_H = 84;
const HALF_LABEL_H = 44;
const HALF_GAP = 28;
const FOOTER_H = 240;

type Ctx = CanvasRenderingContext2D;
type Theme = ReturnType<typeof readTheme>;

function readTheme() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();

  return {
    bg: v("--bg"),
    surface: v("--surface"),
    ink: v("--ink"),
    muted: v("--muted"),
    line: v("--line"),
    head: v("--head"),
    headInk: v("--head-ink"),
    accent: v("--accent"),
    accentInk: v("--accent-ink"),
    accentStrong: v("--accent-strong"),
    hl: v("--hl"),
    avatarInk: v("--avatar-ink"),
    players: [1, 2, 3, 4].map((i) => v(`--p${i}`)),
    owl: {
      body: v("--owl-body"),
      belly: v("--owl-belly"),
      eye: v("--owl-eye"),
      pupil: v("--owl-pupil"),
      beak: v("--owl-beak"),
    },
    display: v("--display"),
    displayWeight: v("--display-weight"),
    num: v("--num"),
    numWeight: v("--num-weight"),
    sans: `${v("--font-figtree")}, system-ui, sans-serif`,
  };
}

export function cardFileName(game: Game) {
  const date = (game.startedAt ? new Date(game.startedAt) : new Date())
    .toISOString()
    .slice(0, 10);

  return `la-chouette-${date}.png`;
}

export async function renderCardImage(game: Game): Promise<Blob> {
  const t = readTheme();

  await Promise.all(
    [
      `${t.displayWeight} 80px ${t.display}`,
      `${t.numWeight} 40px ${t.num}`,
      `700 30px ${t.sans}`,
      `500 26px ${t.sans}`,
    ].map((font) => document.fonts.load(font).catch(() => [])),
  );

  const n = game.players.length;
  const halves = game.holeCount === 18 ? [0, 1] : [0];
  const cardH =
    halves.length * (HALF_LABEL_H + CARD_HEAD_H + CARD_PAR_H + n * CARD_ROW_H) +
    (halves.length - 1) * HALF_GAP;
  const height =
    HEADER_H +
    SECTION_TITLE_H +
    n * STANDING_H +
    (n - 1) * STANDING_GAP +
    SECTION_TITLE_H +
    cardH +
    FOOTER_H;

  const canvas = document.createElement("canvas");

  canvas.width = WIDTH * SCALE;
  canvas.height = height * SCALE;
  const ctx = canvas.getContext("2d")!;

  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = t.bg;
  ctx.fillRect(0, 0, WIDTH, height);

  let y = drawHeader(ctx, t, game);

  y = drawStandings(ctx, t, game, y);
  y = drawCard(ctx, t, game, halves, y);
  drawFooter(ctx, t, game, y);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Image non générée")),
      "image/png",
    ),
  );
}

/* ---------- Sections ---------- */

function drawHeader(ctx: Ctx, t: Theme, game: Game) {
  ctx.fillStyle = t.head;
  ctx.fillRect(0, 0, WIDTH, HEADER_H);

  // Golf-ball dimples.
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = t.headInk;
  for (let x = 10; x < WIDTH; x += 20)
    for (let y = 10; y < HEADER_H; y += 20) dot(ctx, x, y, 1.9);
  ctx.restore();

  drawOwl(ctx, t, PAD - 8, 78, 172);

  const x = PAD + 190;
  const played = completedHoles(game);
  const date = (
    game.startedAt ? new Date(game.startedAt) : new Date()
  ).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  label(ctx, t, "CARTE DE SCORE", x, 112, t.headInk, 0.75);
  text(ctx, "La Chouette", x, 196, {
    font: font(t.display, t.displayWeight, 88),
    color: t.headInk,
  });
  text(ctx, `${date} · ${game.holeCount} trous · ${game.players.length} joueurs`, x, 244, {
    font: font(t.sans, 500, 28),
    color: t.headInk,
    alpha: 0.82,
    maxWidth: WIDTH - x - PAD,
  });

  const pill =
    played === game.holeCount
      ? "Partie terminée"
      : `En cours · ${played} trou${played > 1 ? "s" : ""} sur ${game.holeCount}`;

  ctx.font = font(t.sans, 700, 22);
  const pillW = ctx.measureText(pill).width + 36;

  ctx.fillStyle = t.accent;
  roundRect(ctx, x, 266, pillW, 40, 20);
  ctx.fill();
  text(ctx, pill, x + 18, 293, { font: font(t.sans, 700, 22), color: t.accentInk });

  return HEADER_H;
}

function drawStandings(ctx: Ctx, t: Theme, game: Game, top: number) {
  const { absolutePoints, relativePoints, ranks } = standings(game);
  const played = completedHoles(game);
  const isFinished = played === game.holeCount;
  const winners = game.players.filter((_, i) => ranks[i] === 1);
  const order = game.players
    .map((_, i) => i)
    .sort((a, b) => ranks[a] - ranks[b] || a - b);

  text(ctx, "Classement", PAD, top + 70, {
    font: font(t.display, t.displayWeight, 46),
    color: t.ink,
  });
  const summary =
    played === 0
      ? "Aucun trou joué pour l’instant"
      : !isFinished
        ? `Classement provisoire après ${played} trou${played > 1 ? "s" : ""}`
        : winners.length === 1
          ? `Victoire de ${winners[0]} avec ${absolutePoints[game.players.indexOf(winners[0])]} points`
          : `Égalité en tête : ${winners.join(" et ")}`;

  text(ctx, summary, WIDTH - PAD, top + 70, {
    font: font(t.sans, 600, 24),
    color: t.muted,
    align: "right",
    maxWidth: WIDTH - 2 * PAD - 300,
  });

  let y = top + SECTION_TITLE_H;

  order.forEach((player) => {
    const leader = ranks[player] === 1 && played > 0;
    const strokes = game.strokes.reduce((sum, row) => sum + (row[player] ?? 0), 0);

    ctx.fillStyle = leader ? t.hl : t.surface;
    roundRect(ctx, PAD, y, WIDTH - 2 * PAD, STANDING_H, 16);
    ctx.fill();
    ctx.strokeStyle = t.line;
    ctx.lineWidth = 2;
    ctx.stroke();

    const cy = y + STANDING_H / 2;

    text(ctx, String(ranks[player]), PAD + 44, cy + 16, {
      font: font(t.num, t.numWeight, 44),
      color: leader ? t.accentStrong : t.muted,
      align: "center",
    });
    avatar(ctx, t, player, game.players[player], PAD + 120, cy, 32);
    text(ctx, game.players[player], PAD + 172, cy - 4, {
      font: font(t.sans, 700, 34),
      color: t.ink,
      maxWidth: WIDTH - 2 * PAD - 172 - 210,
    });
    text(ctx, strokes ? `${strokes} coups` : "–", PAD + 172, cy + 32, {
      font: font(t.sans, 500, 24),
      color: t.muted,
    });
    text(ctx, String(absolutePoints[player]), WIDTH - PAD - 96, cy + 18, {
      font: font(t.num, t.numWeight, 56),
      color: leader ? t.accentStrong : t.ink,
      align: "right",
    });
    text(ctx, "pts", WIDTH - PAD - 32, cy + 18, {
      font: font(t.sans, 600, 24),
      color: t.muted,
      align: "right",
    });
    y += STANDING_H + STANDING_GAP;
  });

  return y - STANDING_GAP;
}

function drawCard(ctx: Ctx, t: Theme, game: Game, halves: number[], top: number) {
  text(ctx, "La carte", PAD, top + 70, {
    font: font(t.display, t.displayWeight, 46),
    color: t.ink,
  });

  const n = game.players.length;
  const colW = (WIDTH - 2 * PAD - NAME_COL) / (NINE + 1);
  let y = top + SECTION_TITLE_H;

  halves.forEach((half) => {
    const holes = Array.from({ length: NINE }, (_, i) => i + half * NINE);
    const blockH = CARD_HEAD_H + CARD_PAR_H + n * CARD_ROW_H;
    const colX = (i: number) => PAD + NAME_COL + colW * i + colW / 2;

    label(
      ctx,
      t,
      halves.length === 1 ? "PARCOURS" : half === 0 ? "ALLER · TROUS 1 À 9" : "RETOUR · TROUS 10 À 18",
      PAD,
      y + 26,
      t.muted,
    );
    y += HALF_LABEL_H;

    // Card body.
    ctx.save();
    roundRect(ctx, PAD, y, WIDTH - 2 * PAD, blockH, 16);
    ctx.fillStyle = t.surface;
    ctx.fill();
    ctx.clip();

    // Hole numbers band, like the printed header of a club card.
    ctx.fillStyle = t.head;
    ctx.fillRect(PAD, y, WIDTH - 2 * PAD, CARD_HEAD_H);
    label(ctx, t, "TROU", PAD + 24, y + 35, t.headInk, 0.75);
    holes.forEach((hole, i) =>
      text(ctx, String(hole + 1), colX(i), y + 37, {
        font: font(t.num, t.numWeight, 26),
        color: t.headInk,
        align: "center",
      }),
    );
    label(ctx, t, "TOT.", colX(NINE), y + 35, t.headInk, 0.75, "center");

    // Par row.
    const parY = y + CARD_HEAD_H;

    ctx.fillStyle = t.hl;
    ctx.fillRect(PAD, parY, WIDTH - 2 * PAD, CARD_PAR_H);
    label(ctx, t, "PAR", PAD + 24, parY + 33, t.muted);
    holes.forEach((hole, i) =>
      text(ctx, game.pars[hole] === null ? "–" : String(game.pars[hole]), colX(i), parY + 35, {
        font: font(t.num, t.numWeight, 26),
        color: t.accentStrong,
        align: "center",
      }),
    );
    const parTotal = holes.reduce((s, h) => s + (game.pars[h] ?? 0), 0);

    text(ctx, parTotal ? String(parTotal) : "–", colX(NINE), parY + 35, {
      font: font(t.num, t.numWeight, 26),
      color: t.accentStrong,
      align: "center",
    });

    // Player rows.
    game.players.forEach((name, player) => {
      const rowY = parY + CARD_PAR_H + player * CARD_ROW_H;
      const cy = rowY + CARD_ROW_H / 2;

      if (player > 0) hLine(ctx, t.line, PAD, WIDTH - PAD, rowY);
      avatar(ctx, t, player, name, PAD + 38, cy, 18);
      const lines = nameLines(ctx, name, font(t.sans, 700, 26), NAME_COL - 66 - 8);

      lines.forEach((line, i) =>
        text(ctx, line, PAD + 66, cy + 9 + (i - (lines.length - 1) / 2) * 28, {
          font: font(t.sans, 700, lines.length > 1 ? 24 : 26),
          color: t.ink,
          maxWidth: NAME_COL - 66 - 8,
        }),
      );

      holes.forEach((hole, i) => {
        const strokes = game.strokes[hole][player];
        const par = game.pars[hole];

        if (strokes === null || par === null) {
          text(ctx, "·", colX(i), cy + 8, {
            font: font(t.sans, 700, 26),
            color: t.muted,
            alpha: 0.5,
            align: "center",
          });

          return;
        }
        markShape(ctx, scoreMark(strokes, par), colX(i), cy, t.ink, t.surface);
        text(ctx, formatStrokes(strokes), colX(i), cy + 11, {
          font: font(t.num, t.numWeight, 30),
          color: t.ink,
          align: "center",
        });

        const pts = isHoleComplete(game, hole)
          ? holePoints(game.strokes[hole])
          : null;

        if (pts) badge(ctx, t, String(pts[player]), colX(i) + 14, cy - 40);
      });

      const total = holes.reduce((s, h) => s + (game.strokes[h][player] ?? 0), 0);

      text(ctx, total ? String(total) : "–", colX(NINE), cy + 11, {
        font: font(t.num, t.numWeight, 30),
        color: t.ink,
        align: "center",
      });
    });

    // Column rules: one before the total column.
    ctx.fillStyle = t.line;
    ctx.fillRect(PAD + NAME_COL + colW * NINE, y + CARD_HEAD_H, 2, blockH - CARD_HEAD_H);
    ctx.restore();

    ctx.strokeStyle = t.line;
    ctx.lineWidth = 2;
    roundRect(ctx, PAD, y, WIDTH - 2 * PAD, blockH, 16);
    ctx.stroke();

    y += blockH + HALF_GAP;
  });

  return y - HALF_GAP;
}

function drawFooter(ctx: Ctx, t: Theme, game: Game, top: number) {
  const y = top + 56;

  hLine(ctx, t.line, PAD, WIDTH - PAD, y);

  // Signature.
  drawOwl(ctx, t, PAD - 4, y + 30, 84);
  text(ctx, "Une partie de La Chouette", PAD + 92, y + 74, {
    font: font(t.display, t.displayWeight, 34),
    color: t.ink,
  });
  text(ctx, "Le jeu de golf à 3 ou 4 joueurs", PAD + 92, y + 110, {
    font: font(t.sans, 500, 22),
    color: t.muted,
  });

  // The rule, as a stat.
  text(ctx, String(game.players.length === 3 ? 6 : 12), WIDTH - PAD, y + 86, {
    font: font(t.num, t.numWeight, 56),
    color: t.accentStrong,
    align: "right",
  });
  label(ctx, t, "POINTS PAR TROU", WIDTH - PAD, y + 114, t.muted, 1, "right");

  // Colophon.
  label(
    ctx,
    t,
    `LA CHOUETTE · VERSION ${siteConfig.version}`,
    WIDTH / 2,
    y + FOOTER_H - 74,
    t.muted,
    0.6,
    "center",
  );
}

/* ---------- Drawing helpers ---------- */

function font(family: string, weight: string | number, size: number) {
  return `${weight} ${size}px ${family}`;
}

interface TextOptions {
  font: string;
  color: string;
  align?: CanvasTextAlign;
  alpha?: number;
  /** Shrinks the text down to 70%, then ellipsizes, to fit. */
  maxWidth?: number;
}

function text(ctx: Ctx, value: string, x: number, y: number, o: TextOptions) {
  ctx.save();
  ctx.font = o.font;
  ctx.fillStyle = o.color;
  ctx.textAlign = o.align ?? "left";
  ctx.globalAlpha = o.alpha ?? 1;

  let shown = value;

  if (o.maxWidth && ctx.measureText(shown).width > o.maxWidth) {
    const size = Number(/(\d+)px/.exec(o.font)?.[1] ?? 16);

    for (let s = size - 1; s >= size * 0.7; s--) {
      ctx.font = o.font.replace(/\d+px/, `${s}px`);
      if (ctx.measureText(shown).width <= o.maxWidth) break;
    }
    while (shown.length > 1 && ctx.measureText(`${shown}…`).width > o.maxWidth)
      shown = shown.slice(0, -1);
    if (shown !== value) shown = `${shown.trimEnd()}…`;
  }
  ctx.fillText(shown, x, y);
  ctx.restore();
}

/** Small uppercase label with a little tracking. */
function label(
  ctx: Ctx,
  t: Theme,
  value: string,
  x: number,
  y: number,
  color: string,
  alpha = 1,
  align: CanvasTextAlign = "left",
) {
  ctx.save();
  if ("letterSpacing" in ctx) ctx.letterSpacing = "2.5px";
  text(ctx, value, x, y, {
    font: font(t.sans, 700, 20),
    color,
    alpha,
    align,
  });
  ctx.restore();
}

/** Splits a long name after a space or hyphen so it fits on two lines. */
function nameLines(ctx: Ctx, name: string, fontSpec: string, maxWidth: number) {
  ctx.font = fontSpec;
  if (ctx.measureText(name).width <= maxWidth) return [name];

  const breaks = [...name.matchAll(/[ -]/g)].map((m) => m.index! + 1);

  if (breaks.length === 0) return [name];
  const middle = name.length / 2;
  const at = breaks.reduce((best, b) =>
    Math.abs(b - middle) < Math.abs(best - middle) ? b : best,
  );

  return [name.slice(0, at).trim(), name.slice(at).trim()];
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function dot(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function hLine(ctx: Ctx, color: string, x1: number, x2: number, y: number) {
  ctx.fillStyle = color;
  ctx.fillRect(x1, y - 1, x2 - x1, 2);
}

function avatar(ctx: Ctx, t: Theme, index: number, name: string, cx: number, cy: number, r: number) {
  ctx.fillStyle = t.players[index % t.players.length];
  dot(ctx, cx, cy, r);
  text(ctx, name.trim().charAt(0).toUpperCase(), cx, cy + r * 0.36, {
    font: font(t.sans, 700, Math.round(r * 1.0)),
    color: t.avatarInk,
    align: "center",
  });
}

function badge(ctx: Ctx, t: Theme, value: string, x: number, y: number) {
  ctx.font = font(t.num, t.numWeight, 18);
  const w = Math.max(24, ctx.measureText(value).width + 12);

  ctx.fillStyle = t.accent;
  roundRect(ctx, x - 4, y, w, 26, 8);
  ctx.fill();
  text(ctx, value, x - 4 + w / 2, y + 20, {
    font: font(t.num, t.numWeight, 18),
    color: t.accentInk,
    align: "center",
  });
}

/** Paper-card notation around a score: circles under par, squares over. */
function markShape(
  ctx: Ctx,
  mark: ReturnType<typeof scoreMark>,
  cx: number,
  cy: number,
  color: string,
  gap: string,
) {
  if (mark === "par") return;
  const r = 24;
  const round = mark === "birdie" || mark === "eagle";
  const double = mark === "eagle" || mark === "double";
  const shape = (s: number) => {
    ctx.beginPath();
    if (round) ctx.arc(cx, cy, s, 0, Math.PI * 2);
    else ctx.roundRect(cx - s, cy - s, s * 2, s * 2, 5);
    ctx.stroke();
  };

  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = color;
  shape(r);
  if (double) {
    ctx.strokeStyle = gap;
    ctx.lineWidth = 3;
    shape(r + 3);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    shape(r + 6);
  }
  ctx.restore();
}

function drawOwl(ctx: Ctx, t: Theme, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 64, size / 64);
  ctx.fillStyle = t.owl.body;
  ctx.fill(new Path2D(OWL_BODY));
  ctx.fillStyle = t.owl.belly;
  ctx.beginPath();
  ctx.ellipse(OWL_BELLY.cx, OWL_BELLY.cy, OWL_BELLY.rx, OWL_BELLY.ry, 0, 0, Math.PI * 2);
  ctx.fill();
  OWL_EYES.forEach((ex) => {
    ctx.fillStyle = t.owl.eye;
    dot(ctx, ex, OWL_EYE_Y, OWL_EYE_RADIUS);
    ctx.fillStyle = t.owl.pupil;
    ctx.globalAlpha = 0.22;
    OWL_DIMPLES.forEach(([dx, dy]) => dot(ctx, ex + dx, OWL_EYE_Y + dy, 0.9));
    ctx.globalAlpha = 1;
    dot(ctx, ex, OWL_EYE_Y, OWL_PUPIL_RADIUS);
  });
  ctx.fillStyle = t.owl.beak;
  ctx.fill(new Path2D(OWL_BEAK));
  ctx.restore();
}
