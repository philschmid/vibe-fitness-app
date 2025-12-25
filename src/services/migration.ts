import { storage } from './storage';
import { db } from './db';

const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const migrateLocalData = async () => {
  try {
    const workouts = storage.getWorkouts();
    const trainings = storage.getTrainings();
    const logs = storage.getDailyLogs();
    
    // Map to track ID changes for relationships (oldId -> newUUID)
    const idMap = new Map<string, string>();

    console.log(`Migrating ${workouts.length} workouts...`);
    for (const workout of workouts) {
      const oldId = workout.id;
      if (!isValidUUID(oldId)) {
        const newId = crypto.randomUUID();
        idMap.set(oldId, newId);
        workout.id = newId;
      }

      // Ensure exercises have valid UUIDs
      workout.exercises = workout.exercises.map(ex => {
        if (!isValidUUID(ex.id)) {
          return { ...ex, id: crypto.randomUUID() };
        }
        return ex;
      });

      await db.saveWorkout(workout);
    }

    console.log(`Migrating ${trainings.length} trainings...`);
    for (const training of trainings) {
      if (!isValidUUID(training.id)) {
        training.id = crypto.randomUUID();
      }
      
      // Update workoutId if mapped
      if (idMap.has(training.workoutId)) {
        training.workoutId = idMap.get(training.workoutId)!;
      }

      await db.saveTraining(training);
    }

    console.log(`Migrating ${logs.length} logs...`);
    for (const log of logs) {
      if (!isValidUUID(log.id)) {
        log.id = crypto.randomUUID();
      }
      await db.saveDailyLog(log);
    }
    
    alert("Migration completed successfully!");
    // storage.clear() ? No, let's keep it safe.
  } catch (error) {
    console.error("Migration failed:", error);
    alert("Migration failed. Check console for details.");
  }
};
