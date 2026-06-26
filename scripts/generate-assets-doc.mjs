/**
 * Generate docs/assets.md from assets-manifest.json
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  readFileSync(join(ROOT, "docs/assets-manifest.json"), "utf8")
);

const USAGE = {
  "hero/morning.svg": "Home greeting (before noon), onboarding welcome",
  "hero/afternoon.svg": "Home greeting (12–17h)",
  "hero/evening.svg": "Home greeting (17–21h)",
  "hero/night.svg": "Home greeting (after 21h), sleep reminders",
  "wellness/workout.svg": "Today workout section, Home Today's Focus",
  "wellness/gym.svg": "Workout plan reference, strength training cards",
  "wellness/water.svg": "Water quick-log, hydration moments",
  "wellness/hydration.svg": "Home journey hydration step, water widget empty",
  "wellness/skincare.svg": "Morning/evening routine, habit cards",
  "wellness/haircare.svg": "Hair routine checklist, Blueprint haircare link",
  "wellness/nutrition.svg": "Nutrition section, protein tracking",
  "wellness/healthy-meal.svg": "Meal logging, nutrition education",
  "wellness/walking.svg": "Steps goal, gentle movement prompts",
  "wellness/steps.svg": "Steps metric tile, activity progress",
  "wellness/meditation.svg": "Mindfulness prompts, Coach calm suggestions",
  "wellness/sleep.svg": "Sleep logging, evening wind-down",
  "wellness/stretching.svg": "Mobility routines, recovery day tips",
  "wellness/recovery.svg": "Rest day focus on Home, recovery messaging",
  "progress/weight.svg": "Progress weight chart empty/hero",
  "progress/muscle.svg": "Strength PR section",
  "progress/strength.svg": "Strength milestones, lifting progress",
  "reflections/journal.svg": "Daily notes, reflection prompts",
  "reflections/review.svg": "Weekly review sheet header",
  "reflections/checkpoint.svg": "Monthly checkpoint dialog",
  "ai/assistant.svg": "Coach tab hero, AI feature introduction",
  "ai/conversation.svg": "Coach chat empty state (with history)",
  "ai/thinking.svg": "AI loading / generating response",
  "ai/suggestion.svg": "Coach suggestion cards",
  "ai/insight.svg": "Insights panel, Forge Brief AI summaries",
  "empty/no-workout.svg": "Today workout — no session scheduled",
  "empty/no-photos.svg": "Progress photo gallery empty",
  "empty/no-calendar.svg": "Calendar — no logged days",
  "empty/no-progress.svg": "Progress tab cold start",
  "empty/no-habits.svg": "Habits section — none configured",
  "empty/no-notifications.svg": "Settings reminders — none enabled",
  "empty/no-coach-history.svg": "Coach — no past conversations",
  "empty/camera.svg": "Photo upload prompt",
  "empty/calendar.svg": "Calendar feature marketing",
  "empty/notebook.svg": "Notes / journal empty",
  "empty/goals.svg": "Goals not yet set",
  "empty/progress.svg": "Charts awaiting data",
  "empty/trophy.svg": "Achievements / streaks empty",
  "empty/analytics.svg": "Analytics dashboard empty",
  "onboarding/welcome.svg": "First-launch onboarding dialog",
  "onboarding/setup.svg": "Profile setup step",
  "onboarding/ready.svg": "Onboarding completion — Start Today",
  "misc/calendar.svg": "Calendar nav accent, date picker",
  "misc/checklist.svg": "Routine checklist headers",
  "misc/notebook.svg": "Blueprint / Plan reference",
  "misc/camera.svg": "Checkpoint photo capture",
  "misc/trophy.svg": "Streak milestones, day-complete celebration",
  "misc/target.svg": "Goals, priorities, Today's Focus fallback",
  "misc/routine.svg": "Daily journey timeline",
  "misc/sparkles.svg": "Day complete moment, micro-celebrations",
};

const categories = [
  "Hero",
  "Wellness",
  "Progress",
  "Reflections",
  "AI",
  "Empty",
  "Onboarding",
  "Misc",
];

let md = `# Forge Illustration Asset Library

Production visual assets for Forge — an AI-powered personal wellbeing companion.

## Visual Identity

| Property | Value |
|----------|-------|
| **Primary style** | Storyset **Amico** (isometric, calm geometry) |
| **Fallback style** | unDraw (5 assets only — see Mixed Style Notes) |
| **Brand accent** | \`#10B981\` (Forge emerald) |
| **Format** | SVG, transparent background |
| **Total assets** | ${manifest.assets.length} |

### Style Rules

- Amico illustrations use a single recolored accent (\`#10B981\` replacing default \`#BA68C8\`).
- unDraw fallbacks are recolored from \`#6C63FF\` → \`#10B981\`.
- Do **not** mix Rafiki, Bro, Pana, or Cuate styles.
- Prefer calm, minimal compositions — reject cartoonish or childish assets.

---

## Licensing

### Storyset (49 assets)

- **License:** [Storyset Free License](https://storyset.com/terms)
- **Requirement:** Attribution required in app footer or credits:
  \`\`\`html
  <a href="https://storyset.com/">Illustrations by Storyset</a>
  \`\`\`
- **Commercial use:** Allowed with attribution

### unDraw (5 assets — fallback only)

- **License:** [unDraw License](https://undraw.co/license)
- **Requirement:** No attribution required
- **Commercial use:** Allowed

### Mixed Style Notes

These files use **unDraw** because no suitable Amico match was found:

| File | unDraw source | Recommendation |
|------|---------------|----------------|
| \`hero/night.svg\` | late-at-night | Replace with custom Amico night scene when available |
| \`progress/muscle.svg\` | fitness-tracker | Commission bespoke strength illustration |
| \`progress/strength.svg\` | fitness-tracker | Same as muscle — differentiate in v2 |
| \`reflections/checkpoint.svg\` | for-review | Replace with Amico monthly-report |
| \`empty/no-progress.svg\` | progress-data | Acceptable interim empty state |
| \`misc/routine.svg\` | checklist | Replace with Amico daily-tasks when indexed |

---

## Folder Structure

\`\`\`
public/assets/illustrations/
├── hero/           Time-of-day greetings (4)
├── wellness/       Daily wellbeing moments (14)
├── progress/       Long-term transformation (3)
├── reflections/    Journal & review rituals (3)
├── ai/             Coach & intelligence (5)
├── empty/          Empty states (14)
├── onboarding/     First-run experience (3)
└── misc/           Shared UI accents (8)
\`\`\`

---

## Asset Catalog

`;

for (const category of categories) {
  const items = manifest.assets
    .filter((a) => a.category === category)
    .sort((a, b) => a.fileName.localeCompare(b.fileName));

  md += `### ${category}\n\n`;

  for (const a of items) {
    const usage = USAGE[a.fileName] ?? "TBD";
    md += `#### \`${a.fileName}\`\n\n`;
    md += `- **Source:** ${a.source}\n`;
    md += `- **Style:** ${a.style}\n`;
    md += `- **License:** ${a.license}\n`;
    md += `- **Download URL:** ${a.downloadUrl}\n`;
    md += `- **Slug:** ${a.slug}\n`;
    md += `- **Reason:** ${a.reason}\n`;
    md += `- **Suggested usage:** ${usage}\n\n`;
  }
}

md += `---

## Usage Map (Quick Reference)

| Screen | Recommended assets |
|--------|-------------------|
| **Home** | \`hero/*\`, \`wellness/recovery.svg\`, \`misc/routine.svg\`, \`misc/sparkles.svg\` |
| **Today** | \`wellness/*\`, \`empty/no-workout.svg\`, \`misc/checklist.svg\` |
| **Progress** | \`progress/*\`, \`empty/no-progress.svg\`, \`empty/no-photos.svg\` |
| **Calendar** | \`misc/calendar.svg\`, \`empty/no-calendar.svg\` |
| **Coach** | \`ai/*\`, \`empty/no-coach-history.svg\` |
| **Onboarding** | \`onboarding/*\` |
| **Settings** | \`empty/no-notifications.svg\` |
| **Weekly Review** | \`reflections/review.svg\` |
| **Monthly Checkpoint** | \`reflections/checkpoint.svg\`, \`misc/camera.svg\` |

---

## Missing Assets

All required assets from the Sprint asset brief are present (**54 / 54**).

No blockers for integration.

---

## Future Premium Asset Recommendations

1. **Custom Amico commission** — Replace 5 unDraw fallbacks with Storyset-custom or in-house isometric art for single-style consistency.
2. **Forge Brief hero** — Bespoke illustration for AI-generated daily briefing (warm, personal, no generic coffee/sun tropes).
3. **Day-complete animation** — Lottie or animated Storyset export for streak celebration (\`misc/sparkles.svg\` moment).
4. **Emotional state set** — 4–6 subtle mood illustrations for Coach empathy responses (stressed, tired, motivated, proud).
5. **Seasonal variants** — Optional hero backgrounds for winter/summer without changing layout.
6. **Premium empty states** — Context-aware empties (e.g. "First workout tomorrow" vs "Rest day today").

---

## Maintenance

- Re-download script: \`node scripts/fetch-storyset-assets.mjs\`
- Patch missing: \`node scripts/fetch-assets-patch.mjs\`
- Manifest: \`docs/assets-manifest.json\`
- Regenerate this doc: \`node scripts/generate-assets-doc.mjs\`

*Last updated: June 26, 2026*
`;

writeFileSync(join(ROOT, "docs/assets.md"), md);
console.log("Wrote docs/assets.md");
