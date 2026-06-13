import { useState } from 'react';
import { useTraversalStore } from '../../store';

interface AlgorithmSelectorProps {
  onStart: (primaryAlgo: string, secondaryAlgo?: string, profile?: string) => void;
}

export function AlgorithmSelector({ onStart }: AlgorithmSelectorProps) {
  const { status, nodes, comparisonMode, setComparisonMode } = useTraversalStore();
  const [selectedPrimary, setSelectedPrimary] = useState<string>('DIJKSTRA');
  const [selectedSecondary, setSelectedSecondary] = useState<string>('GREEDY');
  
  const isRunning = status !== 'IDLE' && status !== 'COMPLETED';

  const algos = [
    { id: 'DIJKSTRA', name: 'Dijkstra' },
    { id: 'ASTAR', name: 'A* Search' },
    { id: 'GREEDY', name: 'Greedy Best-First' },
    { id: 'BIDIRECTIONAL_DIJKSTRA', name: 'Bidirectional Dijkstra' },
    { id: 'BIDIRECTIONAL_ASTAR', name: 'Bidirectional A*' },
    { id: 'PRIM', name: 'Prim\'s MST' },
    { id: 'KRUSKAL', name: 'Kruskal\'s MST' },
    { id: 'TSP_GA', name: 'TSP (Genetic)' }
  ];

  const profiles = [
    { id: 'SHORTEST', name: 'Shortest Distance' },
    { id: 'FASTEST', name: 'Fastest Travel Time' },
    { id: 'ECO', name: 'Eco-Friendly' },
    { id: 'SCENIC', name: 'Scenic Route' }
  ];

  const [selectedProfile, setSelectedProfile] = useState<string>('SHORTEST');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-400 flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={comparisonMode}
            onChange={(e) => setComparisonMode(e.target.checked)}
            disabled={isRunning}
            className="accent-[#ff8c00]"
          />
          Compare Mode
        </label>
        
        <label className="text-xs text-gray-400 flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={useTraversalStore().visualizationMode === 'heatmap'}
            onChange={(e) => useTraversalStore.getState().setVisualizationMode(e.target.checked ? 'heatmap' : 'standard')}
            className="accent-[#00f3ff]"
          />
          Heatmap Density
        </label>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] uppercase text-[#00f3ff] font-semibold tracking-wider">Primary</span>
          <select 
            value={selectedPrimary}
            onChange={(e) => setSelectedPrimary(e.target.value)}
            disabled={isRunning}
            className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white outline-none focus:border-[#00f3ff]"
          >
            {algos.map(a => <option key={a.id} value={a.id} className="bg-bg-dark text-white">{a.name}</option>)}
          </select>
        </div>

        {comparisonMode && (
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] uppercase text-[#ff8c00] font-semibold tracking-wider">Secondary</span>
            <select 
              value={selectedSecondary}
              onChange={(e) => setSelectedSecondary(e.target.value)}
              disabled={isRunning}
              className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white outline-none focus:border-[#ff8c00]"
            >
              {algos.map(a => <option key={a.id} value={a.id} className="bg-bg-dark text-white">{a.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-2">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[10px] uppercase text-[#ff3366] font-semibold tracking-wider">Route Profile</span>
          <select 
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
            disabled={isRunning}
            className="w-full bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white outline-none focus:border-[#ff3366]"
          >
            {profiles.map(p => <option key={p.id} value={p.id} className="bg-bg-dark text-white">{p.name}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={() => onStart(selectedPrimary, comparisonMode ? selectedSecondary : undefined, selectedProfile)}
        disabled={isRunning || nodes.size === 0}
        className="w-full py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded text-xs font-medium transition-colors border border-white/10 mt-1"
      >
        Run {comparisonMode ? 'Race' : 'Algorithm'}
      </button>
    </div>
  );
}
