import type { GraphData } from '../../types/graph';
import type { AlgorithmEvent } from '../../types/events';
import { AlgorithmEventType } from '../../types/events';
import type { RouteProfile, RouteProfileType } from '../../features/routing/routeProfiles';
import { RouteProfiles } from '../../features/routing/routeProfiles';

export abstract class GraphAlgorithm {
  protected graph: GraphData;
  protected emitEvent: (event: AlgorithmEvent) => void;
  protected isPaused: boolean = false;
  protected isCancelled: boolean = false;
  protected speed: number = 1;
  protected profile: RouteProfile;

  constructor(graph: GraphData, emitEvent: (event: AlgorithmEvent) => void, profileType: RouteProfileType = 'SHORTEST') {
    this.graph = graph;
    this.emitEvent = emitEvent;
    this.profile = RouteProfiles[profileType];
  }

  abstract findPath(startNodeId: string, targetNodeId: string): Promise<string[] | null>;

  async execute(waypoints: string[]): Promise<void> {
    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: AlgorithmEventType.SEARCH_STARTED
    });

    let fullPath: string[] = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      if (this.isCancelled) break;
      const start = waypoints[i];
      const target = waypoints[i+1];
      
      const segmentPath = await this.findPath(start, target);
      if (segmentPath && segmentPath.length > 0) {
        if (i > 0) {
          fullPath.push(...segmentPath.slice(1));
        } else {
          fullPath.push(...segmentPath);
        }
        
        const { distance, eta } = this.calculatePathMetrics(fullPath);

        this.emitEvent({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type: AlgorithmEventType.GOAL_REACHED,
          metadata: { path: [...fullPath], distance, eta }
        });
      } else {
        break; // Path not found
      }
    }

    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: AlgorithmEventType.ALGORITHM_COMPLETED
    });
  }

  protected calculatePathMetrics(path: string[]): { distance: number, eta: number } {
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i+1];
      
      // Find the edge connecting u and v
      const neighbors = this.graph.adjacencyList.get(u) || [];
      let connectingEdge = null;
      for (const edgeId of neighbors) {
        const edge = this.graph.edges.get(edgeId)!;
        if (edge.target === v) {
          connectingEdge = edge;
          break;
        }
      }

      if (connectingEdge) {
        totalDistance += connectingEdge.distance;
        totalTime += connectingEdge.travelTime;
      }
    }

    return { distance: totalDistance, eta: totalTime };
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  public cancel() {
    this.isCancelled = true;
  }

  public setSpeed(speed: number) {
    this.speed = speed;
  }

  protected async yieldIfNecessary(iterations: number): Promise<void> {
    if (this.isCancelled) throw new Error("Algorithm Cancelled");

    // Handle pause
    while (this.isPaused && !this.isCancelled) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Dynamic batch size based on speed (higher speed = larger batch before yielding)
    const baseBatch = 30;
    const batchSize = this.speed >= 1 ? Math.floor(baseBatch * this.speed) : Math.max(1, Math.floor(baseBatch * this.speed));
    
    if (iterations % batchSize === 0) {
      // Delay to visually slow down if speed < 1
      const delay = this.speed < 1 ? Math.floor(10 / this.speed) : 0;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  protected async checkYield(): Promise<void> {
    if (this.isCancelled) {
      throw new Error("Algorithm Cancelled");
    }
    
    while (this.isPaused && !this.isCancelled) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}
