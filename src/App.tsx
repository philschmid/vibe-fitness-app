import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import AuthView from "./components/AuthView";
import {
  AppView,
  Workout,
  TrainingSession,
  DailyLog,
  ActiveSessionData,
} from "./types";
import { db } from "./services/db";
import { storage } from "./services/storage"; // Keep for active session
import { migrateLocalData } from "./services/migration";
import {
  INITIAL_WORKOUTS,
  INITIAL_TRAININGS,
  INITIAL_DAILY_LOGS,
} from "./constants";
import BottomNav from "./components/BottomNav";
import Dashboard from "./components/Dashboard";
import DailyLogEntry from "./components/DailyLogEntry";
import TrainingSessionView from "./components/TrainingSessionView";
import StatsView from "./components/StatsView";
import WorkoutsView from "./components/WorkoutsView";
import EditWorkoutView from "./components/EditWorkoutView";
import HistoryView from "./components/HistoryView";
import HistoryDetailView from "./components/HistoryDetailView";
import SettingsView from "./components/SettingsView";
import { useAppVersion } from "./hooks/useAppVersion";
import UpdatePopup from "./components/UpdatePopup";

const App: React.FC = () => {
  const { session, loading, signOut } = useAuth();
  const { updateAvailable, forceUpdate, releaseNotes, latestVersion } =
    useAppVersion();
  const [view, setView] = useState<AppView>("dashboard");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [activeSessionData, setActiveSessionData] =
    useState<ActiveSessionData | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<TrainingSession | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [w, s, l] = await Promise.all([
        db.getWorkouts(),
        db.getTrainings(),
        db.getDailyLogs(),
      ]);
      setWorkouts(w);
      setSessions(s);
      setDailyLogs(l);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }, []);

  // Load data on mount or when session changes
  useEffect(() => {
    if (session) {
      refreshData();
    }
  }, [session, refreshData]);

  // Check for active session (local storage)
  useEffect(() => {
    const savedActiveSession = storage.getActiveSession();
    if (savedActiveSession) {
      // We need workouts loaded to find the active workout
      // But workouts load async.
      // We can rely on 'workouts' state update.
      if (workouts.length > 0) {
        const workout = workouts.find(
          (w) => w.id === savedActiveSession.workoutId
        );
        if (workout) {
          setActiveWorkout(workout);
          setActiveSessionData(savedActiveSession);
        }
      }
    }
  }, [workouts]);

  const handleSeedData = async () => {
    if (confirm("Load dummy data? This will overwrite your current data.")) {
      const idMap = new Map<string, string>();
      const isValidUUID = (id: string) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id
        );

      // 1. Workouts
      for (const w of INITIAL_WORKOUTS) {
        const workout = { ...w };
        if (!isValidUUID(workout.id)) {
          const newId = crypto.randomUUID();
          idMap.set(workout.id, newId);
          workout.id = newId;
        }

        workout.exercises = workout.exercises.map((ex) => {
          if (!isValidUUID(ex.id)) {
            return { ...ex, id: crypto.randomUUID() };
          }
          return ex;
        });

        await db.saveWorkout(workout);
      }

      // 2. Trainings
      for (const s of INITIAL_TRAININGS) {
        const session = { ...s };
        if (!isValidUUID(session.id)) {
          session.id = crypto.randomUUID();
        }
        if (idMap.has(session.workoutId)) {
          session.workoutId = idMap.get(session.workoutId)!;
        }
        await db.saveTraining(session);
      }

      // 3. Logs
      for (const l of INITIAL_DAILY_LOGS) {
        const log = { ...l };
        if (!isValidUUID(log.id)) {
          log.id = crypto.randomUUID();
        }
        await db.saveDailyLog(log);
      }
      await refreshData();
    }
  };

  const handleLoadWorkouts = async () => {
    if (
      confirm(
        "Load default workout routines? This will add them to your collection."
      )
    ) {
      try {
        console.log("Starting to load default workouts...");

        // Remove hardcoded numeric IDs to let DB generate UUIDs
        // Or generate valid UUIDs client-side if we want to preserve relationships
        for (const w of INITIAL_WORKOUTS) {
          console.log(`Saving workout: ${w.name}`);

          // Create a copy with a new UUID if the ID is invalid (like "1")
          // Note: This logic depends on whether we want to "reset" the ID or use a specific one.
          // Since "1" is invalid for UUID, we MUST generate a new one.
          // However, db.saveWorkout expects a Workout object which has an ID.

          // Let's generate a random UUID for the workout and its exercises
          const workoutId = crypto.randomUUID();
          const exercisesWithIds = w.exercises.map((ex) => ({
            ...ex,
            id: crypto.randomUUID(), // New ID for exercise
          }));

          const workoutToSave: Workout = {
            ...w,
            id: workoutId,
            exercises: exercisesWithIds,
          };

          await db.saveWorkout(workoutToSave);
        }
        console.log("All workouts saved. Refreshing data...");
        await refreshData();
        alert("Default workouts loaded successfully!");
      } catch (error) {
        console.error("Failed to load workouts:", error);
        alert("Failed to load workouts. Check console for details.");
      }
    }
  };

  const handleMigrateData = async () => {
    if (confirm("Migrate local data to Supabase?")) {
      await migrateLocalData();
      await refreshData();
    }
  };

  const handleStartSession = (workout: Workout) => {
    setActiveWorkout(workout);
    // If resuming, activeSessionData is already set. If new, clear it.
    if (activeSessionData && activeSessionData.workoutId !== workout.id) {
      setActiveSessionData(null);
    }
    setView("session");
  };

  const handleSessionUpdate = useCallback((data: ActiveSessionData) => {
    setActiveSessionData(data);
    storage.saveActiveSession(data);
  }, []);

  const handleFinishSession = async (session: TrainingSession) => {
    // Optimistic update
    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);

    try {
      await db.saveTraining(session);
    } catch (error) {
      console.error("Failed to save session:", error);
      alert("Failed to save session. Please try again.");
      return; // Don't clear state if failed
    }

    // Clear active session
    setActiveWorkout(null);
    setActiveSessionData(null);
    storage.clearActiveSession();

    setView("dashboard");
    refreshData(); // Sync with DB
  };

  const handleAbortSession = () => {
    if (confirm("Delete current session? Progress will be lost.")) {
      setActiveWorkout(null);
      setActiveSessionData(null);
      storage.clearActiveSession();
      setView("dashboard");
    }
  };

  const handleSaveDailyLog = async (log: DailyLog) => {
    // Optimistic update
    const index = dailyLogs.findIndex((l) => l.date === log.date);
    let updatedLogs;
    if (index >= 0) {
      updatedLogs = [...dailyLogs];
      updatedLogs[index] = log;
    } else {
      updatedLogs = [...dailyLogs, log];
    }
    setDailyLogs(updatedLogs);

    try {
      await db.saveDailyLog(log);
    } catch (error) {
      console.error("Failed to save log:", error);
    }
    refreshData();
  };

  const handleSaveWorkout = async (workout: Workout) => {
    // Optimistic update
    const index = workouts.findIndex((w) => w.id === workout.id);
    let updatedWorkouts;
    if (index >= 0) {
      updatedWorkouts = [...workouts];
      updatedWorkouts[index] = workout;
    } else {
      updatedWorkouts = [...workouts, workout];
    }
    setWorkouts(updatedWorkouts);
    setView("workouts");

    try {
      await db.saveWorkout(workout);
    } catch (error) {
      console.error("Failed to save workout:", error);
    }
    refreshData();
  };

  const handleDeleteWorkout = async (id: string) => {
    if (confirm("Are you sure you want to delete this workout?")) {
      // Optimistic update
      const updatedWorkouts = workouts.filter((w) => w.id !== id);
      setWorkouts(updatedWorkouts);

      try {
        await db.deleteWorkout(id);
      } catch (error) {
        console.error("Failed to delete workout:", error);
      }
      refreshData();
    }
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setView("edit-workout");
  };

  const handleSelectSession = (session: TrainingSession) => {
    setSelectedSession(session);
    setView("history-detail");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return (
          <Dashboard
            workouts={workouts}
            sessions={sessions}
            dailyLogs={dailyLogs}
            activeWorkout={activeWorkout}
            onStartSession={handleStartSession}
            onViewChange={setView}
          />
        );
      case "daily":
        return (
          <DailyLogEntry
            logs={dailyLogs}
            onSave={handleSaveDailyLog}
            onClose={() => setView("dashboard")}
          />
        );
      case "session":
        if (!activeWorkout) {
          setView("dashboard");
          return null;
        }
        const lastSes =
          sessions.filter((s) => s.workoutId === activeWorkout.id).pop() ||
          null;
        return (
          <TrainingSessionView
            workout={activeWorkout}
            lastSession={lastSes}
            initialData={activeSessionData}
            onComplete={handleFinishSession}
            onUpdate={handleSessionUpdate}
            onCancel={() => setView("dashboard")}
            onAbort={handleAbortSession}
          />
        );
      case "workouts":
        return (
          <WorkoutsView
            workouts={workouts}
            activeWorkout={activeWorkout}
            onStart={handleStartSession}
            onEdit={handleEditWorkout}
            onDelete={handleDeleteWorkout}
            onCreate={() => {
              setEditingWorkout(null);
              setView("edit-workout");
            }}
          />
        );
      case "edit-workout":
        return (
          <EditWorkoutView
            workout={editingWorkout}
            onSave={handleSaveWorkout}
            onCancel={() => setView("workouts")}
          />
        );
      case "history":
        return (
          <HistoryView
            sessions={sessions}
            workouts={workouts}
            onSelectSession={handleSelectSession}
          />
        );
      case "history-detail":
        if (!selectedSession) {
          setView("history");
          return null;
        }
        return (
          <HistoryDetailView
            session={selectedSession}
            workout={workouts.find((w) => w.id === selectedSession.workoutId)}
            onBack={() => setView("history")}
          />
        );
      case "stats":
        return (
          <StatsView
            sessions={sessions}
            dailyLogs={dailyLogs}
            workouts={workouts}
          />
        );
      case "settings":
        return (
          <SettingsView
            onSeedData={handleSeedData}
            onLoadWorkouts={handleLoadWorkouts}
            onMigrateData={handleMigrateData}
            onSignOut={signOut}
          />
        );
      default:
        return <div className="p-4 text-center">View coming soon...</div>;
    }
  };

  return (
    <div className="max-w-md mx-auto h-dvh bg-black flex flex-col relative overflow-hidden">
      {updateAvailable && latestVersion && (
        <UpdatePopup
          latestVersion={latestVersion}
          forceUpdate={forceUpdate}
          releaseNotes={releaseNotes}
          onUpdate={() => window.location.reload()}
        />
      )}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {renderContent()}
      </div>
      {view !== "session" &&
        view !== "edit-workout" &&
        view !== "daily" &&
        view !== "history-detail" && (
          <BottomNav currentView={view} onViewChange={setView} />
        )}
    </div>
  );
};

export default App;
