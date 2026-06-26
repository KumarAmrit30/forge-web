import { AssetGallery } from "@/components/asset-gallery/AssetGallery";
import type { AssetManifest } from "@/lib/asset-catalog";
import manifest from "../../../docs/assets-manifest.json";

export const metadata = {
  title: "Asset Gallery · Forge",
  description: "Illustration library review — Storyset Amico assets for Forge.",
};

export default function AssetGalleryPage() {
  return <AssetGallery manifest={manifest as AssetManifest} />;
}
