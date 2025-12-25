import {
  Workout,
  TrainingSession,
  DailyLog,
  ActiveSessionData,
} from "../types";
import { STORAGE_KEYS } from "../constants";

export const storage = {
  getWorkouts: (): Workout[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
    return data ? JSON.parse(data) : [];
  },
  saveWorkouts: (workouts: Workout[]) => {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
  },

  getTrainings: (): TrainingSession[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRAININGS);
    return data ? JSON.parse(data) : [];
  },
  saveTrainings: (trainings: TrainingSession[]) => {
    localStorage.setItem(STORAGE_KEYS.TRAININGS, JSON.stringify(trainings));
  },

  getDailyLogs: (): DailyLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    return data ? JSON.parse(data) : [];
  },
  saveDailyLogs: (logs: DailyLog[]) => {
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
  },

  getActiveSession: (): ActiveSessionData | null => {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return data ? JSON.parse(data) : null;
  },
  saveActiveSession: (data: ActiveSessionData) => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(data));
  },
  clearActiveSession: () => {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  },
};
