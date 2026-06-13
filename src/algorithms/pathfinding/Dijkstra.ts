import { GraphAlgorithm } from '../base/GraphAlgorithm';
import { AlgorithmEventType } from '../../types/events';

// Simplified PriorityQueue
export class PriorityQueue<T> {
  private elements: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority); 
  }

  dequeue(): T | undefined {
    return this.elements.shift()?.item;
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }
}

export class Dijkstra extends GraphAlgorithm {
  async findPath(startNodeId: string, targetNodeId: string): Promise<string[] | null> {

    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const pq = new PriorityQueue<string>();
    const visited = new Set<string>();

    this.graph.nodes.forEach((_, id) => distances.set(id, Infinity));
    distances.set(startNodeId, 0);
    pq.enqueue(startNodeId, 0);

    let iterations = 0;

    while (!pq.isEmpty()) {
      await this.yieldIfNecessary(iterations);

      const current = pq.dequeue()!;

      if (visited.has(current)) continue;
      
      visited.add(current);

      this.emitEvent({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: AlgorithmEventType.NODE_VISITED,
        nodeId: current,
        cost: distances.get(current)
      });

      if (current === targetNodeId) {
        const path = [];
        let curr: string | undefined = current;
        while (curr) {
          path.unshift(curr);
          curr = previous.get(curr);
        }
        return path;
      }

      const neighborsEdges = this.graph.adjacencyList.get(current) || [];

      for (const edgeId of neighborsEdges) {
        const edge = this.graph.edges.get(edgeId)!;
        
        // Since we explicitly build directed edges in OSM pipeline
        // adjacencyList only contains edges where edge.source === current
        const neighborId = edge.target;

        if (!visited.has(neighborId)) {
          this.emitEvent({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: AlgorithmEventType.EDGE_EXPLORED,
            edgeId: edge.id
          });
          
          this.emitEvent({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: AlgorithmEventType.FRONTIER_UPDATED,
            nodeId: neighborId
          });

          const alt = distances.get(current)! + this.profile.evaluateCost(edge);
          if (alt < distances.get(neighborId)!) {
            distances.set(neighborId, alt);
            previous.set(neighborId, current);
            pq.enqueue(neighborId, alt);
          }
        }
      }

      iterations++;
    }
    return null;
  }
}
