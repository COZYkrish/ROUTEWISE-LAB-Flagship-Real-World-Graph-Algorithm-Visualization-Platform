import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CanvasOverlay from './CanvasOverlay';
import StaticNetworkOverlay from './StaticNetworkOverlay';
import VehicleSimulator from './VehicleSimulator';
import { useTraversalStore } from '../../store';

const MapController = () => {
  const map = useMap();
  
  useEffect(() => {
    // Expose map to window for our visualization engine to access without prop drilling
    (window as any).leafletMap = map;
    return () => {
      delete (window as any).leafletMap;
    };
  }, [map]);

  return null;
};

const InteractiveSelection = () => {
  const { 
    nodes, 
    selectedWaypoints, 
    addWaypoint,
    removeWaypoint,
    status 
  } = useTraversalStore();

  useMapEvents({
    click(e) {
      if (status !== 'IDLE' && status !== 'COMPLETED') return;
      
      let nearestId: string | null = null;
      let minDistance = Infinity;
      
      nodes.forEach((node, id) => {
        const d = Math.pow(node.lat - e.latlng.lat, 2) + Math.pow(node.lng - e.latlng.lng, 2);
        if (d < minDistance) {
          minDistance = d;
          nearestId = id;
        }
      });

      if (nearestId) {
        // If it's already a waypoint, remove it. Otherwise add it.
        const idx = selectedWaypoints.indexOf(nearestId);
        if (idx >= 0) {
          removeWaypoint(idx);
        } else {
          addWaypoint(nearestId);
        }
      }
    }
  });

  return (
    <>
      {selectedWaypoints.map((nodeId, index) => {
        const node = nodes.get(nodeId);
        if (!node) return null;
        const isStart = index === 0;
        const isEnd = index === selectedWaypoints.length - 1 && selectedWaypoints.length > 1;
        const color = isStart ? '#00f3ff' : (isEnd ? '#ff3366' : '#ff8c00');
        const label = isStart ? 'Start' : (isEnd ? 'End' : `Stop ${index}`);
        
        return (
          <CircleMarker 
            key={`${nodeId}-${index}`}
            center={[node.lat, node.lng]} 
            radius={8} 
            pathOptions={{ color: '#ffffff', fillColor: color, fillOpacity: 0.8, weight: 2 }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent className="font-mono text-xs">{label}</Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
};

const SelectionControls = () => {
  const { selectedWaypoints, clearWaypoints } = useTraversalStore();
  
  return (
    <div className="absolute bottom-28 right-6 z-[1000] bg-[#14141f]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 text-xs text-gray-400 font-mono shadow-2xl flex flex-col gap-2 w-64 pointer-events-auto">
      <div className="text-center font-bold text-white mb-1 uppercase tracking-wider text-[10px]">Waypoints ({selectedWaypoints.length})</div>
      <div className="flex gap-2 text-[10px]">
        Tap anywhere on the road network to add or remove a stop.
      </div>
      {selectedWaypoints.length > 0 && (
        <button 
          onClick={clearWaypoints}
          className="w-full mt-2 py-1.5 rounded outline-none transition-colors border border-white/10 hover:bg-white/10 hover:text-white"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

const MapView: React.FC = () => {
  // Center on a city (e.g., New York)
  const position: [number, number] = [40.7128, -74.0060];

  return (
    <div className="w-full h-full relative bg-bg-dark">
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ width: '100%', height: '100%', background: '#0a0a0f' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController />
        <InteractiveSelection />
        <StaticNetworkOverlay />
        <CanvasOverlay />
        <VehicleSimulator />
      </MapContainer>
      
      <SelectionControls />
    </div>
  );
};

export default MapView;
