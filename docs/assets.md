# Forge Illustration Asset Library

Production visual assets for Forge — an AI-powered personal wellbeing companion.

## Visual Identity

| Property | Value |
|----------|-------|
| **Primary style** | Storyset **Amico** (isometric, calm geometry) |
| **Fallback style** | unDraw (5 assets only — see Mixed Style Notes) |
| **Brand accent** | `#10B981` (Forge emerald) |
| **Format** | SVG, transparent background |
| **Total assets** | 54 |

### Style Rules

- Amico illustrations use a single recolored accent (`#10B981` replacing default `#BA68C8`).
- unDraw fallbacks are recolored from `#6C63FF` → `#10B981`.
- Do **not** mix Rafiki, Bro, Pana, or Cuate styles.
- Prefer calm, minimal compositions — reject cartoonish or childish assets.

---

## Licensing

### Storyset (49 assets)

- **License:** [Storyset Free License](https://storyset.com/terms)
- **Requirement:** Attribution required in app footer or credits:
  ```html
  <a href="https://storyset.com/">Illustrations by Storyset</a>
  ```
- **Commercial use:** Allowed with attribution

### unDraw (5 assets — fallback only)

- **License:** [unDraw License](https://undraw.co/license)
- **Requirement:** No attribution required
- **Commercial use:** Allowed

### Mixed Style Notes

These files use **unDraw** because no suitable Amico match was found:

| File | unDraw source | Recommendation |
|------|---------------|----------------|
| `hero/night.svg` | late-at-night | Replace with custom Amico night scene when available |
| `progress/muscle.svg` | fitness-tracker | Commission bespoke strength illustration |
| `progress/strength.svg` | fitness-tracker | Same as muscle — differentiate in v2 |
| `reflections/checkpoint.svg` | for-review | Replace with Amico monthly-report |
| `empty/no-progress.svg` | progress-data | Acceptable interim empty state |
| `misc/routine.svg` | checklist | Replace with Amico daily-tasks when indexed |

---

## Folder Structure

```
public/assets/illustrations/
├── hero/           Time-of-day greetings (4)
├── wellness/       Daily wellbeing moments (14)
├── progress/       Long-term transformation (3)
├── reflections/    Journal & review rituals (3)
├── ai/             Coach & intelligence (5)
├── empty/          Empty states (14)
├── onboarding/     First-run experience (3)
└── misc/           Shared UI accents (8)
```

---

## Asset Catalog

### Hero

#### `hero/afternoon.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/coffee-break/amico
- **Slug:** coffee-break
- **Reason:** Calm midday pause — afternoon greeting.
- **Suggested usage:** Home greeting (12–17h)

#### `hero/evening.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/sunset/amico
- **Slug:** sunset
- **Reason:** Soft evening wind-down.
- **Suggested usage:** Home greeting (17–21h)

#### `hero/morning.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/early-morning/amico
- **Slug:** early-morning
- **Reason:** Soft morning start — welcoming daily return.
- **Suggested usage:** Home greeting (before noon), onboarding welcome

#### `hero/night.svg`

- **Source:** unDraw
- **Style:** unDraw
- **License:** unDraw License (free for commercial use)
- **Download URL:** https://undraw.co/illustrations/late-at-night
- **Slug:** late-at-night
- **Reason:** Restful night — calm moonlight, not childish.
- **Suggested usage:** Home greeting (after 21h), sleep reminders

### Wellness

#### `wellness/gym.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/fitness-tracker/amico
- **Slug:** fitness-tracker
- **Reason:** Training session — structured movement.
- **Suggested usage:** Workout plan reference, strength training cards

#### `wellness/haircare.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/barber/amico
- **Slug:** barber
- **Reason:** Hair wellness routine.
- **Suggested usage:** Hair routine checklist, Blueprint haircare link

#### `wellness/healthy-meal.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/eating-healthy-food/amico
- **Slug:** eating-healthy-food
- **Reason:** Mindful eating moment.
- **Suggested usage:** Meal logging, nutrition education

#### `wellness/hydration.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/hydratation/amico
- **Slug:** hydratation
- **Reason:** Daily water intake moment.
- **Suggested usage:** Home journey hydration step, water widget empty

#### `wellness/meditation.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/meditation/amico
- **Slug:** meditation
- **Reason:** Mindfulness and calm.
- **Suggested usage:** Mindfulness prompts, Coach calm suggestions

#### `wellness/nutrition.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/healthy-food/amico
- **Slug:** healthy-food
- **Reason:** Nourishment and balance.
- **Suggested usage:** Nutrition section, protein tracking

#### `wellness/recovery.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/work-life-balance/amico
- **Slug:** work-life-balance
- **Reason:** Rest and recovery permission.
- **Suggested usage:** Rest day focus on Home, recovery messaging

#### `wellness/skincare.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/skincare/amico
- **Slug:** skincare
- **Reason:** Gentle self-care routine.
- **Suggested usage:** Morning/evening routine, habit cards

#### `wellness/sleep.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/sleep-analysis/amico
- **Slug:** sleep-analysis
- **Reason:** Rest and recovery.
- **Suggested usage:** Sleep logging, evening wind-down

#### `wellness/steps.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/completed-steps/amico
- **Slug:** completed-steps
- **Reason:** Daily step progress.
- **Suggested usage:** Steps metric tile, activity progress

#### `wellness/stretching.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/stretching-exercises/amico
- **Slug:** stretching-exercises
- **Reason:** Mobility and body care.
- **Suggested usage:** Mobility routines, recovery day tips

#### `wellness/walking.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/jogging/amico
- **Slug:** jogging
- **Reason:** Gentle outdoor movement.
- **Suggested usage:** Steps goal, gentle movement prompts

#### `wellness/water.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/bottle-of-water/amico
- **Slug:** bottle-of-water
- **Reason:** Hydration ritual.
- **Suggested usage:** Water quick-log, hydration moments

#### `wellness/workout.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/workout/amico
- **Slug:** workout
- **Reason:** Movement as wellbeing, not bodybuilding.
- **Suggested usage:** Today workout section, Home Today's Focus

### Progress

#### `progress/muscle.svg`

- **Source:** unDraw
- **Style:** unDraw
- **License:** unDraw License (free for commercial use)
- **Download URL:** https://undraw.co/illustrations/fitness-tracker
- **Slug:** fitness-tracker
- **Reason:** Strength development.
- **Suggested usage:** Strength PR section

#### `progress/strength.svg`

- **Source:** unDraw
- **Style:** unDraw
- **License:** unDraw License (free for commercial use)
- **Download URL:** https://undraw.co/illustrations/fitness-tracker
- **Slug:** fitness-tracker
- **Reason:** Progressive overload tracking.
- **Suggested usage:** Strength milestones, lifting progress

#### `progress/weight.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/fitness-stats/amico
- **Slug:** fitness-stats
- **Reason:** Body composition tracking.
- **Suggested usage:** Progress weight chart empty/hero

### Reflections

#### `reflections/checkpoint.svg`

- **Source:** unDraw
- **Style:** unDraw
- **License:** unDraw License (free for commercial use)
- **Download URL:** https://undraw.co/illustrations/for-review
- **Slug:** for-review
- **Reason:** Monthly checkpoint.
- **Suggested usage:** Monthly checkpoint dialog

#### `reflections/journal.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/diary/amico
- **Slug:** diary
- **Reason:** Personal journaling.
- **Suggested usage:** Daily notes, reflection prompts

#### `reflections/review.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/progress-overview/amico
- **Slug:** progress-overview
- **Reason:** Weekly reflection.
- **Suggested usage:** Weekly review sheet header

### AI

#### `ai/assistant.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/chat-bot/amico
- **Slug:** chat-bot
- **Reason:** Forge AI companion.
- **Suggested usage:** Coach tab hero, AI feature introduction

#### `ai/conversation.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/conversation/amico
- **Slug:** conversation
- **Reason:** Supportive dialogue with coach.
- **Suggested usage:** Coach chat empty state (with history)

#### `ai/insight.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/statistics/amico
- **Slug:** statistics
- **Reason:** Pattern insight delivery.
- **Suggested usage:** Insights panel, Forge Brief AI summaries

#### `ai/suggestion.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/light-bulb/amico
- **Slug:** light-bulb
- **Reason:** Gentle suggestions from coach.
- **Suggested usage:** Coach suggestion cards

#### `ai/thinking.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/thinking-face/amico
- **Slug:** thinking-face
- **Reason:** AI processing a thoughtful response.
- **Suggested usage:** AI loading / generating response

### Empty

#### `empty/analytics.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/business-analytics/amico
- **Slug:** business-analytics
- **Reason:** Analytics empty state.
- **Suggested usage:** Analytics dashboard empty

#### `empty/calendar.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/calendar/amico
- **Slug:** calendar
- **Reason:** Calendar empty state.
- **Suggested usage:** Calendar feature marketing

#### `empty/camera.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/image-viewer/amico
- **Slug:** image-viewer
- **Reason:** Photo capture empty state.
- **Suggested usage:** Photo upload prompt

#### `empty/goals.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/shared-goals/amico
- **Slug:** shared-goals
- **Reason:** Goals not yet defined.
- **Suggested usage:** Goals not yet set

#### `empty/no-calendar.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/calendar/amico
- **Slug:** calendar
- **Reason:** Calendar awaiting history.
- **Suggested usage:** Calendar — no logged days

#### `empty/no-coach-history.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/chat/amico
- **Slug:** chat
- **Reason:** No coach conversations.
- **Suggested usage:** Coach — no past conversations

#### `empty/no-habits.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/checklist/amico
- **Slug:** checklist
- **Reason:** Habits not configured.
- **Suggested usage:** Habits section — none configured

#### `empty/no-notifications.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/push-notifications/amico
- **Slug:** push-notifications
- **Reason:** No reminders set.
- **Suggested usage:** Settings reminders — none enabled

#### `empty/no-photos.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/image-upload/amico
- **Slug:** image-upload
- **Reason:** No progress photos.
- **Suggested usage:** Progress photo gallery empty

#### `empty/no-progress.svg`

- **Source:** unDraw
- **Style:** unDraw
- **License:** unDraw License (free for commercial use)
- **Download URL:** https://undraw.co/illustrations/progress-data
- **Slug:** progress-data
- **Reason:** No progress data yet.
- **Suggested usage:** Progress tab cold start

#### `empty/no-workout.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/no-data/amico
- **Slug:** no-data
- **Reason:** No workout logged.
- **Suggested usage:** Today workout — no session scheduled

#### `empty/notebook.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/notebook/amico
- **Slug:** notebook
- **Reason:** Notes empty state.
- **Suggested usage:** Notes / journal empty

#### `empty/progress.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/progress-indicator/amico
- **Slug:** progress-indicator
- **Reason:** Progress chart empty.
- **Suggested usage:** Charts awaiting data

#### `empty/trophy.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/winners/amico
- **Slug:** winners
- **Reason:** Achievements empty.
- **Suggested usage:** Achievements / streaks empty

### Onboarding

#### `onboarding/ready.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/launching/amico
- **Slug:** launching
- **Reason:** Ready to begin.
- **Suggested usage:** Onboarding completion — Start Today

#### `onboarding/setup.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/personal-settings/amico
- **Slug:** personal-settings
- **Reason:** Initial profile setup.
- **Suggested usage:** Profile setup step

#### `onboarding/welcome.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/welcome/amico
- **Slug:** welcome
- **Reason:** First-time welcome moment.
- **Suggested usage:** First-launch onboarding dialog

### Misc

#### `misc/calendar.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/schedule/amico
- **Slug:** schedule
- **Reason:** Calendar feature iconography.
- **Suggested usage:** Calendar nav accent, date picker

#### `misc/camera.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/camera/amico
- **Slug:** camera
- **Reason:** Progress photo capture.
- **Suggested usage:** Checkpoint photo capture

#### `misc/checklist.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/checklist/amico
- **Slug:** checklist
- **Reason:** Daily routine checklist.
- **Suggested usage:** Routine checklist headers

#### `misc/notebook.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/notebook/amico
- **Slug:** notebook
- **Reason:** Notes and planning.
- **Suggested usage:** Blueprint / Plan reference

#### `misc/routine.svg`

- **Source:** unDraw
- **Style:** unDraw
- **License:** unDraw License (free for commercial use)
- **Download URL:** https://undraw.co/illustrations/checklist
- **Slug:** checklist
- **Reason:** Daily routine structure.
- **Suggested usage:** Daily journey timeline

#### `misc/sparkles.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/celebration/amico
- **Slug:** celebration
- **Reason:** Micro-celebration moments.
- **Suggested usage:** Day complete moment, micro-celebrations

#### `misc/target.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/target/amico
- **Slug:** target
- **Reason:** Goal targeting.
- **Suggested usage:** Goals, priorities, Today's Focus fallback

#### `misc/trophy.svg`

- **Source:** Storyset
- **Style:** Amico
- **License:** Storyset Free License (attribution required)
- **Download URL:** https://storyset.com/illustration/awards/amico
- **Slug:** awards
- **Reason:** Achievement celebration.
- **Suggested usage:** Streak milestones, day-complete celebration

---

## Usage Map (Quick Reference)

| Screen | Recommended assets |
|--------|-------------------|
| **Home** | `hero/*`, `wellness/recovery.svg`, `misc/routine.svg`, `misc/sparkles.svg` |
| **Today** | `wellness/*`, `empty/no-workout.svg`, `misc/checklist.svg` |
| **Progress** | `progress/*`, `empty/no-progress.svg`, `empty/no-photos.svg` |
| **Calendar** | `misc/calendar.svg`, `empty/no-calendar.svg` |
| **Coach** | `ai/*`, `empty/no-coach-history.svg` |
| **Onboarding** | `onboarding/*` |
| **Settings** | `empty/no-notifications.svg` |
| **Weekly Review** | `reflections/review.svg` |
| **Monthly Checkpoint** | `reflections/checkpoint.svg`, `misc/camera.svg` |

---

## Missing Assets

All required assets from the Sprint asset brief are present (**54 / 54**).

No blockers for integration.

---

## Future Premium Asset Recommendations

1. **Custom Amico commission** — Replace 5 unDraw fallbacks with Storyset-custom or in-house isometric art for single-style consistency.
2. **Forge Brief hero** — Bespoke illustration for AI-generated daily briefing (warm, personal, no generic coffee/sun tropes).
3. **Day-complete animation** — Lottie or animated Storyset export for streak celebration (`misc/sparkles.svg` moment).
4. **Emotional state set** — 4–6 subtle mood illustrations for Coach empathy responses (stressed, tired, motivated, proud).
5. **Seasonal variants** — Optional hero backgrounds for winter/summer without changing layout.
6. **Premium empty states** — Context-aware empties (e.g. "First workout tomorrow" vs "Rest day today").

---

## Maintenance

- Re-download script: `node scripts/fetch-storyset-assets.mjs`
- Patch missing: `node scripts/fetch-assets-patch.mjs`
- Manifest: `docs/assets-manifest.json`
- Regenerate this doc: `node scripts/generate-assets-doc.mjs`

*Last updated: June 26, 2026*
