import { Workout, TrainingSession, DailyLog } from "./types";

export const APP_VERSION = "0.0.2";

export const INITIAL_WORKOUTS: Workout[] = [
  {
    id: "1",
    name: "Pull",
    exercises: [
      { id: "u1", name: "Weighted Pull Ups", sets: 3, hasWarmup: true },
      { id: "u2", name: "Barbell Row", sets: 3, hasWarmup: false },
      { id: "u3", name: "Machine Row (Die 2.)", sets: 3, hasWarmup: false },
      { id: "u4", name: "Close Grip Lat Pulldown", sets: 3, hasWarmup: false },
      { id: "u5", name: "Cable Rear Delt", sets: 3, hasWarmup: false },
      { id: "u6", name: "Cable Biceps Curl", sets: 3, hasWarmup: false },
      { id: "u7", name: "Preacher Curl Machine", sets: 3, hasWarmup: false },
      { id: "u8", name: "Rear Delt Fly", sets: 3, hasWarmup: false },
      { id: "u9", name: "Forearms", sets: 3, hasWarmup: false },
    ],
  },
  {
    id: "2",
    name: "Push",
    exercises: [
      { id: "p1", name: "Incline Dumbbell Press", sets: 3, hasWarmup: true },
      { id: "p2", name: "Cable Fly / Pec Deck", sets: 6, hasWarmup: false },
      { id: "p3", name: "Incline Smith Press", sets: 3, hasWarmup: false },
      { id: "p4", name: "DB Shoulder Press", sets: 3, hasWarmup: false },
      { id: "p5", name: "Lateral Raises", sets: 3, hasWarmup: false },
      { id: "p6", name: "Triceps Extension", sets: 6, hasWarmup: false },
      { id: "p7", name: "Weighted Dips", sets: 3, hasWarmup: false },
      { id: "p8", name: "Lateral Raise Machine", sets: 3, hasWarmup: false },
    ],
  },
  {
    id: "3",
    name: "Legs",
    exercises: [
      { id: "l1", name: "RDLs", sets: 2, hasWarmup: true },
      { id: "l2", name: "Leg Extensions", sets: 2, hasWarmup: true },
      { id: "l3", name: "Hamstring Curls", sets: 2, hasWarmup: true },
      {
        id: "l4",
        name: "Smith Machine Squat / Sissy Squat",
        sets: 2,
        hasWarmup: true,
      },
      { id: "l5", name: "Bulgarian Split Squat", sets: 2, hasWarmup: false },
      { id: "l6", name: "Adductors", sets: 2, hasWarmup: false },
      { id: "l7", name: "Calves", sets: 2, hasWarmup: false },
      { id: "l8", name: "Abs Cable Crunch", sets: 3, hasWarmup: false },
      { id: "l9", name: "Abs Machine Crunch", sets: 3, hasWarmup: false },
    ],
  },
];

// Helper to generate dates for dummy data
const getPastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const getPastDateOnly = (daysAgo: number) => {
  return getPastDate(daysAgo).split("T")[0];
};

export const INITIAL_DAILY_LOGS: DailyLog[] = [
  { id: "d1", date: getPastDateOnly(6), weight: 81.2, calories: 2450 },
  { id: "d2", date: getPastDateOnly(5), weight: 81.0, calories: 2300 },
  { id: "d3", date: getPastDateOnly(4), weight: 80.8, calories: 2550 },
  { id: "d4", date: getPastDateOnly(3), weight: 80.5, calories: 2200 },
  { id: "d5", date: getPastDateOnly(2), weight: 80.7, calories: 2400 },
  { id: "d6", date: getPastDateOnly(1), weight: 80.4, calories: 2350 },
  { id: "d7", date: getPastDateOnly(0), weight: 80.2, calories: 2100 },
];

export const INITIAL_TRAININGS: TrainingSession[] = [
  // Pull Session 1 (5 days ago)
  {
    id: "s1",
    workoutId: "1", // Pull
    date: getPastDate(5),
    exerciseResults: {
      u1: [
        { reps: 10, weight: 0, isWarmup: true, completed: true },
        { reps: 8, weight: 10, isWarmup: false, completed: true },
        { reps: 8, weight: 10, isWarmup: false, completed: true },
        { reps: 7, weight: 10, isWarmup: false, completed: true },
      ],
      u2: [
        { reps: 12, weight: 60, isWarmup: false, completed: true },
        { reps: 12, weight: 60, isWarmup: false, completed: true },
        { reps: 10, weight: 60, isWarmup: false, completed: true },
      ],
    },
  },
  // Push Session 1 (3 days ago)
  {
    id: "s2",
    workoutId: "2", // Push
    date: getPastDate(3),
    exerciseResults: {
      p1: [
        { reps: 15, weight: 12, isWarmup: true, completed: true },
        { reps: 10, weight: 24, isWarmup: false, completed: true },
        { reps: 10, weight: 24, isWarmup: false, completed: true },
        { reps: 9, weight: 24, isWarmup: false, completed: true },
      ],
      p2: [
        { reps: 12, weight: 40, isWarmup: false, completed: true },
        { reps: 12, weight: 40, isWarmup: false, completed: true },
      ],
    },
  },
  // Legs Session 1 (2 days ago)
  {
    id: "s3",
    workoutId: "3", // Legs
    date: getPastDate(2),
    exerciseResults: {
      l1: [
        { reps: 12, weight: 40, isWarmup: true, completed: true },
        { reps: 10, weight: 80, isWarmup: false, completed: true },
        { reps: 10, weight: 80, isWarmup: false, completed: true },
      ],
      l2: [
        { reps: 12, weight: 40, isWarmup: true, completed: true },
        { reps: 12, weight: 60, isWarmup: false, completed: true },
        { reps: 12, weight: 60, isWarmup: false, completed: true },
      ],
    },
  },
  // Pull Session 2 (1 day ago)
  {
    id: "s4",
    workoutId: "1", // Pull
    date: getPastDate(1),
    exerciseResults: {
      u1: [
        { reps: 10, weight: 0, isWarmup: true, completed: true },
        { reps: 9, weight: 12.5, isWarmup: false, completed: true },
        { reps: 8, weight: 12.5, isWarmup: false, completed: true },
        { reps: 7, weight: 12.5, isWarmup: false, completed: true },
      ],
      u2: [
        { reps: 12, weight: 65, isWarmup: false, completed: true },
        { reps: 11, weight: 65, isWarmup: false, completed: true },
        { reps: 10, weight: 65, isWarmup: false, completed: true },
      ],
    },
  },
];

export const STORAGE_KEYS = {
  WORKOUTS: "flex_workouts_v2",
  TRAININGS: "flex_trainings_v2",
  DAILY_LOGS: "flex_daily_logs_v2",
  ACTIVE_SESSION: "flex_active_session_v2",
};
