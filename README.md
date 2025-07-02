# Soullve LTE - Mental Health App

Soullve LTE is a modern mental health web application built with Next.js, React, and TypeScript. It provides a secure, user-friendly platform for patients and therapists to manage sessions, notes, and therapy resources.

## Features

- **User Authentication:** Secure sign up, login, and session management.
- **Patient Dashboard:** Personalized dashboard for patients to view sessions, notes, and resources.
- **Therapist Dashboard:** Tools for therapists to manage patients, notes, and therapy types.
- **Real-time Chat:** Secure messaging between patients and therapists.
- **Session Scheduling:** Book, view, and manage therapy sessions.
- **Notes & Resources:** Add, view, and manage therapy notes and educational resources.
- **Role-based Access:** Separate flows and permissions for patients and therapists.
- **Responsive Design:** Works on desktop and mobile devices.

## Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, CSS Modules
- **Backend:** Node.js, Redis (for caching), Supabase (auth & database)
- **Other:** Environment variables for configuration, modular component structure

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Redis server (for caching)
- Supabase project (for authentication and database)

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/yourusername/soullvelte.git
   cd soullvelte
   ```

2. **Install dependencies:**

   ```sh
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SERVER_URL=https://license-naxr.onrender.com
   LICENSE_KEY=PIRJ-T6Q1-S51K-A6CO
   UPSTASH_REDIS_URL=your_upstash_redis_url
   UPSTASH_REDIS_TOKEN=your_upstash_redis_token
   ```

4. **Start the development server:**

   ```sh
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**  
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
  _components/      # Reusable React components
  _lib/             # Utility functions and services (API, cache, etc.)
  (patient)/        # Patient-specific routes and pages
  (therapist)/      # Therapist-specific routes and pages
  _utils/           # Helper utilities (Supabase, middleware, etc.)
public/             # Static assets
styles/             # Global styles
.env.local          # Environment variables
```

## Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm start` — Start the production server

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

---

**Soullve LTE** — Empowering mental health through technology.
