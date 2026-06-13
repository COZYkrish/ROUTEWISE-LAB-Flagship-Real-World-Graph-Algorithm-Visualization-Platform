import { GraphAlgorithm } from '../base/GraphAlgorithm';
import { AlgorithmEventType } from '../../types/events';
import { PriorityQueue } from './Dijkstra';

export class BidirectionalAStar extends GraphAlgorithm {
  private heuristic(node1Id: string, node2Id: string): number {
    const n1 = this.graph.nodes.get(node1Id);
    const n2 = this.graph.nodes.get(node2Id);
    if (!n1 || !n2) return 0;
    
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
    
    if (this.profile.name === 'Fastest Travel Time') {
      return distance / 36.0; 
    }
    return distance;
  }

  async findPath(startNodeId: string, targetNodeId: string): Promise<string[] | null> {

    const gScoreF = new Map<string, number>();
    const gScoreB = new Map<string, number>();
    const previousF = new Map<string, string>();
    const previousB = new Map<string, string>();
    
    const pqF = new PriorityQueue<string>();
    const pqB = new PriorityQueue<string>();
    
    const visitedF = new Set<string>();
    const visitedB = new Set<string>();

    this.graph.nodes.forEach((_, id) => {
      gScoreF.set(id, Infinity);
      gScoreB.set(id, Infinity);
    });

    gScoreF.set(startNodeId, 0);
    gScoreB.set(targetNodeId, 0);

    pqF.enqueue(startNodeId, this.heuristic(startNodeId, targetNodeId));
    pqB.enqueue(targetNodeId, this.heuristic(targetNodeId, startNodeId));

    let iterations = 0;
    let meetingNode: string | null = null;
    let bestPathCost = Infinity;

    while (!pqF.isEmpty() && !pqB.isEmpty()) {
      if (this.isCancelled) break;
      await this.yieldIfNecessary(iterations);

      // Expand Forward
      if (!pqF.isEmpty()) {
        const currF = pqF.dequeue()!;
        if (!visitedF.has(currF)) {
          visitedF.add(currF);
          this.emitEvent({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: AlgorithmEventType.NODE_VISITED,
            nodeId: currF
          });

          if (visitedB.has(currF)) {
            const cost = gScoreF.get(currF)! + gScoreB.get(currF)!;
            if (cost < bestPathCost) {
              bestPathCost = cost;
              meetingNode = currF;
            }
          }

          const neighborsEdgesF = this.graph.adjacencyList.get(currF) || [];
          for (const edgeId of neighborsEdgesF) {
            const edge = this.graph.edges.get(edgeId)!;
            const neighborId = edge.target; // Directed edge

            if (!visitedF.has(neighborId)) {
              this.emitEvent({
                id: crypto.randomUUID(), timestamp: Date.now(), type: AlgorithmEventType.EDGE_EXPLORED, edgeId
              });
              this.emitEvent({
                id: crypto.randomUUID(), timestamp: Date.now(), type: AlgorithmEventType.FRONTIER_UPDATED, nodeId: neighborId
              });

              const alt = gScoreF.get(currF)! + this.profile.evaluateCost(edge);
              if (alt < gScoreF.get(neighborId)!) {
                gScoreF.set(neighborId, alt);
                previousF.set(neighborId, currF);
                pqF.enqueue(neighborId, alt + this.heuristic(neighborId, targetNodeId));
              }
            }
          }
        }
      }

      await this.yieldIfNecessary(iterations);

      // Expand Backward
      if (!pqB.isEmpty()) {
        const currB = pqB.dequeue()!;
        if (!visitedB.has(currB)) {
          visitedB.add(currB);
          this.emitEvent({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: AlgorithmEventType.NODE_VISITED,
            nodeId: currB
          });

          if (visitedF.has(currB)) {
            const cost = gScoreF.get(currB)! + gScoreB.get(currB)!;
            if (cost < bestPathCost) {
              bestPathCost = cost;
              meetingNode = currB;
            }
          }

          // For backward search on a directed graph, we must look at edges entering currB.
          const neighborsEdgesB = this.graph.reverseAdjacencyList.get(currB) || [];
          for (const edgeId of neighborsEdgesB) {
            const edge = this.graph.edges.get(edgeId)!;
            const neighborId = edge.source; // Edge is source -> currB

            if (!visitedB.has(neighborId)) {
              this.emitEvent({
                id: crypto.randomUUID(), timestamp: Date.now(), type: AlgorithmEventType.EDGE_EXPLORED, edgeId
              });
              this.emitEvent({
                id: crypto.randomUUID(), timestamp: Date.now(), type: AlgorithmEventType.FRONTIER_UPDATED, nodeId: neighborId
              });

              const alt = gScoreB.get(currB)! + this.profile.evaluateCost(edge);
              if (alt < gScoreB.get(neighborId)!) {
                gScoreB.set(neighborId, alt);
                previousB.set(neighborId, currB);
                pqB.enqueue(neighborId, alt + this.heuristic(neighborId, startNodeId));
              }
            }
          }
        }
      }

      iterations++;

      if (meetingNode) {
        break;
      }
    }

    if (meetingNode && !this.isCancelled) {
      const path = [];
      let curr: string | undefined = meetingNode;
      while (curr) {
        path.unshift(curr);
        curr = previousF.get(curr);
      }
      
      curr = previousB.get(meetingNode);
      while (curr) {
        path.push(curr);
        curr = previousB.get(curr);
      }
      
        return path;
    }
    return null;
  }
}
