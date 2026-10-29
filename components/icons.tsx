import type { IconSvgProps } from "@/types";

function Icon({ size = 20, children, ...props }: IconSvgProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {children}
    </svg>
  );
}

export const FlagIcon = (props: IconSvgProps) => (
  <Icon {...props}>
    <path d="M6 21V3l11 4-11 4" />
    <path d="M3 21h7" />
  </Icon>
);

export const CardIcon = (props: IconSvgProps) => (
  <Icon {...props}>
    <rect height="18" rx="2" width="16" x="4" y="3" />
    <path d="M4 9h16M4 15h16M10 3v18" />
  </Icon>
);

export const BookIcon = (props: IconSvgProps) => (
  <Icon {...props}>
    <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" />
    <path d="M4 19V5" />
  </Icon>
);

export const ChevronLeftIcon = (props: IconSvgProps) => (
  <Icon {...props}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
);

export const ChevronRightIcon = (props: IconSvgProps) => (
  <Icon {...props}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

export const MinusIcon = (props: IconSvgProps) => (
  <Icon {...props}>
    <path d="M5 12h14" />
  </Icon>
);

export const PlusIcon = (props: IconSvgProps) => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const TrophyIcon = (props: IconSvgProps) => (
  <Icon {...props}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M17 6h3v2a3 3 0 0 1-3 3M7 6H4v2a3 3 0 0 0 3 3" />
  </Icon>
);
