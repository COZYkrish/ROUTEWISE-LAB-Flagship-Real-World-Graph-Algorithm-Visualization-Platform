import { useEffect, useRef } from 'react';
import { useTraversalStore } from '../store';
import AlgorithmWorker from '../workers/algorithm.worker?worker';

export function useAlgorithmEngine() {
  const { applyEventBatch, nodes, edges, adjacencyList, reverseAdjacencyList, comparisonMode } = useTraversalStore();
  const primaryWorkerRef = useRef<Worker | null>(null);
  const secondaryWorkerRef = useRef<Worker | null>(null);

  useEffect(() => {
    primaryWorkerRef.current = new AlgorithmWorker();
    secondaryWorkerRef.current = new AlgorithmWorker();
    
    primaryWorkerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'EVENT_BATCH') {
        const events = payload.map((ev: any) => ({ ...ev, runId: 'primary' }));
        applyEventBatch(events);
      }
    };

    secondaryWorkerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'EVENT_BATCH') {
        const events = payload.map((ev: any) => ({ ...ev, runId: 'secondary' }));
        applyEventBatch(events);
      }
    };

    return () => {
      primaryWorkerRef.current?.terminate();
      secondaryWorkerRef.current?.terminate();
    };
  }, [applyEventBatch]);

  // Handle speed changes
  const playbackSpeed = useTraversalStore(state => state.playbackSpeed);
  useEffect(() => {
    primaryWorkerRef.current?.postMessage({ type: 'SET_SPEED', payload: playbackSpeed });
    secondaryWorkerRef.current?.postMessage({ type: 'SET_SPEED', payload: playbackSpeed });
  }, [playbackSpeed]);

  useEffect(() => {
    if (nodes.size > 0 && edges.size > 0 && adjacencyList.size > 0) {
      const payload = { nodes, edges, adjacencyList, reverseAdjacencyList };
      primaryWorkerRef.current?.postMessage({ type: 'SET_GRAPH', payload });
      secondaryWorkerRef.current?.postMessage({ type: 'SET_GRAPH', payload });
    }
  }, [nodes, edges, adjacencyList, reverseAdjacencyList]);

  const startAlgorithm = (algorithmName: string, waypoints: string[], secondaryAlgorithmName?: string, routeProfile?: string) => {
    useTraversalStore.getState().resetAlgorithmState();
    useTraversalStore.getState().setAlgorithms(algorithmName, secondaryAlgorithmName);
    useTraversalStore.getState().setStatus('RUNNING');
    
    primaryWorkerRef.current?.postMessage({
      type: 'START_ALGORITHM',
      payload: { algorithmName, waypoints, routeProfile }
    });

    if (comparisonMode && secondaryAlgorithmName) {
      secondaryWorkerRef.current?.postMessage({
        type: 'START_ALGORITHM',
        payload: { algorithmName: secondaryAlgorithmName, waypoints, routeProfile }
      });
    }
  };

  const pause = () => {
    useTraversalStore.getState().setStatus('PAUSED');
    primaryWorkerRef.current?.postMessage({ type: 'PAUSE' });
    secondaryWorkerRef.current?.postMessage({ type: 'PAUSE' });
  };

  const resume = () => {
    useTraversalStore.getState().setStatus('RUNNING');
    primaryWorkerRef.current?.postMessage({ type: 'RESUME' });
    secondaryWorkerRef.current?.postMessage({ type: 'RESUME' });
  };

  const cancel = () => {
    useTraversalStore.getState().setStatus('IDLE');
    primaryWorkerRef.current?.postMessage({ type: 'STOP' });
    secondaryWorkerRef.current?.postMessage({ type: 'STOP' });
  };

  return { startAlgorithm, pause, resume, cancel };
}
