/**
 * Fetches Storyset Amico SVGs via the Freepik Labs API and saves them
 * to public/assets/illustrations/ with Forge brand recoloring.
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public/assets/illustrations");

const STYLE = "amico";
const BRAND_COLOR = "#10B981"; // Forge emerald — calm, premium
const AMICO_DEFAULT = /#BA68C8/gi;

/** @type {Record<string, { query: string; slug?: string; category: string; reason: string }>} */
const ASSET_MAP = {
  // Hero
  "hero/morning.svg": {
    query: "morning",
    slug: "early-morning",
    category: "Hero",
    reason: "Soft morning start — welcoming daily return.",
  },
  "hero/afternoon.svg": {
    query: "afternoon sun",
    slug: "sunny-day",
    category: "Hero",
    reason: "Midday energy without intensity.",
  },
  "hero/evening.svg": {
    query: "evening",
    slug: "at-home",
    category: "Hero",
    reason: "Winding down — calm end-of-day tone.",
  },
  "hero/night.svg": {
    query: "night sleep",
    slug: "good-night",
    category: "Hero",
    reason: "Restful night greeting.",
  },

  // Wellness
  "wellness/workout.svg": {
    query: "workout",
    slug: "fitness-stats",
    category: "Wellness",
    reason: "Movement as wellbeing, not bodybuilding.",
  },
  "wellness/gym.svg": {
    query: "gym",
    slug: "fitness-tracker",
    category: "Wellness",
    reason: "Training session — structured movement.",
  },
  "wellness/water.svg": {
    query: "water drink",
    slug: "water",
    category: "Wellness",
    reason: "Hydration ritual.",
  },
  "wellness/hydration.svg": {
    query: "hydration",
    slug: "drinking-water",
    category: "Wellness",
    reason: "Daily water intake moment.",
  },
  "wellness/skincare.svg": {
    query: "skincare",
    slug: "self-care",
    category: "Wellness",
    reason: "Gentle self-care routine.",
  },
  "wellness/haircare.svg": {
    query: "hair care",
    slug: "barber",
    category: "Wellness",
    reason: "Hair wellness routine.",
  },
  "wellness/nutrition.svg": {
    query: "healthy food",
    slug: "healthy-food",
    category: "Wellness",
    reason: "Nourishment and balance.",
  },
  "wellness/healthy-meal.svg": {
    query: "healthy meal",
    slug: "eating-healthy",
    category: "Wellness",
    reason: "Mindful eating moment.",
  },
  "wellness/walking.svg": {
    query: "walking",
    slug: "walking",
    category: "Wellness",
    reason: "Gentle daily movement.",
  },
  "wellness/steps.svg": {
    query: "steps fitness",
    slug: "steps",
    category: "Wellness",
    reason: "Step count as gentle progress.",
  },
  "wellness/meditation.svg": {
    query: "meditation",
    slug: "meditation",
    category: "Wellness",
    reason: "Mindfulness and calm.",
  },
  "wellness/sleep.svg": {
    query: "sleep",
    slug: "sleep-analysis",
    category: "Wellness",
    reason: "Rest and recovery.",
  },
  "wellness/stretching.svg": {
    query: "stretching yoga",
    slug: "yoga",
    category: "Wellness",
    reason: "Mobility and body awareness.",
  },
  "wellness/recovery.svg": {
    query: "recovery rest",
    slug: "take-a-break",
    category: "Wellness",
    reason: "Rest day — permission to recover.",
  },

  // Progress
  "progress/weight.svg": {
    query: "weight scale",
    slug: "weighing",
    category: "Progress",
    reason: "Long-term body composition tracking.",
  },
  "progress/muscle.svg": {
    query: "muscle fitness",
    slug: "body-building",
    category: "Progress",
    reason: "Strength development over time.",
  },
  "progress/strength.svg": {
    query: "strength training",
    slug: "weightlifting",
    category: "Progress",
    reason: "Progressive strength gains.",
  },

  // Reflections
  "reflections/journal.svg": {
    query: "journal writing",
    slug: "diary",
    category: "Reflections",
    reason: "Personal reflection and journaling.",
  },
  "reflections/review.svg": {
    query: "weekly review",
    slug: "progress-overview",
    category: "Reflections",
    reason: "Weekly reflection ritual.",
  },
  "reflections/checkpoint.svg": {
    query: "monthly report",
    slug: "monthly-report",
    category: "Reflections",
    reason: "Monthly checkpoint review.",
  },

  // AI
  "ai/assistant.svg": {
    query: "virtual assistant",
    slug: "virtual-assistant",
    category: "AI",
    reason: "Forge AI companion presence.",
  },
  "ai/conversation.svg": {
    query: "conversation chat",
    slug: "conversation",
    category: "AI",
    reason: "Supportive dialogue with coach.",
  },
  "ai/thinking.svg": {
    query: "thinking",
    slug: "thinking-face",
    category: "AI",
    reason: "AI processing a thoughtful response.",
  },
  "ai/suggestion.svg": {
    query: "ideas lightbulb",
    slug: "ideas",
    category: "AI",
    reason: "Gentle suggestions from coach.",
  },
  "ai/insight.svg": {
    query: "data insights",
    slug: "data-insights",
    category: "AI",
    reason: "Pattern recognition and insight.",
  },

  // Empty states
  "empty/no-workout.svg": {
    query: "no data workout",
    slug: "no-data",
    category: "Empty",
    reason: "No workout logged yet.",
  },
  "empty/no-photos.svg": {
    query: "no photos",
    slug: "photo",
    category: "Empty",
    reason: "Progress photos not yet added.",
  },
  "empty/no-calendar.svg": {
    query: "empty calendar",
    slug: "calendar",
    category: "Empty",
    reason: "Calendar awaiting history.",
  },
  "empty/no-progress.svg": {
    query: "no progress",
    slug: "progress-overview",
    category: "Empty",
    reason: "Progress data not yet available.",
  },
  "empty/no-habits.svg": {
    query: "empty checklist",
    slug: "checklist",
    category: "Empty",
    reason: "Habits not yet configured.",
  },
  "empty/no-notifications.svg": {
    query: "notifications",
    slug: "notifications",
    category: "Empty",
    reason: "No reminders set.",
  },
  "empty/no-coach-history.svg": {
    query: "empty chat",
    slug: "chat",
    category: "Empty",
    reason: "No coach conversations yet.",
  },
  "empty/camera.svg": {
    query: "camera photo",
    slug: "photo",
    category: "Empty",
    reason: "Photo capture empty state.",
  },
  "empty/calendar.svg": {
    query: "calendar",
    slug: "calendar",
    category: "Empty",
    reason: "Calendar empty state.",
  },
  "empty/notebook.svg": {
    query: "notebook",
    slug: "notebook",
    category: "Empty",
    reason: "Notes empty state.",
  },
  "empty/goals.svg": {
    query: "goals target",
    slug: "team-goals",
    category: "Empty",
    reason: "Goals not yet defined.",
  },
  "empty/progress.svg": {
    query: "progress chart",
    slug: "progress-data",
    category: "Empty",
    reason: "Progress chart empty state.",
  },
  "empty/trophy.svg": {
    query: "trophy achievement",
    slug: "winners",
    category: "Empty",
    reason: "Achievements empty state.",
  },
  "empty/analytics.svg": {
    query: "analytics chart",
    slug: "analytics",
    category: "Empty",
    reason: "Analytics empty state.",
  },

  // Onboarding
  "onboarding/welcome.svg": {
    query: "welcome",
    slug: "welcome",
    category: "Onboarding",
    reason: "First-time welcome moment.",
  },
  "onboarding/setup.svg": {
    query: "setup profile",
    slug: "personal-settings",
    category: "Onboarding",
    reason: "Initial profile setup.",
  },
  "onboarding/ready.svg": {
    query: "ready start",
    slug: "getting-started",
    category: "Onboarding",
    reason: "Ready to begin daily journey.",
  },

  // Misc
  "misc/calendar.svg": {
    query: "calendar schedule",
    slug: "schedule",
    category: "Misc",
    reason: "Calendar feature iconography.",
  },
  "misc/checklist.svg": {
    query: "checklist",
    slug: "checklist",
    category: "Misc",
    reason: "Daily routine checklist.",
  },
  "misc/notebook.svg": {
    query: "notebook notes",
    slug: "notes",
    category: "Misc",
    reason: "Notes and planning.",
  },
  "misc/camera.svg": {
    query: "camera",
    slug: "camera",
    category: "Misc",
    reason: "Progress photo capture.",
  },
  "misc/trophy.svg": {
    query: "trophy",
    slug: "trophy",
    category: "Misc",
    reason: "Achievement celebration.",
  },
  "misc/target.svg": {
    query: "target goal",
    slug: "target",
    category: "Misc",
    reason: "Goal targeting.",
  },
  "misc/routine.svg": {
    query: "daily routine",
    slug: "daily-tasks",
    category: "Misc",
    reason: "Daily routine structure.",
  },
  "misc/sparkles.svg": {
    query: "celebration stars",
    slug: "celebration",
    category: "Misc",
    reason: "Delight and micro-celebration.",
  },
};

