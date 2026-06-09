# EdManagementOrg Platform

Education Management Organization platform for portfolio oversight, professional development, instructional coaching, and school operations across a K-12 network.

## Tech Stack

- Next.js (App Router) + TypeScript
- Supabase (database + auth)
- Tailwind CSS + shadcn/ui
- Recharts

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Copy `.env.local.example` to `.env.local` and add your hosted Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run database migrations

In the Supabase SQL Editor, run in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql` (optional sample data)

### 4. Enable Email auth

In Supabase Dashboard → Authentication → Providers → enable Email.

### 5. Start dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), sign up, and explore the dashboard.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Role-based dashboard (portfolio, workspace, or board view) |
| `/workspace` | Unified educator home for teachers, coaches, parents |
| `/schools/[id]` | School detail with goals, interventions, chart |
| `/goals` | Strategic goals with filters and inline updates |
| `/interventions` | Intervention log with create/edit |
| `/growth-plans` | Teacher growth plans with goals, reflections, evidence |
| `/coaching` | Instructional coaching cycles and observations |
| `/pd` | Professional development catalog and registration |
| `/certifications` | Certification tracker with expiry alerts |

## User Roles

`admin`, `regional_manager`, `staff`, `teacher`, `coach`, `consultant`, `parent`, `board_member` — each role sees a tailored nav and home dashboard.

## School Health Logic

- **Green (Healthy):** ≥80% of goals on track
- **Yellow (At Risk):** 60–79% on track
- **Red (Off Track):** <60% on track
