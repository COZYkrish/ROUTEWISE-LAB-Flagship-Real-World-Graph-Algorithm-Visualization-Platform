import { GraphAlgorithm } from '../base/GraphAlgorithm';
import { AlgorithmEventType } from '../../types/events';
import { PriorityQueue } from './Dijkstra';

export class AStar extends GraphAlgorithm {
  private heuristic(node1Id: string, node2Id: string): number {
    const n1 = this.graph.nodes.get(node1Id);
    const n2 = this.graph.nodes.get(node2Id);
    if (!n1 || !n2) return 0;
    
    // Haversine distance
    const R = 6371e3; // metres
    const lat1 = n1.lat * Math.PI/180;
    const lat2 = n2.lat * Math.PI/180;
    const deltaLat = (n2.lat - n1.lat) * Math.PI/180;
    const deltaLng = (n2.lng - n1.lng) * Math.PI/180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Convert heuristic distance to match the active route profile's cost scale roughly.
    // To remain admissible, it should underestimate the cost.
    // If FASTEST, divide by max possible speed limit (e.g. 130km/h -> 36m/s)
    if (this.profile.name === 'Fastest Travel Time') {
      return distance / 36.0; 
    }
    return distance;
  }

  async findPath(startNodeId: string, targetNodeId: string): Promise<string[] | null> {

    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    const previous = new Map<string, string>();
    const pq = new PriorityQueue<string>();
    const visited = new Set<string>();

    this.graph.nodes.forEach((_, id) => {
      gScore.set(id, Infinity);
      fScore.set(id, Infinity);
    });

    gScore.set(startNodeId, 0);
    fScore.set(startNodeId, this.heuristic(startNodeId, targetNodeId));
    pq.enqueue(startNodeId, fScore.get(startNodeId)!);

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
        cost: gScore.get(current)
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
        const neighborId = edge.target; // Directed edge

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

          const tentativeGScore = gScore.get(current)! + this.profile.evaluateCost(edge);
          
          if (tentativeGScore < gScore.get(neighborId)!) {
            previous.set(neighborId, current);
            gScore.set(neighborId, tentativeGScore);
            fScore.set(neighborId, tentativeGScore + this.heuristic(neighborId, targetNodeId));
            pq.enqueue(neighborId, fScore.get(neighborId)!);
          }
        }
      }

      iterations++;
    }
    return null;
  }
}
