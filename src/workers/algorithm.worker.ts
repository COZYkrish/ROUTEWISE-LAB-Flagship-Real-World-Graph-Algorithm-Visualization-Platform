import type { GraphData } from '../types/graph';
import type { AlgorithmEvent } from '../types/events';
import { Dijkstra } from '../algorithms/pathfinding/Dijkstra';
import { AStar } from '../algorithms/pathfinding/AStar';
import { GreedyBFS } from '../algorithms/pathfinding/GreedyBFS';
import { BidirectionalAStar } from '../algorithms/pathfinding/BidirectionalAStar';
import { BidirectionalDijkstra } from '../algorithms/pathfinding/BidirectionalDijkstra';
import { Prim } from '../algorithms/structural/Prim';
import { Kruskal } from '../algorithms/structural/Kruskal';
import { GeneticTSP } from '../algorithms/optimization/GeneticTSP';
import { GraphAlgorithm } from '../algorithms/base/GraphAlgorithm';

let currentGraph: GraphData | null = null;
let currentAlgorithm: GraphAlgorithm | null = null;

let eventBuffer: AlgorithmEvent[] = [];
const BATCH_SIZE = 50;

function flushEvents() {
  if (eventBuffer.length > 0) {
    self.postMessage({ type: 'EVENT_BATCH', payload: eventBuffer });
    eventBuffer = [];
  }
}

setInterval(flushEvents, 50);

const emitEvent = (event: AlgorithmEvent) => {
  eventBuffer.push(event);
  if (eventBuffer.length >= BATCH_SIZE) {
    flushEvents();
  }
};

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'SET_GRAPH':
      currentGraph = payload;
      break;

    case 'START_ALGORITHM':
      if (!currentGraph) return;
      if (currentAlgorithm) {
        currentAlgorithm.cancel();
      }
      
      const { algorithmName, waypoints, routeProfile } = payload;
      
      if (algorithmName === 'DIJKSTRA') {
        currentAlgorithm = new Dijkstra(currentGraph, emitEvent, routeProfile);
      } else if (algorithmName === 'ASTAR') {
        currentAlgorithm = new AStar(currentGraph, emitEvent, routeProfile);
      } else if (algorithmName === 'GREEDY') {
        currentAlgorithm = new GreedyBFS(currentGraph, emitEvent, routeProfile);
      } else if (algorithmName === 'BIDIRECTIONAL_ASTAR') {
        currentAlgorithm = new BidirectionalAStar(currentGraph, emitEvent, routeProfile);
      } else if (algorithmName === 'BIDIRECTIONAL_DIJKSTRA') {
        currentAlgorithm = new BidirectionalDijkstra(currentGraph, emitEvent, routeProfile);
      } else if (algorithmName === 'PRIM') {
        currentAlgorithm = new Prim(currentGraph, emitEvent);
      } else if (algorithmName === 'KRUSKAL') {
        currentAlgorithm = new Kruskal(currentGraph, emitEvent);
      } else if (algorithmName === 'TSP_GA') {
        currentAlgorithm = new GeneticTSP(currentGraph, emitEvent);
      }
      
      if (currentAlgorithm) {
        currentAlgorithm.execute(waypoints).catch(err => {
          console.error("Algorithm Error:", err);
        });
      }
      break;

    case 'PAUSE':
      if (currentAlgorithm) currentAlgorithm.pause();
      break;

    case 'RESUME':
      if (currentAlgorithm) currentAlgorithm.resume();
      break;

    case 'STOP':
      if (currentAlgorithm) currentAlgorithm.cancel();
      break;

    case 'SET_SPEED':
      if (currentAlgorithm) currentAlgorithm.setSpeed(payload);
      break;
  }
};
