/**
 * MVP brand preset: one default config for caption typography and colors.
 * Used by Remotion caption composition.
 */
export interface BrandPreset {
  /** Primary text color (hex or CSS color) */
  primaryColor: string;
  /** Background / highlight color for captions */
  highlightColor: string;
  /** Font family (e.g. Google Font name or system stack) */
  fontFamily: string;
  /** Base font size in px */
  fontSize: number;
  /** Optional font weight */
  fontWeight?: number;
  /** Optional text shadow for readability */
  textShadow?: string;
}

export const DEFAULT_BRAND_PRESET: BrandPreset = {
  primaryColor: "#ffffff",
  highlightColor: "#171717",
  fontFamily: "Inter",
  fontSize: 48,
  fontWeight: 600,
  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
};
