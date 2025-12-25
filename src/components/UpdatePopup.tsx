import React from 'react';

interface UpdatePopupProps {
  onUpdate: () => void;
  forceUpdate: boolean;
  releaseNotes?: string;
  latestVersion: string;
}

const UpdatePopup: React.FC<UpdatePopupProps> = ({ onUpdate, forceUpdate, releaseNotes, latestVersion }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-[#FF9500]">
          <i className="fa-solid fa-cloud-arrow-down text-3xl"></i>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black tracking-tight text-white">Update Available</h2>
          <p className="text-[#8E8E93] text-sm font-medium">
            Version {latestVersion} is now available.
          </p>
        </div>

        {releaseNotes && (
          <div className="bg-black/20 rounded-xl p-4 text-left">
            <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">What's New</p>
            <p className="text-sm text-white/90 leading-relaxed">{releaseNotes}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onUpdate}
            className="w-full bg-[#FF9500] text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl active:scale-[0.98] transition-all"
          >
            Update Now
          </button>
          
          {!forceUpdate && (
             <button
              onClick={() => window.location.reload()} // Just reload for now, or dismiss if we had state
              className="text-[#8E8E93] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Remind Me Later
            </button>
          )}
           {forceUpdate && (
             <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
               Update Required
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatePopup;

