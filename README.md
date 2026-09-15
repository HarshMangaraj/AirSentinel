# AirSentinel 🛰️💨

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000000?style=for-the-badge&logo=expo&logoColor=white)
![PostGIS](https://img.shields.io/badge/PostGIS-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

> **AirSentinel** is a real-time Air Quality Index (AQI) monitoring, spatial analytics, and telemetry platform built specifically for Indian cities. It aggregates live sensor feeds from multiple environmental providers (CPCB, WAQI, OpenAQ, AccuWeather), computes spatial proximity using PostGIS vector geometry, and presents data in a glassmorphic mobile dashboard.

---

## 📌 Quick Summary (TL;DR)

- **Frontend**: React Native (Expo SDK 57), TypeScript, `@expo/vector-icons` (Feather), `expo-blur` Glassmorphism UI, Leaflet WebView Maps.
- **Backend**: FastAPI (Python 3.10+), SQLAlchemy ORM, GeoAlchemy2, PostGIS Spatial Extension.
- **Database**: PostgreSQL with PostGIS (`POINT` geometries in `SRID 4326`).
- **Auth**: Passwordless email OTP via Supabase Auth & JWT token validation.

---

## 🔄 System Data Flow Architecture

```mermaid
flowchart TD
    subgraph Data_Sources["📡 External Telemetry Feeds"]
        CPCB["CPCB (India Central Board)"]
        WAQI["WAQI (World Air Quality)"]
        OpenAQ["OpenAQ Data Network"]
    end

    subgraph Backend_Layer["🐍 Python FastAPI Backend (/backend)"]
        Router["/aqi/current Router (aqi.py)"]
        Aggregator["Multi-Source Aggregator & Distance Normalizer"]
        PostGIS[("PostgreSQL + PostGIS DB\n(Cities, AQI Readings, Spatial Points)")]
    end

    subgraph Mobile_App["📱 Expo React Native App (/app)"]
        APIClient["API Client (lib/api.ts)"]
        BentoUI["Bento Grid Dashboard (HomeScreen.tsx)"]
        MapVisualizer["Interactive Leaflet Map (LeafletMap.tsx)"]
    end

    CPCB --> Router
    WAQI --> Router
    OpenAQ --> Router
    Router --> Aggregator
    Aggregator <--> PostGIS
    Aggregator -->|JSON Telemetry| APIClient
    APIClient --> BentoUI
    APIClient --> MapVisualizer
```

---

## 🏗️ Project Folder & File Guide

```
AirSentinel/
├── app/                          # Mobile App Client (Expo / React Native)
│   ├── assets/                   # App icons, splash screens, and images
│   ├── components/               # Reusable UI Components
│   │   ├── Button.tsx            # Custom touch action button
│   │   ├── GlassCard.tsx         # Glassmorphic container with spring animations
│   │   ├── GlassSkeleton.tsx     # Animated pulse loading skeleton
│   │   ├── LeafletMap.tsx        # Leaflet web map container with dark/light filters
│   │   ├── Screen.tsx            # SafeAreaView container wrapper
│   │   └── TextField.tsx         # Input component with error state styling
│   ├── context/                  # React State Contexts
│   │   ├── AuthContext.tsx       # Supabase authentication & user session state
│   │   └── ThemeContext.tsx      # Dark (Obsidian) / Light (Studio Neutral) theme provider
│   ├── lib/                      # Services & Utilities
│   │   ├── api.ts                # HTTP Client fetching /cities and /aqi/current
│   │   ├── aqiScale.ts           # EPA AQI category labels ('Good', 'Moderate', etc.)
│   │   ├── location.ts           # Device GPS location & Nominatim reverse geocoding
│   │   └── supabase.ts           # Supabase JavaScript client instance
│   ├── navigation/               # Screen Navigators
│   │   └── RootNavigator.tsx     # Stack Navigation (SignIn, VerifyOtp, HomeScreen)
│   ├── screens/                  # Application Screens
│   │   ├── HomeScreen.tsx        # Main Bento Grid telemetry screen & interactive map
│   │   ├── SignInScreen.tsx      # Email input for requesting OTP code
│   │   └── VerifyOtpScreen.tsx   # 6-digit OTP code verification screen
│   ├── theme/                    # Design System Configuration
│   │   └── tokens.ts             # Colors, typography scales, spacing, and radius tokens
│   ├── app.json                  # Expo metadata configuration
│   ├── package.json              # Frontend package dependencies
│   └── tsconfig.json             # TypeScript config
│
├── backend/                      # API Backend (FastAPI / Python)
│   ├── app/                      # Application Package
│   │   ├── api/                  # API Controllers / Routers
│   │   │   ├── aqi.py            # AQI telemetry fetcher & spatial distance logic
│   │   │   └── cities.py         # City spatial list endpoints
│   │   ├── core/                 # Core Setup & Middleware
│   │   │   ├── auth.py           # Supabase JWT decoder & authorization dependencies
│   │   │   ├── config.py         # Environment variables parser
│   │   │   └── database.py       # SQLAlchemy engine and session dependency
│   │   ├── models/               # PostGIS Database Models
│   │   │   └── models.py         # City, User, Report, AQIReading, SatelliteEvent ORM models
│   │   ├── create_tables.py      # Database table initialization script
│   │   ├── main.py               # FastAPI entry point & router registrations
│   │   └── seed_cities.py        # Database seeder populating Indian major cities
│   ├── .env                      # Environment secrets (DB connection & JWT keys)
│   └── pyproject.toml            # Python backend dependencies
│
└── servers.pid                   # Active server Process IDs tracking file
```

---

## 📑 File Responsibilities Matrix

| File Path | Responsible For | Key Inputs / Outputs |
| :--- | :--- | :--- |
| **`app/screens/HomeScreen.tsx`** | Main dashboard view rendering Bento Grid telemetry, live pulse indicators, and interactive Leaflet map. | **Input**: `Point` location state.<br/>**Output**: Renders live AQI card, 2x2 source grid, map. |
| **`app/components/GlassCard.tsx`** | Frosted glassmorphic card container with spring animation on press. | **Input**: `children`, `glowColor`, `intensity`, `onPress`.<br/>**Output**: BlurView component. |
| **`app/components/LeafletMap.tsx`** | Embedded web map component applying dark/light filters on OpenStreetMap tiles. | **Input**: `lat`, `lon`, `aqi`, `isDark`.<br/>**Output**: Interactive WebView map. |
| **`app/components/GlassSkeleton.tsx`** | Shimmering loading placeholders displayed while telemetry data loads. | **Input**: Animated opacity loop.<br/>**Output**: Pulsing skeleton layout. |
| **`app/lib/api.ts`** | Client HTTP functions connecting mobile app to FastAPI endpoints. | **Input**: Coordinates `(lat, lon)`.<br/>**Output**: Promises returning `City[]` or `AqiReading`. |
| **`backend/app/api/aqi.py`** | Multi-source AQI query engine & PostGIS distance computer. | **Input**: HTTP GET `?lat=...&lon=...`.<br/>**Output**: JSON Object with aggregated AQI & sources. |
| **`backend/app/api/cities.py`** | Spatial query returning list of supported cities with coordinates. | **Input**: HTTP GET `/cities`.<br/>**Output**: JSON Array of cities. |
| **`backend/app/models/models.py`** | SQLAlchemy ORM schemas mapping database tables to PostGIS `POINT` geometries. | **Input**: PostGIS spatial tables.<br/>**Output**: DB Models (`City`, `AQIReading`, `User`). |

---

## 🛠️ Step-by-Step Installation & Setup

### Prerequisites Checklist
- [x] Node.js `v18+` or Bun `v1.1+` installed
- [x] Python `3.10+` installed
- [x] PostgreSQL with PostGIS extension enabled (`CREATE EXTENSION postgis;`)
- [x] Supabase Project created (for Auth credentials)

---

### Step 1: Set Up the Backend Server

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment
python -m venv .venv

# 3. Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# 4. Install required Python packages
pip install fastapi uvicorn sqlalchemy geoalchemy2 psycopg2-binary pyjwt requests python-dotenv

# 5. Create environment configuration file
```

Create file `backend/.env` with the following variables:
```env
# PostgreSQL connection URL (replace user, password, and database name)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/airsentinel

# Supabase JWT Secret (from Supabase Dashboard -> Project Settings -> API -> JWT Secret)
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
```

```bash
# 6. Initialize database schema tables
python app/create_tables.py

# 7. Seed initial city data (Delhi, Mumbai, Bengaluru, etc.)
python app/seed_cities.py

# 8. Start the FastAPI development server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### Step 2: Set Up the Mobile Client

```bash
# 1. Open a new terminal and navigate to app directory
cd app

# 2. Install dependencies using Bun or Node
bun install
# or
npm install

# 3. Configure backend IP address
```

Open [app/lib/api.ts](file:///e:/AirSentinel/app/lib/api.ts#L3) and update `API_BASE` with your local IP address:
```typescript
// Replace 192.168.x.x with your computer's local network IP address
const API_BASE = 'http://192.168.31.188:8000';
```

```bash
# 4. Start the Expo development server
bunx expo start --clear
# or
npx expo start --clear
```

---

## 📡 API Endpoint Reference

| Method | Endpoint | Auth | Description | Sample Output |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/health` | None | Returns API service status | `{"status": "ok"}` |
| **GET** | `/cities` | Bearer Token | Returns spatial list of cities | `[{"id": "...", "name": "Delhi", "lat": 28.61, "lon": 77.20}]` |
| **GET** | `/aqi/current` | Bearer Token | Fetches real-time AQI for given `?lat=...&lon=...` | `{"aqi": 142, "station": "Delhi", "sources": [...]}` |
| **GET** | `/auth/me` | Bearer Token | Validates Supabase JWT & returns user profile | `{"id": "...", "email": "user@example.com", "role": "citizen"}` |

---

## ❓ Troubleshooting & FAQs

#### 1. Expo mobile app shows `Network Request Failed` when fetching AQI
- **Cause**: The app is trying to connect to `localhost` or an unreachable IP address.
- **Solution**: Open `app/lib/api.ts` and set `API_BASE` to your computer's local Wi-Fi IP address (e.g. `http://192.168.1.50:8000`), NOT `127.0.0.1`.

#### 2. PostgreSQL throws `type "geometry" does not exist`
- **Cause**: The PostGIS extension is not active in your PostgreSQL database.
- **Solution**: Connect to your database via `psql` or pgAdmin and run:
  ```sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  ```

#### 3. How to re-seed or reset city database data?
- Execute `python app/seed_cities.py` to upsert city coordinate records.
