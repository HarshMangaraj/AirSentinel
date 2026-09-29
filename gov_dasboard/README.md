# AirSentinel Government Authority Command Center Dashboard

> **Clean Air • Safe Future**  
> Authenticated Environmental Authority Command & Emergency-Response Dashboard.

---

## 🏛️ Project Purpose & Core Workflow

This is **NOT** a citizen-facing dashboard. This is an authenticated government and environmental authority command center built for environmental officers, municipal commissioners, traffic police, agriculture authorities, and rapid response squads.

### The Operational Workflow:
$$\text{Data} \longrightarrow \text{Detection} \longrightarrow \text{Prediction} \longrightarrow \text{Source Attribution} \longrightarrow \text{Coordination} \longrightarrow \text{Action} \longrightarrow \text{Verification} \longrightarrow \text{Learning}$$

1. **Monitor Current Conditions**: Real-time CAAQMS station telemetry, multi-pollutant breakdowns (PM2.5, PM10, NO2, SO2, CO, O3), and multi-timeframe trend charts (1h, 6h, 24h, 7d).
2. **Identify Pollution Hotspots**: Geospatial heatmaps with thermal dispersion rings, sensor pins, and zone boundaries.
3. **AI Source Attribution & Prediction**: ML estimation of probable contributing sources with confidence percentages and atmospheric forecasts.
4. **Review Citizen & Field Grievances**: Comprehensive evidence inspection with ground photos, Sentinel-5P satellite corroboration, and nearby sensor correlation.
5. **Assign Inter-Agency Directives**: Coordinate seamlessly between Pollution Control Board, Municipal Corporation, Traffic Department, Agriculture Department, Emergency Response Squad, and Field Teams.
6. **Authorize & Execute Actions**: High-velocity anti-smog guns, mechanical sweepers, Section 31A industrial sealings, traffic diversions, and emergency misting.
7. **Verify Intervention Impact**: Scientific pre-intervention vs. post-intervention baseline calculations with estimated impact confidence and statutory rigor disclaimers.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: React Native with Expo (SDK 52) & Expo Router
- **Language**: TypeScript (strict mode, zero `any`)
- **Styling**: NativeWind (Tailwind CSS) with high information-density command center aesthetics
- **Client/UI State**: Zustand (`useAuthStore`, `useUIStore`, `useMapStore`)
- **Server/Data State**: TanStack Query (`@tanstack/react-query`) with automatic polling and cache invalidation
- **Visuals & Charts**: Lucide React Native, `react-native-svg` custom gradient curves and radar grid overlays
- **Clean Service/Repository Layer**: Clean separation under `services/` so mock APIs can be replaced 1-to-1 with FastAPI endpoints and PostGIS spatial databases.

---

## 👥 Role-Based Access Control (RBAC)

The dashboard provides a built-in session switcher for all 8 statutory roles:
1. **Super Admin** (Dr. Rajesh Sharma, PCB Chairman)
2. **State Officer** (Ananya Verma, IAS, State Environmental Secretary)
3. **District Officer** (Vikramaditya Chauhan, District Magistrate)
4. **Pollution Control Officer** (Er. Sunita Deshmukh, SPCB Environmental Engineer)
5. **Municipal Officer** (Karan Mehra, MCD Executive Engineer)
6. **Traffic Officer** (ACP Ramesh Yadav, Traffic Police Nodal)
7. **Agriculture Officer** (Dr. Balwinder Singh, Crop Residue Nodal)
8. **Field Officer** (Amit Patel, Rapid Response Squad)

---

## 🚀 Running the Dashboard

```bash
# Navigate to the dashboard directory
cd D:\Github-project\Airsentinal\AirSentinel\gov-dasboard

# Start the Expo development server (Web / Mobile)
npm run web
# or
npm run start
```
