export function getSiteOrigin() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "https://rendivia.com";
  return baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
}
