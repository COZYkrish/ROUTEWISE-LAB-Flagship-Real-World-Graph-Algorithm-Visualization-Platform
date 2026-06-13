import { useEffect, useRef } from 'react';
import { useTraversalStore } from '../store';
import GraphWorker from '../workers/graph.worker?worker';

export function useGraphEngine() {
  const setGraph = useTraversalStore(state => state.setGraph);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new GraphWorker();
    
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'GRAPH_LOADED') {
        useTraversalStore.setState({
          nodes: payload.nodes,
          edges: payload.edges,
          adjacencyList: payload.adjacencyList,
          reverseAdjacencyList: payload.reverseAdjacencyList
        });
      }
    };

    workerRef.current.postMessage({ type: 'LOAD_GRAPH' });

    return () => {
      workerRef.current?.terminate();
    };
  }, [setGraph]);
}
