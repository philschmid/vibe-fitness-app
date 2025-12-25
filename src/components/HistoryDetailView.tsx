
import React from 'react';
import { TrainingSession, Workout } from '../types';

interface HistoryDetailViewProps {
  session: TrainingSession;
  workout: Workout | undefined;
  onBack: () => void;
}

const HistoryDetailView: React.FC<HistoryDetailViewProps> = ({ session, workout, onBack }) => {
  const date = new Date(session.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-black flex flex-col animate-in pb-20">
      <header className="px-6 pt-12 pb-6 border-b border-white/5">
        <button onClick={onBack} className="text-[#8E8E93] mb-4 active:text-white transition-colors">
          <i className="fa-solid fa-arrow-left mr-2"></i> Back to History
        </button>
        <h1 className="text-3xl font-black tracking-tighter">{workout?.name || 'Session Summary'}</h1>
        <p className="text-[#FF9500] text-xs font-black uppercase tracking-widest mt-1">
          {formattedDate}
        </p>
      </header>

      <main className="p-6 space-y-8">
        {workout?.exercises.map((ex) => {
          const results = session.exerciseResults[ex.id];
          if (!results) return null;

          return (
            <section key={ex.id} className="space-y-3">
              <h3 className="text-lg font-bold tracking-tight px-1">{ex.name}</h3>
              <div className="bg-[#1C1C1E] rounded-3xl overflow-hidden border border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-black/20">
                    <tr className="text-[9px] font-black uppercase text-[#8E8E93] tracking-widest">
                      <th className="px-4 py-2">Set</th>
                      <th className="px-4 py-2">Weight</th>
                      <th className="px-4 py-2">Reps</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((set, idx) => (
                      <tr key={idx} className={set.isWarmup ? 'text-[#FF9500]/70 italic' : ''}>
                        <td className="px-4 py-3 text-xs font-mono">
                          {set.isWarmup ? 'W' : (results.filter(s => !s.isWarmup).indexOf(set) + 1)}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono font-bold">{set.weight}kg</td>
                        <td className="px-4 py-3 text-sm font-mono font-bold">{set.reps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default HistoryDetailView;
