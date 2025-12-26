import React from "react";
import { APP_VERSION } from "../constants";
import { useAuth } from "../context/AuthContext";

interface SettingsViewProps {
  onSeedData: () => void;
  onLoadWorkouts: () => void;
  onMigrateData: () => void;
  onSignOut: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  onSeedData,
  onLoadWorkouts,
  onMigrateData,
  onSignOut,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.email === "schmidphilipp1995@gmail.com";

  return (
    <div className="p-6 space-y-8 pb-24 animate-in">
      <header className="pt-4">
        <h1 className="text-4xl font-black tracking-tighter">Settings</h1>
        <p className="text-[#8E8E93] text-sm font-medium">App configuration.</p>
      </header>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase text-[#8E8E93] tracking-widest px-1">
            Account
          </h2>
          <div className="bg-[#1C1C1E] rounded-3xl overflow-hidden border border-white/5">
            <div className="p-5 flex items-center justify-between border-b border-white/5">
              <div>
                <h3 className="font-bold text-base">Sign Out</h3>
                <p className="text-xs text-[#8E8E93] mt-1">
                  Sign out of your account.
                </p>
              </div>
              <button
                onClick={onSignOut}
                className="bg-[#FF453A] text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                Sign Out
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase text-[#8E8E93] tracking-widest px-1">
            Data Management
          </h2>

          <div className="bg-[#1C1C1E] rounded-3xl overflow-hidden border border-white/5">
            <div className="p-5 flex items-center justify-between border-b border-white/5">
              <div>
                <h3 className="font-bold text-base">Migrate Data</h3>
                <p className="text-xs text-[#8E8E93] mt-1">
                  Upload local data to Supabase.
                </p>
              </div>
              <button
                onClick={onMigrateData}
                className="bg-[#32D74B] text-black px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                Migrate
              </button>
            </div>
            {isAdmin && (
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                <div>
                  <h3 className="font-bold text-base">Demo Mode</h3>
                  <p className="text-xs text-[#8E8E93] mt-1">
                    Populate app with dummy data for testing.
                  </p>
                </div>
                <button
                  onClick={onSeedData}
                  className="bg-[#FF9500] text-black px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
                >
                  Load Data
                </button>
              </div>
            )}
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Default Routines</h3>
                <p className="text-xs text-[#8E8E93] mt-1">
                  Load the standard workout templates.
                </p>
              </div>
              <button
                onClick={onLoadWorkouts}
                className="bg-[#1C1C1E] border border-white/20 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                Load Routines
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase text-[#8E8E93] tracking-widest px-1">
            System
          </h2>
          <div className="bg-[#1C1C1E] rounded-3xl overflow-hidden border border-white/5">
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Update App</h3>
                <p className="text-xs text-[#8E8E93] mt-1">
                  Reload to get the latest updates.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#1C1C1E] border border-white/20 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                Reload
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xs font-black uppercase text-[#8E8E93] tracking-widest px-1">
            About
          </h2>
          <div className="bg-[#1C1C1E] rounded-3xl p-5 border border-white/5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-dumbbell text-[#FF9500]"></i>
              </div>
              <div>
                <h3 className="font-bold">Vibe Fitness</h3>
                <p className="text-xs text-[#8E8E93]">Version {APP_VERSION}</p>
              </div>
            </div>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              A minimal workout tracker focused on progression and simplicity.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
