
import React from 'react';
import { TrainingSession, Workout } from '../types';

interface HistoryViewProps {
  sessions: TrainingSession[];
  workouts: Workout[];
  onSelectSession: (session: TrainingSession) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ sessions, workouts, onSelectSession }) => {
  // Sort sessions by date descending
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getWorkoutName = (workoutId: string) => {
    return workouts.find(w => w.id === workoutId)?.name || 'Deleted Workout';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div className="p-6 space-y-6 pb-24 animate-in">
      <header className="pt-4">
        <h1 className="text-3xl font-black tracking-tighter">History</h1>
        <p className="text-[#8E8E93] text-xs font-medium uppercase tracking-widest">Past Achievements</p>
      </header>

      <div className="space-y-3">
        {sortedSessions.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto text-[#3A3A3C]">
              <i className="fa-solid fa-calendar-xmark text-2xl"></i>
            </div>
            <p className="text-[#8E8E93] text-sm">No recorded sessions yet.</p>
          </div>
        ) : (
          sortedSessions.map((session) => (
            <button 
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="w-full text-left bg-[#1C1C1E] rounded-2xl p-3 border border-white/5 flex items-center space-x-3 active:scale-[0.98] transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-black flex flex-col items-center justify-center text-[#FF9500] border border-white/5 group-active:border-[#FF9500]/50">
                <span className="text-[8px] font-black uppercase leading-none opacity-60">
                  {new Date(session.date).toLocaleString('default', { month: 'short' })}
                </span>
                <span className="text-base font-black leading-none">
                  {new Date(session.date).getDate()}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm leading-tight truncate">
                  {getWorkoutName(session.workoutId)}
                </h3>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[9px] text-[#8E8E93] font-bold uppercase tracking-tighter">
                    {Object.keys(session.exerciseResults).length} Ex
                  </span>
                  <span className="text-white/10">•</span>
                  <span className="text-[9px] text-[#8E8E93] font-bold uppercase tracking-tighter">
                    {formatDate(session.date)}
                  </span>
                </div>
              </div>
              
              <i className="fa-solid fa-chevron-right text-[#3A3A3C] text-[10px] pr-1"></i>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;
