import { TrainingSession, SetData } from "../types";

// Calculate total volume (weight * reps) for a session, excluding warmups
export function calculateTotalVolume(session: TrainingSession): number {
  let total = 0;
  Object.values(session.exerciseResults).forEach((sets) => {
    sets.forEach((set) => {
      if (!set.isWarmup && set.completed) {
        total += set.weight * set.reps;
      }
    });
  });
  return total;
}

// Calculate total sets completed (excluding warmups)
export function calculateTotalSets(session: TrainingSession): number {
  let total = 0;
  Object.values(session.exerciseResults).forEach((sets) => {
    sets.forEach((set) => {
      if (!set.isWarmup && set.completed) {
        total++;
      }
    });
  });
  return total;
}

// Calculate total reps (excluding warmups)
export function calculateTotalReps(session: TrainingSession): number {
  let total = 0;
  Object.values(session.exerciseResults).forEach((sets) => {
    sets.forEach((set) => {
      if (!set.isWarmup && set.completed) {
        total += set.reps;
      }
    });
  });
  return total;
}

// Calculate duration in minutes
export function calculateDuration(session: TrainingSession): number {
  if (session.startTime && session.endTime) {
    return Math.round((session.endTime - session.startTime) / 60000);
  }
  return 0;
}

// Compare two sessions and return percentage change
export function compareSessionVolume(
  current: TrainingSession,
  previous: TrainingSession | null
): number | null {
  if (!previous) return null;
  const currentVolume = calculateTotalVolume(current);
  const previousVolume = calculateTotalVolume(previous);
  if (previousVolume === 0) return null;
  return ((currentVolume - previousVolume) / previousVolume) * 100;
}

// Get the previous session for the same workout
export function getPreviousSession(
  sessions: TrainingSession[],
  workoutId: string,
  currentSessionId?: string
): TrainingSession | null {
  const workoutSessions = sessions
    .filter((s) => s.workoutId === workoutId && s.id !== currentSessionId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return workoutSessions[0] || null;
}

// Check if an exercise has had the same weight and reps for the last N sessions
// Returns the exercise IDs that are plateauing
export function detectPlateauExercises(
  sessions: TrainingSession[],
  workoutId: string,
  exerciseId: string,
  requiredConsecutive: number = 3
): { isPlateauing: boolean; consecutiveCount: number; weight: number; reps: number } | null {
  // Get sessions for this workout, sorted by date descending
  const workoutSessions = sessions
    .filter((s) => s.workoutId === workoutId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (workoutSessions.length < requiredConsecutive) {
    return null;
  }

  // Get the last N sessions
  const recentSessions = workoutSessions.slice(0, requiredConsecutive);

  // Check if all sessions have the same weight and reps for the exercise (excluding warmups and dropsets)
  let referenceWeight: number | null = null;
  let referenceReps: number | null = null;
  let allSame = true;

  for (const session of recentSessions) {
    const sets = session.exerciseResults[exerciseId];
    if (!sets) {
      allSame = false;
      break;
    }

    // Get non-warmup, non-dropset, completed sets
    const workingSets = sets.filter(
      (s) => !s.isWarmup && !s.isDropset && s.completed
    );

    if (workingSets.length === 0) {
      allSame = false;
      break;
    }

    // Use the first working set as reference (or average, but first is simpler)
    const avgWeight = Math.round(
      workingSets.reduce((sum, s) => sum + s.weight, 0) / workingSets.length
    );
    const avgReps = Math.round(
      workingSets.reduce((sum, s) => sum + s.reps, 0) / workingSets.length
    );

    if (referenceWeight === null) {
      referenceWeight = avgWeight;
      referenceReps = avgReps;
    } else {
      if (avgWeight !== referenceWeight || avgReps !== referenceReps) {
        allSame = false;
        break;
      }
    }
  }

  if (allSame && referenceWeight !== null && referenceReps !== null) {
    return {
      isPlateauing: true,
      consecutiveCount: requiredConsecutive,
      weight: referenceWeight,
      reps: referenceReps,
    };
  }

  return null;
}

// Calculate per-exercise volume comparison
export function calculateExerciseVolumes(
  session: TrainingSession
): Record<string, number> {
  const volumes: Record<string, number> = {};
  Object.entries(session.exerciseResults).forEach(([exerciseId, sets]) => {
    let volume = 0;
    sets.forEach((set) => {
      if (!set.isWarmup && set.completed) {
        volume += set.weight * set.reps;
      }
    });
    volumes[exerciseId] = volume;
  });
  return volumes;
}

