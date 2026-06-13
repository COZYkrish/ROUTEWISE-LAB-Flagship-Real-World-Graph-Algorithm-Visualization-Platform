import { Play, Pause, Square } from 'lucide-react';
import { useTraversalStore } from '../../store';

interface PlaybackControlsProps {
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export function PlaybackControls({ onPause, onResume, onCancel }: PlaybackControlsProps) {
  const { status, playbackSpeed, setPlaybackSpeed } = useTraversalStore();

  const isRunning = status === 'RUNNING';
  const isIdle = status === 'IDLE' || status === 'COMPLETED';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button
          onClick={isRunning ? onPause : onResume}
          disabled={isIdle}
          className="flex-1 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded flex items-center justify-center transition-colors border border-white/10"
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          onClick={onCancel}
          disabled={isIdle}
          className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 rounded flex items-center justify-center transition-colors border border-red-500/30 text-red-200"
        >
          <Square size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 w-12">Speed</span>
        <input 
          type="range" 
          min="0.1" 
          max="5" 
          step="0.1" 
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          className="flex-1 accent-[#00f3ff]"
        />
        <span className="text-xs font-mono text-[#00f3ff] w-8 text-right">{playbackSpeed.toFixed(1)}x</span>
      </div>
    </div>
  );
}
