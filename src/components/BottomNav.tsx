import React from "react";
import { AppView } from "../types";

interface BottomNavProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const tabs: { id: AppView; icon: string; label: string }[] = [
    { id: "dashboard", icon: "fa-house", label: "Home" },
    { id: "workouts", icon: "fa-dumbbell", label: "Workouts" },
    { id: "history", icon: "fa-clock-rotate-left", label: "History" },
    { id: "stats", icon: "fa-chart-line", label: "Analytics" },
    { id: "settings", icon: "fa-gear", label: "Settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
              currentView === tab.id ? "text-[#FF9500]" : "text-[#8E8E93]"
            }`}
          >
            <i className={`fa-solid ${tab.icon} text-lg mb-1`}></i>
            <span className="text-[10px] font-semibold tracking-tight">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
