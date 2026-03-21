# Development Setup

## Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and API keys

# Start development server
npm run start:dev
```

Backend runs at: http://localhost:4000

## MongoDB Setup

### Option 1: Local MongoDB with Compass
1. Install MongoDB Community Server
2. Start MongoDB: `mongod`
3. Connect via MongoDB Compass: `mongodb://localhost:27017`
4. Create database: `planner_ai`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update MONGODB_URI in .env

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend runs at: http://localhost:3000

## Environment Variables

### Backend (.env)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Backend server port (default: 4000)
- `FRONTEND_URL`: Frontend URL for CORS

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_URL`: Frontend URL

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:4000/api/docs

## Testing

### Backend Tests
```bash
npm run test
```

### Frontend Build
```bash
npm run build
```

## Production Deployment

### Backend (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables (MONGODB_URI, JWT_SECRET, OPENAI_API_KEY)
3. Deploy

### Frontend (Vercel)
1. Import project from GitHub
2. Set environment variables
3. Deploy with CDN

### MongoDB Atlas
1. Create free cluster at mongodb.com/cloud/atlas
2. Whitelist IP addresses (0.0.0.0/0 for development)
3. Get connection string
4. Update MONGODB_URI in backend

## Features

- AI-powered study plan generation
- Progress tracking and analytics
- Streak and achievement system
- Subject and topic management
- Daily task scheduling
- Focus session tracking
- Responsive dashboard
- Dark mode support

## Support

For issues or questions, create an issue on GitHub.
