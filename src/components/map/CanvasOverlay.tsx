import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useTraversalStore } from '../../store';

const CanvasOverlay: React.FC = () => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const state = useTraversalStore.getState();
      const { nodes, edges } = state;

      if (nodes.size === 0) return;

      const drawRun = (runState: any, colors: any, algorithm: string | null) => {
        const isMST = algorithm === 'PRIM' || algorithm === 'KRUSKAL';
        if (state.visualizationMode === 'heatmap') {
          // Heatmap Rendering
          ctx.globalCompositeOperation = 'lighter';
          runState.heatmapDensity.forEach((density: number, nodeId: string) => {
            const node = nodes.get(nodeId);
            if (node) {
              const pt = map.latLngToContainerPoint([node.lat, node.lng]);
              
              // Base radius and intensity based on density
              const radius = Math.min(20, 8 + density * 2);
              const alpha = Math.min(0.8, 0.1 + density * 0.1);

              const gradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, radius);
              gradient.addColorStop(0, colors.heatmapCenter.replace('ALPHA', alpha.toString()));
              gradient.addColorStop(1, colors.heatmapEdge.replace('ALPHA', '0'));
              
              ctx.beginPath();
              ctx.fillStyle = gradient;
              ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
              ctx.fill();
            }
          });
          ctx.globalCompositeOperation = 'source-over';
          
          // Draw tree edges
          if (runState.treeEdges && runState.treeEdges.size > 0) {
            ctx.strokeStyle = isMST ? colors.path : colors.edges; 
            ctx.lineWidth = isMST ? 4 : 1;
            ctx.shadowColor = isMST ? colors.path : 'transparent';
            ctx.shadowBlur = isMST ? 10 : 0;
            if (isMST) {
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
            }
            ctx.beginPath();
            runState.treeEdges.forEach((edgeId: string) => {
              const edge = edges.get(edgeId);
              if (!edge) return;
              const sourceNode = nodes.get(edge.source);
              const targetNode = nodes.get(edge.target);
              if (sourceNode && targetNode) {
                const sourcePt = map.latLngToContainerPoint([sourceNode.lat, sourceNode.lng]);
                const targetPt = map.latLngToContainerPoint([targetNode.lat, targetNode.lng]);
                ctx.moveTo(sourcePt.x, sourcePt.y);
                ctx.lineTo(targetPt.x, targetPt.y);
              }
            });
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          
          // Still draw the best path on top of heatmap
          if (runState.bestPath.length > 0) {
            ctx.strokeStyle = colors.path; 
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowColor = colors.path;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            for (let i = 0; i < runState.bestPath.length; i++) {
              const node = nodes.get(runState.bestPath[i]);
              if (node) {
                const pt = map.latLngToContainerPoint([node.lat, node.lng]);
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
              }
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          return; // Skip standard rendering
        }

        // Standard Rendering
        // Draw explored edges
        ctx.strokeStyle = colors.edges;
        ctx.lineWidth = 2;
        ctx.beginPath();
        runState.exploredEdges.forEach((edgeId: string) => {
          const edge = edges.get(edgeId);
          if (!edge) return;
          const sourceNode = nodes.get(edge.source);
          const targetNode = nodes.get(edge.target);
          if (sourceNode && targetNode) {
            const sourcePt = map.latLngToContainerPoint([sourceNode.lat, sourceNode.lng]);
            const targetPt = map.latLngToContainerPoint([targetNode.lat, targetNode.lng]);
            ctx.moveTo(sourcePt.x, sourcePt.y);
            ctx.lineTo(targetPt.x, targetPt.y);
          }
        });
        ctx.stroke();

        // Draw visited nodes
        ctx.fillStyle = colors.visited;
        runState.visitedNodes.forEach((nodeId: string) => {
          const node = nodes.get(nodeId);
          if (node) {
            const pt = map.latLngToContainerPoint([node.lat, node.lng]);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Draw frontier nodes
        ctx.fillStyle = colors.frontier;
        runState.frontierNodes.forEach((nodeId: string) => {
          const node = nodes.get(nodeId);
          if (node) {
            const pt = map.latLngToContainerPoint([node.lat, node.lng]);
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Draw waypoints
        if (runState.waypoints && runState.waypoints.length > 0) {
          ctx.fillStyle = '#ff3366'; // bright pinkish red for waypoints
          ctx.shadowColor = '#ff3366';
          ctx.shadowBlur = 15;
          runState.waypoints.forEach((nodeId: string) => {
            const node = nodes.get(nodeId);
            if (node) {
              const pt = map.latLngToContainerPoint([node.lat, node.lng]);
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
              ctx.fill();
              
              // Inner white core
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ff3366'; // restore
            }
          });
          ctx.shadowBlur = 0;
        }

        // Draw tree edges
        if (runState.treeEdges && runState.treeEdges.size > 0) {
          ctx.strokeStyle = isMST ? colors.path : colors.edges; 
          ctx.lineWidth = isMST ? 4 : 1.5;
          ctx.shadowColor = isMST ? colors.path : 'transparent';
          ctx.shadowBlur = isMST ? 10 : 0;
          if (isMST) {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          }
          ctx.beginPath();
          runState.treeEdges.forEach((edgeId: string) => {
            const edge = edges.get(edgeId);
            if (!edge) return;
            const sourceNode = nodes.get(edge.source);
            const targetNode = nodes.get(edge.target);
            if (sourceNode && targetNode) {
              const sourcePt = map.latLngToContainerPoint([sourceNode.lat, sourceNode.lng]);
              const targetPt = map.latLngToContainerPoint([targetNode.lat, targetNode.lng]);
              ctx.moveTo(sourcePt.x, sourcePt.y);
              ctx.lineTo(targetPt.x, targetPt.y);
            }
          });
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw best path
        if (runState.bestPath.length > 0) {
          ctx.strokeStyle = colors.path; 
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = colors.path;
          ctx.shadowBlur = 20;
          ctx.beginPath();
          
          for (let i = 0; i < runState.bestPath.length; i++) {
            const node = nodes.get(runState.bestPath[i]);
            if (node) {
              const pt = map.latLngToContainerPoint([node.lat, node.lng]);
              if (i === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            }
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      };

      drawRun(state.runs.primary, {
        edges: 'rgba(0, 243, 255, 0.4)', // cyan
        visited: 'rgba(0, 243, 255, 0.6)',
        frontier: 'rgba(176, 38, 255, 0.8)', // purple
        path: '#ffffff',
        heatmapCenter: 'rgba(0, 243, 255, ALPHA)',
        heatmapEdge: 'rgba(176, 38, 255, ALPHA)'
      }, state.primaryAlgorithm);

      if (state.comparisonMode) {
        drawRun(state.runs.secondary, {
          edges: 'rgba(255, 140, 0, 0.4)', // orange
          visited: 'rgba(255, 140, 0, 0.6)',
          frontier: 'rgba(0, 255, 128, 0.8)', // green
          path: '#ff8c00',
          heatmapCenter: 'rgba(255, 140, 0, ALPHA)',
          heatmapEdge: 'rgba(255, 0, 128, ALPHA)'
        }, state.secondaryAlgorithm);
      }
    };

    const updateAndDraw = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(draw);
    };

    updateAndDraw();
    map.on('move', updateAndDraw);
    map.on('zoom', updateAndDraw);
    map.on('resize', updateAndDraw);

    // Subscribe to store changes
    const unsubscribe = useTraversalStore.subscribe(updateAndDraw);

    return () => {
      map.off('move', updateAndDraw);
      map.off('zoom', updateAndDraw);
      map.off('resize', updateAndDraw);
      unsubscribe();
      cancelAnimationFrame(animationFrameId);
    };
  }, [map]);

  return (
    <div className="leaflet-top leaflet-left" style={{ pointerEvents: 'none', width: '100%', height: '100%', zIndex: 400 }}>
      <canvas ref={canvasRef} id="route-canvas" className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
};

export default CanvasOverlay;
