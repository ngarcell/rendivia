import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";

export type GoogleFontName =
  | "Inter"
  | "Poppins"
  | "Montserrat"
  | "Oswald";

export const GOOGLE_FONT_OPTIONS: GoogleFontName[] = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Oswald",
];

export function loadGoogleFont(fontName: string): string {
  switch (fontName) {
    case "Poppins":
      return loadPoppins().fontFamily;
    case "Montserrat":
      return loadMontserrat().fontFamily;
    case "Oswald":
      return loadOswald().fontFamily;
    case "Inter":
    default:
      return loadInter().fontFamily;
  }
}
