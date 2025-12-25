import { storage } from './storage';
import { db } from './db';

export const migrateLocalData = async () => {
  try {
    const workouts = storage.getWorkouts();
    const trainings = storage.getTrainings();
    const logs = storage.getDailyLogs();

    console.log(`Migrating ${workouts.length} workouts...`);
    for (const workout of workouts) {
      await db.saveWorkout(workout);
    }

    console.log(`Migrating ${trainings.length} trainings...`);
    for (const training of trainings) {
      await db.saveTraining(training);
    }

    console.log(`Migrating ${logs.length} logs...`);
    for (const log of logs) {
      await db.saveDailyLog(log);
    }
    
    alert("Migration completed successfully!");
    // storage.clear() ? No, let's keep it safe.
  } catch (error) {
    console.error("Migration failed:", error);
    alert("Migration failed. Check console for details.");
  }
};

