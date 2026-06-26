"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type AssetEntry,
  type AssetManifest,
  groupAssetsByCategory,
  assetPublicPath,
  assetSlugFromPath,
  categoryAnchor,
} from "@/lib/asset-catalog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Search } from "lucide-react";

function AssetCard({ asset }: { asset: AssetEntry }) {
  const name = assetSlugFromPath(asset.fileName);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/30">
      <div
        className="relative flex aspect-[4/3] items-center justify-center p-6"
        style={{
          backgroundImage:
            "linear-gradient(45deg, oklch(0.22 0.01 260 / 0.5) 25%, transparent 25%, transparent 75%, oklch(0.22 0.01 260 / 0.5) 75%), linear-gradient(45deg, oklch(0.22 0.01 260 / 0.5) 25%, transparent 25%, transparent 75%, oklch(0.22 0.01 260 / 0.5) 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 8px 8px",
          backgroundColor: "oklch(0.14 0.008 260)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assetPublicPath(asset.fileName)}
          alt={name}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-border/40 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-mono text-sm font-medium leading-tight">{name}</h3>
          <div className="flex shrink-0 flex-wrap gap-1">
            <Badge variant="outline" className="text-[10px]">
              {asset.source}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {asset.style}
            </Badge>
          </div>
        </div>

        <p className="font-mono text-[11px] text-muted-foreground">
          {asset.fileName}
        </p>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {asset.reason}
        </p>

        <p className="mt-auto pt-1 font-mono text-[10px] text-muted-foreground/70">
          {asset.slug}
        </p>

        <a
          href={asset.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:underline"
        >
          Source
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}

export function AssetGallery({ manifest }: { manifest: AssetManifest }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return manifest.assets;

    return manifest.assets.filter(
      (a) =>
        a.fileName.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q)
    );
  }, [manifest.assets, query]);

  const groups = useMemo(() => groupAssetsByCategory(filtered), [filtered]);

  const storysetCount = manifest.assets.filter(
    (a) => a.source === "Storyset"
  ).length;
  const undrawCount = manifest.assets.filter((a) => a.source === "unDraw").length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-32 md:px-8 md:pt-10">
      <div className="mb-8 space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Design review
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Asset Gallery
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              {manifest.assets.length} illustrations · {manifest.style} · accent{" "}
              <span
                className="inline-block h-3 w-3 rounded-full align-middle"
                style={{ backgroundColor: manifest.brandColor }}
              />{" "}
              <span className="font-mono">{manifest.brandColor}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/50 px-3 py-1">
              Storyset {storysetCount}
            </span>
            <span className="rounded-full border border-border/50 px-3 py-1">
              unDraw {undrawCount}
            </span>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, slug, category, reason…"
            className="pl-9"
          />
        </div>

        {!query && (
          <nav className="flex flex-wrap gap-2">
            {groups.map(({ category, assets }) => (
              <a
                key={category}
                href={`#${categoryAnchor(category)}`}
                className="rounded-full border border-border/50 bg-secondary/30 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary/60"
              >
                {category}
                <span className="ml-1.5 text-muted-foreground">{assets.length}</span>
              </a>
            ))}
          </nav>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No assets match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="space-y-14">
          {groups.map(({ category, assets }) => (
            <section
              key={category}
              id={categoryAnchor(category)}
              className="scroll-mt-24 space-y-5"
            >
              <div className="flex items-baseline gap-3 border-b border-border/40 pb-3">
                <h2 className="text-xl font-semibold tracking-tight">{category}</h2>
                <span className="text-sm text-muted-foreground">{assets.length}</span>
              </div>

              <div
                className={cn(
                  "grid gap-4",
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                )}
              >
                {assets.map((asset) => (
                  <AssetCard key={asset.fileName} asset={asset} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