async function searchStoryset(query) {
  const url = `https://stories.freepiklabs.com/api/vectors?style=${STYLE}&query=${encodeURIComponent(query)}&app=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search failed: ${query} (${res.status})`);
  const json = await res.json();
  return json.data ?? [];
}

async function resolveAsset(config) {
  const results = await searchStoryset(config.query);
  if (!results.length) return null;

  if (config.slug) {
    const exact = results.find((r) => r.illustration.slug === config.slug);
    if (exact) return exact;
    const partial = results.find((r) =>
      r.illustration.slug.includes(config.slug)
    );
    if (partial) return partial;
  }

  return results[0];
}

function recolorSvg(svg) {
  return svg.replace(AMICO_DEFAULT, BRAND_COLOR);
}

async function downloadSvg(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Download failed: ${src}`);
  return res.text();
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  /** @type {Array<Record<string, string>>} */
  const manifest = [];
  /** @type {Array<{ file: string; query: string }>} */
  const missing = [];

  for (const [relPath, config] of Object.entries(ASSET_MAP)) {
    const outPath = join(OUT, relPath);
    mkdirSync(dirname(outPath), { recursive: true });

    try {
      const item = await resolveAsset(config);
      if (!item?.src) {
        missing.push({ file: relPath, query: config.query });
        console.warn(`MISSING: ${relPath} (${config.query})`);
        continue;
      }

      let svg = await downloadSvg(item.src);
      svg = recolorSvg(svg);

      writeFileSync(outPath, svg, "utf8");

      manifest.push({
        fileName: relPath,
        category: config.category,
        source: "Storyset",
        style: "Amico",
        license: "Storyset Free License (attribution required)",
        downloadUrl: `https://storyset.com/illustration/${item.illustration.slug}/${STYLE}`,
        apiSrc: item.src,
        slug: item.illustration.slug,
        reason: config.reason,
      });

      console.log(`✓ ${relPath} ← ${item.illustration.slug}`);
      await new Promise((r) => setTimeout(r, 150));
    } catch (err) {
      missing.push({ file: relPath, query: config.query, error: String(err) });
      console.error(`✗ ${relPath}:`, err.message);
    }
  }

  writeFileSync(
    join(ROOT, "docs/assets-manifest.json"),
    JSON.stringify({ style: STYLE, brandColor: BRAND_COLOR, assets: manifest, missing }, null, 2)
  );

  console.log(`\nDone: ${manifest.length} assets, ${missing.length} missing`);
}

main();
