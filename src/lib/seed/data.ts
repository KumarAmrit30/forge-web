export const seedData = {
  profile: {
    name: "Amrit Kumar",
    age: 22,
    gender: "Male",
    height: "5'7\"",
    currentWeight: 76,
    targetWeight: 72,
    targetWeightRange: "70-72 kg",
    dailyProteinGoal: 130,
    dailyWaterGoal: 3500,
    dailyStepsGoal: 10000,
    dailySleepGoal: 8,
    startDate: "2026-06-01",
  },

  goals: [
    "Reach 70-72 kg bodyweight",
    "Build lean muscle mass",
    "Improve strength",
    "Reduce body fat",
    "Improve skin quality",
    "Improve scalp health",
    "Improve hair density",
    "Build long-term consistency",
  ],

  hairRoutine: {
    products: [
      {
        name: "Minimalist 5% Minoxidil",
        frequency: "Daily",
        timing: "Night",
        notes: "Apply to dry scalp before sleeping",
      },
      {
        name: "Ketoconazole 2% Shampoo",
        frequency: "Twice Weekly",
        schedule: ["Monday", "Saturday"],
        notes: "Leave on scalp for 3-5 minutes",
      },
      {
        name: "DHT Blocker Shampoo",
        frequency: "Wednesday",
        notes: "Finish existing bottle then switch to Kesh King Gold",
      },
      {
        name: "Hair Gummies",
        frequency: "Daily",
        timing: "Morning",
      },
    ],
    monthlyPhotos: ["Front Hairline", "Top View", "Crown View"],
  },

  skinRoutine: {
    morning: [
      "Minimalist 2% Salicylic Acid Cleanser",
      "Moisturizer",
      "Sunscreen",
    ],
    night: [
      "Minimalist 2% Salicylic Acid Cleanser",
      "Moisturizer",
    ],
    weekly: [
      {
        name: "Curd + Besan Face Pack",
        frequency: "1-2x per week",
      },
      {
        name: "Charcoal Peel Off Mask",
        frequency: "Every 1-2 weeks",
      },
    ],
  },

  nutrition: {
    calories: 2200,
    protein: 130,
    carbs: 250,
    fats: 65,
    fiber: 35,
    water: 3500,
  },

  breakfast: {
    name: "Overnight Oats Bowl",
    ingredients: [
      "Kellogg's Muesli",
      "Plain Oats",
      "Pumpkin Seeds",
      "Sunflower Seeds",
      "Chia Seeds",
      "Flax Seeds",
      "Almonds",
      "Raisins",
      "Dried Cranberries",
      "Cow Milk",
    ],
    nutrition: {
      calories: "650-750",
      protein: "24-28g",
      carbs: "75-85g",
      fats: "25-30g",
      fiber: "15-20g",
    },
  },

  customHabits: [
    "Hit Protein Goal",
    "Drink 3.5L Water",
    "Complete Workout",
    "Apply Minoxidil",
    "Morning Skincare",
    "Night Skincare",
    "Sleep 8 Hours",
    "Walk 10,000 Steps",
  ],

  workoutPlan: [
    {
      day: 1,
      title: "Chest + Biceps (Strength Focus)",
      exercises: [
        {
          name: "Barbell Bench Press",
          sets: 4,
          reps: "4-6",
          rest: "2-3 min",
          notes: "Last set drop set (-30%)",
        },
        {
          name: "Incline DB Press",
          sets: 3,
          reps: "8-10",
          rest: "90 sec",
          notes: "Last set rest-pause",
        },
        {
          name: "Chest Fly",
          sets: 3,
          reps: "12-15",
          notes: "Last set double drop",
        },
        { name: "Dips", sets: 2, reps: "Failure" },
        { name: "Barbell Curl", sets: 4, reps: "6-8" },
        {
          name: "Incline DB Curl",
          sets: 3,
          reps: "10-12",
          notes: "4 sec negatives",
        },
        {
          name: "Cable Curl",
          sets: 3,
          reps: "12-15",
          notes: "Triple drop",
        },
        { name: "Hammer Curl", sets: 2, reps: "12-15" },
      ],
    },
    {
      day: 2,
      title: "Back + Triceps (Thickness)",
      exercises: [
        {
          name: "Deadlift / Rack Pull",
          sets: 4,
          reps: "3-5",
          rest: "3 min",
        },
        {
          name: "Pull-ups / Lat Pulldown",
          sets: 4,
          reps: "8-10",
        },
        { name: "Barbell Row", sets: 3, reps: "8-10" },
        {
          name: "Seated Cable Row",
          sets: 3,
          reps: "12",
          notes: "Drop set",
        },
        {
          name: "Close Grip Bench Press",
          sets: 4,
          reps: "6-8",
        },
        { name: "Skull Crusher", sets: 3, reps: "10-12" },
        {
          name: "Rope Pushdown",
          sets: 3,
          reps: "12-15",
          notes: "Triple drop",
        },
        {
          name: "Overhead DB Extension",
          sets: 2,
          reps: "Failure",
        },
      ],
    },
    {
      day: 3,
      title: "Shoulders + Abs",
      exercises: [
        { name: "Overhead Press", sets: 4, reps: "5-7" },
        {
          name: "Lateral Raise",
          sets: 4,
          reps: "12-15",
          notes: "Drop set",
        },
        { name: "Rear Delt Fly", sets: 3, reps: "15" },
        { name: "Upright Row", sets: 3, reps: "10" },
        { name: "Hanging Leg Raise", sets: 4, reps: "15" },
        { name: "Cable Crunch", sets: 4, reps: "15" },
        { name: "Plank", sets: 3, reps: "1 min" },
      ],
    },
    { day: 4, title: "Chest + Biceps (Pump & Volume)", exercises: [] },
    { day: 5, title: "Back + Triceps (Pump)", exercises: [] },
    { day: 6, title: "Legs + Abs", exercises: [] },
    { day: 7, title: "Rest Day", exercises: [], isRestDay: true },
  ],

  goldenRules: [
    "Heavy sets = 2-3 min rest",
    "Pump sets = 45-60 sec rest",
    "Drop sets only on final set",
    "Progressive overload every week",
    "Failure only on final 1-2 sets",
    "Consistency beats perfection",
    "Track progress monthly",
    "Focus on long-term improvement",
  ],

  reminderSchedule: {
    water: [
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
      "20:00",
    ],
  },

  lifeAreas: {
    Fitness: "Build lean muscle, improve strength, and maintain consistent workout execution.",
    Health: "Optimize nutrition, hydration, sleep, and daily health habits.",
    Appearance: "Improve skin quality, hair density, and overall grooming routines.",
    Career: "Advance professional skills and deliver consistent high-quality work.",
    Startup: "Build and ship Aarogya Vault MVP and grow as a founder.",
    Learning: "Read consistently and expand technical and personal knowledge.",
    Finance: "Build savings discipline and long-term financial stability.",
    Relationships: "Invest time in meaningful connections and communication.",
  },
};
