import { GraphAlgorithm } from '../base/GraphAlgorithm';
import { AlgorithmEventType } from '../../types/events';

class PrimEdgeQueue {
  private elements: { edgeId: string; weight: number }[] = [];

  enqueue(edgeId: string, weight: number) {
    this.elements.push({ edgeId, weight });
    this.elements.sort((a, b) => a.weight - b.weight); // simple array sort for PQ, acceptable for this scale
  }

  dequeue() {
    return this.elements.shift();
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}

export class Prim extends GraphAlgorithm {
  async findPath(_startNodeId: string, _targetNodeId: string): Promise<string[] | null> {
    return null; // Structural algorithms don't find point-to-point paths
  }

  async execute(waypoints: string[]): Promise<void> {
    if (waypoints.length === 0) return;
    const startNodeId = waypoints[0];
    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: AlgorithmEventType.SEARCH_STARTED
    });

    const pq = new PrimEdgeQueue();
    const visited = new Set<string>();

    visited.add(startNodeId);
    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: AlgorithmEventType.NODE_VISITED,
      nodeId: startNodeId
    });

    const startNeighbors = this.graph.adjacencyList.get(startNodeId) || [];
    for (const edgeId of startNeighbors) {
      const edge = this.graph.edges.get(edgeId)!;
      pq.enqueue(edgeId, edge.distance);
      this.emitEvent({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: AlgorithmEventType.EDGE_EXPLORED,
        edgeId: edgeId
      });
    }

    let iterations = 0;

    while (!pq.isEmpty()) {
      if (this.isCancelled) break;
      await this.yieldIfNecessary(iterations);

      const minEdgeRef = pq.dequeue()!;
      const edge = this.graph.edges.get(minEdgeRef.edgeId)!;
      
      const unvisitedNode = !visited.has(edge.source) ? edge.source : 
                            !visited.has(edge.target) ? edge.target : null;

      if (unvisitedNode) {
        visited.add(unvisitedNode);
        
        this.emitEvent({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type: AlgorithmEventType.NODE_VISITED,
          nodeId: unvisitedNode
        });

        this.emitEvent({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type: AlgorithmEventType.EDGE_ADDED_TO_TREE,
          edgeId: edge.id
        });

        const neighbors = this.graph.adjacencyList.get(unvisitedNode) || [];
        for (const nextEdgeId of neighbors) {
          const nextEdge = this.graph.edges.get(nextEdgeId)!;
          const neighborId = nextEdge.source === unvisitedNode ? nextEdge.target : nextEdge.source;
          
          if (!visited.has(neighborId)) {
            pq.enqueue(nextEdgeId, nextEdge.distance);
            this.emitEvent({
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              type: AlgorithmEventType.EDGE_EXPLORED,
              edgeId: nextEdgeId
            });
            this.emitEvent({
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              type: AlgorithmEventType.FRONTIER_UPDATED,
              nodeId: neighborId
            });
          }
        }
      }

      iterations++;
    }

    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: AlgorithmEventType.ALGORITHM_COMPLETED
    });
  }
}
