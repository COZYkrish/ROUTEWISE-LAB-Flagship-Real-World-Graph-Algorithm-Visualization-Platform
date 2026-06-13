import MapView from '../components/map/MapView';
import { useGraphEngine } from '../hooks/useGraphEngine';
import { useAlgorithmEngine } from '../hooks/useAlgorithmEngine';
import { useTraversalStore } from '../store';
import { MetricsOverlay } from '../components/dashboard/MetricsOverlay';
import { AlgorithmSelector } from '../components/controls/AlgorithmSelector';
import { PlaybackControls } from '../components/controls/PlaybackControls';
import { HistoryScrubber } from '../components/controls/HistoryScrubber';

export default function Simulator() {
  useGraphEngine();
  const { startAlgorithm, pause, resume, cancel } = useAlgorithmEngine();
  const { nodes, selectedWaypoints } = useTraversalStore();

  const handleStart = (primaryAlgo: string, secondaryAlgo?: string, profile?: string) => {
    if (nodes.size === 0 || selectedWaypoints.length < 2) return;
    startAlgorithm(primaryAlgo, selectedWaypoints, secondaryAlgo, profile);
  };

  return (
    <div className="w-screen h-dvh flex relative overflow-hidden bg-[#0a0a0f] text-white font-sans">
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>
      
      {/* Top HUD Container for Mobile/Desktop */}
      <div className="absolute inset-x-3 top-3 md:inset-x-6 md:top-6 z-10 flex flex-col md:flex-row justify-between items-start pointer-events-none gap-3 md:gap-6">
        
        {/* Left Sidebar (Command Center + Primary Telemetry) */}
        <div className="w-full md:w-80 flex flex-col gap-3 md:gap-4 max-h-[50vh] md:max-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden pointer-events-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {/* Configuration Control Panel */}
          <div className="liquid-glass-strong rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col gap-4 md:gap-6 transition-all pointer-events-auto shrink-0 border border-white/10">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-br from-[#00f3ff] via-[#3b82f6] to-[#b026ff] bg-clip-text text-transparent drop-shadow-sm">RouteWise</h1>
              <p className="text-[10px] md:text-[11px] uppercase tracking-widest text-gray-400 font-semibold mt-1">Logistics Intelligence</p>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <AlgorithmSelector onStart={handleStart} />
              <PlaybackControls onPause={pause} onResume={resume} onCancel={cancel} />
            </div>
          </div>

          <div className="pointer-events-auto shrink-0">
            <MetricsOverlay side="primary" />
          </div>
        </div>

        {/* Right Sidebar (Secondary Telemetry) */}
        <div className="w-full md:w-80 pointer-events-none shrink-0 mt-auto md:mt-0">
          <MetricsOverlay side="secondary" />
        </div>
      </div>

      {/* Bottom Center: Timeline Scrubber */}
      <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:right-auto z-20 md:w-[60vw] max-w-4xl pointer-events-auto">
        <HistoryScrubber />
      </div>
    </div>
  );
}
