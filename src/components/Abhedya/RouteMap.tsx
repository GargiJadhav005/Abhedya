/**
 * RouteMap — Leaflet implementation with India focus
 *
 * Features:
 *  • OpenStreetMap tiles (free, no API key)
 *  • Centered on northern India border region (fictional forward logistics)
 *  • Three animated routes: amber (mountain), teal (valley), blue (highway)
 *  • Red / yellow / green route-risk colour coding
 *  • Base depot (Chandigarh region) and forward post (Ladakh region) markers
 *  • Animated vehicle pulse marker on active route
 *  • Interactive route selection
 *  • Weather toggle (Clear / Snow / Storm)
 *  • Compact mode for dashboard glance
 *  • SSR-safe: Leaflet only loads client-side
 *  • Reduced-motion support
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDemo } from '@/lib/demo';
import { Button } from '@/components/ui/button';
import { CloudSnow, CloudSun, CloudLightning, Layers3 } from 'lucide-react';

/* ─── Shared route data (re-exported for workspace.tsx compatibility) ─── */
export const routes = [
  { name: 'Mountain Express', duration: 5.2, baseRisk: 24, capacity: 'Light only',   color: 'route-amber', length: '186 km' },
  { name: 'Valley Corridor',  duration: 6.8, baseRisk: 12, capacity: 'All vehicles', color: 'route-teal',  length: '224 km' },
  { name: 'Highway Route',    duration: 7.5, baseRisk:  8, capacity: 'All vehicles', color: 'route-blue',  length: '251 km' },
];

export function routeMetrics(name: string, weather: string) {
  const r = routes.find(x => x.name === name) ?? routes[1]!;
  const impact = weather === 'Storm' ? 28 : weather === 'Snow' ? 12 : 0;
  return {
    risk: Math.min(92, r.baseRisk + impact + (name === 'Mountain Express' && weather !== 'Clear' ? 12 : 0)),
    duration: (r.duration + (weather === 'Storm' ? 2.1 : weather === 'Snow' ? 0.9 : 0)).toFixed(1),
    feasible: !(name === 'Mountain Express' && weather === 'Storm'),
  };
}

/* ─── Indian forward logistics network (fictional coordinates) ─── */
// Base Depot: Near Chandigarh/Ambala region (staging area)
const BASE_DEPOT: [number, number] = [30.73, 76.78];

// Forward Post: Ladakh region (high-altitude forward position)
const FORWARD_POST: [number, number] = [34.15, 77.58];

// Route waypoints — three fictional supply corridors
const MOUNTAIN_COORDS: [number, number][] = [
  BASE_DEPOT,
  [31.10, 77.17], // Shimla region
  [32.08, 77.57], // Manali region
  [32.95, 77.35], // Keylong region
  [33.78, 77.15], // High mountain pass
  FORWARD_POST,
];

const VALLEY_COORDS: [number, number][] = [
  BASE_DEPOT,
  [31.62, 76.38], // Dharamshala region
  [32.48, 76.82], // Chamba valley
  [33.25, 77.28], // Mid valley
  [33.85, 77.45], // Approach valley
  FORWARD_POST,
];

const HIGHWAY_COORDS: [number, number][] = [
  BASE_DEPOT,
  [31.10, 75.88], // Pathankot region
  [32.20, 76.20], // Jammu approach
  [33.08, 75.95], // Srinagar region
  [33.92, 76.78], // Kargil region
  FORWARD_POST,
];

// Vehicle position: midpoint of each route
const vehiclePos: Record<string, [number, number]> = {
  'Mountain Express': [32.95, 77.35],
  'Valley Corridor':  [33.25, 77.28],
  'Highway Route':    [33.08, 75.95],
};

// Supply relay points
const SUPPLY_POINTS: { coords: [number, number]; label: string }[] = [
  { coords: [32.08, 77.57], label: 'Relay Alpha' },
  { coords: [32.48, 76.82], label: 'Relay Beta'  },
  { coords: [32.20, 76.20], label: 'Relay Gamma' },
];

