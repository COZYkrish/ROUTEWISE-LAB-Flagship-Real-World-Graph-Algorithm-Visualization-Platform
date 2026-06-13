import type { Edge } from '../../types/graph';

export type RouteProfileType = 'SHORTEST' | 'FASTEST' | 'ECO' | 'SCENIC';

export interface RouteProfile {
  name: string;
  evaluateCost: (edge: Edge) => number;
}

export const RouteProfiles: Record<RouteProfileType, RouteProfile> = {
  SHORTEST: {
    name: 'Shortest Distance',
    evaluateCost: (edge: Edge) => edge.distance,
  },
  FASTEST: {
    name: 'Fastest Travel Time',
    // travelTime is in seconds. trafficMultiplier increases travel time.
    evaluateCost: (edge: Edge) => edge.travelTime * edge.trafficMultiplier,
  },
  ECO: {
    name: 'Eco-Friendly (Fuel Efficient)',
    // Penalize heavy traffic as it increases fuel consumption.
    evaluateCost: (edge: Edge) => {
      const trafficPenalty = edge.trafficMultiplier > 1.2 ? Math.pow(edge.trafficMultiplier, 2) : 1;
      return edge.distance * trafficPenalty;
    },
  },
  SCENIC: {
    name: 'Scenic Route',
    // Prefer smaller roads with lower speed limits. Penalize motorways.
    evaluateCost: (edge: Edge) => {
      let penalty = 1.0;
      if (edge.roadType === 'motorway' || edge.roadType === 'trunk') penalty = 3.0;
      if (edge.roadType === 'primary') penalty = 2.0;
      if (edge.roadType === 'residential' || edge.roadType === 'unclassified') penalty = 0.8;
      
      return edge.distance * penalty * edge.trafficMultiplier;
    },
  }
};
