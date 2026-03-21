export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  timezone: string;
  dailyGoal: number;
  streakCount: number;
  lastStudyDate?: string;
  totalStudyMinutes: number;
  level: number;
  experiencePoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  targetGrade?: string;
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number;
  estimatedHours: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface StudyPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  status: 'active' | 'completed' | 'paused';
  aiGenerated: boolean;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  studyPlanId: string;
  topicId?: string;
  title: string;
  description?: string;
  plannedMinutes: number;
  actualMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  priority: number;
  scheduledDate?: string;
  completedAt?: string;
  topic?: Topic;
  subject?: Subject;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId?: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  focusScore?: number;
  notes?: string;
  mood?: 'great' | 'good' | 'okay' | 'tired';
  subject?: Subject;
  task?: Task;
}

export interface ProgressLog {
  id: string;
  userId: string;
  date: string;
  tasksCompleted: number;
  tasksPlanned: number;
  studyMinutes: number;
  focusScore?: number;
  completionRate: number;
}

export interface WeeklyStats {
  dailyStats: DailyStat[];
  totalMinutes: number;
  avgDailyMinutes: number;
  mostProductiveDay: { date: string; totalMinutes: number };
  totalSessions: number;
}

export interface DailyStat {
  date: string;
  totalMinutes: number;
  sessionsCount: number;
  subjectBreakdown: Record<string, number>;
}

export interface SubjectAnalytics {
  name: string;
  color: string;
  totalMinutes: number;
  sessionsCount: number;
  avgSessionLength: number;
}

export interface UserStats {
  streakCount: number;
  level: number;
  experiencePoints: number;
  totalStudyMinutes: number;
  weeklyProgress: ProgressLog[];
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface AIGeneratedPlan {
  totalHours: number;
  tasks: {
    title: string;
    description: string;
    topicName: string;
    plannedMinutes: number;
    difficulty: string;
    priority: number;
    scheduledDate: string;
  }[];
  insights: {
    strengths: string[];
    areasToFocus: string[];
    tips: string[];
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  earnedAt?: string;
  unlocked: boolean;
}
