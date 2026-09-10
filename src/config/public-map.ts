export type PublicMapConfiguration = {
  provider: "maptiler" | "custom";
  styleUrl: string;
};

export function getPublicMapConfiguration(): PublicMapConfiguration | null {
  const customStyleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL?.trim();
  if (customStyleUrl && isAllowedStyleUrl(customStyleUrl)) {
    return { provider: "custom", styleUrl: customStyleUrl };
  }

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();
  if (!maptilerKey) return null;

  return {
    provider: "maptiler",
    styleUrl: `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(maptilerKey)}`,
  };
}

function isAllowedStyleUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
