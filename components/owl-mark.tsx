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

/** The owl whose eyes are golf balls. Colors come from the theme tokens. */
export function OwlMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 64 64">
      <path d={OWL_BODY} fill="var(--owl-body)" />
      <ellipse {...OWL_BELLY} fill="var(--owl-belly)" />
      {OWL_EYES.map((x) => (
        <g key={x}>
          <circle cx={x} cy={OWL_EYE_Y} fill="var(--owl-eye)" r={OWL_EYE_RADIUS} />
          {OWL_DIMPLES.map(([dx, dy]) => (
            <circle
              key={`${dx}${dy}`}
              cx={x + dx}
              cy={OWL_EYE_Y + dy}
              fill="var(--owl-pupil)"
              opacity=".22"
              r="0.9"
            />
          ))}
          <circle
            cx={x}
            cy={OWL_EYE_Y}
            fill="var(--owl-pupil)"
            r={OWL_PUPIL_RADIUS}
          />
        </g>
      ))}
      <path d={OWL_BEAK} fill="var(--owl-beak)" />
    </svg>
  );
}
