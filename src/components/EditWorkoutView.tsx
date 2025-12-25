
import React, { useState } from 'react';
import { Workout, Exercise } from '../types';

interface EditWorkoutViewProps {
  workout: Workout | null;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

const EditWorkoutView: React.FC<EditWorkoutViewProps> = ({ workout, onSave, onCancel }) => {
  const [name, setName] = useState(workout?.name || '');
  const [exercises, setExercises] = useState<Exercise[]>(workout?.exercises || [
    { id: crypto.randomUUID(), name: '', sets: 3, hasWarmup: false }
  ]);

  const addExercise = () => {
    setExercises([...exercises, { 
      id: crypto.randomUUID(), 
      name: '', 
      sets: 3, 
      hasWarmup: false 
    }]);
  };

  const removeExercise = (idx: number) => {
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const updateExercise = (idx: number, updates: Partial<Exercise>) => {
    const newExs = [...exercises];
    newExs[idx] = { ...newExs[idx], ...updates };
    setExercises(newExs);
  };

  const handleSave = () => {
    if (!name.trim()) return alert('Please enter a workout name');
    if (exercises.some(ex => !ex.name.trim())) return alert('All exercises must have a name');
    
    onSave({
      id: workout?.id || crypto.randomUUID(),
      name,
      exercises
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col animate-in">
      <header className="px-6 pt-12 pb-4 flex justify-between items-center">
        <button onClick={onCancel} className="text-[#8E8E93] font-bold text-sm">Cancel</button>
        <h1 className="text-lg font-black tracking-tight uppercase">Routine Editor</h1>
        <button onClick={handleSave} className="text-[#FF9500] font-black text-sm uppercase">Save</button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 space-y-8 pb-32 hide-scrollbar">
        <section className="space-y-4 pt-4">
          <label className="text-[10px] font-black uppercase text-[#8E8E93] tracking-[0.3em] block px-1">Routine Name</label>
          <input 
            type="text"
            placeholder="e.g. Upper Body Focus"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#1C1C1E] rounded-2xl p-5 text-xl font-bold outline-none border border-white/5 focus:border-[#FF9500]/50 transition-colors"
          />
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <label className="text-[10px] font-black uppercase text-[#8E8E93] tracking-[0.3em] block">Exercises</label>
            <span className="text-[#3A3A3C] text-[10px] font-bold">{exercises.length} Total</span>
          </div>
          
          <div className="space-y-4">
            {exercises.map((ex, idx) => (
              <div key={ex.id} className="bg-[#1C1C1E] rounded-3xl p-5 border border-white/5 space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[#FF9500] font-mono text-xs font-bold border border-white/5">
                    {idx + 1}
                  </span>
                  <input 
                    type="text"
                    placeholder="Exercise Name"
                    value={ex.name}
                    onChange={(e) => updateExercise(idx, { name: e.target.value })}
                    className="flex-1 bg-transparent text-lg font-bold outline-none placeholder:text-[#3A3A3C]"
                  />
                  <button 
                    onClick={() => removeExercise(idx)}
                    className="text-red-500/50 active:text-red-500 px-2"
                  >
                    <i className="fa-solid fa-minus-circle"></i>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-tighter">Working Sets</p>
                    <div className="flex items-center bg-black rounded-xl border border-white/5 p-1">
                       <button 
                        onClick={() => updateExercise(idx, { sets: Math.max(1, ex.sets - 1) })}
                        className="w-8 h-8 flex items-center justify-center text-sm"
                       >
                        <i className="fa-solid fa-minus"></i>
                       </button>
                       <span className="flex-1 text-center font-mono font-bold">{ex.sets}</span>
                       <button 
                        onClick={() => updateExercise(idx, { sets: ex.sets + 1 })}
                        className="w-8 h-8 flex items-center justify-center text-sm"
                       >
                        <i className="fa-solid fa-plus"></i>
                       </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-tighter">Warmup Set</p>
                    <button 
                      onClick={() => updateExercise(idx, { hasWarmup: !ex.hasWarmup })}
                      className={`w-full h-10 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center space-x-2 border ${
                        ex.hasWarmup ? 'bg-orange-500/10 border-orange-500/30 text-[#FF9500]' : 'bg-black border-white/5 text-[#3A3A3C]'
                      }`}
                    >
                      <i className={`fa-solid ${ex.hasWarmup ? 'fa-fire-flame-curved' : 'fa-circle'}`}></i>
                      <span>{ex.hasWarmup ? 'Include' : 'Skip'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={addExercise}
              className="w-full bg-[#1C1C1E] border border-dashed border-[#3A3A3C] py-5 rounded-3xl text-[#8E8E93] font-bold text-sm uppercase tracking-widest active:bg-white/5 transition-colors"
            >
              Add Exercise
            </button>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 glass pb-safe">
        <button
          onClick={handleSave}
          className="w-full bg-white text-black font-black py-5 rounded-3xl text-lg uppercase tracking-widest active:scale-95 transition-all shadow-xl"
        >
          Finalize Routine
        </button>
      </footer>
    </div>
  );
};

export default EditWorkoutView;
