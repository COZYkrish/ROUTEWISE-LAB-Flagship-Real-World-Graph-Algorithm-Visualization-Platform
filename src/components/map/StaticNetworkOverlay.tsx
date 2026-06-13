import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { useTraversalStore } from '../../store';

const StaticNetworkOverlay: React.FC = () => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let redrawTimeout: number;

    const drawStaticNetwork = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const state = useTraversalStore.getState();
      const { nodes, edges } = state;

      if (nodes.size === 0) return;

      // Draw all edges
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      edges.forEach(edge => {
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

      // Draw basic nodes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      nodes.forEach(node => {
        const pt = map.latLngToContainerPoint([node.lat, node.lng]);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const scheduleRedraw = () => {
      if (redrawTimeout) cancelAnimationFrame(redrawTimeout);
      redrawTimeout = requestAnimationFrame(drawStaticNetwork);
    };

    scheduleRedraw();
    map.on('move', scheduleRedraw);
    map.on('zoom', scheduleRedraw);
    map.on('resize', scheduleRedraw);

    // Only subscribe to graph structure changes, NOT algorithm traversal updates
    const unsubscribe = useTraversalStore.subscribe((state, prevState) => {
      if (state.nodes !== prevState.nodes || state.edges !== prevState.edges) {
        scheduleRedraw();
      }
    });

    return () => {
      map.off('move', scheduleRedraw);
      map.off('zoom', scheduleRedraw);
      map.off('resize', scheduleRedraw);
      unsubscribe();
      cancelAnimationFrame(redrawTimeout);
    };
  }, [map]);

  return (
    <div className="leaflet-top leaflet-left" style={{ pointerEvents: 'none', width: '100%', height: '100%', zIndex: 300 }}>
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
};

export default StaticNetworkOverlay;
