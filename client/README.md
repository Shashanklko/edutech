# EduVera — Frontend Client

This directory contains the React 18 single-page application (SPA) built with Vite and Tailwind CSS.

## 🚀 Scripts

```bash
# Run local Vite development server (Port 5173)
npm run dev

# Build production bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

## 🌐 Cloud Deployment (Vercel)

* **Vercel Configuration**: Pre-configured with [`vercel.json`](./vercel.json) for client-side routing rewrites (`/(.*) -> /index.html`).
* **Custom API Base URL**: Set the environment variable `VITE_API_BASE_URL` in the Vercel project settings to your deployed backend URL (e.g. `https://your-api.onrender.com`). If not set, it defaults to relative `/api/*` proxy paths.
