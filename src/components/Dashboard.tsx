
import React from 'react';
import { Workout, TrainingSession, DailyLog, AppView } from '../types';

interface DashboardProps {
  workouts: Workout[];
  sessions: TrainingSession[];
  dailyLogs: DailyLog[];
  activeWorkout?: Workout | null;
  onStartSession: (workout: Workout) => void;
  onViewChange: (view: AppView) => void;
  onSeedData: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ workouts, sessions, dailyLogs, activeWorkout, onStartSession, onViewChange, onSeedData }) => {
  const todayLog = dailyLogs.find(l => l.date === new Date().toISOString().split('T')[0]);
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const lastWorkout = lastSession ? workouts.find(w => w.id === lastSession.workoutId) : null;
  
  // Decide which workout to show as the "Quick Start" hero
  // Suggest the NEXT workout in the list after the last one performed
  let nextWorkout = workouts.length > 0 ? workouts[0] : null;
  
  if (lastWorkout) {
    const lastIndex = workouts.findIndex(w => w.id === lastWorkout.id);
    if (lastIndex >= 0) {
        const nextIndex = (lastIndex + 1) % workouts.length;
        nextWorkout = workouts[nextIndex];
    }
  }

  const heroWorkout = activeWorkout || nextWorkout;

  return (
    <div className="p-6 space-y-8 pb-24 animate-in">
      <header className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Activity</h1>
          <p className="text-[#8E8E93] text-sm font-medium">Ready for your session?</p>
        </div>
        {(sessions.length === 0 && dailyLogs.length === 0) && (
          <button 
            onClick={onSeedData}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/5 flex items-center justify-center active:scale-95 transition-transform animate-pulse"
          >
            <i className="fa-solid fa-bolt text-[#FF9500]"></i>
          </button>
        )}
      </header>

      {/* Hero Quick Start Button */}
      {heroWorkout && (
        <section className="space-y-3">
          <div className="flex justify-between items-end px-1">
            <h2 className="text-xs font-black uppercase text-[#8E8E93] tracking-widest">
              {activeWorkout ? 'Resume Workout' : 'Suggested for You'}
            </h2>
          </div>
          <button
            onClick={() => onStartSession(heroWorkout)}
            className={`w-full ${activeWorkout ? 'bg-[#32D74B] animate-pulse' : 'bg-[#FF9500]'} p-6 rounded-[2.5rem] flex flex-col items-start justify-between shadow-xl shadow-orange-950/30 active:scale-[0.97] transition-all relative overflow-hidden group`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-active:scale-125 transition-transform">
              <i className="fa-solid fa-dumbbell text-8xl text-black"></i>
            </div>
            <div className="relative z-10 space-y-1">
              <p className="text-black/60 text-[10px] font-black uppercase tracking-widest">
                {activeWorkout ? 'In Progress' : 'Up Next'}
              </p>
              <h3 className="text-black text-3xl font-black tracking-tighter leading-none">
                {heroWorkout.name}
              </h3>
            </div>
            <div className={`relative z-10 mt-6 flex items-center space-x-2 bg-black ${activeWorkout ? 'text-[#32D74B]' : 'text-[#FF9500]'} px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest`}>
              <i className={`fa-solid ${activeWorkout ? 'fa-arrow-right' : 'fa-play'} text-[8px]`}></i>
              <span>{activeWorkout ? 'Resume Session' : 'Start Workout'}</span>
            </div>
          </button>
        </section>
      )}

      {/* Daily Stats Section */}
      <section className="space-y-3">
        <h2 className="text-xs font-black uppercase text-[#8E8E93] tracking-widest px-1">Vital Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => onViewChange('daily')}
            className="bg-[#1C1C1E] rounded-3xl p-5 border border-white/5 active:scale-95 transition-all"
          >
            <p className="text-[#8E8E93] text-[10px] font-bold uppercase mb-1 tracking-widest">Weight</p>
            <p className="text-2xl font-mono font-bold">
              {todayLog ? todayLog.weight : '--'}<span className="text-sm font-sans ml-1 opacity-50 font-normal">kg</span>
            </p>
            <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-[#FF9500] w-2/3"></div>
            </div>
          </div>
          <div 
            onClick={() => onViewChange('daily')}
            className="bg-[#1C1C1E] rounded-3xl p-5 border border-white/5 active:scale-95 transition-all"
          >
            <p className="text-[#8E8E93] text-[10px] font-bold uppercase mb-1 tracking-widest">Energy</p>
            <p className="text-2xl font-mono font-bold">
              {todayLog ? todayLog.calories : '--'}<span className="text-sm font-sans ml-1 opacity-50 font-normal">cal</span>
            </p>
            <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-white/20 w-1/2"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Workouts List */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-xs font-black uppercase text-[#8E8E93] tracking-widest">All Routines</h2>
          <button 
            onClick={() => onViewChange('workouts')}
            className="text-[#FF9500] text-[10px] font-black uppercase tracking-widest"
          >
            See Library
          </button>
        </div>
        <div className="space-y-3">
          {workouts.filter(w => w.id !== heroWorkout?.id).slice(0, 3).map(workout => (
            <button
              key={workout.id}
              onClick={() => onStartSession(workout)}
              disabled={!!activeWorkout}
              className={`w-full text-left bg-[#1C1C1E] p-5 rounded-[2rem] border border-white/5 flex items-center justify-between transition-all group ${
                activeWorkout 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-[#FF9500] group-active:scale-90 transition-transform">
                  <i className="fa-solid fa-dumbbell text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">{workout.name}</h3>
                  <p className="text-[10px] text-[#8E8E93] font-black uppercase tracking-tighter">
                    {workout.exercises.length} Exercises
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <i className="fa-solid fa-play text-[#3A3A3C] text-[8px]"></i>
              </div>
            </button>
          ))}
          {workouts.length === 0 && (
            <div className="text-center py-10 bg-[#1C1C1E]/50 rounded-[2rem] border border-dashed border-white/10">
               <p className="text-sm text-[#8E8E93] mb-4">No routines found.</p>
               <button 
                 onClick={() => onViewChange('workouts')}
                 className="bg-white text-black px-6 py-2 rounded-full text-xs font-black uppercase"
               >
                 Create Routine
               </button>
            </div>
          )}
        </div>
      </section>

      {lastSession && (
        <section className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <i className="fa-solid fa-chart-line text-6xl"></i>
          </div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black uppercase text-[#8E8E93] tracking-widest">Recent Activity</h3>
            <span className="text-[10px] font-mono opacity-40">{new Date(lastSession.date).toLocaleDateString()}</span>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium leading-relaxed">
              You crushed <span className="text-[#FF9500] font-bold">{lastWorkout?.name}</span> last time. Your strength progress is trending up.
            </p>
            <button 
              onClick={() => onViewChange('stats')}
              className="text-white text-xs font-black uppercase tracking-widest flex items-center bg-white/5 px-4 py-2 rounded-full w-fit active:bg-white/10 transition-colors"
            >
              Analytics <i className="fa-solid fa-arrow-right ml-2 text-[10px]"></i>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
