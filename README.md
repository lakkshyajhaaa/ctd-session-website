# Session Attendance - Class Management Platform

A production-ready web application for class/session management and attendance tracking with Trainer, Student, and Admin roles.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Recharts
- **Backend**: Next.js API Routes (REST)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT, secure cookies
- **Deployment**: Vercel (frontend), Railway/Render (backend + database)

## Features

### Trainers
- Create sessions (subject, topic, duration, type)
- Generate real-time attendance codes (20s expiry)
- Record session notes
- View registered students and attendance

### Students
- Register for sessions
- Enter attendance code to verify presence
- Track study hours and attendance rate
- View session notes
- Achievement tracking

### Admins
- Manage trainers and students
- View all sessions and data
- Edit session notes
- System analytics

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### 1. Clone and Install

```bash
cd session-attendance-app
npm install
```

### 2. Environment Variables

Copy the example env file and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/session_attendance?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars-change-in-production"
JWT_SECRET="your-jwt-secret-min-32-characters"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (dev)
npm run db:push

# Or run migrations (production)
npm run db:migrate

# Seed demo users (optional)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts (after seed)

| Role   | Email              | Password    |
|--------|--------------------|-------------|
| Admin  | admin@example.com  | Admin123!   |
| Trainer| trainer@example.com| Trainer123! |
| Student| student@example.com| Student123! |

## Project Structure

```
session-attendance-app/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed script
├── src/
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── auth/        # Login, register, forgot password
│   │   ├── dashboard/   # Role-based dashboards
│   │   └── admin/       # Admin panel
│   ├── components/
│   │   ├── ui/          # shadcn components
│   │   ├── layout/      # Sidebar, theme toggle
│   │   └── dashboard/   # Dashboard components
│   ├── lib/             # Auth, Prisma, utils, validations
│   ├── server/services/ # Business logic
│   ├── middleware.ts    # Auth middleware
│   └── types/           # TypeScript types
└── package.json
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login (via NextAuth)
- `GET /api/auth/me` - Current user

### Sessions
- `GET /api/sessions` - List sessions
- `POST /api/sessions` - Create session (Trainer/Admin)
- `GET /api/sessions/:id` - Session detail
- `POST /api/sessions/:id/register` - Register for session (Student)

### Attendance
- `POST /api/attendance/generate-code` - Generate code (Trainer)
- `POST /api/attendance/verify` - Verify code (Student)
- `GET /api/attendance/session/:id` - Session attendance

### Notes
- `POST /api/notes` - Create note
- `GET /api/notes/session/:id` - Session notes

### Admin
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## Security

- **Password**: bcrypt hashing (12 rounds)
- **API**: JWT verification via NextAuth
- **Rate limiting**: Attendance code attempts (5/min per student)
- **Validation**: Zod schemas on all inputs
- **SQL injection**: Protected via Prisma ORM

## Deployment

### Vercel (Frontend + API)

1. Connect your repo to Vercel
2. Add environment variables
3. Deploy

### Railway/Render (Database)

1. Create PostgreSQL database
2. Copy `DATABASE_URL` to Vercel env
3. Run migrations: `npx prisma migrate deploy`

## License

MIT
