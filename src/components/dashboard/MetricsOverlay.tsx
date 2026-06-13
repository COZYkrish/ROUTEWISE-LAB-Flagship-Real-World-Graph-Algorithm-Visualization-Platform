import { useTraversalStore } from '../../store';

export function MetricsOverlay({ side }: { side: 'primary' | 'secondary' }) {
  const { runs, status, comparisonMode } = useTraversalStore();
  
  if (side === 'secondary' && !comparisonMode) return null;

  const run = side === 'primary' ? runs.primary : runs.secondary;
  const isPrimary = side === 'primary';
  const colorClass = isPrimary ? 'text-[#00f3ff]' : 'text-[#ff8c00]';
  const label = isPrimary ? 'Primary Algorithm' : 'Secondary Algorithm';

  return (
    <div className="bg-[#14141f]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col gap-3 shadow-2xl pointer-events-auto">
      <div className="flex justify-between items-center border-b border-white/10 pb-2">
        <span className={`text-xs font-bold uppercase tracking-widest ${colorClass}`}>{label}</span>
        {isPrimary && <span className="font-mono text-white text-[10px] bg-white/10 px-2 py-0.5 rounded-full">{status}</span>}
      </div>
      
      {run.metrics.generation !== undefined ? (
        <>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs font-medium">Generation</span>
            <span className={`font-mono text-sm ${colorClass}`}>{run.metrics.generation}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs font-medium">Best Fitness</span>
            <span className={`font-mono text-sm ${colorClass}`}>{(run.metrics.fitness || 0).toFixed(2)}</span>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs font-medium">Nodes Visited</span>
            <span className={`font-mono text-sm ${colorClass}`}>{run.visitedNodes.size.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs font-medium">Edges Explored</span>
            <span className={`font-mono text-sm ${colorClass}`}>{run.exploredEdges.size.toLocaleString()}</span>
          </div>
          {run.metrics.pathDistance !== undefined && (
            <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-1">
              <span className="text-gray-400 text-xs font-medium">Total Distance</span>
              <span className={`font-mono text-sm ${colorClass}`}>{(run.metrics.pathDistance / 1000).toFixed(2)} km</span>
            </div>
          )}
          {run.metrics.pathETA !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-xs font-medium">Estimated ETA</span>
              <span className={`font-mono text-sm ${colorClass}`}>{Math.ceil(run.metrics.pathETA / 60)} min</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
