import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useTraversalStore } from '../../store';

const VehicleSimulator: React.FC = () => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    
    // Vehicle State
    let currentPathIndex = 0;
    let segmentProgress = 0; // 0.0 to 1.0

    // To prevent the store subscription from triggering closures with stale data,
    // we fetch the latest state directly in the animation loop.
    
    const draw = (time: number) => {
      animationFrameId = requestAnimationFrame(draw);
      
      const deltaTime = time - lastTime;
      lastTime = time;
      if (deltaTime > 100) return; // Ignore large jumps (e.g. tab backgrounded)

      const state = useTraversalStore.getState();
      const { status, runs, nodes, edges } = state;
      const bestPath = runs.primary.bestPath;

      // Ensure canvas is resized to map
      const size = map.getSize();
      if (canvas.width !== size.x || canvas.height !== size.y) {
        canvas.width = size.x;
        canvas.height = size.y;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (status !== 'COMPLETED' || bestPath.length < 2) {
        // Reset vehicle state if not ready
        currentPathIndex = 0;
        segmentProgress = 0;
        return;
      }

      // We are completed and have a path. Animate!
      if (currentPathIndex >= bestPath.length - 1) {
        // Vehicle reached destination, loop back or stay. Let's stay.
        currentPathIndex = bestPath.length - 2;
        segmentProgress = 1.0;
      }

      const uId = bestPath[currentPathIndex];
      const vId = bestPath[currentPathIndex + 1];
      const u = nodes.get(uId);
      const v = nodes.get(vId);

      if (!u || !v) return;

      const p1 = map.latLngToContainerPoint([u.lat, u.lng]);
      const p2 = map.latLngToContainerPoint([v.lat, v.lng]);

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const segmentPixelLength = Math.sqrt(dx * dx + dy * dy);

      // We need to fetch the edge to determine traffic multiplier and travel time
      // This allows dynamic speed!
      let trafficMultiplier = 1;
      const neighbors = state.adjacencyList.get(uId) || [];
      for (const edgeId of neighbors) {
        const edge = edges.get(edgeId)!;
        if (edge.target === vId) {
          trafficMultiplier = edge.trafficMultiplier;
          break;
        }
      }

      // Base speed in pixels per millisecond
      // Slow down if traffic is high
      const baseSpeed = 0.15; 
      const actualSpeed = baseSpeed / Math.max(0.5, trafficMultiplier); 

      // Distance to travel this frame
      const distanceThisFrame = actualSpeed * deltaTime;
      
      if (segmentProgress < 1.0) {
        // Advance progress
        const progressDelta = segmentPixelLength > 0 ? (distanceThisFrame / segmentPixelLength) : 1;
        segmentProgress += progressDelta;

        if (segmentProgress >= 1.0) {
          segmentProgress = 0;
          currentPathIndex++;
          if (currentPathIndex >= bestPath.length - 1) {
            currentPathIndex = bestPath.length - 2;
            segmentProgress = 1.0;
          }
        }
      }

      // Calculate current interpolated position
      const x = p1.x + dx * segmentProgress;
      const y = p1.y + dy * segmentProgress;
      
      const angle = Math.atan2(dy, dx);

      // Render the Vehicle
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Vehicle styling
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 15;
      
      // Draw a sleek neon triangle pointing right
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-6, 6);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, -6);
      ctx.closePath();
      
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      // Add a trailing exhaust based on speed/traffic
      ctx.shadowBlur = 0;
      ctx.beginPath();
      const exhaustLength = 10 + (2 / trafficMultiplier) * 5;
      ctx.moveTo(-6, 0);
      ctx.lineTo(-6 - exhaustLength, 0);
      ctx.strokeStyle = trafficMultiplier > 1.5 ? '#ff3366' : '#00f3ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [map]);

  return (
    <div className="leaflet-top leaflet-left" style={{ pointerEvents: 'none', width: '100%', height: '100%', zIndex: 450 }}>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
};

export default VehicleSimulator;
