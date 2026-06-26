/**
 * Second pass: fill missing Storyset Amico assets + unDraw fallbacks.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public/assets/illustrations");

const STYLE = "amico";
const BRAND = "#10B981";
const AMICO_PURPLE = /#BA68C8/gi;
const UNDRAW_PURPLE = /#6C63FF/gi;
const UNDRAW_BASE =
  "https://raw.githubusercontent.com/balazser/undraw-svg-collection/main/svgs";

/** @type {Array<{ out: string; storyset?: { query: string; slug: string }; undraw?: string; category: string; reason: string }>} */
const PATCHES = [
  {
    out: "hero/afternoon.svg",
    storyset: { query: "coffee break", slug: "coffee-break" },
    undraw: "drink-coffee.svg",
    category: "Hero",
    reason: "Calm midday pause — afternoon greeting.",
  },
  {
    out: "hero/evening.svg",
    storyset: { query: "sunset", slug: "sunset" },
    undraw: "into-the-night.svg",
    category: "Hero",
    reason: "Soft evening wind-down.",
  },
  {
    out: "hero/night.svg",
    storyset: { query: "moon night", slug: "sweet-dreams" },
    undraw: "late-at-night.svg",
    category: "Hero",
    reason: "Restful night — calm moonlight, not childish.",
  },
  {
    out: "wellness/walking.svg",
    storyset: { query: "jogging", slug: "jogging" },
    undraw: "relaxing-walk.svg",
    category: "Wellness",
    reason: "Gentle outdoor movement.",
  },
  {
    out: "wellness/steps.svg",
    storyset: { query: "completed steps", slug: "completed-steps" },
    undraw: "completed-steps.svg",
    category: "Wellness",
    reason: "Daily step progress.",
  },
  {
    out: "wellness/stretching.svg",
    storyset: { query: "stretching exercises", slug: "stretching-exercises" },
    undraw: "meditation.svg",
    category: "Wellness",
    reason: "Mobility and body care.",
  },
  {
    out: "wellness/recovery.svg",
    storyset: { query: "work life balance", slug: "work-life-balance" },
    undraw: "meditating.svg",
    category: "Wellness",
    reason: "Rest and recovery permission.",
  },
  {
    out: "progress/weight.svg",
    storyset: { query: "fitness stats", slug: "fitness-stats" },
    undraw: "fitness-stats.svg",
    category: "Progress",
    reason: "Body composition tracking.",
  },
  {
    out: "progress/muscle.svg",
    storyset: { query: "body building", slug: "body-building" },
    undraw: "fitness-tracker.svg",
    category: "Progress",
    reason: "Strength development.",
  },
  {
    out: "progress/strength.svg",
    storyset: { query: "weightlifting", slug: "weightlifting" },
    undraw: "fitness-tracker.svg",
    category: "Progress",
    reason: "Progressive overload tracking.",
  },
  {
    out: "reflections/journal.svg",
    storyset: { query: "diary", slug: "diary" },
    undraw: "diary.svg",
    category: "Reflections",
    reason: "Personal journaling.",
  },
  {
    out: "reflections/review.svg",
    storyset: { query: "progress overview", slug: "progress-overview" },
    undraw: "progress-overview.svg",
    category: "Reflections",
    reason: "Weekly reflection.",
  },
  {
    out: "reflections/checkpoint.svg",
    storyset: { query: "monthly report", slug: "monthly-report" },
    undraw: "for-review.svg",
    category: "Reflections",
    reason: "Monthly checkpoint.",
  },
  {
    out: "ai/assistant.svg",
    storyset: { query: "chat bot", slug: "chat-bot" },
    undraw: "chat-bot.svg",
    category: "AI",
    reason: "Forge AI companion.",
  },
  {
    out: "ai/insight.svg",
    storyset: { query: "statistics", slug: "statistics" },
    undraw: "growth-analytics.svg",
    category: "AI",
    reason: "Pattern insight delivery.",
  },
  {
    out: "empty/no-workout.svg",
    storyset: { query: "no data", slug: "no-data" },
    undraw: "no-data.svg",
    category: "Empty",
    reason: "No workout logged.",
  },
  {
    out: "empty/no-photos.svg",
    storyset: { query: "image upload", slug: "image-upload" },
    undraw: "photo.svg",
    category: "Empty",
    reason: "No progress photos.",
  },
  {
    out: "empty/no-calendar.svg",
    storyset: { query: "calendar", slug: "calendar" },
    undraw: "online-calendar.svg",
    category: "Empty",
    reason: "Calendar awaiting history.",
  },
  {
    out: "empty/no-progress.svg",
    storyset: { query: "progress data", slug: "progress-data" },
    undraw: "progress-data.svg",
    category: "Empty",
    reason: "No progress data yet.",
  },
  {
    out: "empty/no-habits.svg",
    storyset: { query: "checklist", slug: "checklist" },
    undraw: "healthy-habit.svg",
    category: "Empty",
    reason: "Habits not configured.",
  },
  {
    out: "empty/no-coach-history.svg",
    storyset: { query: "chat", slug: "chat" },
    undraw: "online-chat.svg",
    category: "Empty",
    reason: "No coach conversations.",
  },
  {
    out: "empty/progress.svg",
    storyset: { query: "progress indicator", slug: "progress-indicator" },
    undraw: "progress-indicator.svg",
    category: "Empty",
    reason: "Progress chart empty.",
  },
  {
    out: "empty/trophy.svg",
    storyset: { query: "winners", slug: "winners" },
    undraw: "awards.svg",
    category: "Empty",
    reason: "Achievements empty.",
  },
  {
    out: "onboarding/ready.svg",
    storyset: { query: "launching", slug: "launching" },
    undraw: "celebration.svg",
    category: "Onboarding",
    reason: "Ready to begin.",
  },
  {
    out: "misc/trophy.svg",
    storyset: { query: "awards", slug: "awards" },
    undraw: "awards.svg",
    category: "Misc",
    reason: "Achievement celebration.",
  },
  {
    out: "misc/routine.svg",
    storyset: { query: "daily tasks", slug: "daily-tasks" },
    undraw: "checklist.svg",
    category: "Misc",
    reason: "Daily routine structure.",
  },
  {
    out: "misc/sparkles.svg",
    storyset: { query: "celebration", slug: "celebration" },
    undraw: "celebrating.svg",
    category: "Misc",
    reason: "Micro-celebration moments.",
  },
];

