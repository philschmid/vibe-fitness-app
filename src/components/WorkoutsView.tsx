
import React from 'react';
import { Workout } from '../types';

interface WorkoutsViewProps {
  workouts: Workout[];
  activeWorkout?: Workout | null;
  onStart: (workout: Workout) => void;
  onEdit: (workout: Workout) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const WorkoutsView: React.FC<WorkoutsViewProps> = ({ workouts, activeWorkout, onStart, onEdit, onDelete, onCreate }) => {
  return (
    <div className="p-6 space-y-8 pb-24 animate-in">
      <header className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Library</h1>
          <p className="text-[#8E8E93] text-sm font-medium">Your custom routines.</p>
        </div>
        <button 
          onClick={onCreate}
          className="w-12 h-12 rounded-full bg-[#FF9500] flex items-center justify-center text-black shadow-lg shadow-orange-950/20 active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-plus text-lg"></i>
        </button>
      </header>

      <div className="space-y-4">
        {workouts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-[#1C1C1E] rounded-full flex items-center justify-center mx-auto text-[#3A3A3C]">
              <i className="fa-solid fa-layer-group text-2xl"></i>
            </div>
            <p className="text-[#8E8E93] text-sm">No workout templates yet.<br/>Create one to get started.</p>
          </div>
        ) : (
          workouts.map(workout => (
            <div 
              key={workout.id} 
              className="bg-[#1C1C1E] rounded-3xl border border-white/5 overflow-hidden active:scale-[0.99] transition-transform"
            >
              <div className="p-4 flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold tracking-tight">{workout.name}</h3>
                  <p className="text-[#8E8E93] text-[10px] font-black uppercase tracking-widest">
                    {workout.exercises.length} Exercises
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onEdit(workout)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#8E8E93] active:bg-white/10"
                  >
                    <i className="fa-solid fa-pen text-[10px]"></i>
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm('Delete this workout template?')) onDelete(workout.id);
                    }}
                    className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 active:bg-red-500/20"
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
                    className="w-full bg-white text-black font-black py-3 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center space-x-2 active:bg-[#FF9500] active:scale-95 transition-all"
                  >
                    <i className="fa-solid fa-play text-[10px]"></i>
                    <span>Start Routine</span>
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
