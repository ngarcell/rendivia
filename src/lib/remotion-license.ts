export function isRemotionLicensed(): boolean {
  return process.env.REMOTION_LICENSED === "true";
}

export function isRemotionAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return isRemotionLicensed();
}
