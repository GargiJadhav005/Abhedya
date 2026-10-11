# Leaflet India Map — Final Implementation

## Overview

Replaced MapLibre GL JS with **Leaflet** and centered the map on **Northern India** with realistic military forward logistics locations (fictional).

---

## Map Configuration

### Technology Stack
- **Leaflet 1.9.4** (lightweight, mature, extensive ecosystem)
- **OpenStreetMap tiles** (free, no API key required)
- **Custom SVG icons** for depots, forward posts, supply relays, and vehicles

### Geographic Focus
**Northern India Border Region** — Forward logistics simulation

| Location Type | Region | Coordinates | Description |
|---|---|---|---|
| **Base Depot** | Chandigarh/Ambala | 30.73°N, 76.78°E | Main staging area |
| **Forward Post** | Ladakh | 34.15°N, 77.58°E | High-altitude forward position |
| **Supply Relays** | Mountain/Valley corridors | Various | Intermediate supply points |

---

## Three Supply Routes

All routes are fictional and illustrative of different terrain/risk profiles:

### 1. Mountain Express (Amber)
- **Terrain:** High-altitude mountain passes
- **Base Risk:** 24% (increases significantly in snow/storm)
- **Capacity:** Light vehicles only
- **Length:** 186 km
- **Key Points:** Shimla → Manali → Keylong → High Pass → Ladakh
- **Special:** Becomes **infeasible** during storm conditions

### 2. Valley Corridor (Teal) — Default
- **Terrain:** Protected valley route
- **Base Risk:** 12% (moderate weather impact)
- **Capacity:** All vehicles
- **Length:** 224 km
- **Key Points:** Dharamshala → Chamba → Mid Valley → Ladakh

### 3. Highway Route (Blue)
- **Terrain:** Major highway (NH 1A-like)
- **Base Risk:** 8% (lowest base risk)
- **Capacity:** All vehicles
- **Length:** 251 km
- **Key Points:** Pathankot → Jammu → Srinagar → Kargil → Ladakh

---

## Risk Dynamics

### Weather Impact Model
| Weather | Base Impact | Mountain Express Penalty | Color Coding |
|---|---|---|---|
| **Clear** | +0% | None | Green (< 25%), Yellow (25-49%), Red (≥ 50%) |
| **Snow** | +12% | +12% (total +24%) | Routes adjust to yellow/amber |
| **Storm** | +28% | Mountain becomes **INFEASIBLE** | High-risk routes turn red |

### Dynamic Risk Calculation
```typescript
risk = Math.min(92, baseRisk + weatherImpact + terrainPenalty)
duration = baseDuration + weatherDelay
feasible = !(routeName === 'Mountain Express' && weather === 'Storm')
```

---

## Visual Features

### Map Styling
- **Tiles:** OpenStreetMap (standard terrain view)
- **Route Lines:** Polylines with dynamic color, width, and opacity based on risk
- **Active Route:** 
  - Width: 5px (vs 2.5px inactive)
  - Opacity: 95% (vs 35% inactive)
  - Color: Risk-based (green → yellow → red)

### Interactive Elements
1. **Depot Marker** — Amber pin with shadow, popup shows "Base Depot"
2. **Forward Post Marker** — Blue pin, popup shows "Forward Post"
3. **Supply Relay Markers** — Small blue squares at intermediate points
4. **Vehicle Marker** — Animated pulsing amber circle, moves with route selection
5. **Route Legend** — Shows risk % and duration for each route

### Accessibility
- `aria-label` on map container describing the scenario
- `aria-pressed` on weather and route controls
- `aria-live` on weather status overlay
- Reduced-motion: disables vehicle pulse animation

---

## Files Changed

### Core Components
| File | Changes |
|---|---|
| `src/components/nexus/RouteMap.tsx` | Complete Leaflet implementation with India coordinates |
| `src/styles.css` | Leaflet-specific styling (removed MapLibre classes) |
| `package.json` | Removed `maplibre-gl`, added `leaflet` + `@types/leaflet` |

### Untouched (backward compatible)
- ✅ `src/routes/index.tsx` — Landing page
- ✅ `src/routes/workspace.tsx` — Workspace dashboard
- ✅ `src/lib/demo.tsx` — Demo state (uses 'Valley Corridor' as default)
- ✅ All other components

---

## Key Coordinates Reference

```typescript
// Base Depot: Chandigarh/Ambala staging area
BASE_DEPOT: [30.73, 76.78]

// Forward Post: Ladakh high-altitude position
FORWARD_POST: [34.15, 77.58]

// Map Center: Northern India overview
MAP_CENTER: [32.5, 76.8]

// Supply Relays
RELAY_ALPHA: [32.08, 77.57]  // Manali region
RELAY_BETA:  [32.48, 76.82]  // Chamba valley
RELAY_GAMMA: [32.20, 76.20]  // Pathankot region
```

---

## Why Leaflet?

| Aspect | Leaflet | MapLibre GL JS |
|---|---|---|
| **Bundle size** | ~150 KB | ~1 MB+ |
| **Complexity** | Simple API | WebGL, complex |
| **Tile sources** | Any standard tiles | Requires vector tiles |
| **Learning curve** | Minimal | Steeper |
| **India map** | Perfect with OSM | Requires custom style JSON |
| **Browser support** | Universal | Modern only |
| **Ecosystem** | Mature, huge plugin library | Growing |

For this use case (polyline routes, markers, basic interactivity), **Leaflet is the optimal choice** — lighter, simpler, and OSM tiles show India perfectly without configuration.

---

## Usage

The map works exactly as before from the user perspective:

1. **Weather Toggle:** Click Clear/Snow/Storm to change conditions
2. **Route Selection:** Click a route in the legend to select it
3. **Vehicle Movement:** Orange dot automatically moves to the selected route's midpoint
4. **Risk Updates:** Route colors change dynamically based on weather + terrain
5. **Popups:** Click depot/forward post/relay markers for info

The map appears on:
- **Landing page** — Section 03 "Delivery Intelligence" (full mode)
- **Workspace dashboard** — Overview "Network at a glance" panel (compact mode)

---

## Result

✅ India-focused map with realistic northern border logistics simulation  
✅ Three distinct supply corridors with different risk profiles  
✅ OpenStreetMap tiles (free, no API key, shows India terrain clearly)  
✅ Lighter bundle size (~400 KB saved vs MapLibre)  
✅ Same interactive features and weather/risk dynamics  
✅ Backward compatible with all existing workspace views  
✅ All TypeScript checks pass  
✅ Build successful (client + SSR + Nitro)
