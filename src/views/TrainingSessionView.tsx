import React, { useState, useEffect, useMemo } from "react";
import {
  Workout,
  TrainingSession,
  SetData,
  Exercise,
  ActiveSessionData,
} from "../types";
import { NumberInput } from "../components/ui/NumberInput";

interface TrainingSessionViewProps {
  workout: Workout;
  lastSession: TrainingSession | null;
  initialData?: ActiveSessionData | null;
  onComplete: (session: TrainingSession) => void;
  onUpdate: (data: ActiveSessionData) => void;
  onCancel: () => void;
  onAbort: () => void;
}

const TrainingSessionView: React.FC<TrainingSessionViewProps> = ({
  workout,
  lastSession,
  initialData,
  onComplete,
  onUpdate,
  onCancel,
  onAbort,
}) => {
  const [currentExIndex, setCurrentExIndex] = useState(
    initialData?.currentExIndex || 0
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(
    initialData?.currentStepIndex || 0
  );
  const [exerciseResults, setExerciseResults] = useState<
    Record<string, SetData[]>
  >(initialData?.exerciseResults || {});
  const [startTime] = useState<number>(initialData?.startTime || Date.now());
  const [showOverview, setShowOverview] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const currentExercise = workout.exercises[currentExIndex];

  const steps = useMemo(() => {
    const s = [];
    if (currentExercise.hasWarmup) s.push({ type: "warmup", label: "Warm up" });
    for (let i = 1; i <= currentExercise.sets; i++) {
      s.push({ type: "set", label: `Set ${i}`, setNum: i - 1 });
    }
    if (currentExercise.hasDropset) s.push({ type: "dropset", label: "Drop Set" });
    return s;
  }, [currentExercise]);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!exerciseResults[currentExercise.id]) {
      const prevSets = lastSession?.exerciseResults[currentExercise.id] || [];
      const initialSets: SetData[] = steps.map((step, idx) => {
        const prevSet = prevSets[idx] || prevSets[prevSets.length - 1];
        return {
          reps: prevSet?.reps || 10,
          weight: prevSet?.weight || 20,
          isWarmup: step.type === "warmup",
          isDropset: step.type === "dropset",
          completed: false,
        };
      });
      setExerciseResults((prev) => ({
        ...prev,
        [currentExercise.id]: initialSets,
      }));
    }
  }, [currentExercise.id, steps, lastSession, exerciseResults]);

  // Sync to storage on any change
  useEffect(() => {
    onUpdate({
      workoutId: workout.id,
      startTime,
      exerciseResults,
      currentExIndex,
      currentStepIndex,
    });
  }, [
    exerciseResults,
    currentExIndex,
    currentStepIndex,
    startTime,
    workout.id,
    onUpdate,
  ]);

  const currentSetData =
    exerciseResults[currentExercise.id]?.[currentStepIndex];

  const updateCurrentSet = (updates: Partial<SetData>) => {
    setExerciseResults((prev) => {
      const sets = [...(prev[currentExercise.id] || [])];
      sets[currentStepIndex] = { ...sets[currentStepIndex], ...updates };
      return { ...prev, [currentExercise.id]: sets };
    });
  };

  const handleNext = () => {
    if (isCompleting) return;

    updateCurrentSet({ completed: true });

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else if (currentExIndex < workout.exercises.length - 1) {
      setCurrentExIndex((prev) => prev + 1);
      setCurrentStepIndex(0);
    } else {
      setIsCompleting(true);
      const session: TrainingSession = {
        id: crypto.randomUUID(), // Ensure valid UUID
        workoutId: workout.id,
        date: new Date(startTime).toISOString(),
        startTime,
        endTime: Date.now(),
        exerciseResults,
        workoutSnapshot: workout,
      };
      onComplete(session);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else if (currentExIndex > 0) {
      const prevEx = workout.exercises[currentExIndex - 1];
      const prevExStepsCount = (prevEx.hasWarmup ? 1 : 0) + prevEx.sets;
      setCurrentExIndex((prev) => prev - 1);
      setCurrentStepIndex(prevExStepsCount - 1);
    }
  };

  const handleJumpToExercise = (index: number) => {
    setCurrentExIndex(index);
    // Find first incomplete set for this exercise
    const ex = workout.exercises[index];
    const results = exerciseResults[ex.id];

    if (results) {
      const firstIncomplete = results.findIndex((s) => !s.completed);
      if (firstIncomplete >= 0) {
        setCurrentStepIndex(firstIncomplete);
      } else {
        // If all done, go to last set
        setCurrentStepIndex(results.length - 1);
      }
    } else {
      setCurrentStepIndex(0);
    }
    setShowOverview(false);
  };

  if (!currentSetData)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-[#8E8E93] font-mono">
        LOADING...
      </div>
    );

  const previousPerformance =
    lastSession?.exerciseResults[currentExercise.id]?.[currentStepIndex];

  return (
    <div className="flex flex-col h-dvh bg-black text-white overflow-hidden relative">
      {/* Overview Modal */}
      {showOverview && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl animate-in flex flex-col">
          <div className="flex justify-between items-center px-6 pt-12 pb-4 border-b border-white/10">
            <h2 className="text-xl font-black tracking-tight">
              Workout Overview
            </h2>
            <button
              onClick={() => setShowOverview(false)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Delete Workout Button */}
            <button
              onClick={onAbort}
              className="w-full text-center p-4 rounded-2xl bg-red-500/10 text-red-500 font-bold uppercase tracking-widest text-xs border border-red-500/20 active:bg-red-500/20 mb-4"
            >
              <i className="fa-solid fa-trash mr-2"></i>
              Delete Active Session
            </button>

            {workout.exercises.map((ex, idx) => {
              const results = exerciseResults[ex.id] || [];
              const totalSets = (ex.hasWarmup ? 1 : 0) + ex.sets;
              const completedSets = results.filter((s) => s.completed).length;
              const isCurrent = idx === currentExIndex;
              const isDone = completedSets === totalSets;

              return (
                <button
                  key={ex.id}
                  onClick={() => handleJumpToExercise(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isCurrent
                      ? "bg-[#FF9500] border-[#FF9500] text-black"
                      : "bg-[#1C1C1E] border-white/5 text-white active:bg-white/5"
                  }`}
                >
                  <div>
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        isCurrent ? "text-black/60" : "text-[#8E8E93]"
                      }`}
                    >
                      {idx + 1}. {ex.hasWarmup ? "Warmup + " : ""}
                      {ex.sets} Sets
                    </p>
                    <h3 className="font-bold text-lg">{ex.name}</h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`font-mono text-sm font-bold ${
                        isCurrent ? "text-black" : "text-[#8E8E93]"
                      }`}
                    >
                      {completedSets}/{totalSets}
                    </span>
                    {isDone && (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? "bg-black text-[#FF9500]"
                            : "bg-[#32D74B] text-black"
                        }`}
                      >
                        <i className="fa-solid fa-check text-[10px]"></i>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 pt-safe pb-2">
        <div className="flex-1">
          <button
            onClick={() => setShowOverview(true)}
            className="flex items-center space-x-2 text-[#FF9500] active:opacity-70 transition-opacity"
          >
            <i className="fa-solid fa-list-ul text-lg"></i>
            <span className="font-black uppercase text-[10px] tracking-widest">
              {currentExIndex + 1} / {workout.exercises.length}
            </span>
          </button>
        </div>
        <button
          onClick={onCancel}
          className="text-[#8E8E93] active:scale-90 transition-transform"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>
      </div>

      <div className="flex-1 flex flex-col px-4 min-h-0">
        <div className="mt-1 text-center shrink-0">
          <h1 className="text-xl font-black tracking-tighter leading-none mb-1 wrap-break-word line-clamp-2">
            {currentExercise.name}
          </h1>
          <h2 className="text-xs font-bold text-[#FF9500] italic uppercase tracking-tight">
            {currentStep.label}
          </h2>
        </div>

        {/* Full Screen Interactive Area */}
        <div className="flex-1 flex flex-col justify-center space-y-2 pb-2 min-h-0">
          {currentStep.type === "warmup" ? (
            <div className="flex flex-col items-center justify-center space-y-4 animate-in">
              <div className="w-20 h-20 rounded-full border border-[#FF9500]/30 flex items-center justify-center bg-[#FF9500]/5">
                <i className="fa-solid fa-fire-flame-curved text-3xl text-[#FF9500]"></i>
              </div>
              <div className="text-center">
                <p className="text-[#8E8E93] font-medium text-sm max-w-[200px]">
                  Perform 10-15 reps with very light weight.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-in flex flex-col justify-center h-full">
              {currentStep.type === 'dropset' && (
                 <div className="flex flex-col items-center justify-center space-y-1 pb-2">
                    <p className="text-purple-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <i className="fa-solid fa-weight-hanging"></i> Drop Set
                    </p>
                 </div>
              )}
              {/* Last Session Reference */}
              {previousPerformance && (
                <div className="flex justify-center shrink-0">
                  <div className="inline-flex items-center space-x-3 bg-[#1C1C1E] px-3 py-1 rounded-full border border-white/5">
                    <span className="text-[10px] font-black uppercase text-[#8E8E93] tracking-wider">
                      Goal
                    </span>
                    <span className="text-xs font-mono font-bold text-[#FF9500]">
                      {previousPerformance.weight}kg
                    </span>
                    <span className="text-white/10">•</span>
                    <span className="text-xs font-mono font-bold text-[#FF9500]">
                      {previousPerformance.reps} reps
                    </span>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="grid grid-cols-1 gap-2 shrink-0">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        updateCurrentSet({
                          weight: Math.max(0, currentSetData.weight - 0.5),
                        })
                      }
                      className="w-12 h-12 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-lg active:bg-[#FF9500] active:text-black transition-all"
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>
                    <div className="text-center flex-1">
                      <p className="text-[9px] font-black uppercase text-[#8E8E93] tracking-[0.2em] mb-0.5">
                        Weight
                      </p>
                      <div className="flex items-baseline justify-center">
                        <NumberInput
                          value={currentSetData.weight}
                          onChange={(val) =>
                            updateCurrentSet({
                              weight: val,
                            })
                          }
                          className="w-24 bg-transparent text-4xl font-mono font-black text-center focus:outline-none"
                        />
                        <span className="text-base font-bold text-[#8E8E93] ml-1">
                          kg
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        updateCurrentSet({
                          weight: currentSetData.weight + 0.5,
                        })
                      }
                      className="w-12 h-12 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-lg active:bg-[#FF9500] active:text-black transition-all"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() =>
                        updateCurrentSet({
                          reps: Math.max(0, currentSetData.reps - 1),
                        })
                      }
                      className="w-12 h-12 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-lg active:bg-[#FF9500] active:text-black transition-all"
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>
                    <div className="text-center flex-1">
                      <p className="text-[9px] font-black uppercase text-[#8E8E93] tracking-[0.2em] mb-0.5">
                        Reps
                      </p>
                      <NumberInput
                        value={currentSetData.reps}
                        onChange={(val) =>
                          updateCurrentSet({
                            reps: val,
                          })
                        }
                        className="w-24 bg-transparent text-4xl font-mono font-black text-center focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() =>
                        updateCurrentSet({ reps: currentSetData.reps + 1 })
                      }
                      className="w-12 h-12 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-lg active:bg-[#FF9500] active:text-black transition-all"
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="p-4 pb-safe space-y-3 shrink-0">
        <div className="flex items-center space-x-1 px-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i === currentStepIndex
                  ? "bg-white scale-y-125"
                  : i < currentStepIndex
                  ? "bg-[#FF9500]"
                  : "bg-[#1C1C1E]"
              }`}
            />
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleBack}
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-[#1C1C1E] text-[#8E8E93] active:scale-90 transition-all ${
              currentExIndex === 0 && currentStepIndex === 0 ? "opacity-0" : ""
            }`}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          <button
            onClick={handleNext}
            disabled={isCompleting}
            className={`flex-1 h-12 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs shadow-xl active:scale-[0.97] transition-all flex items-center justify-center space-x-2 ${
              isCompleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <span>
              {isCompleting 
                ? "Finishing..." 
                : currentStep.type === "warmup" 
                  ? "Warm up Done" 
                  : "Complete Set"
              }
            </span>
            {!isCompleting && <i className="fa-solid fa-check text-[10px]"></i>}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default TrainingSessionView;
