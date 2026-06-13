import fs from 'fs';
import https from 'https';
import path from 'path';

// Bounding box for Lower Manhattan / Brooklyn Heights
// MapView center is [40.7128, -74.0060]
const MIN_LAT = 40.6900;
const MAX_LAT = 40.7600;
const MIN_LNG = -74.0300;
const MAX_LNG = -73.9500;

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const query = `
[out:json][timeout:25];
(
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|residential|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$"](${MIN_LAT},${MIN_LNG},${MAX_LAT},${MAX_LNG});
);
(._;>;);
out body;
`;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

function parseSpeedLimit(maxspeed, highwayType) {
  if (maxspeed) {
    const match = maxspeed.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  // Default speeds in km/h based on road type
  const defaults = {
    motorway: 90,
    trunk: 80,
    primary: 50,
    secondary: 40,
    tertiary: 40,
    unclassified: 30,
    residential: 30,
    motorway_link: 60,
    trunk_link: 50,
    primary_link: 40,
    secondary_link: 30,
    tertiary_link: 30
  };
  return defaults[highwayType] || 30;
}

function fetchOSM() {
  console.log('Fetching OpenStreetMap data...');
  
  const req = https.request(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'RouteWise-Lab-Script/1.0',
      'Accept': '*/*'
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Download complete. Parsing...');
      const json = JSON.parse(data);
      
      const nodesMap = new Map();
      const nodes = [];
      const edges = [];
      
      // First pass: extract nodes
      for (const element of json.elements) {
        if (element.type === 'node') {
          nodesMap.set(element.id, {
            id: `n_${element.id}`,
            lat: element.lat,
            lng: element.lon
          });
        }
      }
      
      // Keep track of which nodes are actually used by roads
      const usedNodes = new Set();
      let edgeIdCounter = 0;

      // Second pass: extract edges from ways
      for (const element of json.elements) {
        if (element.type === 'way' && element.tags && element.tags.highway) {
          const highway = element.tags.highway;
          const onewayTag = element.tags.oneway;
          const maxspeedTag = element.tags.maxspeed;
          
          let isOneway = false;
          let isReversed = false;
          
          if (onewayTag === 'yes' || onewayTag === '1' || onewayTag === 'true' || highway === 'motorway') {
            isOneway = true;
          } else if (onewayTag === '-1') {
            isOneway = true;
            isReversed = true;
          }
          
          const speedLimit = parseSpeedLimit(maxspeedTag, highway);
          
          const wayNodes = element.nodes;
          for (let i = 0; i < wayNodes.length - 1; i++) {
            const n1Id = wayNodes[i];
            const n2Id = wayNodes[i+1];
            
            const n1 = nodesMap.get(n1Id);
            const n2 = nodesMap.get(n2Id);
            
            if (n1 && n2) {
              usedNodes.add(n1Id);
              usedNodes.add(n2Id);
              
              const dist = haversineDistance(n1.lat, n1.lng, n2.lat, n2.lng);
              // travel time in seconds = distance (m) / speed (m/s)
              // speed (m/s) = speedLimit (km/h) / 3.6
              const speedMs = speedLimit / 3.6;
              const travelTime = dist / speedMs;
              
              const sourceId = isReversed ? `n_${n2Id}` : `n_${n1Id}`;
              const targetId = isReversed ? `n_${n1Id}` : `n_${n2Id}`;

              edges.push({
                id: `e_${edgeIdCounter++}`,
                source: sourceId,
                target: targetId,
                distance: dist,
                roadType: highway,
                oneWay: isOneway,
                speedLimit: speedLimit,
                travelTime: travelTime,
                trafficMultiplier: 1.0 // Base traffic
              });
              
              // If not one way, add the reverse edge explicitly so algorithms have an easier time
              // Actually, wait, the prompt specified edge properties. If it's a directed graph, we should just emit both directed edges if it's two-way.
              // Let's emit both edges for two-way streets so the graph is purely directed.
              if (!isOneway) {
                edges.push({
                  id: `e_${edgeIdCounter++}`,
                  source: targetId,
                  target: sourceId,
                  distance: dist,
                  roadType: highway,
                  oneWay: false,
                  speedLimit: speedLimit,
                  travelTime: travelTime,
                  trafficMultiplier: 1.0
                });
              }
            }
          }
        }
      }
      
      for (const nodeId of usedNodes) {
        nodes.push(nodesMap.get(nodeId));
      }
      
      const chunk = {
        bounds: {
          minLat: MIN_LAT,
          maxLat: MAX_LAT,
          minLng: MIN_LNG,
          maxLng: MAX_LNG
        },
        nodes,
        edges
      };
      
      const outDir = path.resolve('public', 'data');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      
      fs.writeFileSync(path.join(outDir, 'road_network.json'), JSON.stringify(chunk));
      
      console.log(`Success! Generated road_network.json with ${nodes.length} nodes and ${edges.length} edges.`);
    });
  });
  
  req.on('error', e => {
    console.error('Error fetching OSM data:', e);
  });
  
  req.write('data=' + encodeURIComponent(query));
  req.end();
}

fetchOSM();