/* ─── Risk → colour mapping ─── */
function riskColor(risk: number): string {
  if (risk >= 50) return '#e05252'; // red
  if (risk >= 25) return '#d4943a'; // amber/yellow
  return '#4fc4a0';                  // green
}

/* ─── Custom Leaflet icon factory ─── */
function makeDepotIcon(): L.DivIcon {
  return L.divIcon({
    className: 'leaflet-depot-icon',
    html: `<div class="depot-marker">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <circle cx="16" cy="16" r="12" fill="#d4943a" fill-opacity="0.2" stroke="#d4943a" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="#d4943a"/>
        <line x1="16" y1="28" x2="16" y2="40" stroke="#d4943a" stroke-width="2"/>
      </svg>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
}

function makeForwardIcon(): L.DivIcon {
  return L.divIcon({
    className: 'leaflet-forward-icon',
    html: `<div class="forward-marker">
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
        <circle cx="16" cy="16" r="12" fill="#4a7cc7" fill-opacity="0.2" stroke="#4a7cc7" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="#4a7cc7"/>
        <line x1="16" y1="28" x2="16" y2="40" stroke="#4a7cc7" stroke-width="2"/>
      </svg>
    </div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
}

function makeVehicleIcon(): L.DivIcon {
  return L.divIcon({
    className: 'leaflet-vehicle-icon',
    html: `<div class="vehicle-marker">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" fill="#d4943a" stroke="#fffef0" stroke-width="2"/>
      </svg>
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function makeSupplyIcon(): L.DivIcon {
  return L.divIcon({
    className: 'leaflet-supply-icon',
    html: `<div class="supply-marker">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="1" width="10" height="10" rx="2" fill="#4a7cc7" fill-opacity="0.3" stroke="#4a7cc7" stroke-width="1.5"/>
        <rect x="3.5" y="3.5" width="5" height="5" rx="1" fill="#4a7cc7"/>
      </svg>
    </div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

/* ─── Component ─── */
export function RouteMap({ compact = false }: { compact?: boolean }) {
  const { route, setRoute, weather, setWeather } = useDemo();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayers = useRef<Record<string, L.Polyline>>({});
  const vehicleMarker = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);

  /* ── Initialize map (client-only) ── */
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current, {
      center: [32.5, 76.8],
      zoom: compact ? 6.5 : 7.2,
      zoomControl: true,
      attributionControl: true,
    });

    // OpenStreetMap tiles (free, no API key)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Define route polylines
    const routeDefs = [
      { id: 'mountain', coords: MOUNTAIN_COORDS, color: '#d4943a', name: 'Mountain Express' },
      { id: 'valley',   coords: VALLEY_COORDS,   color: '#4fc4a0', name: 'Valley Corridor'  },
      { id: 'highway',  coords: HIGHWAY_COORDS,  color: '#4a7cc7', name: 'Highway Route'    },
    ];

    routeDefs.forEach(({ id, coords, color }) => {
      const line = L.polyline(coords, {
        color,
        weight: 3,
        opacity: 0.4,
        smoothFactor: 1,
      }).addTo(map);
      routeLayers.current[id] = line;
    });

    // Base depot marker
    L.marker(BASE_DEPOT, { icon: makeDepotIcon() })
      .addTo(map)
      .bindPopup('<strong>Base Depot</strong><br/><small>Chandigarh region · fictional</small>');

    // Forward post marker
    L.marker(FORWARD_POST, { icon: makeForwardIcon() })
      .addTo(map)
      .bindPopup('<strong>Forward Post</strong><br/><small>Ladakh region · fictional</small>');

    // Supply relay markers
    SUPPLY_POINTS.forEach(({ coords, label }) => {
      L.marker(coords, { icon: makeSupplyIcon() })
        .addTo(map)
        .bindPopup(`<strong>${label}</strong><br/><small>Supply relay · fictional</small>`);
    });

    // Vehicle marker (initial position)
    const vehicle = L.marker(vehiclePos['Valley Corridor'] as [number, number], { icon: makeVehicleIcon() })
      .addTo(map);
    vehicleMarker.current = vehicle;

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Update active route styling + vehicle position ── */
  useEffect(() => {
    if (!mapReady) return;

    const idMap: Record<string, string> = {
      'Mountain Express': 'mountain',
      'Valley Corridor':  'valley',
      'Highway Route':    'highway',
    };

    const activeId = idMap[route] ?? 'valley';

    (['mountain', 'valley', 'highway'] as const).forEach(id => {
      const isActive = id === activeId;
      const line = routeLayers.current[id];
      if (!line) return;

      const m = routeMetrics(
        Object.keys(idMap).find(k => idMap[k] === id) ?? 'Valley Corridor',
        weather,
      );
      const rc = riskColor(m.risk);

      line.setStyle({
        color: isActive ? rc : (id === 'mountain' ? '#d4943a' : id === 'valley' ? '#4fc4a0' : '#4a7cc7'),
        weight: isActive ? 5 : 2.5,
        opacity: isActive ? 0.95 : 0.35,
      });
    });

    // Move vehicle marker
    const vPos = vehiclePos[route];
    if (vPos && vehicleMarker.current) {
      vehicleMarker.current.setLatLng(vPos);
    }
  }, [route, weather, mapReady]);

  /* ── Derived metrics for legend ── */
  const metrics = routes.map(r => ({
    ...r,
    m: routeMetrics(r.name, weather),
  }));

  return (
    <div className={`map-panel leaflet-panel ${compact ? 'map-compact' : ''}`}>
      {/* Controls bar */}
      <div className="map-controls">
        <span className="eyebrow">
          <Layers3 size={13} aria-hidden="true" />
          FICTIONAL NETWORK / LIVE SIMULATION
        </span>
        <div className="segmented" role="group" aria-label="Simulated weather">
          {(['Clear', 'Snow', 'Storm'] as const).map(w => (
            <Button
              key={w}
              variant="ghost"
              size="sm"
              className={weather === w ? 'selected' : ''}
              onClick={() => setWeather(w)}
              title={`Simulate ${w.toLowerCase()} weather`}
              aria-pressed={weather === w}
            >
              {w === 'Clear' ? <CloudSun aria-hidden="true" /> : w === 'Snow' ? <CloudSnow aria-hidden="true" /> : <CloudLightning aria-hidden="true" />}
              {!compact && w}
            </Button>
          ))}
        </div>
      </div>

      {/* Leaflet container */}
      <div
        ref={mapContainer}
        className="leaflet-canvas"
        role="img"
        aria-label={`Interactive map showing three fictional supply routes in northern India between Base Depot and Forward Post under ${weather} weather conditions`}
      >
        {/* Coordinates overlay */}
        <div className="map-coordinate" aria-hidden="true">32° 30′ N &nbsp; 76° 48′ E</div>
        {/* Weather overlay */}
        <div className="map-weather" aria-live="polite" aria-atomic="true">
          {weather === 'Clear' ? 'CLEAR SKIES' : weather === 'Snow' ? 'SNOWFALL ADVISORY' : 'SEVERE WEATHER'}
          <span> · SIMULATED</span>
        </div>
      </div>

      {/* Route legend — only in full mode */}
      {!compact && (
        <div className="map-legend" role="list" aria-label="Route alternatives">
          {metrics.map(r => (
            <Button
              key={r.name}
              variant="ghost"
              className={`legend-route ${route === r.name ? 'active' : ''}`}
              onClick={() => setRoute(r.name)}
              role="listitem"
              aria-pressed={route === r.name}
            >
              <span
                className="legend-line"
                style={{ background: riskColor(r.m.risk) }}
                aria-hidden="true"
              />
              <span>{r.name}</span>
              <span
                className="legend-risk-badge"
                style={{ color: riskColor(r.m.risk) }}
                aria-label={`${r.m.risk}% delay risk`}
              >
                {r.m.risk}%
              </span>
              <small>{r.m.duration}h</small>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
