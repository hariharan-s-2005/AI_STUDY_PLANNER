# Planner.AI - AI-Powered Study Planner

A full-stack AI-powered study planner with subjects, chapters, tasks, AI planning, and chat assistant.

## Features

- **Subjects & Chapters**: Create subjects with chapters/topics
- **AI Study Planner**: Generate personalized study plans (daily/weekly/monthly)
- **Task Management**: Track and manage your study tasks
- **AI Assistant**: Chat with AI for study tips and motivation
- **Progress Analytics**: Track your study hours and completion rates
- **Dark Mode**: Supports light and dark themes

---

## What You Need To Do (Step by Step)

### Step 1: Install MongoDB
1. Download MongoDB from: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. Start MongoDB service

### Step 2: Create Database in MongoDB Compass
1. Open **MongoDB Compass**
2. Click **"New Connection"**
3. Connect with: `mongodb://localhost:27017`
4. Click **"Create Database"**
5. Database Name: `planner_ai`
6. Collection Name: `users` (just create one collection, MongoDB will create others automatically)

### Step 3: Backend Setup

```bash
cd C:\Planner.Ai\backend
npm install
```

Create `backend\.env` file:
```
MONGODB_URI=mongodb://localhost:27017/planner_ai
JWT_SECRET=mysecretkey123456789012345678901234
OPENAI_API_KEY=sk-your-openai-api-key-here
PORT=4000
FRONTEND_URL=http://localhost:3000
```

**Get OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Create account/Login
3. Click "Create new secret key"
4. Copy the key and paste it in `.env`

Start backend:
```bash
npm run start:dev
```
Backend will run at: http://localhost:4000

### Step 4: Frontend Setup

```bash
cd C:\Planner.Ai\frontend
npm install
npm run dev
```
Frontend will run at: http://localhost:3000

### Step 5: Open in Browser
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:4000/api/docs

---

## How To Use

### 1. Sign Up / Login
- Create an account or login

### 2. Add Subjects & Chapters
- Go to **Subjects** page
- Click **"Add Subject"**
- Enter subject name and choose color
- Expand the subject and click **"Chapter"** to add chapters
- Set difficulty (easy/medium/hard) and estimated hours for each chapter

### 3. Generate AI Study Plan
- Go to **AI Planner** page
- **Step 1**: Select subjects (only those with chapters)
- **Step 2**: Set daily study time (hours + minutes)
- **Step 3**: Choose duration (Daily/Weekly/Monthly)
- Set start and end dates
- Click **"Generate Plan"**
- AI will create personalized tasks based on your subjects and chapters

### 4. Manage Tasks
- Go to **Tasks** page
- View all tasks organized
- Click task to mark as complete
- Filter by status (All/Pending/Completed)

### 5. Chat with AI Assistant
- Go to **AI Assistant** page
- Ask any study-related questions
- Get tips and motivation

### 6. View Analytics
- Go to **Analytics** page
- See study hours, progress, and subject distribution

---

## Pages

| Page | Description |
|------|-------------|
| Dashboard | Overview with stats - shows only real data |
| Subjects | Add subjects with chapters |
| AI Planner | 3-step wizard to generate study plans |
| Tasks | Manage study tasks from generated plans |
| Analytics | View progress and statistics |
| AI Assistant | Chat with AI study helper |
| Settings | Configure your profile |

---

## Important Notes

1. **No Mock Data**: All pages show only real data from database
2. **Empty States**: Pages show proper empty states when no data exists
3. **API Key Required**: AI features require valid OpenAI API key
4. **Subjects Need Chapters**: Only subjects with chapters can be selected for planning

---

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check `mongod` is running in terminal
- Verify connection string in `.env`

**OpenAI Error:**
- Make sure you have valid API key
- Check your OpenAI account has available credits

**Blank Pages:**
- This means no data exists - add subjects and generate plans first

---

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Recharts, Zustand
- **Backend**: NestJS, MongoDB (Mongoose), JWT
- **AI**: OpenAI GPT-4

---

## Quick Reference

```bash
# Start MongoDB (in separate terminal)
mongod

# Start Backend (in backend folder)
npm run start:dev

# Start Frontend (in frontend folder)
npm run dev
```

**Database**: MongoDB at `mongodb://localhost:27017/planner_ai`
**API Docs**: http://localhost:4000/api/docs
**App**: http://localhost:3000
