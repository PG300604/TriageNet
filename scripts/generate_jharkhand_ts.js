const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'seed', 'jharkhand-hospitals.json');
const targetPath = path.join(__dirname, '..', 'frontend', 'lib', 'jharkhand-data.ts');

const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const districts = [];
for (const [name, d] of Object.entries(seed.districts)) {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  districts.push({
    id,
    name,
    cmoName: d.cmo,
    cmoPhone: d.phone,
    lat: d.lat,
    lng: d.lng
  });
}

const hospitals = seed.hospitals.map((h, i) => {
  const id = 'jh-' + h.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  const shortCode = h.name.split(' ').map(w => w[0]).filter(c => c && c >= 'A' && c <= 'Z').join('').substring(0, 5) || 'HOSP';
  return {
    id,
    name: h.name,
    shortCode,
    districtName: h.districtName,
    facilityTier: h.facilityTier,
    latitude: h.latitude,
    longitude: h.longitude,
    totalGeneralBeds: h.totalGeneralBeds || 100,
    availableGeneralBeds: h.availableGeneralBeds || Math.round((h.totalGeneralBeds || 100) * 0.25),
    totalIcuBeds: h.totalIcuBeds || 10,
    availableIcuBeds: h.availableIcuBeds || Math.round((h.totalIcuBeds || 10) * 0.2),
    totalVentilators: h.hasVentilator ? Math.round((h.totalIcuBeds || 10) * 0.6) : 0,
    availableVentilators: h.hasVentilator ? Math.max(1, Math.round((h.totalIcuBeds || 10) * 0.15)) : 0,
    hasVentilator: !!h.hasVentilator,
    hasTraumaSurgery: !!h.hasTraumaSurgery,
    hasBloodBank: !!h.hasBloodBank,
    hasOxygenGenerator: !!h.hasOxygenGenerator,
    specialists: h.specialists || ['General Physician', 'Medical Officer']
  };
});

