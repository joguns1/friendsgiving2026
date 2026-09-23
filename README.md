# In Good Taste — Friendsgiving 2026

This project is a mobile-first private event experience built for a Friendsgiving gathering. The application uses React, Vite, React Router, and a warm premium design system inspired by an upscale dinner party.

## Quick start

1. Install dependencies:
   npm install
2. Start the app locally:
   npm run dev
3. Build for production:
   npm run build
4. Run tests:
   npm test

## Environment configuration

Copy the sample environment file and adjust values as needed:

cp .env.example .env

Required values:

- VITE_APP_NAME
- VITE_BASE_URL
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ENABLE_DEMO_MODE

When Supabase credentials are unavailable, the app can run in demo mode with clearly labeled mock data.

## Project structure

- src/App.tsx — routed event shell and guest-facing experience
- src/data/event.ts — event metadata and homepage navigation cards
- src/index.css — premium theme, responsive design, reduced-motion support
- src/App.test.jsx — smoke tests for route rendering
- .env.example — environment configuration template

## Deployment

This frontend is intended for Vercel deployment. Configure the production domain in VITE_BASE_URL before generating QR codes or shipping public links.

## Database and auth

The app is structured to support Supabase for PostgreSQL, storage, and RLS-based access control. Sensitive actions such as admin moderation, voting validation, and private data queries should be enforced server-side and protected through Supabase policies.

## Phase 1 status

Implemented:

- Vite app foundation preserved and modernized
- React Router configuration with guest-facing routes
- Premium event design system with warm brown, cream, and caramel palette
- Homepage hero and navigation card layout
- Event schedule and private-event placeholder pages
- Smoke tests for route rendering
- README and environment template

Remaining configuration requirements:

- Add real Supabase credentials
- Implement protected admin authentication
- Add true backend persistence for menu, voting, gallery, gratitude, and tournament flows
- Expand the app into the remaining guest experience and admin features in subsequent phases
