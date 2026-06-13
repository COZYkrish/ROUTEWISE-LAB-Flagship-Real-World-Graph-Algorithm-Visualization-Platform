import type { GraphData, Node, Edge, GraphChunk } from '../types/graph';

async function loadGraphData(): Promise<GraphData> {
  const nodes = new Map<string, Node>();
  const edges = new Map<string, Edge>();
  const adjacencyList = new Map<string, string[]>();

  try {
    // Fetch the chunked OSM network
    const response = await fetch('/data/road_network.json');
    if (!response.ok) {
      throw new Error(`Failed to load graph data: ${response.statusText}`);
    }
    const chunk: GraphChunk = await response.json();

    const reverseAdjacencyList = new Map<string, string[]>();

    for (const node of chunk.nodes) {
      nodes.set(node.id, node);
      adjacencyList.set(node.id, []);
      reverseAdjacencyList.set(node.id, []);
    }

    for (const edge of chunk.edges) {
      edges.set(edge.id, edge);
      
      if (adjacencyList.has(edge.source)) {
        adjacencyList.get(edge.source)!.push(edge.id);
      } else {
        adjacencyList.set(edge.source, [edge.id]);
      }

      if (reverseAdjacencyList.has(edge.target)) {
        reverseAdjacencyList.get(edge.target)!.push(edge.id);
      } else {
        reverseAdjacencyList.set(edge.target, [edge.id]);
      }
    }

    return { nodes, edges, adjacencyList, reverseAdjacencyList };
  } catch (err) {
    console.error('Error in GraphWorker:', err);
    throw err;
  }
}

self.onmessage = async (e: MessageEvent) => {
  const { type } = e.data;

  if (type === 'LOAD_GRAPH') {
    try {
      const graph = await loadGraphData();
      
      self.postMessage({
        type: 'GRAPH_LOADED',
        payload: {
          nodes: graph.nodes,
          edges: graph.edges,
          adjacencyList: graph.adjacencyList,
          reverseAdjacencyList: graph.reverseAdjacencyList
        }
      });
    } catch (err) {
      self.postMessage({
        type: 'GRAPH_ERROR',
        payload: { message: (err as Error).message }
      });
    }
  }
};
