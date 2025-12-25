import React, { useState } from 'react';
import { DailyLog } from '../types';

interface DailyLogEntryProps {
  logs: DailyLog[];
  onSave: (log: DailyLog) => void;
  onClose: () => void;
}

const DailyLogEntry: React.FC<DailyLogEntryProps> = ({ logs, onSave, onClose }) => {
  const today = new Date().toISOString().split('T')[0];
  const existingLog = logs.find(l => l.date === today);
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;

  const [weight, setWeight] = useState<string>(existingLog?.weight.toString() || lastLog?.weight.toString() || '75.0');
  const [calories, setCalories] = useState<string>(existingLog?.calories.toString() || lastLog?.calories.toString() || '2000');

  const handleSave = () => {
    onSave({
      id: existingLog?.id || Date.now().toString(),
      date: today,
      weight: parseFloat(weight),
      calories: parseInt(calories)
    });
    onClose();
  };

  return (
    <div className="h-full bg-black p-6 animate-in flex flex-col overflow-y-auto">
      <header className="flex justify-between items-center mb-8 pt-safe">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Vitals</h1>
          <p className="text-[#8E8E93] text-sm font-medium">Daily check-in.</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center text-[#8E8E93]">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>

      <div className="flex-1 space-y-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-[#8E8E93] tracking-[0.3em] block px-1">Weight (kg)</label>
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setWeight((parseFloat(weight) - 0.1).toFixed(1))} className="w-14 h-14 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-lg active:bg-[#FF9500] transition-colors"><i className="fa-solid fa-minus"></i></button>
            <input 
              type="number" step="0.1" value={weight} 
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1 w-24 bg-transparent text-center text-5xl font-mono font-black outline-none min-w-0"
            />
            <button onClick={() => setWeight((parseFloat(weight) + 0.1).toFixed(1))} className="w-14 h-14 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-lg active:bg-[#FF9500] transition-colors"><i className="fa-solid fa-plus"></i></button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-[#8E8E93] tracking-[0.3em] block px-1">Calories (kcal)</label>
          <div className="flex items-center justify-between gap-2">
            <button onClick={() => setCalories((parseInt(calories) - 50).toString())} className="w-14 h-14 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-lg active:bg-[#FF9500] transition-colors"><i className="fa-solid fa-minus"></i></button>
            <input 
              type="number" value={calories} 
              onChange={(e) => setCalories(e.target.value)}
              className="flex-1 w-24 bg-transparent text-center text-5xl font-mono font-black outline-none min-w-0"
            />
            <button onClick={() => setCalories((parseInt(calories) + 50).toString())} className="w-14 h-14 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-lg active:bg-[#FF9500] transition-colors"><i className="fa-solid fa-plus"></i></button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-[#FF9500] text-black font-black py-5 rounded-3xl text-lg uppercase tracking-widest active:scale-95 transition-all mb-safe shadow-xl shadow-orange-950/20 mt-8"
      >
        Record Log
      </button>
    </div>
  );
};

export default DailyLogEntry;
