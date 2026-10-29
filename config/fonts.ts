import { Bricolage_Grotesque, Figtree, Young_Serif } from "next/font/google";

export const fontSans = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

/** Display face of the light theme. */
export const fontSerif = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-young-serif",
});

/** Display face of the dark theme. */
export const fontGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
