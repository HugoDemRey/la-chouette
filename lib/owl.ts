/** Owl mark geometry, in a 64 × 64 box. Shared by the SVG mark and the exported card. */
export const OWL_BODY =
  "M11 9 L22 17 Q32 13 42 17 L53 9 L51 31 Q52 56 32 59 Q12 56 13 31 Z";
export const OWL_BEAK = "M28.5 38 L35.5 38 L32 44 Z";
export const OWL_BELLY = { cx: 32, cy: 49, rx: 11, ry: 8 };
export const OWL_EYES = [22.5, 41.5];
export const OWL_EYE_Y = 30;
export const OWL_EYE_RADIUS = 9.5;
export const OWL_PUPIL_RADIUS = 3.6;
/** Golf-ball dimples around each pupil, as offsets from the eye's centre. */
export const OWL_DIMPLES = [
  [-5, -3],
  [-5.5, 2],
  [-2, 6],
  [3, 6.5],
  [6, 2.5],
  [5.5, -3],
  [1, -6.5],
  [-3, -6.8],
];
