/**
 * Extract brand (colors, fonts, logo) from a website URL for Remotion props.
 * Used for "brand from URL" feature (Pro+).
 */
import type { BrandPreset } from "./brand-preset";

const DEFAULT: BrandPreset = {
  primaryColor: "#ffffff",
  highlightColor: "#171717",
  fontFamily: "Inter",
  fontSize: 48,
  fontWeight: 600,
  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
};

function parseColor(css: string): string | null {
  const hex = css.match(/#[0-9A-Fa-f]{3,8}/);
  if (hex) return hex[0];
  const rgb = css.match(/rgba?\([^)]+\)/);
  if (rgb) return rgb[0];
  return null;
}

function parseFontFamily(css: string): string | null {
  const m = css.match(/font-family\s*:\s*([^;]+)/);
  if (m) return m[1].replace(/['"]/g, "").trim();
  return null;
}

export interface BrandFromUrlResult {
  brand: BrandPreset;
  logoUrl: string | null;
  primaryColor: string | null;
  fontFamily: string | null;
  raw: { colors: string[]; fonts: string[] };
}

export async function extractBrandFromUrl(url: string): Promise<BrandFromUrlResult> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Rendivia-Brand-Extractor/1.0" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const html = await res.text();

  const colors: string[] = [];
  const fonts: string[] = [];

  // Inline styles and style blocks
  const styleMatches = html.matchAll(/style\s*=\s*["']([^"']+)["']|<\s*style[^>]*>([\s\S]*?)<\s*\/\s*style>/gi);
  for (const m of styleMatches) {
    const css = (m[1] ?? m[2] ?? "").replace(/\s+/g, " ");
    const c = parseColor(css);
    if (c && !colors.includes(c)) colors.push(c);
    const f = parseFontFamily(css);
    if (f && !fonts.includes(f)) fonts.push(f);
  }

  // Common meta theme-color
  const themeMatch = html.match(/<meta[^>]+name\s*=\s*["']theme-color["'][^>]+content\s*=\s*["']([^"']+)["']/i)
    ?? html.match(/content\s*=\s*["']([^"']+)["'][^>]+name\s*=\s*["']theme-color["']/i);
  if (themeMatch && themeMatch[1]) {
    const c = parseColor(themeMatch[1]) ?? themeMatch[1];
    if (!colors.includes(c)) colors.unshift(c);
  }

  // Logo: first img with logo in src or alt, or first og:image
  let logoUrl: string | null = null;
  const ogImage = html.match(/<meta[^>]+property\s*=\s*["']og:image["'][^>]+content\s*=\s*["']([^"']+)["']/i)
    ?? html.match(/content\s*=\s*["']([^"']+)["'][^>]+property\s*=\s*["']og:image["']/i);
  if (ogImage?.[1]) logoUrl = new URL(ogImage[1], url).href;
  const imgLogo = html.match(/<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*(?:alt\s*=\s*["'][^"']*logo[^"']*["']|logo)[^>]*>/i)
    ?? html.match(/<img[^>]*(?:alt\s*=\s*["'][^"']*logo[^"']*["']|logo)[^>]+src\s*=\s*["']([^"']+)["']/i);
  if (imgLogo?.[1] && !logoUrl) logoUrl = new URL(imgLogo[1], url).href;

  const primaryColor = colors[0] ?? null;
  const fontFamily = fonts[0] ?? null;

  const brand: BrandPreset = {
    ...DEFAULT,
    primaryColor: primaryColor ?? DEFAULT.primaryColor,
    highlightColor: colors[1] ?? DEFAULT.highlightColor,
    fontFamily: fontFamily ?? DEFAULT.fontFamily,
  };

  return {
    brand,
    logoUrl,
    primaryColor,
    fontFamily,
    raw: { colors, fonts },
  };
}
