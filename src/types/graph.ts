export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Node {
  id: string;
  lat: number;
  lng: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  distance: number;
  geometry?: Coordinate[];
  roadType: string;
  oneWay: boolean;
  speedLimit: number;
  travelTime: number;
  trafficMultiplier: number;
}

export interface GraphChunk {
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  nodes: Node[];
  edges: Edge[];
}

export interface GraphData {
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
  adjacencyList: Map<string, string[]>;
  reverseAdjacencyList: Map<string, string[]>;
}