async function searchStoryset(query) {
  const url = `https://stories.freepiklabs.com/api/vectors?style=${STYLE}&query=${encodeURIComponent(query)}&app=true`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

async function fetchStoryset(slug, query) {
  const results = await searchStoryset(query);
  const item =
    results.find((r) => r.illustration.slug === slug) ??
    results.find((r) => r.illustration.slug.includes(slug));
  if (!item?.src) return null;
  const res = await fetch(item.src);
  if (!res.ok) return null;
  return {
    svg: (await res.text()).replace(AMICO_PURPLE, BRAND),
    slug: item.illustration.slug,
    url: `https://storyset.com/illustration/${item.illustration.slug}/${STYLE}`,
    source: "Storyset",
    style: "Amico",
    license: "Storyset Free License (attribution required)",
  };
}

async function fetchUndraw(filename) {
  const res = await fetch(`${UNDRAW_BASE}/${filename}`);
  if (!res.ok) return null;
  let svg = await res.text();
  svg = svg.replace(UNDRAW_PURPLE, BRAND);
  svg = svg.replace(/#596E79/gi, BRAND);
  return {
    svg,
    slug: filename.replace(".svg", ""),
    url: `https://undraw.co/illustrations/${filename.replace(".svg", "").replace(/_/g, "-")}`,
    source: "unDraw",
    style: "unDraw",
    license: "unDraw License (free for commercial use)",
  };
}

async function main() {
  /** @type {Array<Record<string, string>>} */
  const added = [];
  /** @type {Array<{ out: string; reason: string }>} */
  const stillMissing = [];

  for (const patch of PATCHES) {
    const outPath = join(OUT, patch.out);
    mkdirSync(dirname(outPath), { recursive: true });

    let result = null;
    if (patch.storyset) {
      result = await fetchStoryset(patch.storyset.slug, patch.storyset.query);
    }
    if (!result && patch.undraw) {
      result = await fetchUndraw(patch.undraw);
    }

    if (!result) {
      stillMissing.push({ out: patch.out, reason: patch.reason });
      console.warn(`MISSING: ${patch.out}`);
      continue;
    }

    writeFileSync(outPath, result.svg, "utf8");
    added.push({
      fileName: patch.out,
      category: patch.category,
      source: result.source,
      style: result.style,
      license: result.license,
      downloadUrl: result.url,
      slug: result.slug,
      reason: patch.reason,
    });
    console.log(`✓ ${patch.out} ← ${result.source} (${result.slug})`);
    await new Promise((r) => setTimeout(r, 120));
  }

  const manifestPath = join(ROOT, "docs/assets-manifest.json");
  let existing = { assets: [], missing: [] };
  if (existsSync(manifestPath)) {
    existing = JSON.parse(readFileSync(manifestPath, "utf8"));
  }

  const merged = [...existing.assets];
  for (const a of added) {
    const idx = merged.findIndex((m) => m.fileName === a.fileName);
    if (idx >= 0) merged[idx] = a;
    else merged.push(a);
  }

  writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        style: "Storyset Amico (primary) + unDraw (fallback)",
        brandColor: BRAND,
        assets: merged.sort((a, b) => a.fileName.localeCompare(b.fileName)),
        missing: stillMissing,
      },
      null,
      2
    )
  );

  console.log(`\nPatch complete: +${added.length}, still missing: ${stillMissing.length}`);
}

main();
