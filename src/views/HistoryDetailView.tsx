import React, { useState, useEffect } from "react";
import { TrainingSession, Workout } from "../types";

interface HistoryDetailViewProps {
  session: TrainingSession;
  workout: Workout | undefined;
  onBack: () => void;
  onDelete: (id: string) => void;
  onUpdate: (session: TrainingSession) => void;
}

const HistoryDetailView: React.FC<HistoryDetailViewProps> = ({
  session,
  workout,
  onBack,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSession, setEditedSession] = useState<TrainingSession>(session);

  useEffect(() => {
    setEditedSession(session);
  }, [session]);

  const displayWorkout = session.workoutSnapshot || workout;

  const date = new Date(session.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSave = () => {
    onUpdate(editedSession);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSession(session);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(session.id);
  };

  const handleSetChange = (
    exerciseId: string,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    // Allow empty string for typing, but convert to number on save or assume 0?
    // Better to keep as number in state if type is number.
    // But input value is string.
    // Let's use string in input and parse on change.
    const val = parseFloat(value);

    const newResults = { ...editedSession.exerciseResults };
    if (!newResults[exerciseId]) return;

    const newSets = [...newResults[exerciseId]];
    newSets[setIndex] = {
      ...newSets[setIndex],
      [field]: isNaN(val) ? 0 : val,
    };
    newResults[exerciseId] = newSets;

    setEditedSession({
      ...editedSession,
      exerciseResults: newResults,
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col animate-in pb-20">
      <header className="px-6 pt-12 pb-6 border-b border-white/5 flex justify-between items-start">
        <div>
          <button
            onClick={onBack}
            className="text-[#8E8E93] mb-4 active:text-white transition-colors"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i> Back to History
          </button>
          <h1 className="text-3xl font-black tracking-tighter">
            {displayWorkout?.name || "Session Summary"}
          </h1>
          <p className="text-[#FF9500] text-xs font-black uppercase tracking-widest mt-1">
            {formattedDate}
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#1C1C1E] w-10 h-10 rounded-full flex items-center justify-center text-[#FF9500]"
          >
            <i className="fa-solid fa-pencil"></i>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="bg-[#1C1C1E] w-10 h-10 rounded-full flex items-center justify-center text-[#8E8E93]"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <button
              onClick={handleSave}
              className="bg-[#FF9500] w-10 h-10 rounded-full flex items-center justify-center text-black"
            >
              <i className="fa-solid fa-check"></i>
            </button>
          </div>
        )}
      </header>

      <main className="p-6 space-y-8 flex-1">
        {displayWorkout?.exercises.map((ex) => {
          // Use editedSession here
          const results = editedSession.exerciseResults[ex.id];
          if (!results) return null;

          return (
            <section key={ex.id} className="space-y-3">
              <h3 className="text-lg font-bold tracking-tight px-1">
                {ex.name}
              </h3>
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
                      <tr
                        key={idx}
                        className={
                          set.isWarmup ? "text-[#FF9500]/70 italic" : ""
                        }
                      >
                        <td className="px-4 py-3 text-xs font-mono">
                          {set.isWarmup
                            ? "W"
                            : results.filter((s) => !s.isWarmup).indexOf(set) +
                              1}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono font-bold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={set.weight}
                              onChange={(e) =>
                                handleSetChange(
                                  ex.id,
                                  idx,
                                  "weight",
                                  e.target.value
                                )
                              }
                              className="w-16 bg-black/50 border border-white/10 rounded px-1 py-0.5 text-center outline-none focus:border-[#FF9500]"
                            />
                          ) : (
                            `${set.weight}kg`
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono font-bold">
                          {isEditing ? (
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) =>
                                handleSetChange(
                                  ex.id,
                                  idx,
                                  "reps",
                                  e.target.value
                                )
                              }
                              className="w-12 bg-black/50 border border-white/10 rounded px-1 py-0.5 text-center outline-none focus:border-[#FF9500]"
                            />
                          ) : (
                            set.reps
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </main>

      {isEditing && (
        <div className="px-6 pb-safe">
          <button
            onClick={handleDelete}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold py-4 rounded-2xl text-sm uppercase tracking-widest mb-4"
          >
            Delete Session
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryDetailView;
