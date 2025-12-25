
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  hasWarmup: boolean;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface SetData {
  reps: number;
  weight: number;
  isWarmup: boolean;
  completed: boolean;
}

export interface TrainingSession {
  id: string;
  workoutId: string;
  date: string; // ISO String
  startTime?: number; // Timestamp
  endTime?: number; // Timestamp
  exerciseResults: Record<string, SetData[]>; // exerciseId -> sets
}

export interface ActiveSessionData {
  workoutId: string;
  startTime: number;
  exerciseResults: Record<string, SetData[]>;
  currentExIndex: number;
  currentStepIndex: number;
}

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  calories: number;
}

export type AppView = 'dashboard' | 'workouts' | 'session' | 'daily' | 'stats' | 'edit-workout' | 'history' | 'history-detail';
