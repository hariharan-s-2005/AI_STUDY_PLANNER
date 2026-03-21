## Project Structure

```
Planner.Ai/
├── backend/                    # NestJS Backend API
│   ├── src/
│   │   ├── main.ts            # Application entry point
│   │   ├── app.module.ts       # Root module
│   │   ├── prisma/             # Database layer
│   │   │   ├── prisma.service.ts
│   │   │   └── schema.prisma
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/          # JWT Authentication
│   │   │   ├── users/         # User management
│   │   │   ├── study-plan/    # Study planning
│   │   │   ├── progress/      # Progress tracking
│   │   │   └── ai/            # OpenAI integration
│   │   └── common/            # Shared utilities
│   │       ├── decorators/
│   │       └── guards/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── planner/       # Study planner
│   │   │   ├── analytics/    # Analytics page
│   │   │   ├── settings/     # Settings page
│   │   │   └── auth/         # Auth pages
│   │   ├── components/       # React components
│   │   │   ├── ui/          # ShadCN UI
│   │   │   ├── charts/      # Data visualization
│   │   │   └── layout/      # Layout components
│   │   ├── lib/             # Utilities
│   │   ├── store/           # Zustand state
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
│
├── README.md                  # Project overview
└── DEVELOPMENT.md             # Setup guide
```

## Database Schema

### Users Table
- Stores user accounts with authentication
- Tracks study statistics (streak, level, XP)
- Manages user preferences (timezone, goals)

### Subjects Table
- User-specific study subjects
- Color coding and icons
- Target grades

### Topics Table
- Topics within subjects
- Difficulty and priority
- Estimated study hours

### Study Plans Table
- AI-generated or manual plans
- Date range and status
- Total estimated hours

### Tasks Table
- Individual study tasks
- Scheduling and priorities
- Completion tracking

### Study Sessions Table
- Active study sessions
- Duration and focus score
- Mood and notes

### Progress Logs Table
- Daily progress snapshots
- Completion rates
- Study minutes

## API Routes

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login

### Users
- `GET /api/users/me` - Get profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/stats` - Get statistics
- `GET/POST /api/users/subjects` - Manage subjects

### Study Plans
- `GET /api/study-plans` - List plans
- `POST /api/study-plans/generate` - Generate AI plan
- `GET /api/study-plans/today` - Today's tasks
- `PUT /api/study-plans/tasks/:id` - Update task

### Progress
- `POST /api/progress/sessions/start` - Start session
- `POST /api/progress/sessions/:id/end` - End session
- `GET /api/progress/weekly` - Weekly stats
- `GET /api/progress/subjects` - Subject analytics

### AI
- `POST /api/ai/recommendations` - Get recommendations

## Frontend Pages

### Dashboard
- Overview statistics
- Weekly charts
- Today's tasks
- Quick actions

### Planner
- Weekly calendar view
- Task management
- AI plan generator

### Analytics
- Study hours trends
- Subject performance
- Achievements
- Export options

### Settings
- Profile management
- Notifications
- Appearance
- Study goals

## Tech Stack

### Backend
- NestJS Framework
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- OpenAI API

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- ShadCN UI
- Recharts
- Zustand

## Development Workflow

1. Clone repository
2. Setup environment variables
3. Start databases
4. Run backend: `cd backend && npm run start:dev`
5. Run frontend: `cd frontend && npm run dev`
6. Open http://localhost:3000

## Deployment

### Backend: Railway/Render
- Connect GitHub repository
- Set environment variables
- Automatic deployments

### Frontend: Vercel
- Import from GitHub
- Configure environment variables
- Deploy with CDN

### Database: Neon/Supabase
- Create PostgreSQL project
- Get connection string
- Update DATABASE_URL
