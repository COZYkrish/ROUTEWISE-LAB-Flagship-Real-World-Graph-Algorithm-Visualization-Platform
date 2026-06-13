export const AlgorithmEventType = {
  SEARCH_STARTED: 'SEARCH_STARTED',
  NODE_VISITED: 'NODE_VISITED',
  EDGE_EXPLORED: 'EDGE_EXPLORED',
  EDGE_ADDED_TO_TREE: 'EDGE_ADDED_TO_TREE',
  FRONTIER_UPDATED: 'FRONTIER_UPDATED',
  PATH_IMPROVED: 'PATH_IMPROVED',
  WAYPOINTS_GENERATED: 'WAYPOINTS_GENERATED',
  CONVERGENCE_STARTED: 'CONVERGENCE_STARTED',
  GOAL_REACHED: 'GOAL_REACHED',
  ALGORITHM_COMPLETED: 'ALGORITHM_COMPLETED'
} as const;

export type AlgorithmEventTypeType = typeof AlgorithmEventType[keyof typeof AlgorithmEventType];

export interface AlgorithmEvent {
  id: string;
  timestamp: number;
  type: AlgorithmEventTypeType;
  runId?: string;
  nodeId?: string;
  edgeId?: string;
  cost?: number;
  metadata?: {
    distance?: number;
    eta?: number;
    path?: string[];
    waypoints?: string[];
    generation?: number;
    fitness?: number;
  };
}
