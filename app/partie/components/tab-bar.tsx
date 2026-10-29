import Link from "next/link";
import clsx from "clsx";

import { BookIcon, CardIcon, FlagIcon } from "@/components/icons";

export type View = "trou" | "carte";

const TABS = [
  { id: "trou", label: "Trou", Icon: FlagIcon },
  { id: "carte", label: "Carte", Icon: CardIcon },
] as const;

const tabClass =
  "flex flex-col items-center gap-1 py-2 text-[11px] font-bold transition-colors";

export function TabBar({
  view,
  onChange,
}: {
  view: View;
  onChange: (view: View) => void;
}) {
  return (
    <nav
      aria-label="Navigation de la partie"
      className="border-line bg-surface/95 fixed inset-x-0 bottom-0 z-20 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="gutter mx-auto grid max-w-md grid-cols-3">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            aria-current={view === id ? "page" : undefined}
            className={clsx(
              tabClass,
              view === id ? "text-accent-strong" : "text-muted",
            )}
            type="button"
            onClick={() => {
              onChange(id);
              window.scrollTo({ top: 0 });
            }}
          >
            <Icon size={22} />
            {label}
          </button>
        ))}
        <Link className={clsx(tabClass, "text-muted")} href="/regles-du-jeu">
          <BookIcon size={22} />
          Règles
        </Link>
      </div>
    </nav>
  );
}

/** Bottom padding that keeps content clear of the tab bar. */
export const TAB_BAR_SPACE = "pb-[calc(5.5rem+env(safe-area-inset-bottom))]";