const tsContent = `// Real Jharkhand State Healthcare Dataset & Structure
// 24 Districts, 79 Government Hospitals (Medical Colleges, Sadar Hospitals, SDHs, CHCs)
import type { Hospital, NetworkEdge } from "./triage-data"

export interface JharkhandDistrict {
  id: string
  name: string
  cmoName: string
  cmoPhone: string
  lat: number
  lng: number
}

export interface JharkhandHospitalFacility {
  id: string
  name: string
  shortCode: string
  districtName: string
  facilityTier: "TERTIARY" | "DISTRICT" | "SUB_DIVISIONAL" | "CHC"
  latitude: number
  longitude: number
  totalGeneralBeds: number
  availableGeneralBeds: number
  totalIcuBeds: number
  availableIcuBeds: number
  totalVentilators: number
  availableVentilators: number
  hasVentilator: boolean
  hasTraumaSurgery: boolean
  hasBloodBank: boolean
  hasOxygenGenerator: boolean
  specialists: string[]
}

export const JHARKHAND_24_DISTRICTS: JharkhandDistrict[] = ${JSON.stringify(districts, null, 2)};

export const JHARKHAND_79_HOSPITALS: JharkhandHospitalFacility[] = ${JSON.stringify(hospitals, null, 2)};

export function getHospitalsForDistrict(districtName: string): JharkhandHospitalFacility[] {
  if (!districtName || districtName === "ALL") {
    return JHARKHAND_79_HOSPITALS;
  }
  return JHARKHAND_79_HOSPITALS.filter(
    (h) => h.districtName.toLowerCase().includes(districtName.toLowerCase()) || districtName.toLowerCase().includes(h.districtName.toLowerCase())
  );
}

// Convert a JharkhandHospitalFacility into a Hospital domain model object for the triage engine
export function convertFacilityToHospital(f: JharkhandHospitalFacility, index: number, total: number): Hospital {
  const totalBeds = f.totalGeneralBeds + f.totalIcuBeds;
  const usedGeneral = Math.max(0, f.totalGeneralBeds - f.availableGeneralBeds);
  const usedIcu = Math.max(0, f.totalIcuBeds - f.availableIcuBeds);
  const usedBeds = usedGeneral + usedIcu;

  // Normalized 2D projection for Dijkstra Canvas (0 to 100)
  // Jharkhand Lat bounds: 22.0 to 25.5 -> y from 90 to 10
  // Jharkhand Lng bounds: 83.3 to 88.0 -> x from 10 to 90
  const x = Math.min(92, Math.max(8, Math.round(((f.longitude - 83.3) / 4.7) * 80 + 10)));
  const y = Math.min(92, Math.max(8, Math.round((1 - (f.latitude - 22.0) / 3.5) * 80 + 10)));

  return {
    id: f.id,
    name: f.name,
    short: f.shortCode,
    x,
    y,
    beds: { used: usedBeds, total: totalBeds },
    icuBeds: { used: usedIcu, total: f.totalIcuBeds },
    generalBeds: { used: usedGeneral, total: f.totalGeneralBeds },
    ventilators: { used: Math.max(0, f.totalVentilators - f.availableVentilators), total: f.totalVentilators },
    specialists: { used: Math.round(f.specialists.length * 0.7), total: f.specialists.length },
    specialistRoster: {
      pulmonologists: { total: f.specialists.includes("Pulmonologist") ? 3 : 0, available: f.specialists.includes("Pulmonologist") ? 1 : 0 },
      cardiologists: { total: f.specialists.includes("Cardiologist") ? 3 : 0, available: f.specialists.includes("Cardiologist") ? 1 : 0 },
      traumaSurgeons: { total: f.specialists.includes("Trauma Surgeon") ? 2 : 0, available: f.specialists.includes("Trauma Surgeon") ? 1 : 0 },
      generalPhysicians: { total: 6, available: 3 }
    }
  };
}

// Compute dynamic spatial road connectivity edges between facilities
export function generateInterconnectivityEdges(hospitals: Hospital[]): NetworkEdge[] {
  const edges: NetworkEdge[] = [];
  if (hospitals.length <= 1) return edges;

  // For each hospital, connect to its nearest 2-3 neighbors
  for (let i = 0; i < hospitals.length; i++) {
    const distances = [];
    const h1 = hospitals[i];
    const f1 = JHARKHAND_79_HOSPITALS.find((h) => h.id === h1.id);

    for (let j = 0; j < hospitals.length; j++) {
      if (i === j) continue;
      const h2 = hospitals[j];
      const f2 = JHARKHAND_79_HOSPITALS.find((h) => h.id === h2.id);

      let minutes = 15;
      if (f1 && f2) {
        // Haversine km
        const dLat = (f2.latitude - f1.latitude) * Math.PI / 180;
        const dLng = (f2.longitude - f1.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(f1.latitude * Math.PI / 180) * Math.cos(f2.latitude * Math.PI / 180) *
          Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const km = 6371 * c;
        minutes = Math.max(5, Math.round(km * 1.4)); // ~45 km/h ambulance speed
      } else {
        const dx = h1.x - h2.x;
        const dy = h1.y - h2.y;
        minutes = Math.max(6, Math.round(Math.sqrt(dx*dx + dy*dy) * 0.8));
      }

      distances.push({ toId: h2.id, minutes });
    }

    // Sort by shortest travel time
    distances.sort((a, b) => a.minutes - b.minutes);
    const k = Math.min(3, distances.length);
    for (let m = 0; m < k; m++) {
      const target = distances[m];
      const exists = edges.some(e => (e.fromId === h1.id && e.toId === target.toId) || (e.fromId === target.toId && e.toId === h1.id));
      if (!exists) {
        edges.push({ fromId: h1.id, toId: target.toId, minutes: target.minutes });
      }
    }
  }

  return edges;
}
`;

fs.writeFileSync(targetPath, tsContent);
console.log('Successfully generated complete jharkhand-data.ts with all 79 facilities and dynamic interconnectivity matrix!');
