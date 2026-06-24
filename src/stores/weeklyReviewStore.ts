"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WeeklyReview } from "@/types";

type WeeklyReviewState = {
  reviews: WeeklyReview[];
  dismissedWeek: string | null;
  addReview: (review: WeeklyReview) => void;
  dismissWeek: (weekStart: string) => void;
  getReviewForWeek: (weekStart: string) => WeeklyReview | undefined;
};

export const useWeeklyReviewStore = create<WeeklyReviewState>()(
  persist(
    (set, get) => ({
      reviews: [],
      dismissedWeek: null,
      addReview: (review) =>
        set((state) => ({
          reviews: [
            ...state.reviews.filter((r) => r.weekStart !== review.weekStart),
            review,
          ],
        })),
      dismissWeek: (weekStart) => set({ dismissedWeek: weekStart }),
      getReviewForWeek: (weekStart) =>
        get().reviews.find((r) => r.weekStart === weekStart),
    }),
    { name: "forge-weekly-review" }
  )
);

export function getWeeklyReviewSnapshot() {
  const s = useWeeklyReviewStore.getState();
  return { reviews: s.reviews, dismissedWeek: s.dismissedWeek };
}

export function hydrateWeeklyReview(
  data: ReturnType<typeof getWeeklyReviewSnapshot>
) {
  useWeeklyReviewStore.setState(data);
}
