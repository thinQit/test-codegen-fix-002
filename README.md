# Task Manager

A web-based Task Manager supporting authentication, task CRUD, and a metrics dashboard. Built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.

## Features
- Secure signup and login with JWT-based auth
- Task creation, editing, deletion, and status updates
- Filtering, sorting, and pagination for task lists
- Dashboard metrics with summary statistics
- Accessible, responsive UI components

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma + SQLite (dev) with migration-ready schema
- Tailwind CSS
- Jest + Testing Library
- Playwright

## Prerequisites
- Node.js 18+
- npm

## Quick Start

### macOS/Linux
```bash
./install.sh
npm run dev
```

### Windows (PowerShell)
```powershell
./install.ps1
npm run dev
```

## Environment Variables
Create a `.env` file from `.env.example`:

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-min-32-chars-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

## Project Structure
```
src/
  app/            # App Router pages, layouts, and API routes
  components/     # Shared UI and layout components
  lib/            # Utilities, API helpers
  providers/      # React context providers
  types/          # Shared TypeScript types
prisma/           # Prisma schema and migrations
```

## API Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/dashboard`

## Available Scripts
- `npm run dev` - Start dev server
- `npm run build` - Build app with Prisma generate
- `npm run start` - Start production server
- `npm run lint` - Lint the codebase
- `npm run test` - Run Jest tests
- `npm run test:e2e` - Run Playwright tests

## Testing
- Unit tests: Jest + React Testing Library
- E2E tests: Playwright

## Notes
- Passwords are hashed with bcryptjs on the server.
- JWTs are used for short-lived access tokens and refresh flows.
- Prisma schema uses string fields for status/role to maintain SQLite compatibility.
