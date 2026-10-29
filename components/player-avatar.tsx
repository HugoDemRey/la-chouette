import clsx from "clsx";

const PLAYER_COLORS = ["var(--p1)", "var(--p2)", "var(--p3)", "var(--p4)"];

export function playerColor(index: number) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

export function PlayerAvatar({
  index,
  name,
  className,
}: {
  index: number;
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "grid shrink-0 place-items-center rounded-full font-bold",
        className ?? "size-10 text-base",
      )}
      style={{ background: playerColor(index), color: "var(--avatar-ink)" }}
    >
      {name.trim().charAt(0).toUpperCase() || index + 1}
    </span>
  );
}
