export type AssetEntry = {
  fileName: string;
  category: string;
  source: string;
  style: string;
  license: string;
  downloadUrl: string;
  slug: string;
  reason: string;
};

export type AssetManifest = {
  style: string;
  brandColor: string;
  assets: AssetEntry[];
};

export const ASSET_CATEGORY_ORDER = [
  "Hero",
  "Wellness",
  "Progress",
  "Reflections",
  "AI",
  "Empty",
  "Onboarding",
  "Misc",
] as const;

export function groupAssetsByCategory(assets: AssetEntry[]) {
  const map = new Map<string, AssetEntry[]>();

  for (const category of ASSET_CATEGORY_ORDER) {
    map.set(category, []);
  }

  for (const asset of assets) {
    const list = map.get(asset.category) ?? [];
    list.push(asset);
    map.set(asset.category, list);
  }

  return ASSET_CATEGORY_ORDER.map((category) => ({
    category,
    assets: (map.get(category) ?? []).sort((a, b) =>
      a.fileName.localeCompare(b.fileName)
    ),
  })).filter((group) => group.assets.length > 0);
}

export function assetPublicPath(fileName: string) {
  return `/assets/illustrations/${fileName}`;
}

export function assetSlugFromPath(fileName: string) {
  return fileName.split("/").pop()?.replace(".svg", "") ?? fileName;
}

export function categoryAnchor(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-");
}
