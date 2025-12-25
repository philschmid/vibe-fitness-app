# Plan: Supabase Integration for Vibe Fitness App

This plan outlines the steps to integrate Supabase for authentication and database storage into the Vibe Fitness App. The goal is to move from `localStorage` to a scalable, cloud-based PostgreSQL database, enabling multi-device sync, user accounts, and advanced analytics, while designing for future extensibility (e.g., food tracking).

## 1. Architecture Overview

- **Auth**: Supabase Auth (Email/Password + Google OAuth).
- **Database**: PostgreSQL (via Supabase).
- **Client**: `@supabase/supabase-js` for interacting with Auth and DB.
- **State**: React Context for Auth state; Custom hooks or Service layer for data fetching.

## 2. Database Schema Design

We will normalize the data structure slightly to leverage SQL's power for analytics (e.g., "What's my max bench press?").

### Core Tables

1.  **`profiles`**
    *   Extends `auth.users`.
    *   `id` (uuid, PK, refs `auth.users`)
    *   `display_name` (text)
    *   `created_at` (timestamptz)

2.  **`exercises`** (Standardizing exercise names)
    *   `id` (uuid, PK)
    *   `user_id` (uuid, refs `profiles`, nullable). *Null = Global system exercise; Set = User custom exercise.*
    *   `name` (text)
    *   `default_sets` (int)
    *   `has_warmup` (bool)
    *   `created_at` (timestamptz)

3.  **`workouts`** (Templates/Routines)
    *   `id` (uuid, PK)
    *   `user_id` (uuid, refs `profiles`)
    *   `name` (text)
    *   `created_at` (timestamptz)
    *   `is_archived` (bool)

4.  **`workout_exercises`** (Exercises included in a Workout template)
    *   `id` (uuid, PK)
    *   `workout_id` (uuid, refs `workouts`)
    *   `exercise_id` (uuid, refs `exercises`)
    *   `order_index` (int)
    *   `target_sets` (int)

5.  **`training_sessions`** (Performed Workouts)
    *   `id` (uuid, PK)
    *   `user_id` (uuid, refs `profiles`)
    *   `workout_id` (uuid, refs `workouts`, nullable for ad-hoc)
    *   `date` (date)
    *   `start_time` (timestamptz)
    *   `end_time` (timestamptz)
    *   `note` (text, optional)

6.  **`session_sets`** (The actual data: reps/weight)
    *   `id` (uuid, PK)
    *   `session_id` (uuid, refs `training_sessions`)
    *   `exercise_id` (uuid, refs `exercises`)
    *   `set_number` (int)
    *   `reps` (int)
    *   `weight` (numeric)
    *   `is_warmup` (bool)
    *   `completed` (bool)
    *   *Normalization Note*: This replaces the JSON `exerciseResults` map. This allows queries like `SELECT MAX(weight) FROM session_sets WHERE exercise_id = 'squat'`.

7.  **`daily_logs`**
    *   `id` (uuid, PK)
    *   `user_id` (uuid, refs `profiles`)
    *   `date` (date)
    *   `weight` (numeric)
    *   `calories` (int)

### Future Extensibility: Food Tracking
To add food tracking later, you would simply add:
-   `foods` (Database of foods)
-   `food_logs` (Linked to `user_id` and `date`, similar to `daily_logs` or `session_sets`)

## 3. Row Level Security (RLS)

-   Enable RLS on all tables.
-   Policy for all tables: `Users can select/insert/update/delete their own data.`
    -   `auth.uid() = user_id`

## 4. Frontend Implementation Plan

### Step 1: Setup & Configuration
1.  Install dependencies: `npm install @supabase/supabase-js`.
2.  Create Supabase project.
3.  Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
4.  Initialize Supabase client in `src/lib/supabase.ts`.

### Step 2: Authentication Flow
1.  **Configure Google Auth in Supabase**:
    -   Create Project in Google Cloud Console.
    -   Get Client ID & Secret.
    -   Enable Google Provider in Supabase Auth settings.
2.  Create `AuthProvider` context (`src/context/AuthContext.tsx`).
    -   Manage `user` and `session` state.
    -   Provide `signInWithEmail`, `signInWithGoogle`, `signUp`, `signOut` methods.
3.  Create `AuthView` component.
    -   Add "Sign in with Google" button.
    -   Handle OAuth redirect flow.
4.  Update `App.tsx` to conditionally render `AuthView` or main app.

### Step 3: Data Layer Refactor (The "Repository" Pattern)
Create a new service layer that abstracts the backend (local vs supabase).
-   Create `src/services/db.ts` or `src/api/`.
-   Implement functions that match the current `storage.ts` interface but write to Supabase.
    -   `fetchWorkouts()` -> `SELECT * FROM workouts ...`
    -   `saveWorkout(workout)` -> `INSERT INTO workouts ...`

### Step 4: Data Migration (LocalStorage -> Supabase)
1.  Create a utility function `migrateLocalData()`.
2.  When a user first logs in (or clicks "Sync Data"):
    -   Read all data from `localStorage`.
    -   Transform `Workout` objects -> `INSERT` into `workouts` and `workout_exercises`.
    -   Transform `TrainingSession` objects -> `INSERT` into `training_sessions` and `session_sets`.
    -   Clear `localStorage` (or keep as backup).

### Step 5: Updating Components
Update components to use the new Async Data functions instead of synchronous `storage` calls.
-   Use `useEffect` to fetch data on load.
-   Show loading states.

## 5. Development Checklist

- [ ] Create Supabase Project & Tables.
- [ ] **Google Cloud Console**: Create OAuth Credentials (Client ID/Secret).
- [ ] **Supabase Auth**: Enable Google Provider & paste credentials.
- [ ] Connect App to Supabase.
- [ ] Implement Auth (Login/Signup + Google Button).
- [ ] Create `Exercise` and `Workout` creation logic (DB writes).
- [ ] Update `TrainingSessionView` to save sets to `session_sets`.
- [ ] Implement `HistoryView` to fetch from DB.
- [ ] Add Migration Button in Settings.
