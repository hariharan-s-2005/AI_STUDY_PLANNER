'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { subjectsAPI, progressAPI, studyPlanAPI } from '@/lib/api';
import { useAuthStore } from '@/store';
import { Brain, TrendingUp, Clock, Target, Flame, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Subject {
  _id: string;
  name: string;
  color: string;
  chapters: any[];
}

interface ProgressData {
  dailyStats: any[];
  totalMinutes: number;
  avgDailyMinutes: number;
  totalSessions: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, tasksRes, progressRes] = await Promise.all([
        subjectsAPI.getAll(),
        studyPlanAPI.getTasks().catch(() => null),
        progressAPI.getWeeklyStats().catch(() => null),
      ]);
      setSubjects(subjectsRes.data || []);

      const tasksData = tasksRes?.data || [];
      const completedTasks = tasksData.filter((t: any) => t.status === 'completed');

      const totalMinutes = completedTasks.reduce(
        (sum: number, t: any) => sum + (t.actualMinutes || t.plannedMinutes || 0),
        0,
      );
      const avgDailyMinutes = Math.round(totalMinutes / 7);
      const totalSessions = completedTasks.length;

      // Generate daily stats from completed tasks using local timezone formatting
      const getLocalDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const generatedDailyStats = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateString(d);

        const dayTasks = completedTasks.filter((t: any) => {
          // Fallback to scheduledDate or updated if completedAt is missing
          const taskDate = new Date(t.completedAt || t.updatedAt || t.scheduledDate || new Date());
          return getLocalDateString(taskDate) === dateStr;
        });

        generatedDailyStats.push({
          date: dateStr,
          totalMinutes: dayTasks.reduce((sum: number, t: any) => sum + (t.actualMinutes || t.plannedMinutes || 0), 0),
          sessionsCount: dayTasks.length,
        });
      }

      setProgressData({
        totalMinutes: totalMinutes,
        dailyStats: generatedDailyStats,
        avgDailyMinutes: avgDailyMinutes,
        totalSessions: totalSessions,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalChapters = subjects.reduce((sum, s) => sum + (s.chapters?.length || 0), 0);
  const completedChapters = subjects.reduce((sum, s) => sum + (s.chapters?.filter((c: any) => c.completed)?.length || 0), 0);

  const weeklyData = progressData?.dailyStats || [];
  const hasData = subjects.length > 0 || (weeklyData && weeklyData.length > 0);

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
            <h1 className="text-3xl font-bold">{greeting}{user?.firstName ? `, ${user.firstName}` : ''}!</h1>
            <p className="text-muted-foreground">
              {hasData ? "Here's your study overview" : "Get started by adding subjects and creating a study plan"}
            </p>
          </div>
          {!hasData && (
            <Link href="/planner">
              <Button size="lg">
                <Brain className="mr-2 h-5 w-5" />
                Create Study Plan
              </Button>
            </Link>
          )}
        </div>

        {hasData ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                  <Target className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{subjects.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalChapters}</div>
                  {totalChapters > 0 && (
                    <p className="text-xs text-muted-foreground">{completedChapters} completed</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
                  <Clock className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {progressData && progressData.totalMinutes > 0
                      ? `${Math.round((progressData.totalMinutes / 60) * 10) / 10}h`
                      : '0h'}
                  </div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                  <Flame className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{user?.streakCount || 0} days</div>
                </CardContent>
              </Card>
            </div>

            {weeklyData.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Study Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="totalMinutes" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subject Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {subjects.length > 0 ? (
                      <>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={subjects.map(s => ({ name: s.name, value: s.chapters?.length || 1, color: s.color }))} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                                {subjects.map((s, i) => (
                                  <Cell key={i} fill={s.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {subjects.map((s) => (
                            <div key={s._id} className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                              <span className="text-sm">{s.name}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No subjects added yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Subjects</CardTitle>
                  <Link href="/subjects">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {subjects.length > 0 ? (
                    <div className="space-y-3">
                      {subjects.slice(0, 4).map((subject) => (
                        <div key={subject._id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                            <div>
                              <p className="font-medium">{subject.name}</p>
                              <p className="text-sm text-muted-foreground">{subject.chapters?.length || 0} chapters</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {subject.chapters?.filter((c: any) => c.completed)?.length || 0}/{subject.chapters?.length || 0}
                            </p>
                            {subject.chapters?.length > 0 && (
                              <Progress value={(subject.chapters.filter((c: any) => c.completed).length / subject.chapters.length) * 100} className="h-1 w-16 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No subjects added yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    <Link href="/planner">
                      <Button variant="outline" className="w-full justify-start">
                        <Brain className="mr-2 h-5 w-5" />
                        Generate AI Study Plan
                      </Button>
                    </Link>
                    <Link href="/subjects">
                      <Button variant="outline" className="w-full justify-start">
                        <Target className="mr-2 h-5 w-5" />
                        Add New Subject
                      </Button>
                    </Link>
                    <Link href="/assistant">
                      <Button variant="outline" className="w-full justify-start">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Chat with AI Assistant
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Brain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Welcome to Planner.AI!</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start by adding your subjects and chapters, then generate a personalized study plan powered by AI.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/subjects">
                  <Button>
                    <Target className="mr-2 h-5 w-5" />
                    Add Subjects
                  </Button>
                </Link>
                <Link href="/assistant">
                  <Button variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
