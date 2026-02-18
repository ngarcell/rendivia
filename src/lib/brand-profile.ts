export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface RenderBrand {
  name: string;
  logoUrl: string | null;
  colors: BrandColors;
  fontFamily: string;
  introText: string | null;
  outroText: string | null;
}

export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: "#f8fafc",
  secondary: "#cbd5f5",
  accent: "#2563eb",
  background: "#0f172a",
};

export const DEFAULT_RENDER_BRAND: RenderBrand = {
  name: "Default",
  logoUrl: null,
  colors: DEFAULT_BRAND_COLORS,
  fontFamily: "Inter",
  introText: null,
  outroText: null,
};

function coerceColor(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function normalizeBrandColors(value: unknown): BrandColors {
  if (!value || typeof value !== "object") return { ...DEFAULT_BRAND_COLORS };
  const colors = value as Partial<BrandColors>;
  return {
    primary: coerceColor(colors.primary, DEFAULT_BRAND_COLORS.primary),
    secondary: coerceColor(colors.secondary, DEFAULT_BRAND_COLORS.secondary),
    accent: coerceColor(colors.accent, DEFAULT_BRAND_COLORS.accent),
    background: coerceColor(colors.background, DEFAULT_BRAND_COLORS.background),
  };
}

export function brandProfileToRenderBrand(
  row: Partial<{
    name: string | null;
    logo_url: string | null;
    colors: unknown;
    font_family: string | null;
    intro_text: string | null;
    outro_text: string | null;
  }> | null
): RenderBrand {
  if (!row) return { ...DEFAULT_RENDER_BRAND };
  return {
    name: row.name?.trim() || DEFAULT_RENDER_BRAND.name,
    logoUrl: row.logo_url ?? DEFAULT_RENDER_BRAND.logoUrl,
    colors: normalizeBrandColors(row.colors),
    fontFamily: row.font_family?.trim() || DEFAULT_RENDER_BRAND.fontFamily,
    introText: row.intro_text ?? DEFAULT_RENDER_BRAND.introText,
    outroText: row.outro_text ?? DEFAULT_RENDER_BRAND.outroText,
  };
}
