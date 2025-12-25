
import { Workout, TrainingSession, DailyLog } from './types';

export const INITIAL_WORKOUTS: Workout[] = [
  {
    id: '1',
    name: 'Push',
    exercises: [
      { id: 'p1', name: 'Incline Dumbbell Press', sets: 3, hasWarmup: true },
      { id: 'p2', name: 'Cable Fly / Pec Deck', sets: 3, hasWarmup: false },
      { id: 'p3', name: 'Incline Smith Press', sets: 3, hasWarmup: false },
      { id: 'p4', name: 'DB Shoulder Press', sets: 3, hasWarmup: false },
      { id: 'p5', name: 'Lateral Raises', sets: 3, hasWarmup: false },
      { id: 'p6', name: 'Triceps Extension', sets: 3, hasWarmup: false },
      { id: 'p7', name: 'Dips', sets: 3, hasWarmup: false },
      { id: 'p8', name: 'Lateral Raise Machine', sets: 3, hasWarmup: false }
    ]
  },
  {
    id: '2',
    name: 'Pull',
    exercises: [
      { id: 'u1', name: 'Pull Ups', sets: 3, hasWarmup: true },
      { id: 'u2', name: 'Barbell Row', sets: 3, hasWarmup: false },
      { id: 'u3', name: 'Seated Machine Row', sets: 3, hasWarmup: false },
      { id: 'u4', name: 'Close Grip Lat Pulldown', sets: 3, hasWarmup: false },
      { id: 'u5', name: 'Cable Rear Delt', sets: 3, hasWarmup: false },
      { id: 'u6', name: 'Cable Biceps Curl', sets: 3, hasWarmup: false },
      { id: 'u7', name: 'Preacher Curl Machine', sets: 3, hasWarmup: false },
      { id: 'u8', name: 'Rear Delt Fly', sets: 3, hasWarmup: false },
      { id: 'u9', name: 'Forearms', sets: 3, hasWarmup: false }
    ]
  },
  {
    id: '3',
    name: 'Legs',
    exercises: [
      { id: 'l1', name: 'Hamstring Curls', sets: 3, hasWarmup: true },
      { id: 'l2', name: 'Smith Machine Squat', sets: 3, hasWarmup: true },
      { id: 'l3', name: 'Bulgarian Split Squat', sets: 3, hasWarmup: false },
      { id: 'l4', name: 'Adductors', sets: 3, hasWarmup: false },
      { id: 'l5', name: 'Calves', sets: 3, hasWarmup: false },
      { id: 'l6', name: 'Abs', sets: 3, hasWarmup: false }
    ]
  }
];

// Helper to generate dates for dummy data
const getPastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const getPastDateOnly = (daysAgo: number) => {
  return getPastDate(daysAgo).split('T')[0];
};

export const INITIAL_DAILY_LOGS: DailyLog[] = [
  { id: 'd1', date: getPastDateOnly(6), weight: 81.2, calories: 2450 },
  { id: 'd2', date: getPastDateOnly(5), weight: 81.0, calories: 2300 },
  { id: 'd3', date: getPastDateOnly(4), weight: 80.8, calories: 2550 },
  { id: 'd4', date: getPastDateOnly(3), weight: 80.5, calories: 2200 },
  { id: 'd5', date: getPastDateOnly(2), weight: 80.7, calories: 2400 },
  { id: 'd6', date: getPastDateOnly(1), weight: 80.4, calories: 2350 },
  { id: 'd7', date: getPastDateOnly(0), weight: 80.2, calories: 2100 },
];

export const INITIAL_TRAININGS: TrainingSession[] = [
  {
    id: 's1',
    workoutId: '1',
    date: getPastDate(5),
    exerciseResults: {
      'p1': [
        { reps: 10, weight: 20, isWarmup: true, completed: true },
        { reps: 10, weight: 24, isWarmup: false, completed: true },
        { reps: 8, weight: 26, isWarmup: false, completed: true },
        { reps: 8, weight: 26, isWarmup: false, completed: true },
      ],
      'p2': [
        { reps: 12, weight: 40, isWarmup: false, completed: true },
        { reps: 12, weight: 40, isWarmup: false, completed: true },
        { reps: 12, weight: 40, isWarmup: false, completed: true },
      ]
    }
  },
  {
    id: 's2',
    workoutId: '2',
    date: getPastDate(3),
    exerciseResults: {
      'u1': [
        { reps: 8, weight: 0, isWarmup: true, completed: true },
        { reps: 8, weight: 0, isWarmup: false, completed: true },
        { reps: 7, weight: 0, isWarmup: false, completed: true },
        { reps: 6, weight: 0, isWarmup: false, completed: true },
      ]
    }
  },
  {
    id: 's3',
    workoutId: '1',
    date: getPastDate(1),
    exerciseResults: {
      'p1': [
        { reps: 10, weight: 20, isWarmup: true, completed: true },
        { reps: 10, weight: 26, isWarmup: false, completed: true },
        { reps: 9, weight: 26, isWarmup: false, completed: true },
        { reps: 8, weight: 26, isWarmup: false, completed: true },
      ]
    }
  }
];

export const STORAGE_KEYS = {
  WORKOUTS: 'flex_workouts_v2',
  TRAININGS: 'flex_trainings_v2',
  DAILY_LOGS: 'flex_daily_logs_v2',
  ACTIVE_SESSION: 'flex_active_session_v2'
};
