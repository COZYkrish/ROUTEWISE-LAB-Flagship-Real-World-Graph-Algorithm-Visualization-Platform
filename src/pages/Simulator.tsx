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
    <div className="w-screen h-screen flex relative overflow-hidden bg-[#0a0a0f] text-white font-sans">
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>
      
      {/* Left Sidebar (Command Center + Primary Telemetry) */}
      <div className="absolute top-6 left-6 z-10 w-80 flex flex-col gap-4 max-h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden pointer-events-none" style={{ scrollbarWidth: 'none' }}>
        
        {/* Configuration Control Panel */}
        <div className="bg-[#14141f]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col gap-6 transition-all pointer-events-auto shrink-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-[#00f3ff] via-[#3b82f6] to-[#b026ff] bg-clip-text text-transparent drop-shadow-sm">RouteWise</h1>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mt-1">Logistics Intelligence</p>
          </div>
          
          <div className="space-y-4">
            <AlgorithmSelector onStart={handleStart} />
            <PlaybackControls onPause={pause} onResume={resume} onCancel={cancel} />
          </div>
        </div>

        <div className="pointer-events-auto shrink-0">
          <MetricsOverlay side="primary" />
        </div>
      </div>

      {/* Right Sidebar (Secondary Telemetry) */}
      <div className="absolute top-6 right-6 z-10 w-80 pointer-events-none">
        <MetricsOverlay side="secondary" />
      </div>

      {/* Bottom Center: Timeline Scrubber */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[60vw] max-w-4xl">
        <HistoryScrubber />
      </div>
    </div>
  );
}
