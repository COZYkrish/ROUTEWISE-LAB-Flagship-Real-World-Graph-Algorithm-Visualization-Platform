import { useTraversalStore } from '../../store';

export function HistoryScrubber() {
  const { history, currentEventIndex, jumpToEvent, status } = useTraversalStore();

  if (history.length === 0) return null;

  const isCompleted = status === 'COMPLETED';
  const isRunning = status === 'RUNNING';
  
  const percentage = (currentEventIndex / Math.max(1, history.length - 1)) * 100;

  return (
    <div className="bg-[#14141f]/80 backdrop-blur-2xl border border-white/5 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl pointer-events-auto transition-all w-full relative group">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Playback Timeline</span>
          {isRunning && !isCompleted && (
            <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 animate-pulse">
              Running
            </span>
          )}
        </div>
        <span className="text-sm font-mono font-bold text-white tracking-widest">
          <span className="text-[#00f3ff]">{currentEventIndex.toString().padStart(4, '0')}</span> 
          <span className="text-gray-600 mx-1">/</span> 
          <span className="text-gray-400">{(history.length - 1).toString().padStart(4, '0')}</span>
        </span>
      </div>

      <div className="relative w-full h-8 flex items-center group-hover:h-10 transition-all">
        {/* Custom Track Background */}
        <div className="absolute left-0 w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          {/* Progress fill */}
          <div 
            className="h-full bg-gradient-to-r from-[#00f3ff] to-[#b026ff] transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Custom Thumb Glow (Follows the range input) */}
        <div 
          className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(0,243,255,0.8)] pointer-events-none transition-all duration-75 z-10"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />

        {/* The actual input overlay (invisible but interactive) */}
        <input
          type="range"
          min="0"
          max={Math.max(0, history.length - 1)}
          value={currentEventIndex}
          onChange={(e) => jumpToEvent(parseInt(e.target.value, 10))}
          disabled={isRunning && !isCompleted}
          className="absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
        />
      </div>

      {isRunning && !isCompleted && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-3 py-1 rounded backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
          Pause to scrub history
        </div>
      )}
    </div>
  );
}
