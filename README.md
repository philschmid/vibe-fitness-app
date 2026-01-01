# FlexTrack Fitness App

FlexTrack is a modern, mobile-first Progressive Web Application (PWA) built for serious lifters who want a frictionless workout tracking experience. It combines the speed of a local-first app with the reliability of cloud sync, ensuring you never lose your progress even if you lose your connection.

![FlexTrack](public/pwa-192x192.png)

## 🚀 Key Features

### 🏋️‍♂️ Smart Workout Tracking
*   **Intelligent Autofill**: The app remembers the weight and reps you lifted last time for every exercise, so you only need to log your progress.
*   **Crash Protection**: Your active session is saved to local storage after every interaction. Close the app, refresh the page, or lock your phone—your workout will be exactly where you left it.
*   **Drop Sets & Warmups**: Native support for tracking special set types like Drop Sets (highlighted in purple) and Warmup sets (highlighted in orange).
*   **Optimized Inputs**: Smart number inputs that handle typing naturally (no more fighting with leading zeros).

### 🛠 Flexible Routines
*   **Custom Workouts**: Create unlimited custom workout routines.
*   **Drag-and-Drop Ordering**: Easily reorder exercises within your routines to match your gym flow.
*   **Editing Safety**: Prevents accidental edits to routines while a session is active to ensure data integrity.

### 📊 Comprehensive History & Analytics
*   **Snapshot History**: Every completed session saves a snapshot of the workout at that moment. Even if you later change or delete the original routine, your history remains accurate.
*   **Detailed Stats**: Visualize your progress with charts for volume, weight trends, and consistency.
*   **Calendar View**: Browse past workouts by date and see detailed breakdowns of every set.

### 📱 Progressive Web App (PWA)
*   **Installable**: Add FlexTrack to your home screen on Android or iOS for a native app experience.
*   **Offline Capable**: The "Cache-First" architecture allows the app to load instantly and function even with poor or no internet connection. Background sync keeps your data safe in the cloud (Supabase) when you reconnect.

## 🛠 Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (Dark Mode optimized)
*   **State**: React Context + Local Storage (Hybrid Sync)
*   **Backend**: Supabase (PostgreSQL + Auth)
*   **Testing**: Vitest + React Testing Library

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/flextrack-pwa.git
    cd flextrack-pwa
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up Environment Variables:
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open `http://localhost:3000` in your browser.

## 🐳 Running with Docker

You can also run the app in a container:

```bash
docker build -t vibe-fitness .
docker run -p 8080:8080 vibe-fitness
```

## 🧪 Testing

Run the test suite to ensure everything is working correctly:

```bash
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License.


I lift for ~10 years now, don't drink, track my food and workout hard. The only thing missing was tracking my weights. Over christmas i challenged myself to purely vibe code an App to see the progress we made this year.

I tried several weigh tracking and workout tracking apps in the past and also handwritten notebooks, but it felt always too much work or the UX was bad. I wanted to have a simple app that i could use quickly and easily. 

I invested around ~10 hours from the first prompt to a working app, which is now tested by ~10 friends from my gym. Here is how i did it: 

1. Started in AI Studio and used Gemini 3 Flash and a very detailed prompt with the concrete features and UX i wanted to achieve. I created multiple versions. 
2. I took the best one and moved to local env with Cursor. 
3. I asked Gemini to update the project to a PWA (Progressive Web App), Added Supabase for authentication and database storage. (Used the MCP server to provide details about supabase).
4. Setup a Vercel deploymend and shared it with my friends.
5. Since then I was able to ship around 5 additional features and bug fixes, based on their feedback.

Note: Building a PWA was a great decision. I was able to acheive a native-like experience (standalone app), I can ship updates with ~1 minute and there was no need to go through a review process. 

Learnings: 

If you have engineering skills, and are familiar with the tech you use, you can iterate so much faster. Models are making mistakes or implementing features wrongly, setting wrong permissions etc. Mostly as becuase you weren't concrete enough in your prompt. But knowing, identifying and reviewing them prevents these mistakes from happening and you can ship faster. 

Before AI I would have probably spent 2-3 weeks full time on this scope of work. Now, I was able to ship a working "app" in 10 hours. The App is nothing special, but it does exactly what and how i want it to. It will not scale to millions of users, but it doesn't have to. 

I am more bullished and excited about the future of AI and how it will change the way we work. And I am more convienced then ever that being an engineer and being able to code is a superpower and you can achieve so much more than you think. 