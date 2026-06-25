"use client";

import { useEffect, useState } from "react";
import { getPhoto, photoKey } from "@/lib/photo-storage";
import { useCheckpointStore } from "@/stores/checkpointStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Camera } from "lucide-react";

type PhotoView = {
  key: string;
  label: string;
  url: string;
};

export function PhotoGallery() {
  const checkpoints = useCheckpointStore((s) => s.checkpoints);
  const morning = useSettingsStore((s) => s.morningRoutineItems);
  const [photos, setPhotos] = useState<PhotoView[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const views: PhotoView[] = [];
      const months = [...checkpoints]
        .sort((a, b) => b.month.localeCompare(a.month))
        .map((c) => c.month);

      for (const month of months) {
        for (const variant of ["front", "top", "crown", "main"]) {
          const key = variant === "main"
            ? photoKey("skin", month, "main")
            : photoKey("hair", month, variant);
          const blob = await getPhoto(key);
          if (blob) {
            views.push({
              key,
              label: `${month} · ${variant}`,
              url: URL.createObjectURL(blob),
            });
          }
        }
      }
      if (!cancelled) setPhotos(views);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [checkpoints, morning]);

  if (!photos.length) {
    return (
      <EmptyState
        icon={Camera}
        title="No progress photos yet"
        description="Add photos during your monthly checkpoint to track hair and skin progress."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.map((p) => (
        <GlassCard key={p.key} className="overflow-hidden p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt={p.label} className="aspect-square w-full object-cover" />
          <p className="px-3 py-2 text-xs text-muted-foreground">{p.label}</p>
        </GlassCard>
      ))}
    </div>
  );
}

export function PhotoCompare() {
  const checkpoints = useCheckpointStore((s) => s.checkpoints);
  const sorted = [...checkpoints].sort((a, b) => a.month.localeCompare(b.month));
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (sorted.length < 2) return;
      const first = sorted[0].month;
      const last = sorted[sorted.length - 1].month;
      const before = await getPhoto(photoKey("hair", first, "front"));
      const after = await getPhoto(photoKey("hair", last, "front"));
      if (before) setBeforeUrl(URL.createObjectURL(before));
      if (after) setAfterUrl(URL.createObjectURL(after));
    }
    load();
  }, [checkpoints]);

  if (!beforeUrl || !afterUrl) return null;

  return (
    <GlassCard className="space-y-3">
      <h3 className="font-semibold">Hairline Comparison</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Before</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={beforeUrl} alt="Before" className="rounded-lg object-cover" />
        </div>
        <div>
          <p className="mb-1 text-xs text-muted-foreground">After</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={afterUrl} alt="After" className="rounded-lg object-cover" />
        </div>
      </div>
    </GlassCard>
  );
}
