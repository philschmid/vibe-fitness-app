# FlexTrack PWA

A high-performance mobile workout tracker built with React, Vite, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- npm

### Installation

Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

### Build

Build for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Deployment

### Cloud Run

1. Build the Docker image:

```bash
docker build -t flextrack-pwa .
```

2. Run locally (optional):

```bash
docker run -p 8080:8080 flextrack-pwa
```

3. Deploy to Cloud Run using Google Cloud SDK or Console.

### Vercel

The project is configured for Vite and should deploy automatically on Vercel.
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
