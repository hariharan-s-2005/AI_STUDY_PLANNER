import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Sanitize message to remove any image references
const sanitizeMessage = (message: string): string => {
  let clean = String(message || '').trim();
  
  // Remove all image patterns
  const patterns = [
    /image\.png/gi,
    /image\.jpg/gi,
    /image\.jpeg/gi,
    /image\.gif/gi,
    /\.png/gi,
    /\.jpg/gi,
    /\.jpeg/gi,
    /\.gif/gi,
    /screenshot/gi,
    /data:image/gi,
    /base64/gi,
  ];
  
  for (const pattern of patterns) {
    clean = clean.replace(pattern, '');
  }
  
  return clean.trim();
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/api/auth/login', data),
};

// Subjects
export const subjectsAPI = {
  getAll: () => api.get('/api/subjects'),
  create: (data: any) => api.post('/api/subjects', data),
  update: (id: string, data: any) => api.put(`/api/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/api/subjects/${id}`),
  addChapter: (id: string, chapter: any) => api.post(`/api/subjects/${id}/chapters`, chapter),
  updateChapter: (id: string, chapterIndex: number, data: any) =>
    api.put(`/api/subjects/${id}/chapters/${chapterIndex}`, data),
  deleteChapter: (id: string, chapterIndex: number) =>
    api.delete(`/api/subjects/${id}/chapters/${chapterIndex}`),
};

// Study Plans
export const studyPlanAPI = {
  getPlans: () => api.get('/api/study-plans'),
  getPlan: (id: string) => api.get(`/api/study-plans/${id}`),
  create: (data: any) => api.post('/api/study-plans', data),
  generate: (data: {
    subjectIds: string[];
    dailyAvailableMinutes: number;
    startDate: string;
    endDate: string;
    difficultyLevel: string;
    planDuration: string;
  }) => api.post('/api/study-plans/generate', data),
  getTasks: (filters?: { status?: string; date?: string }) =>
    api.get('/api/study-plans/tasks', { params: filters }),
  createTask: (data: any) => api.post('/api/study-plans/tasks', data),
  updateTask: (taskId: string, data: any) => api.put(`/api/study-plans/tasks/${taskId}`, data),
  deleteTask: (taskId: string) => api.delete(`/api/study-plans/tasks/${taskId}`),
};

// Progress
export const progressAPI = {
  startSession: (data: any) => api.post('/api/progress/sessions/start', data),
  endSession: (sessionId: string, data: any) =>
    api.post(`/api/progress/sessions/${sessionId}/end`, data),
  getWeeklyStats: () => api.get('/api/progress/weekly'),
  getProgressHistory: (days?: number) => api.get(`/api/progress/history?days=${days || 30}`),
  getSubjectAnalytics: () => api.get('/api/progress/subjects'),
};

// AI
export const aiAPI = {
  chat: (message: string) => api.post('/api/ai/chat', { message: sanitizeMessage(message) }),
};

export default api;
