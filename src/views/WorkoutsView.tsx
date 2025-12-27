
import React, { useState } from 'react';
import { Workout } from '../types';

interface WorkoutsViewProps {
  workouts: Workout[];
  activeWorkout?: Workout | null;
  onStart: (workout: Workout) => void;
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onCreate: () => void;
}

const WorkoutsView: React.FC<WorkoutsViewProps> = ({ workouts, activeWorkout, onStart, onEdit, onDelete, onToggleActive, onCreate }) => {
  const [showInactive, setShowInactive] = useState(false);

  const filteredWorkouts = workouts.filter(w => w.isActive === !showInactive);

  return (
    <div className="p-6 space-y-8 pb-24 animate-in">
      <header className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Library</h1>
          <div className="flex items-center space-x-2">
            <p className="text-[#8E8E93] text-sm font-medium">Your custom routines.</p>
            <button 
              onClick={() => setShowInactive(!showInactive)}
              className="text-xs font-bold px-2 py-1 rounded bg-white/10 text-[#8E8E93] hover:text-white transition-colors"
            >
              {showInactive ? 'Show Active' : 'Show Inactive'}
            </button>
          </div>
        </div>
        <button 
          onClick={onCreate}
          className="w-12 h-12 rounded-full bg-[#FF9500] flex items-center justify-center text-black shadow-lg shadow-orange-950/20 active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-plus text-lg"></i>
        </button>
      </header>

      <div className="space-y-4">
        {filteredWorkouts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto text-[#3A3A3C]">
              <i className={`fa-solid ${showInactive ? 'fa-box-archive' : 'fa-layer-group'} text-2xl`}></i>
            </div>
            <p className="text-[#8E8E93] text-sm">
              {showInactive 
                ? 'No inactive routines.' 
                : <>No active routines.<br/>Create one to get started.</>
              }
            </p>
          </div>
        ) : (
          filteredWorkouts.map(workout => (
            <div 
              key={workout.id} 
              className={`bg-[#1C1C1E] rounded-3xl border ${showInactive ? 'border-dashed border-white/10' : 'border-white/5'} overflow-hidden active:scale-[0.99] transition-transform`}
            >
              <div className="p-4 flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold tracking-tight opacity-90">{workout.name}</h3>
                  <p className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest">
                    {workout.exercises.length} Exercises
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onToggleActive(workout.id, !workout.isActive)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] ${
                      workout.isActive 
                        ? 'bg-yellow-500/10 text-yellow-500 active:bg-yellow-500/20' 
                        : 'bg-green-500/10 text-green-500 active:bg-green-500/20'
                    }`}
                    title={workout.isActive ? "Deactivate" : "Activate"}
                  >
                    <i className={`fa-solid ${workout.isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                  <button 
                    onClick={() => !activeWorkout && onEdit(workout)}
                    disabled={!!activeWorkout}
                    className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93] ${
                      activeWorkout ? 'opacity-30 cursor-not-allowed' : 'active:bg-white/10'
                    }`}
                  >
                    <i className="fa-solid fa-pen text-[10px]"></i>
                  </button>
                  <button 
                    onClick={() => {
                      if(!activeWorkout && confirm('Delete this workout template?')) onDelete(workout.id);
                    }}
                    disabled={!!activeWorkout}
                    className={`w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 ${
                      activeWorkout ? 'opacity-30 cursor-not-allowed' : 'active:bg-red-500/20'
                    }`}
                  >
                    <i className="fa-solid fa-trash text-[10px]"></i>
                  </button>
                </div>
              </div>
              
              <div className="px-4 pb-4 pt-0">
                {activeWorkout ? (
                  <button 
                    disabled
                    className="w-full bg-[#1C1C1E] text-[#8E8E93] font-black py-3 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center space-x-2 cursor-not-allowed border border-white/5"
                  >
                    <i className="fa-solid fa-lock text-[10px]"></i>
                    <span>Session in Progress</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => onStart(workout)}
                    className={`w-full font-black py-3 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition-all ${
                      workout.isActive 
                        ? 'bg-white text-black active:bg-[#FF9500] active:scale-95' 
                        : 'bg-white/5 text-[#8E8E93] hover:bg-white/10'
                    }`}
                  >
                    <i className="fa-solid fa-play text-[10px]"></i>
                    <span>{workout.isActive ? 'Start Routine' : 'Start (Inactive)'}</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutsView;
