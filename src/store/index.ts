import { create } from 'zustand';
import type { Node, Edge } from '../types/graph';
import type { AlgorithmEvent } from '../types/events';
import { AlgorithmEventType } from '../types/events';

export interface LiveMetrics {
  nodesVisited: number;
  edgesExplored: number;
  frontierSize: number;
  currentCost: number;
  executionTimeMs: number;
  pathDistance?: number;
  pathETA?: number;
  generation?: number;
  fitness?: number;
}

export interface RunState {
  visitedNodes: Set<string>;
  exploredEdges: Set<string>;
  frontierNodes: Set<string>;
  treeEdges: Set<string>;
  waypoints: string[];
  bestPath: string[];
  heatmapDensity: Map<string, number>;
  metrics: LiveMetrics;
}

export interface Checkpoint {
  eventIndex: number;
  runs: Record<'primary' | 'secondary', {
    visitedNodes: string[];
    exploredEdges: string[];
    frontierNodes: string[];
    treeEdges: string[];
    waypoints: string[];
    bestPath: string[];
    heatmapDensity: [string, number][];
  }>;
}

export interface TraversalState {
  // Graph State
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
  adjacencyList: Map<string, string[]>;
  reverseAdjacencyList: Map<string, string[]>;
  
  comparisonMode: boolean;
  setComparisonMode: (mode: boolean) => void;

  selectedWaypoints: string[];
  setSelectedWaypoints: (waypoints: string[]) => void;
  addWaypoint: (nodeId: string) => void;
  removeWaypoint: (index: number) => void;
  clearWaypoints: () => void;

  visualizationMode: 'standard' | 'heatmap';
  setVisualizationMode: (mode: 'standard' | 'heatmap') => void;

  runs: Record<'primary' | 'secondary', RunState>;

  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  playbackSpeed: number;
  history: AlgorithmEvent[];
  checkpoints: Checkpoint[]; 
  currentEventIndex: number;

  primaryAlgorithm: string | null;
  secondaryAlgorithm: string | null;

