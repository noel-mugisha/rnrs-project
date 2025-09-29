# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

RNRS (Raising Non Employed Rwandans) is a comprehensive job portal platform connecting job seekers with employers in Rwanda. It consists of a TypeScript/Express backend API and a Next.js frontend application.

## Development Commands

### Backend (Express/Prisma API)
```bash
cd backend

# Development
npm run dev                 # Start development server with hot reload
npm run build              # Build TypeScript to JavaScript
npm start                  # Start production server

# Database operations
npm run db:generate        # Generate Prisma client types
npm run db:migrate         # Run database migrations (development)
npm run db:deploy          # Deploy migrations to production
npm run db:seed            # Seed database with sample data

# Testing & Quality
npm test                   # Run Jest tests
npm run test:watch         # Run tests in watch mode
npm run lint               # Run ESLint
npm run lint:fix           # Auto-fix ESLint issues
```

### Frontend (Next.js)
```bash
cd frontend

# Development
npm run dev                # Start development server (port 3000)
npm run build              # Build for production
npm start                  # Start production server
npm run lint               # Run Next.js linter
```

### Running Single Tests
```bash
# Backend - run specific test file
cd backend
npm test -- --testPathPattern="auth.test.ts"

# Backend - run tests in specific directory
npm test -- src/services/auth/

# Backend - run single test case
npm test -- --testNamePattern="should validate user credentials"
```

## Architecture Overview

### Backend Architecture (Port 4000)

The backend follows a layered architecture pattern with clean separation of concerns:

**Entry Points:**
- `src/server.ts` - Server startup with database connection and graceful shutdown
- `src/app.ts` - Express app configuration with middleware setup

**Core Layers:**
- **Routes** (`src/routes/`) - API endpoint definitions and route grouping
- **Controllers** (`src/controllers/`) - Request/response handling and HTTP-specific logic
- **Services** (`src/services/`) - Business logic layer with domain-specific operations
- **Middleware** (`src/middleware/`) - Authentication, validation, rate limiting, error handling

**Key Infrastructure:**
- **Database** - PostgreSQL with Prisma ORM for type-safe database operations
- **Authentication** - JWT with refresh tokens stored in httpOnly cookies
- **File Storage** - Cloudinary integration for resume/logo uploads
- **Background Jobs** - Background processing for email notifications and file processing
- **Validation** - Zod schemas for comprehensive input validation
- **Logging** - Winston with structured logging to files

**Database Models:**
- Users with role-based access (JobSeeker, JobProvider, Admin)
- JobSeekerProfile with skills, resumes, and applications
- Employer profiles with job postings and application management
- Job applications with status tracking and notifications

### Frontend Architecture (Port 3000)

Next.js 14 application using App Router with modern React patterns:

**Structure:**
- **App Router** (`app/`) - File-based routing with layouts and pages
- **Components** (`components/`) - Reusable UI components using Radix UI and Tailwind CSS
- **Hooks** (`hooks/`) - Custom React hooks for shared logic
- **Lib** (`lib/`) - Utility functions and shared configurations

**Key Features:**
- **Authentication Flow** - Login, signup, and email verification pages
- **Dashboard** - Role-specific dashboards for job seekers and employers
- **Job Management** - Job search, posting, and application tracking
- **Theme System** - Light/dark mode support with next-themes

## Key Development Patterns

### Backend Patterns

**Service Layer Pattern:**
All business logic is encapsulated in services that controllers call. Services handle:
- Data validation using Zod schemas
- Database operations through Prisma
- External API integrations (Cloudinary, email)
- Business rule enforcement

**Authentication Middleware:**
JWT tokens are validated in middleware before reaching protected routes. Refresh tokens enable seamless token renewal.

**Error Handling:**
Centralized error handling middleware processes all errors and returns consistent API responses.

**Database Migrations:**
All schema changes go through Prisma migrations. The seed script creates test data for development.

### Frontend Patterns

**Server/Client Component Split:**
Pages use server components for SEO and performance, with client components for interactivity.

**Form Management:**
React Hook Form with Zod validation for type-safe form handling throughout the application.

**State Management:**
React Context for authentication state, with server state handled by Next.js data fetching.

## Environment Setup

### Required Services
- **PostgreSQL** - Main database (locally or cloud)
- **Cloudinary** - File storage for resumes and company logos
- **SMTP Server** - Email notifications (Gmail, SendGrid, etc.)

### Environment Files
- Backend: Copy `.env.example` to `.env` and configure all required variables
- Frontend: Next.js handles environment variables through `.env.local`

### Database Initialization
After setting up PostgreSQL:
1. Run `npm run db:generate` to create Prisma client
2. Run `npm run db:migrate` to create tables
3. Run `npm run db:seed` to populate with test data

## Testing & Development

### Test Accounts (from seed data)
- Admin: `admin@jobportal.com` / `Admin123!`
- Job Seeker: `jobseeker@example.com` / `JobSeeker123!`
- Job Provider: `employer@example.com` / `JobProvider123!`

### API Documentation
- Swagger UI available at `/api-docs` when backend is running
- Postman collection in `backend/postman_collection.json`

### Development Flow
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Backend runs on port 4000, frontend on port 3000
4. Use test accounts or create new accounts through the signup flow

## Common Troubleshooting

**Database Connection Issues:**
- Verify PostgreSQL is running and DATABASE_URL is correct
- Run migrations if tables are missing

**File Upload Problems:**
- Verify Cloudinary credentials are set correctly
- Check network connectivity for external API calls

**JWT Token Issues:**
- Clear browser cookies if experiencing authentication problems
- Verify JWT_SECRET and REFRESH_TOKEN_SECRET are set