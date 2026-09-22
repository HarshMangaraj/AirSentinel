# AirSentinel 🛰️💨

<div align="center">

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React Native](https://img.shields.io/badge/React_Native-0.86+-61DAFB.svg?logo=react&logoColor=black)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-57.0+-000020.svg?logo=expo&logoColor=white)](https://expo.dev)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/PostGIS-Spatial-green.svg)](https://postgis.net/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI_Intelligence-8E75B2.svg?logo=google&logoColor=white)](https://ai.google.dev/)

**A Modern Cross-Platform Mobile App & AI Backend to Track Hyperlocal Air Pollution, Predict Dangerous Spikes, and Report Neighborhood Smoke.**  
*Know what you breathe, find out why the air is dirty, and help protect your community.*

[Features](#-features-what-we-built--why-we-built-it) • [Architecture](#%EF%B8%8F-how-the-whole-system-works-simple-flow) • [Installation & Running Guide](#%EF%B8%8F-installation--running-guide) • [API Reference](#-api-endpoints-reference) • [Troubleshooting](#-troubleshooting--faqs)

</div>

---

## 🌟 Quick Summary (What is this project in 30 seconds?)

Most weather apps only show you **one single air pollution number** from an official station that might be 20 kilometers away from your house. But air pollution changes from street to street! If someone is burning trash two streets away, your phone's normal weather app won't know.

**AirSentinel** fixes this problem:
1. It **combines live data** from multiple official stations and weather feeds into one accurate local number.
2. It uses **smart math (AI)** to warn you if air pollution is suddenly spiking or getting worse.
3. It figures out **why the air is dirty** (e.g., heavy traffic vs. trash smoke vs. dust) by checking wind and weather.
4. It lets **regular people snap a photo of smoke or burning garbage** to report it with their phone's GPS location.

---

## 🚀 Features (What We Built & Why We Built It)

Here is every main feature of AirSentinel explained in simple everyday words:

---

### 1. 📱 The Live Dashboard (Home Screen)
* **What it does:** Shows your current local Air Quality score (AQI) with a clear color (Green = Good, Yellow = Moderate, Red = Dangerous) and lists key pollutants like fine dust (PM2.5) and car exhaust (NO2).
* **Why we built it:** People don't want to read a complicated scientific report just to know if they can go for a morning jog. This screen tells you if the air is safe to breathe in 2 seconds.
* **How to say it in your presentation:**  
  > *"It works like a speedometer for clean air. Green means safe, red means stay inside."*

---

### 2. 🗺️ Interactive Air Quality Map
* **What it does:** An interactive map of the city showing air quality stations and color-coded zones from clean to dirty.
* **Why we built it:** Smoke travels with the wind. The map lets you see which areas of your city are clean and which are polluted before you drive to work or travel.
* **How to say it in your presentation:**  
  > *"It’s like Google Maps traffic, but instead of showing traffic jams, it shows smoke and pollution clouds."*

---

### 3. 📸 Citizen Smoke & Fire Reporter
* **What it does:** Allows any user to open their camera, take a picture of a pollution source (like burning garbage, construction dust, or factory smoke), and submit it with their exact location.
* **Why we built it:** Government air sensors are expensive and rare. A sensor will never catch someone burning plastic in a back alley. By letting citizens take pictures and report, the whole community helps find pollution hotspots.
* **How to say it in your presentation:**  
  > *"Sensors are fixed in one place, but citizens are everywhere. We turn every smartphone into a pollution detector."*

---

### 4. 🧠 Smart Anomaly & Hotspot Finder (AI)
* **What it does:** Compares air quality across multiple cities and neighborhoods. If one area suddenly jumps from 100 to 350 while everywhere else is normal, the system flags it as an abnormal hotspot.
* **Why we built it:** Big spikes mean an emergency is happening—like a chemical fire, a pile of tires burning, or sudden illegal factory dumping. The system finds these automatically.
* **How to say it in your presentation:**  
  > *"Instead of humans checking numbers all day, our smart code spots sudden pollution jumps automatically."*

---

### 5. 📈 Future Spike Prediction (Will it get worse?)
* **What it does:** Checks recent readings (for example, whether the number has been climbing steadily over the last few hours) and predicts if the air is going to cross dangerous health levels soon.
* **Why we built it:** Warning people *after* the air becomes toxic is too late. If the app warns you an hour in advance, you can close your windows or turn on your home air purifier before the bad air gets inside.
* **How to say it in your presentation:**  
  > *"It doesn't just tell you how bad the air is right now—it predicts if it's about to get worse."*

---

### 6. 🔍 "Why is the air bad?" (Source Finder)
* **What it does:** Looks at live wind speed from weather stations and combines it with recent citizen smoke reports to guess the likely cause of the dirty air (e.g., *"Likely Cause: Traffic fumes trapped by zero wind"* or *"Likely Cause: Local trash fire reported nearby"*).
* **Why we built it:** Knowing the air is bad isn't enough. People and city officials want to know *who or what* is causing it so action can be taken.
* **How to say it in your presentation:**  
  > *"We don't just measure the smoke; we use wind and reports to trace where it came from."*

---

### 7. 🔔 Instant Health Alerts & Notifications
* **What it does:** Sends an alert to your phone when air quality reaches dangerous levels, when clean air returns, or when someone reports a fire near you.
* **Why we built it:** You shouldn't have to keep opening the app all day. The app lets you know when your health is at risk.
* **How to say it in your presentation:**  
  > *"It acts like a smoke alarm for your city."*

---

### 8. 🏥 Plain-English Health Advice
* **What it does:** Tells you directly what to do based on the air quality: *"Safe for outdoor workouts"*, *"Sensitive groups should wear an N95 mask"*, or *"Keep windows closed today"*.
* **Why we built it:** Most people don't know what a number like "AQI 185" actually means for their body. Giving clear doctor-style advice makes the data useful for real life.
* **How to say it in your presentation:**  
  > *"We translate raw sensor numbers into simple medical advice that anyone can follow."*

---

### 9. ⏱️ 15-Minute Automatic Refresh
* **What it does:** A background program on our server runs automatically every 15 minutes to pull the latest weather and air data.
* **Why we built it:** Nobody has to press a button to refresh the server. The data is always fresh and ready when a user opens their phone.

---

### 10. 🔐 Easy Passwordless Login
* **What it does:** You type your email and receive a 6-digit code to log in immediately. No password needed.
* **Why we built it:** People forget passwords. Entering a quick code from an email is fast, simple, and very secure.

---

## 💻 Tech Stack (What Tools We Used in Plain English)

| Tool / Technology | What is it? (Simple words) | Why did we use it? |
| :--- | :--- | :--- |
| **React Native + Expo** | The mobile app builder | Lets us write code once and run it on both **Android phones and iPhones**. |
| **TypeScript** | Clean programming language for the app | Helps catch typos and bugs while writing the code so the app doesn't crash. |
| **Glassmorphism Design** | Frosted glass look & dark mode | Makes the app look beautiful, modern, and high-tech rather than plain and boring. |
| **Leaflet & WebView** | Free, interactive map engine | Shows the map on your phone without needing expensive Google Maps licenses. |
| **Python & FastAPI** | The backend server (the brain) | Super fast web server in Python that answers the app's requests in a fraction of a second. |
| **PostgreSQL Database** | The memory storage | A rock-solid storage system to save user accounts, city names, reports, and readings. |
| **PostGIS** | The GPS / map calculator | A database tool that understands geographic coordinates. It can calculate: *"Which sensor is within 5 kilometers of this user?"* in milliseconds. |
| **NumPy (Math Library)** | Fast calculator in Python | Calculates averages and flags abnormal pollution spikes (AI anomaly score). |
| **APScheduler** | The automatic alarm clock on the server | Wakes up the server every 15 minutes to download new air readings and weather. |
| **Supabase Auth** | The security guard | Sends login codes to your email and checks that users are who they say they are. |
| **Open-Meteo API** | Free live weather service | Tells our server the live wind speed, wind direction, and temperature. |
| **CPCB, WAQI & OpenAQ** | Public air pollution sensors | Public networks providing live measurements from government and international air stations. |
| **Google Gemini AI** | Environmental Intelligence Briefing | Generates plain-English AI explanations of pollution trends, cause attribution, and health advisories. |

---

## 🏗️ How the Whole System Works (Simple Flow)

Here is how data moves through AirSentinel step by step:

```mermaid
flowchart TD
    subgraph Step1["Step 1: Gathering Data"]
        Sensors["Public Air Sensors\n(CPCB, WAQI, OpenAQ)"]
        Weather["Weather Feeds\n(Wind & Temperature)"]
        Citizens["Citizens with Phones\n(Photos of fires & smoke)"]
    end

    subgraph Step2["Step 2: The Server Brain (Python FastAPI)"]
        Timer["Timer runs every 15 mins\n(Downloads latest numbers)"]
        AI["Smart Math\n(Finds abnormal spikes & predicts trends)"]
        CauseFinder["Cause Finder\n(Combines wind + reports)"]
    end

    subgraph Step3["Step 3: Database Storage"]
        DB[("PostgreSQL Database\n(Saves cities, map coordinates, and readings)")]
    end

    subgraph Step4["Step 4: The Phone App"]
        App["AirSentinel Mobile App\n(Dashboard, Map, Alerts & Camera)"]
    end

    Sensors --> Timer
    Weather --> Timer
    Timer --> DB
    Citizens --> App
    App --> DB
    DB <--> AI
    DB <--> CauseFinder
    DB --> App
```

1. **Step 1:** External sensors measure the air, weather services measure the wind, and citizens report local fires.
2. **Step 2:** Our Python server downloads this data every 15 minutes and runs smart math to check for sudden spikes.
3. **Step 3:** Everything is safely stored in our database with exact GPS coordinates.
4. **Step 4:** When you open your phone, the app gets clean, instant answers and shows them on your screen.

---

## 🎤 Ready-to-Use Presentation Slides (Copy & Paste for Your Talk)

Use these 7 slides for your presentation. Each slide has **Bullet Points** to put on the screen and **What to Say** out loud:

### 🔹 Slide 1: Introduction
* **Screen Title:** AirSentinel — Real-Time Air Quality & Community Action
* **Subtitle:** Knowing what you breathe, predicting bad air, and reporting pollution together.
* **What you say:**  
  > *"Hello everyone. Today I am presenting AirSentinel, a mobile platform that helps people know what they are breathing, warns them before dangerous pollution spikes arrive, and empowers communities to report local pollution hazards."*

---

### 🔹 Slide 2: The Real-World Problem
* **Screen Bullet Points:**
  - Official air sensors are far apart and miss neighborhood events.
  - Trash burning, construction dust, and traffic jams happen at street level.
  - People find out the air is bad only after they have already breathed it in.
* **What you say:**  
  > *"Air pollution changes from street to street. A government sensor 15 kilometers away will never detect someone burning plastic or tires around your corner. By the time the news talks about bad air, your lungs have already suffered."*

---

### 🔹 Slide 3: Our Solution: AirSentinel
* **Screen Bullet Points:**
  - One clean app for real-time local air ratings.
  - Interactive map showing pollution clouds.
  - Crowdsourced reporting: Take a picture of smoke with your phone.
  - Smart alerts that warn you before the air gets dangerous.
* **What you say:**  
  > *"AirSentinel solves this by bringing official sensor data and community reporting together on one mobile app with smart early warnings."*

---

### 🔹 Slide 4: Key App Features
* **Screen Bullet Points:**
  - **Live Dashboard:** Clean color-coded air quality score in 2 seconds.
  - **Interactive Map:** Zoom into neighborhoods to check smoke spread.
  - **Citizen Camera:** Snap photos of illegal burning or factory smoke with GPS.
  - **Health Advice:** Clear doctor-recommended tips like when to wear a mask.
* **What you say:**  
  > *"The user gets a clean dashboard with green, yellow, and red safety indicators, an interactive map, and a built-in camera tool so anyone can report pollution in their neighborhood."*

---

### 🔹 Slide 5: The Smart Math & AI Layer
* **Screen Bullet Points:**
  - **Abnormal Spike Detection:** Flags sudden jumps in pollution.
  - **Trend Prediction:** Guesses if air will worsen in the next few hours.
  - **Cause Finder:** Combines wind direction with citizen reports to explain *why* the air is bad.
* **What you say:**  
  > *"Our system does not just show raw numbers. It analyzes the trend to predict if a spike is coming, and it uses wind direction to explain whether the dirty air is caused by traffic or a nearby fire."*

---

### 🔹 Slide 6: Our Technology Stack
* **Screen Bullet Points:**
  - **Frontend:** React Native & Expo (Works on Android & iOS).
  - **Backend:** Python FastAPI (Fast, modern server).
  - **Database:** PostgreSQL + PostGIS (Handles map and GPS coordinates).
  - **Scheduler:** APScheduler (Refreshes data automatically every 15 minutes).
  - **Login:** Supabase Auth (Secure 6-digit email code).
* **What you say:**  
  > *"On the technical side, we built a cross-platform mobile app using React Native and Expo. Our backend is written in Python using FastAPI for speed, and we use PostgreSQL with PostGIS to perform geographic distance calculations."*

---

### 🔹 Slide 7: Conclusion & Impact
* **Screen Bullet Points:**
  - Protects vulnerable citizens (asthma patients, children, elderly).
  - Creates crowdsourced accountability for cleaner cities.
  - Simple, fast, and ready to scale.
* **What you say:**  
  > *"AirSentinel turns passive citizens into active environmental protectors. It helps families protect their health and helps cities stay cleaner. Thank you, and I am happy to take questions!"*

---

## 📁 Project Architecture & Directory Structure

```
AirSentinel/
├── app/                                # CROSS-PLATFORM MOBILE APPLICATION (EXPO / REACT NATIVE)
│   ├── App.tsx                         # App entrypoint with theme & navigation providers
│   ├── index.ts                        # Expo root registration
│   ├── app.json                        # Expo app manifest and device permissions
│   ├── package.json                    # Frontend dependencies and npm scripts
│   ├── tsconfig.json                   # TypeScript compiler configuration
│   ├── assets/                         # Icons, splash screens, and images
│   ├── components/                     # Reusable UI widgets & glassmorphism cards
│   │   ├── AQIGauge.tsx                # Circular AQI gauge with color-coded safety level
│   │   ├── GlassCard.tsx               # Frosted-glass backdrop container
│   │   ├── InteractiveMap.tsx          # Leaflet WebView with live station pins & heat zones
│   │   ├── PollutantCard.tsx           # Individual pollutant indicator (PM2.5, PM10, NO2, etc.)
│   │   └── TrendChart.tsx              # Historical AQI trend visualizer
│   ├── context/                        # Global state management
│   │   ├── AuthContext.tsx             # Supabase passwordless session & user state
│   │   └── ThemeContext.tsx            # Dynamic light/dark theme provider
│   ├── lib/                            # Utilities & external client wrappers
│   │   ├── api.ts                      # Backend HTTP client with dynamic host resolution
│   │   ├── aqiScale.ts                 # AQI category breakpoints and color standards
│   │   ├── location.ts                 # GPS geolocation helper via expo-location
│   │   ├── storage.ts                  # Persistent local storage wrapper
│   │   └── supabase.ts                 # Supabase client with expo-secure-store auth adapter
│   ├── navigation/                     # Navigation hierarchies
│   │   ├── AppNavigator.tsx            # Main tab bar and stack navigator router
│   │   └── TabBar.tsx                  # Custom frosted-glass bottom navigation bar
│   ├── screens/                        # User-facing application screens
│   │   ├── HomeScreen.tsx              # Primary live AQI score, health advice, and intelligence
│   │   ├── MapScreen.tsx               # Full-screen interactive sensor & hotspot map
│   │   ├── ReportScreen.tsx            # Camera capture & GPS smoke/fire report submission
│   │   ├── ReportStatusScreen.tsx      # Community reports feed and verification tracker
│   │   ├── AlertsScreen.tsx            # Urgent pollution spikes and fire proximity alerts
│   │   ├── HealthSafetyScreen.tsx      # Doctor-style outdoor precautions & mask guidance
│   │   ├── HotspotDetailScreen.tsx     # Deep-dive view of localized pollution clusters
│   │   ├── EventDetailsScreen.tsx      # Cause attribution and wind vector breakdown
│   │   ├── ProfileScreen.tsx           # User settings, dark mode toggle, and saved locations
│   │   ├── SignInScreen.tsx            # Passwordless email OTP entry
│   │   └── VerifyOtpScreen.tsx         # 6-digit OTP verification screen
│   └── theme/                          # Design tokens, color palettes, and typography
│
└── backend/                            # FASTAPI + POSTGRESQL BRAIN & INGESTION ENGINE
    ├── requirements.txt                # Curated Python package dependencies
    ├── .env.example                    # Sample configuration template for environment variables
    ├── .env                            # Active environment configuration (git-ignored)
    └── app/
        ├── main.py                     # FastAPI application setup, CORS, and scheduler hooks
        ├── create_tables.py            # SQLAlchemy table creation migration script
        ├── seed_cities.py              # Initial database seeder for Indian metro cities
        ├── core/                       # Core system utilities
        │   ├── auth.py                 # Supabase JWT token verification & RBAC dependencies
        │   └── database.py             # SQLAlchemy engine with dual psycopg2/pg8000 support
        ├── models/                     # Database schemas
        │   └── models.py               # PostGIS ORM models (City, User, Report, AQIReading, etc.)
        ├── jobs/                       # Background recurring tasks
        │   └── ingest.py               # 15-minute scheduled pipeline for weather and sensor sync
        └── api/                        # REST API routing modules
            ├── aqi.py                  # Live multi-source AQI aggregation (WAQI, OpenAQ, CPCB)
            ├── ai_hotspots.py          # Spatial anomaly & sudden outlier detection
            ├── predictions.py          # Short-term pollution spike forecast algorithm
            ├── attribution.py          # Source cause attribution (wind trajectory + reports)
            ├── intelligence.py         # Google Gemini AI environmental summary briefing
            ├── reports.py              # Citizen pollution report CRUD and image submission
            ├── alerts.py               # Active health threshold alert triggers
            ├── weather.py              # Open-Meteo live atmospheric conditions
            ├── history.py              # 24-hour historical readings for trend charts
            ├── cities.py               # Monitored cities and geographical boundaries
            └── pollutants.py           # Detailed breakdown of specific chemical pollutants
```

---

## 🛠️ Installation & Running Guide

Follow these step-by-step instructions to get both the Python backend server and the React Native mobile app running locally on your computer.

### 📋 System Prerequisites

Before starting, ensure you have the following installed on your development machine:

1. **Python 3.10+** (Tested on Python 3.11, 3.12, and 3.13) — [Download Python](https://www.python.org/downloads/)
2. **Node.js 18+ (LTS)** & **npm** (or Bun / Yarn) — [Download Node.js](https://nodejs.org/)
3. **Git** — [Download Git](https://git-scm.com/)
4. **Expo Go App** on your iOS or Android device:
   - [Expo Go for Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [Expo Go for iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)
5. **PostgreSQL 14+ with PostGIS extension**:
   - A free cloud database from [Supabase](https://supabase.com/) (recommended — PostGIS is enabled with one click).
   - Alternatively, a local PostgreSQL installation with the `postgis` extension installed.

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/HarshMangaraj/AirSentinel.git
cd AirSentinel
```

---

### Step 2: Backend Setup (Python & FastAPI)

The backend server manages multi-source sensor aggregation, PostgreSQL storage, AI anomaly detection, and automated background data fetching.

#### 1. Navigate to the backend directory:
```bash
cd backend
```

#### 2. Create and activate a Python virtual environment:
- **On Windows (PowerShell):**
  ```powershell
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  ```
  *(If PowerShell gives an execution policy error, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

- **On Windows (Command Prompt):**
  ```cmd
  python -m venv .venv
  .\.venv\Scripts\activate.bat
  ```

- **On macOS / Linux:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

#### 3. Install required Python packages:
```bash
pip install -r requirements.txt
```

> [!NOTE]
> On Windows, `pg8000` (pure-Python Postgres driver) is included alongside `psycopg2-binary` to prevent Windows Smart App Control blocking compiled C-extension DLLs. The database layer automatically uses `pg8000` on Windows.

#### 4. Configure Environment Variables:
Copy the sample environment file to `.env`:
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS/Linux/Git Bash:
cp .env.example .env
```

Open `.env` in your text editor and provide your keys:

```env
# Database connection string with PostGIS
DATABASE_URL=postgresql://postgres:your-password@db.your-supabase-project.supabase.co:5432/postgres

# Supabase URL for JWT user authentication
SUPABASE_URL=https://your-supabase-project.supabase.co

# Free API Tokens
WAQI_API_TOKEN=your_waqi_api_token
OPENAQ_API_KEY=your_openaq_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
GEMINI_API_KEY=your_gemini_api_key

# Optional
CPCB_API_KEY=your_cpcb_api_key
IQAIR_API_KEY=your_iqair_api_key
```

<details>
<summary>🔑 <b>Where to get free API keys (Click to expand)</b></summary>

- **Supabase & PostGIS**: Sign up at [supabase.com](https://supabase.com/). In SQL Editor, run `CREATE EXTENSION IF NOT EXISTS postgis;`.
- **WAQI (World Air Quality Index)**: Instant free token at [aqicn.org/data-platform/token](https://aqicn.org/data-platform/token/).
- **OpenAQ**: Free developer key at [openaq.org](https://openaq.org/).
- **OpenWeatherMap**: Free current weather & air API at [openweathermap.org/api](https://openweathermap.org/api).
- **Google Gemini AI**: Free API key at [aistudio.google.com](https://aistudio.google.com/).

</details>

#### 5. Initialize the Database & Seed Cities:
Run the initialization scripts to create the database tables and insert starting metro cities (Delhi, Mumbai, Bangalore, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad, Jaipur, Lucknow, Bhubaneswar, Sambalpur):

```bash
# Create PostGIS tables (users, cities, reports, aqi_readings, weather_data, alerts)
python app/create_tables.py

# Seed the base monitored cities with geographic coordinates
python app/seed_cities.py
```

#### 6. Start the Backend Server:
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> [!TIP]
> Using `--host 0.0.0.0` allows your physical mobile device on the same local Wi-Fi network to communicate with the FastAPI server running on your computer.

#### 7. Verify Server Status:
- Open your browser to `http://localhost:8000/health` (should return `{"status": "ok", "service": "airsentinel-backend"}`).
- Interactive Swagger UI: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- Interactive ReDoc: [`http://localhost:8000/redoc`](http://localhost:8000/redoc)

---

### Step 3: Frontend Setup (React Native & Expo App)

The mobile application runs on Android, iOS, and the Web using Expo.

#### 1. Open a new terminal and navigate to the `app` folder:
```bash
cd AirSentinel/app
```

#### 2. Install dependencies:
```bash
npm install
```

#### 3. Network Configuration for Mobile Device Testing:
The mobile application uses `Constants.expoConfig.hostUri` in [api.ts](file:///e:/AirSentinel/app/lib/api.ts) to automatically detect your computer's local network IP address (e.g. `http://192.168.x.x:8000`).

> [!IMPORTANT]
> - Ensure your **phone and computer are connected to the same Wi-Fi network**.
> - Ensure your computer's firewall allows incoming traffic on port `8000`.

#### 4. Launch the Expo Development Server:
```bash
npx expo start --clear
```

#### 5. Open the App:
Once the terminal displays the QR code:
- **On Physical Android:** Open the **Expo Go** app and tap **Scan QR Code**.
- **On Physical iPhone:** Open the default **Camera** app, point it at the QR code, and tap the **Open in Expo Go** notification.
- **On Web Browser:** Press <kbd>w</kbd> in your terminal to open in Chrome / Edge / Safari.
- **On Android Emulator:** Press <kbd>a</kbd> in your terminal (requires Android Studio).
- **On iOS Simulator:** Press <kbd>i</kbd> in your terminal (requires Xcode on macOS).

---

## ⚡ Background Automation & Scheduled Ingestion

AirSentinel includes a built-in background scheduler using **APScheduler**:
- **Frequency:** Executes every **15 minutes** automatically on the server.
- **Immediate execution on boot:** Also fires an async ingestion task upon server startup.
- **Operations performed:**
  1. Queries all monitored cities from the database.
  2. Pulls live sensor readings from WAQI, OpenAQ, OpenWeather, and CPCB.
  3. Pulls current atmospheric parameters (temperature, humidity, wind velocity, wind direction) from Open-Meteo.
  4. Stores timestamped time-series records in PostgreSQL for anomaly tracking.

---

## 📡 API Endpoints Reference

AirSentinel exposes a modular REST API. Below is a summary of the core endpoints:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/health` | Server liveness & health check | No |
| `GET` | `/cities` | List all monitored cities with PostGIS coordinates | No |
| `GET` | `/aqi/live?lat={lat}&lon={lon}` | Multi-source aggregated AQI & dominant pollutant | No |
| `GET` | `/history?city_id={id}` | 24-hour historical AQI readings for charts | No |
| `GET` | `/weather?lat={lat}&lon={lon}` | Real-time atmospheric conditions (wind, temp, humidity) | No |
| `GET` | `/pollutants?lat={lat}&lon={lon}` | Granular readings for PM2.5, PM10, NO2, SO2, CO, O3 | No |
| `GET` | `/ai-hotspots` | Spatial anomaly detection flagging sudden pollution spikes | No |
| `GET` | `/predictions?city_id={id}` | Predictive spike warning for the next 1–3 hours | No |
| `GET` | `/attribution?city_id={id}` | Root-cause analysis (combining wind vectors & reports) | No |
| `GET` | `/intelligence?city_id={id}` | Google Gemini AI synthesized environmental briefing | No |
| `GET` | `/reports` | List recent citizen-submitted pollution reports | No |
| `POST` | `/reports` | Submit a new citizen pollution photo report with GPS | Yes (Bearer) |
| `GET` | `/alerts` | Current active pollution and fire proximity alerts | No |
| `GET` | `/auth/me` | Current authenticated user profile | Yes (Bearer) |
| `GET` | `/docs` | Interactive Swagger UI API explorer | No |

---

## 🔧 Troubleshooting & FAQs

### 1. The mobile app shows "Network request failed" or fails to load data:
- **Same Wi-Fi Network:** Confirm your smartphone running Expo Go is connected to the exact same Wi-Fi network as your computer.
- **Windows Firewall:** Ensure Windows Defender Firewall allows incoming connections to Python on private networks. You can run:
  ```powershell
  New-NetFirewallRule -DisplayName "FastAPI Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
  ```
- **IP Fallback:** If auto-detection fails, edit [app/lib/api.ts](file:///e:/AirSentinel/app/lib/api.ts) and replace the fallback IP (`http://192.168.x.x:8000`) with your computer's local IP address (found via `ipconfig` on Windows or `ifconfig` on Mac/Linux).

### 2. Windows Smart App Control blocks `psycopg2`:
- On newer Windows 11 updates, Smart App Control blocks compiled C-extensions like `psycopg2`.
- AirSentinel has built-in support for `pg8000` (pure Python). It is included in `requirements.txt` and automatically substituted in [backend/app/core/database.py](file:///e:/AirSentinel/backend/app/core/database.py).

### 3. PostGIS extension error during table creation:
- If `create_tables.py` throws `type "geometry" does not exist`:
  1. Open your database console (Supabase SQL Editor or `psql`).
  2. Run:
     ```sql
     CREATE EXTENSION IF NOT EXISTS postgis;
     ```
  3. Re-run `python app/create_tables.py`.

### 4. Expo cache or bundler conflicts:
- Reset the Expo cache by running:
  ```bash
  npx expo start --clear
  ```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](file:///e:/AirSentinel/app/LICENSE) file for details.
