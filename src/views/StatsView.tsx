import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { TrainingSession, DailyLog, Workout, Exercise } from "../types";
import {
  calculateTotalVolume,
  calculateDuration,
  calculateTotalSets,
} from "../lib/sessionUtils";

interface StatsViewProps {
  sessions: TrainingSession[];
  dailyLogs: DailyLog[];
  workouts: Workout[];
}

type TimeRange = "week" | "month" | "all";

const StatsView: React.FC<StatsViewProps> = ({
  sessions,
  dailyLogs,
  workouts,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Filter sessions by time range
  const filteredSessions = useMemo(() => {
    const now = new Date();
    let cutoff: Date;

    switch (timeRange) {
      case "week":
        cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoff = new Date(0);
    }

    return sessions.filter((s) => new Date(s.date) >= cutoff);
  }, [sessions, timeRange]);

  // Summary Stats
  const summaryStats = useMemo(() => {
    const totalVolume = filteredSessions.reduce(
      (sum, s) => sum + calculateTotalVolume(s),
      0
    );
    const totalSets = filteredSessions.reduce(
      (sum, s) => sum + calculateTotalSets(s),
      0
    );
    const totalDuration = filteredSessions.reduce(
      (sum, s) => sum + calculateDuration(s),
      0
    );
    const avgDuration =
      filteredSessions.length > 0
        ? Math.round(totalDuration / filteredSessions.length)
        : 0;

    // Calculate streak
    const sortedDates = [...new Set(sessions.map((s) => s.date.split("T")[0]))]
      .sort()
      .reverse();
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (sortedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today might not have a workout yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      workoutCount: filteredSessions.length,
      totalVolume,
      totalSets,
      avgDuration,
      streak,
    };
  }, [filteredSessions, sessions]);

  // Volume over time chart
  const volumeChartData = useMemo(() => {
    const sorted = [...filteredSessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted.map((s) => {
      const workout =
        s.workoutSnapshot || workouts.find((w) => w.id === s.workoutId);
      return {
        date: new Date(s.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        volume: calculateTotalVolume(s),
        workout: workout?.name || "Workout",
      };
    });
  }, [filteredSessions, workouts]);

  // Get all unique exercises from sessions
  const allExercises = useMemo(() => {
    const exerciseMap = new Map<string, { id: string; name: string }>();

    sessions.forEach((s) => {
      const workout =
        s.workoutSnapshot || workouts.find((w) => w.id === s.workoutId);
      if (workout) {
        workout.exercises.forEach((ex) => {
          if (!exerciseMap.has(ex.id)) {
            exerciseMap.set(ex.id, { id: ex.id, name: ex.name });
          }
        });
      }
    });

    return Array.from(exerciseMap.values());
  }, [sessions, workouts]);

  // Exercise progress data
  const exerciseProgressData = useMemo(() => {
    if (!selectedExercise) return [];

    const relevantSessions = sessions
      .filter((s) => s.exerciseResults[selectedExercise])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return relevantSessions.map((s) => {
      const sets = s.exerciseResults[selectedExercise].filter(
        (set) => !set.isWarmup && !set.isDropset && set.completed
      );
      const maxWeight = sets.length > 0 ? Math.max(...sets.map((x) => x.weight)) : 0;
      const avgReps =
        sets.length > 0
          ? Math.round(sets.reduce((sum, x) => sum + x.reps, 0) / sets.length)
          : 0;

      return {
        date: new Date(s.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        maxWeight,
        avgReps,
        volume: sets.reduce((sum, x) => sum + x.weight * x.reps, 0),
      };
    });
  }, [selectedExercise, sessions]);

  // Personal Records
  const personalRecords = useMemo(() => {
    const records: Record<
      string,
      { name: string; weight: number; reps: number; date: string }
    > = {};

    sessions.forEach((s) => {
      const workout =
        s.workoutSnapshot || workouts.find((w) => w.id === s.workoutId);

      Object.entries(s.exerciseResults).forEach(([exId, sets]) => {
        const exercise = workout?.exercises.find((e) => e.id === exId);
        if (!exercise) return;

        sets
          .filter((set) => !set.isWarmup && !set.isDropset && set.completed)
          .forEach((set) => {
            const current = records[exId];
            if (!current || set.weight > current.weight) {
              records[exId] = {
                name: exercise.name,
                weight: set.weight,
                reps: set.reps,
                date: s.date,
              };
            }
          });
      });
    });

    return Object.values(records)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
  }, [sessions, workouts]);

  // Workout distribution
  const workoutDistribution = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};

    filteredSessions.forEach((s) => {
      const workout =
        s.workoutSnapshot || workouts.find((w) => w.id === s.workoutId);
      const name = workout?.name || "Unknown";
      if (!counts[s.workoutId]) {
        counts[s.workoutId] = { name, count: 0 };
      }
      counts[s.workoutId].count++;
    });

    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [filteredSessions, workouts]);

  // Body weight trend
  const weightTrendData = useMemo(() => {
    const sorted = [...dailyLogs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    return sorted.map((log) => ({
      date: new Date(log.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: log.weight,
    }));
  }, [dailyLogs]);

  // Weekly activity heatmap data
  const weeklyActivity = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = new Array(7).fill(0);

    filteredSessions.forEach((s) => {
      const dayIndex = new Date(s.date).getDay();
      counts[dayIndex]++;
    });

    const maxCount = Math.max(...counts, 1);
    return days.map((day, i) => ({
      day,
      count: counts[i],
      intensity: counts[i] / maxCount,
    }));
  }, [filteredSessions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C1C1E] border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-1">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-mono font-bold" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
              {entry.name === "weight" || entry.name === "maxWeight" || entry.name === "volume"
                ? "kg"
                : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatVolume = (vol: number) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toString();
  };

  if (sessions.length === 0) {
    return (
      <div className="p-6 space-y-8 pb-24 animate-in">
        <header className="pt-4">
          <h1 className="text-4xl font-black tracking-tighter">Analytics</h1>
          <p className="text-[#8E8E93] text-sm font-medium">
            Track your progress
          </p>
        </header>
        <div className="bg-[#1C1C1E] rounded-3xl p-12 text-center border border-white/5 space-y-4">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto text-[#3A3A3C] border border-white/5">
            <i className="fa-solid fa-chart-line text-2xl"></i>
          </div>
          <p className="text-[#8E8E93] text-sm font-medium px-4">
            Complete your first workout to start tracking your progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-24 animate-in">
      <header className="pt-4 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Analytics</h1>
          <p className="text-[#8E8E93] text-sm font-medium">
            Track your progress
          </p>
        </div>
      </header>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {(["week", "month", "all"] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              timeRange === range
                ? "bg-[#FF9500] text-black"
                : "bg-[#1C1C1E] text-[#8E8E93] border border-white/5"
            }`}
          >
            {range === "all" ? "All Time" : range}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5">
          <p className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest mb-1">
            Workouts
          </p>
          <p className="text-3xl font-mono font-black text-white">
            {summaryStats.workoutCount}
          </p>
        </div>
        <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5">
          <p className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest mb-1">
            Total Volume
          </p>
          <p className="text-3xl font-mono font-black text-white">
            {formatVolume(summaryStats.totalVolume)}
            <span className="text-sm text-[#8E8E93] ml-1">kg</span>
          </p>
        </div>
        <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5">
          <p className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest mb-1">
            Avg Duration
          </p>
          <p className="text-3xl font-mono font-black text-white">
            {summaryStats.avgDuration}
            <span className="text-sm text-[#8E8E93] ml-1">min</span>
          </p>
        </div>
        <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5">
          <p className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest mb-1">
            Streak
          </p>
          <div className="flex items-baseline">
            <p className="text-3xl font-mono font-black text-[#FF9500]">
              {summaryStats.streak}
            </p>
            <span className="text-sm text-[#8E8E93] ml-1">days</span>
            {summaryStats.streak > 0 && (
              <i className="fa-solid fa-fire text-[#FF9500] ml-2"></i>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <section className="bg-[#1C1C1E] p-5 rounded-3xl border border-white/5 space-y-4">
        <h3 className="text-xs font-black text-[#8E8E93] uppercase tracking-widest">
          Weekly Activity
        </h3>
        <div className="flex justify-between">
          {weeklyActivity.map((day) => (
            <div key={day.day} className="flex flex-col items-center space-y-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{
                  backgroundColor: `rgba(255, 149, 0, ${0.1 + day.intensity * 0.9})`,
                }}
              >
                <span
                  className="text-xs font-mono font-bold"
                  style={{
                    color: day.intensity > 0.5 ? "#000" : "#8E8E93",
                  }}
                >
                  {day.count}
                </span>
              </div>
              <span className="text-[9px] font-bold text-[#8E8E93]">
                {day.day}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Volume Over Time */}
      {volumeChartData.length > 1 && (
        <section className="bg-[#1C1C1E] p-5 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-xs font-black text-[#8E8E93] uppercase tracking-widest">
            Volume Trend
          </h3>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={volumeChartData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9500" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF9500" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#3A3A3C"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#3A3A3C"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatVolume(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#FF9500"
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Exercise Progress */}
      <section className="bg-[#1C1C1E] p-5 rounded-3xl border border-white/5 space-y-4">
        <h3 className="text-xs font-black text-[#8E8E93] uppercase tracking-widest">
          Exercise Progress
        </h3>
        <select
          value={selectedExercise || ""}
          onChange={(e) => setSelectedExercise(e.target.value || null)}
          className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-medium text-white focus:outline-none focus:border-[#FF9500]"
        >
          <option value="">Select an exercise...</option>
          {allExercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>

        {selectedExercise && exerciseProgressData.length > 0 && (
          <div className="space-y-4">
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={exerciseProgressData}
                  margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    stroke="#3A3A3C"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#3A3A3C"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    name="Max Weight"
                    stroke="#FF9500"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#FF9500" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <p className="text-[8px] font-black text-[#8E8E93] uppercase">
                  Best
                </p>
                <p className="text-lg font-mono font-black text-[#FF9500]">
                  {Math.max(...exerciseProgressData.map((d) => d.maxWeight))}kg
                </p>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <p className="text-[8px] font-black text-[#8E8E93] uppercase">
                  Latest
                </p>
                <p className="text-lg font-mono font-black text-white">
                  {exerciseProgressData[exerciseProgressData.length - 1]?.maxWeight}kg
                </p>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <p className="text-[8px] font-black text-[#8E8E93] uppercase">
                  Sessions
                </p>
                <p className="text-lg font-mono font-black text-white">
                  {exerciseProgressData.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedExercise && exerciseProgressData.length === 0 && (
          <p className="text-[#8E8E93] text-sm text-center py-4">
            No data for this exercise yet.
          </p>
        )}
      </section>

      {/* Personal Records */}
      {personalRecords.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-black text-[#8E8E93] uppercase tracking-widest px-1">
            Personal Records
          </h3>
          <div className="space-y-2">
            {personalRecords.map((pr, index) => (
              <div
                key={pr.name}
                className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                      index === 0
                        ? "bg-yellow-500/20 text-yellow-500"
                        : index === 1
                        ? "bg-gray-400/20 text-gray-400"
                        : index === 2
                        ? "bg-orange-700/20 text-orange-700"
                        : "bg-white/5 text-[#8E8E93]"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm truncate max-w-[180px]">
                      {pr.name}
                    </p>
                    <p className="text-[10px] text-[#8E8E93]">
                      {new Date(pr.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-black text-[#FF9500]">
                    {pr.weight}kg
                  </p>
                  <p className="text-[10px] text-[#8E8E93] font-mono">
                    {pr.reps} reps
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Workout Distribution */}
      {workoutDistribution.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-black text-[#8E8E93] uppercase tracking-widest px-1">
            Workout Split
          </h3>
          <div className="bg-[#1C1C1E] p-5 rounded-3xl border border-white/5 space-y-3">
            {workoutDistribution.map((w, index) => {
              const maxCount = workoutDistribution[0].count;
              const percentage = (w.count / maxCount) * 100;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium truncate">{w.name}</span>
                    <span className="font-mono font-bold text-[#8E8E93]">
                      {w.count}x
                    </span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#FF9500] rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Body Weight Trend */}
      {weightTrendData.length > 1 && (
        <section className="bg-[#1C1C1E] p-5 rounded-3xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-[#8E8E93] uppercase tracking-widest">
              Body Weight
            </h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-mono font-black text-white">
                {weightTrendData[weightTrendData.length - 1]?.weight}
              </span>
              <span className="text-sm text-[#8E8E93]">kg</span>
              {weightTrendData.length > 1 && (
                <span
                  className={`text-xs font-bold ${
                    weightTrendData[weightTrendData.length - 1].weight <
                    weightTrendData[0].weight
                      ? "text-green-400"
                      : weightTrendData[weightTrendData.length - 1].weight >
                        weightTrendData[0].weight
                      ? "text-red-400"
                      : "text-[#8E8E93]"
                  }`}
                >
                  {(
                    weightTrendData[weightTrendData.length - 1].weight -
                    weightTrendData[0].weight
                  ).toFixed(1)}
                  kg
                </span>
              )}
            </div>
          </div>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weightTrendData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="date"
                  stroke="#3A3A3C"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#3A3A3C"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#32D74B"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#32D74B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
};

export default StatsView;
