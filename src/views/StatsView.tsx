
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar } from 'recharts';
import { TrainingSession, DailyLog, Workout } from '../types';

interface StatsViewProps {
  sessions: TrainingSession[];
  dailyLogs: DailyLog[];
  workouts: Workout[];
}

const StatsView: React.FC<StatsViewProps> = ({ sessions, dailyLogs, workouts }) => {
  // Correlate data: Body Weight vs Strength (Max weight in a session)
  const chartData = useMemo(() => {
    const sortedLogs = [...dailyLogs].sort((a, b) => a.date.localeCompare(b.date));
    
    return sortedLogs.map(log => {
      // Find training sessions on this day
      const sessionToday = sessions.find(s => s.date.startsWith(log.date));
      
      let maxStrength = 0;
      if (sessionToday) {
        const weights = Object.values(sessionToday.exerciseResults)
          .flatMap(sets => sets.filter(s => !s.isWarmup).map(s => s.weight));
        maxStrength = weights.length > 0 ? Math.max(...weights) : 0;
      } else {
        // Fallback: find the most recent session before this log date to show "current potential"
        const pastSessions = sessions.filter(s => s.date.split('T')[0] <= log.date)
          .sort((a, b) => b.date.localeCompare(a.date));
        if (pastSessions.length > 0) {
           const weights = Object.values(pastSessions[0].exerciseResults)
            .flatMap(sets => sets.filter(s => !s.isWarmup).map(s => s.weight));
           maxStrength = weights.length > 0 ? Math.max(...weights) : 0;
        }
      }

      return {
        date: log.date.slice(5).replace('-', '/'), // MM/DD
        bodyWeight: log.weight,
        strength: maxStrength
      };
    }).slice(-10); // Show last 10 entries for clarity on mobile
  }, [sessions, dailyLogs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C1C1E] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center space-x-8">
              <span className="text-xs font-bold text-white">Body Weight</span>
              <span className="text-xs font-mono font-black text-[#FF9500]">{payload[0].value}kg</span>
            </div>
            <div className="flex justify-between items-center space-x-8">
              <span className="text-xs font-bold text-white">Max Lift</span>
              <span className="text-xs font-mono font-black text-white">{payload[1]?.value || 0}kg</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-8 pb-24 animate-in">
      <header className="pt-4">
        <h1 className="text-4xl font-black tracking-tighter">Insights</h1>
        <p className="text-[#8E8E93] text-sm font-medium">Strength & Correlation trends.</p>
      </header>

      {chartData.length < 3 ? (
        <div className="bg-[#1C1C1E] rounded-[2.5rem] p-12 text-center border border-white/5 space-y-4">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto text-[#3A3A3C] border border-white/5">
            <i className="fa-solid fa-chart-simple text-2xl"></i>
          </div>
          <p className="text-[#8E8E93] text-sm font-medium px-4">Log more weight entries and sessions to unlock performance trends.</p>
        </div>
      ) : (
        <>
          {/* Main Correlation Chart */}
          <section className="bg-[#1C1C1E] p-6 rounded-[2.5rem] border border-white/5 space-y-6">
            <header className="flex justify-between items-end">
              <div>
                <h3 className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.2em]">Body vs Power</h3>
                <p className="text-lg font-bold tracking-tight">Correlation</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#FF9500]"></div>
                  <span className="text-[9px] font-black text-[#8E8E93] uppercase">Body</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <span className="text-[9px] font-black text-[#8E8E93] uppercase">Lift</span>
                </div>
              </div>
            </header>

            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#3A3A3C" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                    fontFamily="Geist Mono"
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#3A3A3C" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="Geist Mono"
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#3A3A3C" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="Geist Mono"
                    hide
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff05' }} />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="bodyWeight" 
                    stroke="#FF9500" 
                    strokeWidth={4} 
                    dot={{ r: 0 }} 
                    activeDot={{ r: 6, stroke: '#000', strokeWidth: 2 }} 
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="strength" 
                    fill="#FFFFFF" 
                    opacity={0.1}
                    radius={[4, 4, 0, 0]} 
                    barSize={12} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#1C1C1E] p-6 rounded-[2rem] border border-white/5">
                <p className="text-[10px] uppercase font-black text-[#8E8E93] mb-2 tracking-widest">Efficiency</p>
                <p className="text-3xl font-mono font-black text-white">
                  {sessions.length}
                  <span className="text-xs font-sans text-[#8E8E93] ml-1">Sess</span>
                </p>
             </div>
             <div className="bg-[#1C1C1E] p-6 rounded-[2rem] border border-white/5">
                <p className="text-[10px] uppercase font-black text-[#8E8E93] mb-2 tracking-widest">Fuel Avg</p>
                <p className="text-3xl font-mono font-black text-white">
                  {Math.round(dailyLogs.reduce((acc, l) => acc + l.calories, 0) / (dailyLogs.length || 1))}
                  <span className="text-xs font-sans text-[#8E8E93] ml-1">kcal</span>
                </p>
             </div>
          </div>
        </>
      )}

      {/* Routine Specific Progress */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase text-[#8E8E93] tracking-[0.2em] px-1">Training Frequency</h2>
        <div className="space-y-3">
          {workouts.map(workout => {
            const wSessions = sessions.filter(s => s.workoutId === workout.id).slice(-6);
            if (wSessions.length === 0) return null;
            
            return (
              <div key={workout.id} className="bg-[#1C1C1E] p-5 rounded-3xl border border-white/5 flex justify-between items-center group active:scale-[0.98] transition-all">
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{workout.name}</h4>
                  <p className="text-[10px] text-[#8E8E93] font-black uppercase tracking-tighter">Relative volume intensity</p>
                </div>
                <div className="flex space-x-1 items-end h-8">
                  {wSessions.map((s, i) => {
                    const exerciseCount = Object.keys(s.exerciseResults).length;
                    const height = (exerciseCount / 10) * 100; // Relative to 10 exercises max
                    return (
                      <div 
                        key={i} 
                        className="w-2 bg-[#FF9500] rounded-sm opacity-20 group-hover:opacity-100 transition-opacity" 
                        style={{ height: `${Math.max(20, height)}%` }}
                      ></div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default StatsView;