  // Actions
  setGraph: (nodes: Map<string, Node>, edges: Map<string, Edge>, adjacencyList: Map<string, string[]>) => void;
  setAlgorithms: (primary: string, secondary?: string) => void;
  resetAlgorithmState: () => void;
  applyEventBatch: (events: AlgorithmEvent[]) => void;
  setStatus: (status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED') => void;
  setPlaybackSpeed: (speed: number) => void;
  jumpToEvent: (index: number) => void;
}

const initialRunState = (): RunState => ({
  visitedNodes: new Set(),
  exploredEdges: new Set(),
  frontierNodes: new Set(),
  treeEdges: new Set(),
  waypoints: [],
  bestPath: [],
  heatmapDensity: new Map(),
  metrics: { nodesVisited: 0, edgesExplored: 0, frontierSize: 0, currentCost: 0, executionTimeMs: 0 }
});

export const useTraversalStore = create<TraversalState>((set, get) => ({
  nodes: new Map(),
  edges: new Map(),
  adjacencyList: new Map(),
  reverseAdjacencyList: new Map(),
  
  comparisonMode: false,
  setComparisonMode: (comparisonMode) => set({ comparisonMode }),

  selectedWaypoints: [],
  setSelectedWaypoints: (selectedWaypoints) => set({ selectedWaypoints }),
  addWaypoint: (nodeId) => set((state) => ({ selectedWaypoints: [...state.selectedWaypoints, nodeId] })),
  removeWaypoint: (index) => set((state) => ({ 
    selectedWaypoints: state.selectedWaypoints.filter((_, i) => i !== index) 
  })),
  clearWaypoints: () => set({ selectedWaypoints: [] }),

  visualizationMode: 'standard',
  setVisualizationMode: (visualizationMode) => set({ visualizationMode }),

  runs: {
    primary: initialRunState(),
    secondary: initialRunState()
  },
  
  status: 'IDLE',
  playbackSpeed: 1,
  history: [],
  checkpoints: [],
  currentEventIndex: -1,
  
  primaryAlgorithm: null,
  secondaryAlgorithm: null,

  setGraph: (nodes, edges, adjacencyList) => set({ nodes, edges, adjacencyList }),
  setAlgorithms: (primary, secondary) => set({ primaryAlgorithm: primary, secondaryAlgorithm: secondary || null }),
  
  resetAlgorithmState: () => set({
    runs: {
      primary: initialRunState(),
      secondary: initialRunState()
    },
    status: 'IDLE',
    history: [],
    checkpoints: [],
    currentEventIndex: -1
  }),

  applyEventBatch: (events) => set((state) => {
    const newRuns: Record<'primary' | 'secondary', RunState> = {
      primary: {
        visitedNodes: new Set(state.runs.primary.visitedNodes),
        exploredEdges: new Set(state.runs.primary.exploredEdges),
        frontierNodes: new Set(state.runs.primary.frontierNodes),
        treeEdges: new Set(state.runs.primary.treeEdges),
        waypoints: [...state.runs.primary.waypoints],
        bestPath: [...state.runs.primary.bestPath],
        heatmapDensity: new Map(state.runs.primary.heatmapDensity),
        metrics: { ...state.runs.primary.metrics }
      },
      secondary: {
        visitedNodes: new Set(state.runs.secondary.visitedNodes),
        exploredEdges: new Set(state.runs.secondary.exploredEdges),
        frontierNodes: new Set(state.runs.secondary.frontierNodes),
        treeEdges: new Set(state.runs.secondary.treeEdges),
        waypoints: [...state.runs.secondary.waypoints],
        bestPath: [...state.runs.secondary.bestPath],
        heatmapDensity: new Map(state.runs.secondary.heatmapDensity),
        metrics: { ...state.runs.secondary.metrics }
      }
    };

    const newHistory = [...state.history];
    const newCheckpoints = [...state.checkpoints];

    for (const event of events) {
      newHistory.push(event);
      const eventIndex = newHistory.length - 1;
      const runId = (event.runId as 'primary' | 'secondary') || 'primary';
      const run = newRuns[runId];

      switch (event.type) {
        case AlgorithmEventType.NODE_VISITED:
          if (event.nodeId) {
            run.visitedNodes.add(event.nodeId);
            const currentDensity = run.heatmapDensity.get(event.nodeId) || 0;
            run.heatmapDensity.set(event.nodeId, currentDensity + 1);
          }
          break;
        case AlgorithmEventType.EDGE_EXPLORED:
          if (event.edgeId) run.exploredEdges.add(event.edgeId);
          break;
        case AlgorithmEventType.EDGE_ADDED_TO_TREE:
          if (event.edgeId) run.treeEdges.add(event.edgeId);
          break;
        case AlgorithmEventType.FRONTIER_UPDATED:
          if (event.nodeId) run.frontierNodes.add(event.nodeId);
          break;
        case AlgorithmEventType.GOAL_REACHED:
        case AlgorithmEventType.PATH_IMPROVED:
          if (event.metadata?.path) run.bestPath = event.metadata.path;
          if (event.metadata?.distance !== undefined) run.metrics.pathDistance = event.metadata.distance;
          if (event.metadata?.eta !== undefined) run.metrics.pathETA = event.metadata.eta;
          if (event.metadata?.generation !== undefined) run.metrics.generation = event.metadata?.generation;
          if (event.metadata?.fitness !== undefined) run.metrics.fitness = event.metadata?.fitness;
          break;
        case AlgorithmEventType.WAYPOINTS_GENERATED:
          if (event.metadata?.waypoints) run.waypoints = event.metadata?.waypoints;
          break;
        case AlgorithmEventType.ALGORITHM_COMPLETED:
        default:
          break;
      }

      run.metrics.nodesVisited = run.visitedNodes.size;
      run.metrics.edgesExplored = run.exploredEdges.size;
      run.metrics.frontierSize = run.frontierNodes.size;

      if (eventIndex > 0 && eventIndex % 2000 === 0) {
        newCheckpoints.push({
          eventIndex,
          runs: {
            primary: {
              visitedNodes: Array.from(newRuns.primary.visitedNodes),
              exploredEdges: Array.from(newRuns.primary.exploredEdges),
              frontierNodes: Array.from(newRuns.primary.frontierNodes),
              treeEdges: Array.from(newRuns.primary.treeEdges),
              waypoints: [...newRuns.primary.waypoints],
              bestPath: [...newRuns.primary.bestPath],
              heatmapDensity: Array.from(newRuns.primary.heatmapDensity.entries())
            },
            secondary: {
              visitedNodes: Array.from(newRuns.secondary.visitedNodes),
              exploredEdges: Array.from(newRuns.secondary.exploredEdges),
              frontierNodes: Array.from(newRuns.secondary.frontierNodes),
              treeEdges: Array.from(newRuns.secondary.treeEdges),
              waypoints: [...newRuns.secondary.waypoints],
              bestPath: [...newRuns.secondary.bestPath],
              heatmapDensity: Array.from(newRuns.secondary.heatmapDensity.entries())
            }
          }
        });
      }
    }

    return {
      runs: newRuns,
      history: newHistory,
      checkpoints: newCheckpoints,
      currentEventIndex: newHistory.length - 1
    };
  }),

  jumpToEvent: (targetIndex) => {
    const state = get();
    if (targetIndex < 0 || targetIndex >= state.history.length) return;

    let closestCheckpoint = null;
    for (let i = state.checkpoints.length - 1; i >= 0; i--) {
      if (state.checkpoints[i].eventIndex <= targetIndex) {
        closestCheckpoint = state.checkpoints[i];
        break;
      }
    }

    const newRuns: Record<'primary' | 'secondary', RunState> = {
      primary: {
        visitedNodes: new Set<string>(closestCheckpoint?.runs.primary.visitedNodes || []),
        exploredEdges: new Set<string>(closestCheckpoint?.runs.primary.exploredEdges || []),
        frontierNodes: new Set<string>(closestCheckpoint?.runs.primary.frontierNodes || []),
        treeEdges: new Set<string>(closestCheckpoint?.runs.primary.treeEdges || []),
        waypoints: [...(closestCheckpoint?.runs.primary.waypoints || [])],
        bestPath: [...(closestCheckpoint?.runs.primary.bestPath || [])],
        heatmapDensity: new Map(closestCheckpoint?.runs.primary.heatmapDensity || []),
        metrics: { ...state.runs.primary.metrics }
      },
      secondary: {
        visitedNodes: new Set<string>(closestCheckpoint?.runs.secondary.visitedNodes || []),
        exploredEdges: new Set<string>(closestCheckpoint?.runs.secondary.exploredEdges || []),
        frontierNodes: new Set<string>(closestCheckpoint?.runs.secondary.frontierNodes || []),
        treeEdges: new Set<string>(closestCheckpoint?.runs.secondary.treeEdges || []),
        waypoints: [...(closestCheckpoint?.runs.secondary.waypoints || [])],
        bestPath: [...(closestCheckpoint?.runs.secondary.bestPath || [])],
        heatmapDensity: new Map(closestCheckpoint?.runs.secondary.heatmapDensity || []),
        metrics: { ...state.runs.secondary.metrics }
      }
    };

    const startIndex = closestCheckpoint ? closestCheckpoint.eventIndex + 1 : 0;

    for (let i = startIndex; i <= targetIndex; i++) {
      const event = state.history[i];
      const runId = (event.runId as 'primary' | 'secondary') || 'primary';
      const run = newRuns[runId];

      switch (event.type) {
        case AlgorithmEventType.NODE_VISITED:
          if (event.nodeId) {
            run.visitedNodes.add(event.nodeId);
            const currentDensity = run.heatmapDensity.get(event.nodeId) || 0;
            run.heatmapDensity.set(event.nodeId, currentDensity + 1);
          }
          break;
        case AlgorithmEventType.EDGE_EXPLORED:
          if (event.edgeId) run.exploredEdges.add(event.edgeId);
          break;
        case AlgorithmEventType.EDGE_ADDED_TO_TREE:
          if (event.edgeId) run.treeEdges.add(event.edgeId);
          break;
        case AlgorithmEventType.FRONTIER_UPDATED:
          if (event.nodeId) run.frontierNodes.add(event.nodeId);
          break;
        case AlgorithmEventType.GOAL_REACHED:
        case AlgorithmEventType.PATH_IMPROVED:
          if (event.metadata?.path) run.bestPath = event.metadata.path;
          if (event.metadata?.distance !== undefined) run.metrics.pathDistance = event.metadata.distance;
          if (event.metadata?.eta !== undefined) run.metrics.pathETA = event.metadata.eta;
          if (event.metadata?.generation !== undefined) run.metrics.generation = event.metadata?.generation;
          if (event.metadata?.fitness !== undefined) run.metrics.fitness = event.metadata?.fitness;
          break;
        case AlgorithmEventType.WAYPOINTS_GENERATED:
          if (event.metadata?.waypoints) run.waypoints = event.metadata?.waypoints;
          break;
        default:
          break;
      }
    }

    newRuns.primary.metrics.nodesVisited = newRuns.primary.visitedNodes.size;
    newRuns.primary.metrics.edgesExplored = newRuns.primary.exploredEdges.size;
    newRuns.primary.metrics.frontierSize = newRuns.primary.frontierNodes.size;
    
    newRuns.secondary.metrics.nodesVisited = newRuns.secondary.visitedNodes.size;
    newRuns.secondary.metrics.edgesExplored = newRuns.secondary.exploredEdges.size;
    newRuns.secondary.metrics.frontierSize = newRuns.secondary.frontierNodes.size;

    set({
      runs: newRuns,
      currentEventIndex: targetIndex,
    });
  },

  setStatus: (status) => set({ status }),
  setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed })
}));
