# Vibe Fitness App (FlexTrack)

This document provides a comprehensive overview of the Vibe Fitness App (internally `flextrack-pwa`), including its architecture, feature set, and build process. It is intended to help new engineers and AI models quickly understand the project context.

## 1. Project Overview

Vibe Fitness is a Progressive Web Application (PWA) designed for tracking workouts, monitoring progress, and managing daily health logs (weight, calories). It focuses on a mobile-first experience with a dark-themed UI.

### Core Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context (Auth) + Local State
- **Backend/Database**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library

## 2. Project Structure

The project follows a standard React + Vite feature-based structure, with a separation between page-level views and reusable components.

```
/
├── dist/                # Production build output
├── src/                 # Source code
│   ├── components/      # Reusable UI components
│   │   ├── ui/          # Shadcn-like UI primitives (Button, etc.)
│   │   └── ...          # Global components (BottomNav, LoadingScreen, etc.)
│   ├── views/           # Page-level components (Routes)
│   ├── context/         # React Context providers (e.g., AuthContext)
│   ├── hooks/           # Custom React hooks (e.g., useAppVersion)
│   ├── lib/             # Third-party library configurations (Supabase, Utils)
│   ├── services/        # Business logic and data access layer
│   │   ├── db.ts        # Database interaction (Supabase wrappers)
│   │   ├── storage.ts   # LocalStorage wrapper (Active session persistence)
│   │   └── migration.ts # Data migration utilities
│   ├── test/            # Unit and integration tests
│   ├── types.ts         # TypeScript interfaces and type definitions
│   ├── constants.ts     # App-wide constants and initial data
│   ├── App.tsx          # Main application component and routing logic
│   └── main.tsx         # Application entry point
├── Dockerfile           # Container definition for production
├── nginx.conf           # Nginx configuration for serving the app
├── package.json         # Dependencies and scripts
└── vite.config.ts       # Vite configuration
```

## 3. Key Features

### 3.1. Authentication
- **Powered by Supabase Auth**.
- Supports user sign-up and login.
- Protected routes ensure only authenticated users can access the app.
- Handled via `AuthContext` and `AuthView` (in `src/views`).

### 3.2. Workout Management
- **Create/Edit Workouts**: Users can define routines consisting of multiple exercises.
- **Exercise Details**: Tracks name, number of sets, and warmup status.
- **Views**: `WorkoutsView`, `EditWorkoutView` (in `src/views`).

### 3.3. Training Session (Active Workout)
- **Real-time Tracking**: Interactive interface to log sets (reps, weight) as they happen.
- **State Persistence**: Active session state is saved to `localStorage` (`storage.ts`), allowing users to close and reopen the app without losing progress.
- **Timer/Flow**: managed within `TrainingSessionView` (in `src/views`).

### 3.4. History & Analytics
- **Session History**: Detailed log of past workouts (`HistoryView`, `HistoryDetailView` in `src/views`).
- **Statistics**: Visual charts for weight trends, workout volume, etc., using `Recharts` (`StatsView` in `src/views`).

### 3.5. Daily Logging
- **Health Metrics**: Simple interface to log daily body weight and caloric intake (`DailyLogView` in `src/views`).

### 3.6. Settings & Data Management
- **Data Control**: Options to seed dummy data, load default workouts, or migrate local data.
- **App Versioning**: Checks for app updates (`useAppVersion`, `UpdatePopup`).
- **View**: `SettingsView` (in `src/views`).

## 4. Architecture & Data Flow

### Data Layer
The app uses a hybrid data approach:
1.  **Supabase (Primary)**: Stores all persistent data (Workouts, Training Sessions, Daily Logs). Accessed via `src/services/db.ts`.
2.  **LocalStorage (Secondary)**: Used for *transient* state, specifically the "Active Session" to prevent data loss during a workout if the browser refreshes or closes. Accessed via `src/services/storage.ts`.

### Routing
The app uses a conditional rendering approach based on a `view` state in `App.tsx` rather than a traditional router library like `react-router`. This simplifies the "app-like" navigation feel for this specific PWA structure.

**Views** (all in `src/views/`): `dashboard`, `workouts`, `session`, `daily`, `stats`, `edit-workout`, `history`, `history-detail`, `settings`.

## 5. Build & Deployment

### Development
To start the local development server:
```bash
npm run dev
```

### Production Build
To create a production build (outputs to `dist/`):
```bash
npm run build
```

### Docker
The application is containerized using a multi-stage build:
1.  **Build Stage**: Node.js image builds the static assets.
2.  **Serve Stage**: Nginx (Alpine) serves the static files from `dist/`.

To build and run with Docker:
```bash
docker build -t vibe-fitness .
docker run -p 8080:8080 vibe-fitness
```

## 6. Testing

The project uses Vitest for testing.
```bash
npm test        # Run tests
npm run coverage # Generate coverage report
```
