import { GraphAlgorithm } from '../base/GraphAlgorithm';
import { AlgorithmEventType } from '../../types/events';

interface TSPPath {
  distance: number;
  path: string[];
}

interface Individual {
  route: string[];
  fitness: number;
}

export class GeneticTSP extends GraphAlgorithm {
  private distanceMatrix: Map<string, Map<string, TSPPath>> = new Map();

  async findPath(_startNodeId: string, _targetNodeId: string): Promise<string[] | null> {
    return null; // Structural algorithms don't find point-to-point paths
  }

  async execute(waypoints: string[]): Promise<void> {
    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: AlgorithmEventType.SEARCH_STARTED
    });

    if (waypoints.length < 3) {
      this.emitEvent({ id: crypto.randomUUID(), timestamp: Date.now(), type: AlgorithmEventType.ALGORITHM_COMPLETED });
      return;
    }

    const POPULATION_SIZE = 100;
    const MAX_GENERATIONS = 200;
    const MUTATION_RATE = 0.1;

    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: AlgorithmEventType.WAYPOINTS_GENERATED,
      metadata: { waypoints }
    });

    // 2. Precompute all-pairs shortest paths between waypoints
    for (let i = 0; i < waypoints.length; i++) {
      this.distanceMatrix.set(waypoints[i], new Map());
      for (let j = 0; j < waypoints.length; j++) {
        if (i !== j) {
          const pathResult = this.computeShortestPath(waypoints[i], waypoints[j]);
          this.distanceMatrix.get(waypoints[i])!.set(waypoints[j], pathResult);
        }
      }
    }

    // 3. Initialize Population
    let population: Individual[] = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      const route = [...waypoints];
      this.shuffle(route);
      population.push({ route, fitness: this.evaluateRoute(route) });
    }
    
    population.sort((a, b) => a.fitness - b.fitness);

    let bestOverallRoute = population[0].route;
    let bestOverallFitness = population[0].fitness;

    // 4. Evolution Loop
    for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
      if (this.isCancelled) break;

      const newPopulation: Individual[] = [];

      // Elitism: keep top 10%
      const eliteCount = Math.floor(POPULATION_SIZE * 0.1);
      for (let i = 0; i < eliteCount; i++) {
        newPopulation.push(population[i]);
      }

      // Crossover and Mutation
      while (newPopulation.length < POPULATION_SIZE) {
        const parent1 = this.tournamentSelection(population);
        const parent2 = this.tournamentSelection(population);

        const childRoute = this.orderCrossover(parent1.route, parent2.route);
        this.mutate(childRoute, MUTATION_RATE);

        newPopulation.push({ route: childRoute, fitness: this.evaluateRoute(childRoute) });
      }

      population = newPopulation;
      population.sort((a, b) => a.fitness - b.fitness);

      // Check for improvement
      if (population[0].fitness < bestOverallFitness) {
        bestOverallFitness = population[0].fitness;
        bestOverallRoute = population[0].route;
      }

      // Emit the best path every generation so user can watch evolution
      const fullPath = this.buildFullPath(bestOverallRoute);
      this.emitEvent({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type: AlgorithmEventType.PATH_IMPROVED,
        metadata: {
          path: fullPath,
          generation: generation + 1,
          fitness: bestOverallFitness
        }
      });

      // Artificial delay to make evolution visible
      await new Promise(resolve => setTimeout(resolve, 50));
      await this.yieldIfNecessary(generation);
    }

    this.emitEvent({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: AlgorithmEventType.ALGORITHM_COMPLETED
    });
  }

  private computeShortestPath(start: string, target: string): TSPPath {
    // Simple Dijkstra without event emissions
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const unvisited = new Set<string>();

    distances.set(start, 0);
    this.graph.nodes.forEach((_, id) => {
      if (id !== start) distances.set(id, Infinity);
      unvisited.add(id);
    });

    while (unvisited.size > 0) {
      let curr = null;
      let minDistance = Infinity;
      
      unvisited.forEach(node => {
        const d = distances.get(node)!;
        if (d < minDistance) {
          minDistance = d;
          curr = node;
        }
      });

      if (!curr || curr === target) break;
      unvisited.delete(curr);

      const neighbors = this.graph.adjacencyList.get(curr) || [];
      for (const edgeId of neighbors) {
        const edge = this.graph.edges.get(edgeId)!;
        const neighbor = edge.source === curr ? edge.target : edge.source;
        if (!unvisited.has(neighbor)) continue;

        const alt = distances.get(curr)! + edge.distance;
        if (alt < distances.get(neighbor)!) {
          distances.set(neighbor, alt);
          previous.set(neighbor, curr);
        }
      }
    }

    const path: string[] = [];
    let curr: string | undefined = target;
    while (curr) {
      path.unshift(curr);
      if (curr === start) break;
      curr = previous.get(curr);
    }

    return { distance: distances.get(target) || Infinity, path };
  }

  private evaluateRoute(route: string[]): number {
    let totalDist = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDist += this.distanceMatrix.get(route[i])!.get(route[i + 1])!.distance;
    }
    // Return to start
    totalDist += this.distanceMatrix.get(route[route.length - 1])!.get(route[0])!.distance;
    return totalDist;
  }

  private buildFullPath(route: string[]): string[] {
    const fullPath: string[] = [];
    for (let i = 0; i < route.length - 1; i++) {
      const segment = this.distanceMatrix.get(route[i])!.get(route[i + 1])!.path;
      // avoid duplicating the overlapping node
      if (i > 0) segment.shift();
      fullPath.push(...segment);
    }
    const finalSegment = this.distanceMatrix.get(route[route.length - 1])!.get(route[0])!.path;
    finalSegment.shift();
    fullPath.push(...finalSegment);
    return fullPath;
  }

  private shuffle(array: string[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private tournamentSelection(population: Individual[]): Individual {
    const tournamentSize = 5;
    let best = population[Math.floor(Math.random() * population.length)];
    for (let i = 1; i < tournamentSize; i++) {
      const competitor = population[Math.floor(Math.random() * population.length)];
      if (competitor.fitness < best.fitness) {
        best = competitor;
      }
    }
    return best;
  }

  private orderCrossover(parent1: string[], parent2: string[]): string[] {
    const start = Math.floor(Math.random() * parent1.length);
    const end = Math.floor(Math.random() * (parent1.length - start)) + start;

    const child = new Array(parent1.length).fill(null);
    for (let i = start; i <= end; i++) {
      child[i] = parent1[i];
    }

    let currentP2Index = 0;
    for (let i = 0; i < child.length; i++) {
      if (child[i] === null) {
        while (child.includes(parent2[currentP2Index])) {
          currentP2Index++;
        }
        child[i] = parent2[currentP2Index];
      }
    }
    return child;
  }

  private mutate(route: string[], rate: number) {
    if (Math.random() < rate) {
      const idx1 = Math.floor(Math.random() * route.length);
      const idx2 = Math.floor(Math.random() * route.length);
      [route[idx1], route[idx2]] = [route[idx2], route[idx1]];
    }
  }
}
