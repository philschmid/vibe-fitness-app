
import React, { useState, useEffect } from 'react';
import { AppView, Workout, TrainingSession, DailyLog, Exercise, ActiveSessionData } from './types';
import { storage } from './services/storage';
import { INITIAL_WORKOUTS, INITIAL_TRAININGS, INITIAL_DAILY_LOGS } from './constants';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import DailyLogEntry from './components/DailyLogEntry';
import TrainingSessionView from './components/TrainingSessionView';
import StatsView from './components/StatsView';
import WorkoutsView from './components/WorkoutsView';
import EditWorkoutView from './components/EditWorkoutView';
import HistoryView from './components/HistoryView';
import HistoryDetailView from './components/HistoryDetailView';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [activeSessionData, setActiveSessionData] = useState<ActiveSessionData | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);

  // Load data on mount
  useEffect(() => {
    setWorkouts(storage.getWorkouts());
    setSessions(storage.getTrainings());
    setDailyLogs(storage.getDailyLogs());

    // Check for active session
    const savedActiveSession = storage.getActiveSession();
    if (savedActiveSession) {
      const workout = storage.getWorkouts().find(w => w.id === savedActiveSession.workoutId);
      if (workout) {
        setActiveWorkout(workout);
        setActiveSessionData(savedActiveSession);
        // Don't force view change immediately if we want to show it on dashboard,
        // but user requested "if a training is not finished it should be shown on the home screen"
        // So we stay on dashboard but show the "Resume" option.
      }
    }
  }, []);

  const handleSeedData = () => {
    if (confirm('Load dummy data? This will overwrite your current data.')) {
      storage.saveWorkouts(INITIAL_WORKOUTS);
      storage.saveTrainings(INITIAL_TRAININGS);
      storage.saveDailyLogs(INITIAL_DAILY_LOGS);
      
      setWorkouts(INITIAL_WORKOUTS);
      setSessions(INITIAL_TRAININGS);
      setDailyLogs(INITIAL_DAILY_LOGS);
    }
  };

  const handleStartSession = (workout: Workout) => {
    setActiveWorkout(workout);
    // If resuming, activeSessionData is already set. If new, clear it.
    if (activeSessionData && activeSessionData.workoutId !== workout.id) {
       setActiveSessionData(null);
    }
    setView('session');
  };

  const handleSessionUpdate = (data: ActiveSessionData) => {
    setActiveSessionData(data);
    storage.saveActiveSession(data);
  };

  const handleFinishSession = (session: TrainingSession) => {
    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);
    storage.saveTrainings(updatedSessions);
    
    // Clear active session
    setActiveWorkout(null);
    setActiveSessionData(null);
    storage.clearActiveSession();
    
    setView('dashboard');
  };

  const handleAbortSession = () => {
    if (confirm('Delete current session? Progress will be lost.')) {
        setActiveWorkout(null);
        setActiveSessionData(null);
        storage.clearActiveSession();
        setView('dashboard');
    }
  };

  const handleSaveDailyLog = (log: DailyLog) => {
    const index = dailyLogs.findIndex(l => l.date === log.date);
    let updatedLogs;
    if (index >= 0) {
      updatedLogs = [...dailyLogs];
      updatedLogs[index] = log;
    } else {
      updatedLogs = [...dailyLogs, log];
    }
    setDailyLogs(updatedLogs);
    storage.saveDailyLogs(updatedLogs);
  };

  const handleSaveWorkout = (workout: Workout) => {
    const index = workouts.findIndex(w => w.id === workout.id);
    let updatedWorkouts;
    if (index >= 0) {
      updatedWorkouts = [...workouts];
      updatedWorkouts[index] = workout;
    } else {
      updatedWorkouts = [...workouts, workout];
    }
    setWorkouts(updatedWorkouts);
    storage.saveWorkouts(updatedWorkouts);
    setView('workouts');
  };

  const handleDeleteWorkout = (id: string) => {
    const updatedWorkouts = workouts.filter(w => w.id !== id);
    setWorkouts(updatedWorkouts);
    storage.saveWorkouts(updatedWorkouts);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setView('edit-workout');
  };

  const handleSelectSession = (session: TrainingSession) => {
    setSelectedSession(session);
    setView('history-detail');
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            workouts={workouts} 
            sessions={sessions} 
            dailyLogs={dailyLogs}
            activeWorkout={activeWorkout}
            onStartSession={handleStartSession}
            onViewChange={setView}
            onSeedData={handleSeedData}
          />
        );
      case 'daily':
        return (
          <DailyLogEntry 
            logs={dailyLogs} 
            onSave={handleSaveDailyLog} 
            onClose={() => setView('dashboard')}
          />
        );
      case 'session':
        if (!activeWorkout) {
          setView('dashboard');
          return null;
        }
        const lastSes = sessions.filter(s => s.workoutId === activeWorkout.id).pop() || null;
        return (
          <TrainingSessionView 
            workout={activeWorkout} 
            lastSession={lastSes} 
            initialData={activeSessionData}
            onComplete={handleFinishSession}
            onUpdate={handleSessionUpdate}
            onCancel={() => setView('dashboard')}
            onAbort={handleAbortSession}
          />
        );
      case 'workouts':
        return (
          <WorkoutsView 
            workouts={workouts}
            activeWorkout={activeWorkout}
            onStart={handleStartSession}
            onEdit={handleEditWorkout}
            onDelete={handleDeleteWorkout}
            onCreate={() => {
              setEditingWorkout(null);
              setView('edit-workout');
            }}
          />
        );
      case 'edit-workout':
        return (
          <EditWorkoutView 
            workout={editingWorkout}
            onSave={handleSaveWorkout}
            onCancel={() => setView('workouts')}
          />
        );
      case 'history':
        return (
          <HistoryView 
            sessions={sessions}
            workouts={workouts}
            onSelectSession={handleSelectSession}
          />
        );
      case 'history-detail':
        if (!selectedSession) {
          setView('history');
          return null;
        }
        return (
          <HistoryDetailView 
            session={selectedSession}
            workout={workouts.find(w => w.id === selectedSession.workoutId)}
            onBack={() => setView('history')}
          />
        );
      case 'stats':
        return <StatsView sessions={sessions} dailyLogs={dailyLogs} workouts={workouts} />;
      default:
        return <div className="p-4 text-center">View coming soon...</div>;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black flex flex-col relative overflow-x-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {renderContent()}
      </div>
      {view !== 'session' && view !== 'edit-workout' && view !== 'daily' && view !== 'history-detail' && (
        <BottomNav currentView={view} onViewChange={setView} />
      )}
    </div>
  );
};

export default App;
