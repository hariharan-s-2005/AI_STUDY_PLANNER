'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { studyPlanAPI } from '@/lib/api';
import { CheckCircle2, Circle, Clock, Play, Pause, Trash2, Calendar as CalendarIcon, Loader2, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  description?: string;
  plannedMinutes: number;
  actualMinutes: number;
  difficulty: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
  metadata?: {
    subjectName?: string;
    chapterName?: string;
    timeSlot?: string;
  };
}

interface TaskTimer {
  taskId: string;
  remainingSeconds: number;
  isRunning: boolean;
  intervalId?: NodeJS.Timeout;
}

interface DeleteModal {
  taskId: string;
  taskTitle: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [timers, setTimers] = useState<Record<string, TaskTimer>>({});
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [dontAskDelete, setDontAskDelete] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timers).forEach(timer => {
        if (timer.intervalId) clearInterval(timer.intervalId);
      });
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await studyPlanAPI.getTasks();
      setTasks(res.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (task: Task) => {
    // Always prefer the task's actual start/end times (most precise)
    if (task.startTime && task.endTime) {
      return `${task.startTime} - ${task.endTime}`;
    }
    // Fallback to metadata slot label only if no direct times
    if (task.metadata?.timeSlot && task.metadata.timeSlot !== 'study' && task.metadata.timeSlot !== 'break') {
      return task.metadata.timeSlot;
    }
    return null;
  };


  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const h = hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    // Stop any other running timers
    Object.entries(timers).forEach(([id, timer]) => {
      if (id !== taskId && timer.isRunning && timer.intervalId) {
        clearInterval(timer.intervalId);
      }
    });

    // Get remaining time (from existing timer or planned minutes)
    const existingTimer = timers[taskId];
    const remainingSeconds = existingTimer 
      ? existingTimer.remainingSeconds 
      : task.plannedMinutes * 60;

    const intervalId = setInterval(() => {
      setTimers(prev => {
        const timer = prev[taskId];
        if (!timer || timer.remainingSeconds <= 0) {
          if (timer?.intervalId) clearInterval(timer.intervalId);
          return prev;
        }
        return {
          ...prev,
          [taskId]: {
            ...timer,
            remainingSeconds: timer.remainingSeconds - 1,
          }
        };
      });
    }, 1000);

    setTimers(prev => ({
      ...prev,
      [taskId]: {
        taskId,
        remainingSeconds,
        isRunning: true,
        intervalId,
      }
    }));

    // Update task status to in_progress
    studyPlanAPI.updateTask(taskId, { status: 'in_progress' });
    setTasks(tasks.map(t => 
      t._id === taskId ? { ...t, status: 'in_progress' } : t
    ));
  };

  const pauseTimer = (taskId: string) => {
    const timer = timers[taskId];
    if (!timer || !timer.intervalId) return;

    clearInterval(timer.intervalId);
    
    setTimers(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        isRunning: false,
        intervalId: undefined,
      }
    }));
  };

  const stopTimer = async (taskId: string) => {
    const timer = timers[taskId];
    if (!timer) return;

    if (timer.intervalId) clearInterval(timer.intervalId);

    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const secondsStudied = (task.plannedMinutes * 60) - timer.remainingSeconds;
    const minutesStudied = Math.round(secondsStudied / 60);

    setTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[taskId];
      return newTimers;
    });

    // Update actual minutes
    const newActualMinutes = (task.actualMinutes || 0) + minutesStudied;
    await studyPlanAPI.updateTask(taskId, { 
      actualMinutes: newActualMinutes,
      status: 'pending'
    });
    setTasks(tasks.map(t => 
      t._id === taskId ? { ...t, actualMinutes: newActualMinutes, status: 'pending' } : t
    ));
  };

  const completeTask = async (taskId: string) => {
    const timer = timers[taskId];
    if (timer) {
      await stopTimer(taskId);
    }

    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    // Calculate actual minutes if timer was running
    let actualMinutes = task.actualMinutes || 0;
    if (timer) {
      const secondsStudied = (task.plannedMinutes * 60) - timer.remainingSeconds;
      actualMinutes += Math.round(secondsStudied / 60);
    } else {
      actualMinutes = task.plannedMinutes;
    }

    await studyPlanAPI.updateTask(taskId, { 
      status: 'completed',
      actualMinutes,
      completedAt: new Date().toISOString()
    });
    setTasks(tasks.map(t => 
      t._id === taskId ? { ...t, status: 'completed', actualMinutes, completedAt: new Date().toISOString() } : t
    ));
  };

  const deleteTask = async (taskId: string) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    // Check if user chose "don't ask again"
    if (localStorage.getItem('dont_ask_delete_task') === 'true') {
      await performDelete(taskId);
      return;
    }

    // Show modal
    setDeleteModal({ taskId, taskTitle: task.title });
  };

  const performDelete = async (taskId: string) => {
    try {
      await studyPlanAPI.deleteTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;
    
    if (dontAskDelete) {
      localStorage.setItem('dont_ask_delete_task', 'true');
    }
    
    await performDelete(deleteModal.taskId);
    setDeleteModal(null);
    setDontAskDelete(false);
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'pending') return task.status !== 'completed';
      if (filter === 'completed') return task.status === 'completed';
      return true;
    })
    .sort((a, b) => {
      const dateA = a.scheduledDate || '';
      const dateB = b.scheduledDate || '';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      const timeA = a.startTime || '99:99';
      const timeB = b.startTime || '99:99';
      return timeA.localeCompare(timeB);
    });

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const pendingCount = tasks.filter(t => t.status !== 'completed').length;
  const totalMinutesStudied = tasks
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.actualMinutes || t.plannedMinutes || 0), 0);
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return '';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No date';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDate = new Date(dateStr);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) return 'Today';
    if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage your study tasks</p>
          </div>
          <div className="flex border rounded-md">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
                className={`rounded-none first:rounded-l-md last:rounded-r-md ${filter === f ? '' : 'bg-transparent'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedCount}</div>
                <Progress value={progress} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time Studied</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(totalMinutesStudied / 60)}h {totalMinutesStudied % 60}m
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle>All Tasks</CardTitle>
              </div>
              <span className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                {tasks.length === 0 ? (
                  <>
                    <Circle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                    <p className="text-muted-foreground">Create a study plan to generate tasks</p>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {filter === 'pending' ? 'No pending tasks' : 'No completed tasks'}
                    </h3>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const timer = timers[task._id];
                  const timeSlot = formatTimeSlot(task);
                  const isActive = timer?.isRunning;
                  const remainingSeconds = timer?.remainingSeconds ?? (task.plannedMinutes * 60);

                  return (
                    <div
                      key={task._id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                        task.status === 'completed' 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : isActive 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' 
                            : 'hover:bg-accent'
                      }`}
                    >
                      {/* Complete/Delete button */}
                      <button
                        onClick={() => task.status === 'completed' ? deleteTask(task._id) : completeTask(task._id)}
                        className="flex-shrink-0"
                        title={task.status === 'completed' ? 'Delete task' : 'Mark complete'}
                      >
                        {task.status === 'completed' ? (
                          <Trash2 className="h-6 w-6 text-red-500 hover:text-red-700" />
                        ) : (
                          <CheckCircle2 className="h-6 w-6 text-muted-foreground hover:text-green-500 transition-colors" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {task.metadata?.subjectName && (
                            <span className="text-xs font-medium text-primary">{task.metadata.subjectName}</span>
                          )}
                          {task.metadata?.chapterName && (
                            <>
                              <span className="text-xs text-muted-foreground">-</span>
                              <span className="text-xs font-medium text-muted-foreground">{task.metadata.chapterName}</span>
                            </>
                          )}
                        </div>
                        <p className={`font-medium mt-1 ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        {timeSlot && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">{timeSlot}</span>
                          </div>
                        )}
                        {task.actualMinutes > 0 && (
                          <span className="text-xs text-green-600">+{task.actualMinutes}m studied</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {task.difficulty && (
                          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(task.difficulty)}`}>
                            {task.difficulty}
                          </span>
                        )}
                        
                        <span className="text-xs text-muted-foreground">{formatDate(task.scheduledDate)}</span>

                        {/* Timer button */}
                        {task.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            onClick={() => {
                              if (isActive) {
                                pauseTimer(task._id);
                              } else {
                                startTimer(task._id);
                              }
                            }}
                            className={`h-9 min-w-[80px] font-mono ${
                              isActive 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : timer && !timer.isRunning 
                                  ? 'border-blue-400 text-blue-600' 
                                  : ''
                            }`}
                          >
                            {timer ? (
                              <>
                                {isActive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                                {formatCountdown(remainingSeconds)}
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                {task.plannedMinutes}m
                              </>
                            )}
                          </Button>
                        )}

                        {/* Delete button for completed */}
                        {task.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTask(task._id)}
                            className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Modal */}
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Delete Task
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Are you sure you want to delete &quot;{deleteModal.taskTitle}&quot;? This action cannot be undone.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dontAskDelete}
                    onChange={(e) => setDontAskDelete(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Don&apos;t ask again for task deletions
                  </span>
                </label>
              </div>

              <div className="flex gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteModal(null);
                    setDontAskDelete(false);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
