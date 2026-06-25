export type GoalCategory =
  | "Fitness"
  | "Health"
  | "Career"
  | "Startup"
  | "Learning"
  | "Finance"
  | "Custom";

export type HabitCategory =
  | "Health"
  | "Fitness"
  | "Mindset"
  | "Career"
  | "Learning"
  | "Custom";

export type Goal = {
  id: string;
  title: string;
  category: GoalCategory;
  current: number;
  target: number;
  unit: string;
  deadline?: string;
  active: boolean;
};

export type Habit = {
  id: string;
  title: string;
  category: HabitCategory;
  frequency: "daily" | "weekly";
  weeklyDays?: string[];
  active: boolean;
};

export type ExerciseModifier = "dropset" | "superset" | "failure";

export type Exercise = {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  notes?: string;
  intensityNotes?: string;
  modifiers?: ExerciseModifier[];
};

export type WorkoutDay = {
  id: string;
  name: string;
  order: number;
  isRestDay?: boolean;
  exercises: Exercise[];
};

export type WorkoutPlan = {
  days: WorkoutDay[];
};

export type WorkoutCycleState = {
  currentIndex: number;
  lastCompletedDayId?: string;
  lastCompletedDate?: string;
  nextWorkoutDayId: string;
};

export type SetLog = {
  reps: number;
  weightKg?: number;
  completed: boolean;
};

export type ExerciseSession = {
  exerciseId: string;
  sets: SetLog[];
  notes?: string;
};

export type WorkoutSession = {
  dayId: string;
  date: string;
  exercises: ExerciseSession[];
  completed: boolean;
};

export type WaterEntry = {
  time: string;
  amountMl: number;
};

export type DayRecord = {
  date: string;
  waterMl: number;
  waterEntries: WaterEntry[];
  proteinG: number;
  sleepHours: number;
  steps: number;
  weightKg?: number;
  morningChecklist: Record<string, boolean>;
  dayChecklist: Record<string, boolean>;
  nightChecklist: Record<string, boolean>;
  workoutCompletion?: WorkoutSession;
  habits: Record<string, boolean>;
  notes?: string;
  dailyScore?: number;
  projectedScore?: number;
};

export type WeeklyReview = {
  id: string;
  weekStart: string;
  wentWell: string;
  didntGoWell: string;
  improveNextWeek: string;
  currentWeight?: number;
  avgSleep?: number;
  workoutCompletionPct?: number;
  waterCompletionPct?: number;
  proteinCompletionPct?: number;
  habitCompletionPct?: number;
  insights?: string[];
  completedAt: string;
};

export type MonthlyCheckpoint = {
  id: string;
  month: string;
  weight?: number;
  measurements: {
    waist?: number;
    chest?: number;
    arms?: number;
    thighs?: number;
  };
  progressNotes?: string;
  hairPhotoIds: string[];
  skinPhotoIds: string[];
  createdAt: string;
};

export type PriorityRank = "P1" | "P2" | "P3" | "P4" | "P5";

export type Priority = {
  rank: PriorityRank;
  label: string;
  impactScore: number;
  category: string;
  actionType: string;
  section: TodaySection;
};

export type TodaySection =
  | "morning"
  | "nutrition"
  | "water"
  | "workout"
  | "habits"
  | "night"
  | "sleep";

export type WeightLog = {
  date: string;
  weightKg: number;
};

export type StrengthLog = {
  date: string;
  exercise: "bench" | "deadlift" | "squat" | "ohp";
  weightKg: number;
  reps: number;
};

export type WaterReminder = {
  id: string;
  time: string;
  enabled: boolean;
};

export type Profile = {
  name: string;
  age: number;
  gender: string;
  height: string;
  currentWeight: number;
  targetWeight: number;
  targetWeightRange: string;
  dailyProteinGoal: number;
  dailyWaterGoal: number;
  dailyStepsGoal: number;
  dailySleepGoal: number;
  startDate: string;
};

export type ScoreBreakdown = {
  workout: number;
  protein: number;
  water: number;
  sleep: number;
  steps: number;
  hairRoutine: number;
  skinRoutine: number;
  total: number;
};

export type ScoreResult = {
  current: ScoreBreakdown;
  projected: ScoreBreakdown;
  gap: number;
};

export type HeatmapDay = {
  date: string;
  score: number | null;
  level: "green" | "yellow" | "red" | "empty";
};

export const LIFE_AREAS = [
  "Fitness",
  "Health",
  "Appearance",
  "Career",
  "Startup",
  "Learning",
  "Finance",
  "Relationships",
] as const;

export type LifeArea = (typeof LIFE_AREAS)[number];

export const BACKUP_SCHEMA_VERSION = 1;
