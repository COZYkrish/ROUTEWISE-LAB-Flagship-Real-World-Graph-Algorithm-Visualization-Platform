import { GraphAlgorithm } from '../base/GraphAlgorithm';
import { AlgorithmEventType } from '../../types/events';

class UnionFind {
  parent: Map<string, string>;
  rank: Map<string, number>;

  constructor(nodes: string[]) {
    this.parent = new Map();
    this.rank = new Map();
    nodes.forEach(n => {
      this.parent.set(n, n);
      this.rank.set(n, 0);
    });
  }

  find(i: string): string {
    let p = this.parent.get(i)!;
    if (p === i) return i;
    
    // Path compression
    const root = this.find(p);
    this.parent.set(i, root);
    return root;
  }

  union(i: string, j: string): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);

    if (rootI === rootJ) return false;

    const rankI = this.rank.get(rootI)!;
    const rankJ = this.rank.get(rootJ)!;

    if (rankI < rankJ) {
      this.parent.set(rootI, rootJ);
    } else if (rankI > rankJ) {
      this.parent.set(rootJ, rootI);
    } else {
      this.parent.set(rootJ, rootI);
      this.rank.set(rootI, rankI + 1);
    }
    return true;
  }
}

export class Kruskal extends GraphAlgorithm {
  async findPath(_startNodeId: string, _targetNodeId: string): Promise<string[] | null> {
    return null; // Structural algorithms don't find point-to-point paths
  }

  async execute(_waypoints: string[]): Promise<void> {
    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: AlgorithmEventType.SEARCH_STARTED
    });

    const nodes = Array.from(this.graph.nodes.keys());
    const edges = Array.from(this.graph.edges.values());
    
    const uf = new UnionFind(nodes);
    
    // Sort all edges by distance
    edges.sort((a, b) => a.distance - b.distance);

    const visited = new Set<string>();
    let iterations = 0;

    for (const edge of edges) {
      if (this.isCancelled) break;

      this.emitEvent({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: AlgorithmEventType.EDGE_EXPLORED,
        edgeId: edge.id
      });

      if (uf.union(edge.source, edge.target)) {
        if (!visited.has(edge.source)) {
          visited.add(edge.source);
          this.emitEvent({
            id: crypto.randomUUID(), timestamp: Date.now(), type: AlgorithmEventType.NODE_VISITED, nodeId: edge.source
          });
        }
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          this.emitEvent({
            id: crypto.randomUUID(), timestamp: Date.now(), type: AlgorithmEventType.NODE_VISITED, nodeId: edge.target
          });
        }

        this.emitEvent({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type: AlgorithmEventType.EDGE_ADDED_TO_TREE,
          edgeId: edge.id
        });
      }

      await this.yieldIfNecessary(iterations);
      iterations++;
    }

    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: AlgorithmEventType.ALGORITHM_COMPLETED
    });
  }
}
