import React from "react";
import { TrainingSession, Workout } from "../types";
import {
  calculateTotalVolume,
  calculateTotalSets,
  calculateTotalReps,
  calculateDuration,
  compareSessionVolume,
  calculateExerciseVolumes,
} from "../lib/sessionUtils";

interface WorkoutSummaryViewProps {
  session: TrainingSession;
  workout: Workout;
  previousSession: TrainingSession | null;
  onClose: () => void;
}

const WorkoutSummaryView: React.FC<WorkoutSummaryViewProps> = ({
  session,
  workout,
  previousSession,
  onClose,
}) => {
  const totalVolume = calculateTotalVolume(session);
  const totalSets = calculateTotalSets(session);
  const totalReps = calculateTotalReps(session);
  const duration = calculateDuration(session);
  const volumeChange = compareSessionVolume(session, previousSession);

  const currentExVolumes = calculateExerciseVolumes(session);
  const previousExVolumes = previousSession
    ? calculateExerciseVolumes(previousSession)
    : null;

  // Calculate overall improvement score based on volume change
  const getOverallScore = () => {
    if (volumeChange === null) return { label: "First Workout", color: "text-blue-400", icon: "fa-star" };
    if (volumeChange > 5) return { label: "Great Progress", color: "text-green-400", icon: "fa-arrow-trend-up" };
    if (volumeChange > 0) return { label: "Slight Improvement", color: "text-green-300", icon: "fa-arrow-up" };
    if (volumeChange > -5) return { label: "Maintained", color: "text-yellow-400", icon: "fa-equals" };
    return { label: "Needs Recovery", color: "text-red-400", icon: "fa-arrow-trend-down" };
  };

  const score = getOverallScore();

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="flex flex-col h-dvh bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#32D74B]/10 border border-[#32D74B]/30 flex items-center justify-center mx-auto">
          <i className="fa-solid fa-check text-3xl text-[#32D74B]"></i>
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Workout Complete</h1>
          <p className="text-[#FF9500] text-sm font-bold mt-1">{workout.name}</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="px-6 flex-1 overflow-y-auto space-y-6 pb-32">
        {/* Overall Score Card */}
        <div className="bg-[#1C1C1E] rounded-3xl p-6 border border-white/5 text-center">
          <div className={`text-5xl mb-3 ${score.color}`}>
            <i className={`fa-solid ${score.icon}`}></i>
          </div>
          <p className={`text-xl font-black ${score.color}`}>{score.label}</p>
          {volumeChange !== null && (
            <p className="text-[#8E8E93] text-sm mt-1">
              {volumeChange > 0 ? "+" : ""}
              {volumeChange.toFixed(1)}% volume vs last session
            </p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/5">
            <p className="text-[9px] font-black uppercase text-[#8E8E93] tracking-widest mb-1">
              Duration
            </p>
            <p className="text-2xl font-black font-mono">
              {duration}<span className="text-sm text-[#8E8E93] ml-1">min</span>
            </p>
          </div>
          <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/5">
            <p className="text-[9px] font-black uppercase text-[#8E8E93] tracking-widest mb-1">
              Total Volume
            </p>
            <p className="text-2xl font-black font-mono">
              {formatNumber(totalVolume)}<span className="text-sm text-[#8E8E93] ml-1">kg</span>
            </p>
          </div>
          <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/5">
            <p className="text-[9px] font-black uppercase text-[#8E8E93] tracking-widest mb-1">
              Sets Completed
            </p>
            <p className="text-2xl font-black font-mono">{totalSets}</p>
          </div>
          <div className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/5">
            <p className="text-[9px] font-black uppercase text-[#8E8E93] tracking-widest mb-1">
              Total Reps
            </p>
            <p className="text-2xl font-black font-mono">{totalReps}</p>
          </div>
        </div>

        {/* Per-Exercise Breakdown */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase text-[#8E8E93] tracking-widest px-1">
            Exercise Breakdown
          </h2>
          {workout.exercises.map((ex) => {
            const currentVolume = currentExVolumes[ex.id] || 0;
            const previousVolume = previousExVolumes?.[ex.id];
            const change =
              previousVolume && previousVolume > 0
                ? ((currentVolume - previousVolume) / previousVolume) * 100
                : null;

            return (
              <div
                key={ex.id}
                className="bg-[#1C1C1E] rounded-2xl p-4 border border-white/5 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{ex.name}</p>
                  <p className="text-[#8E8E93] text-xs font-mono">
                    {formatNumber(currentVolume)} kg volume
                  </p>
                </div>
                {change !== null && (
                  <div
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                      change > 0
                        ? "bg-green-500/10 text-green-400"
                        : change < 0
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    <i
                      className={`fa-solid text-[10px] ${
                        change > 0
                          ? "fa-arrow-up"
                          : change < 0
                          ? "fa-arrow-down"
                          : "fa-equals"
                      }`}
                    ></i>
                    <span className="text-xs font-bold font-mono">
                      {Math.abs(change).toFixed(0)}%
                    </span>
                  </div>
                )}
                {change === null && previousSession && (
                  <span className="text-[#8E8E93] text-xs italic">New</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Button */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 pb-safe bg-gradient-to-t from-black via-black to-transparent">
        <button
          onClick={onClose}
          className="w-full h-14 rounded-full bg-white text-black font-black uppercase tracking-widest text-sm shadow-xl active:scale-[0.97] transition-all"
        >
          Done
        </button>
      </footer>
    </div>
  );
};

export default WorkoutSummaryView;

