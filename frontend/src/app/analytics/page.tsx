'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subjectsAPI } from '@/lib/api';
import { Loader2, TrendingUp, Clock, Target, Flame, Download, Plus } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

interface Subject {
  _id: string;
  name: string;
  color: string;
  chapters: any[];
}

interface WeeklyStats {
  dailyStats: any[];
  totalMinutes: number;
  avgDailyMinutes: number;
  totalSessions: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const subjectsRes = await subjectsAPI.getAll();
      setSubjects(subjectsRes.data || []);

      const weeklyRes = await fetch('/api/progress/weekly', { headers }).then(r => r.json()).catch(() => null);
      setWeeklyStats(weeklyRes || null);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
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

  const hasData = subjects.length > 0 || (weeklyStats && weeklyStats.totalMinutes > 0);
  const weeklyData = weeklyStats?.dailyStats || [];
  const totalHours = weeklyStats ? Math.round(weeklyStats.totalMinutes / 60 * 10) / 10 : 0;

  const totalChapters = subjects.reduce((sum, s) => sum + (s.chapters?.length || 0), 0);
  const completedChapters = subjects.reduce((sum, s) => sum + (s.chapters?.filter((c: any) => c.completed)?.length || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your study progress and insights</p>
          </div>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {hasData ? (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Study Hours</CardTitle>
                  <Clock className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalHours}h</div>
                  <p className="text-xs text-muted-foreground">This {timeRange}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Chapters Completed</CardTitle>
                  <Target className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completedChapters}/{totalChapters}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0}% complete
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Daily Minutes</CardTitle>
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{weeklyStats?.avgDailyMinutes || 0}m</div>
                  <p className="text-xs text-muted-foreground">Per day average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <Flame className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{weeklyStats?.totalSessions || 0}</div>
                  <p className="text-xs text-muted-foreground">Study sessions</p>
                </CardContent>
              </Card>
            </div>

            {weeklyData.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Study Hours</CardTitle>
                    <CardDescription>Minutes studied per day</CardDescription>
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
                    <CardDescription>Time spent on each subject</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {subjects.length > 0 ? (
                      <>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={subjects.map(s => ({ name: s.name, value: s.chapters?.length || 1, color: s.color }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                              >
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
                      <p className="text-center text-muted-foreground py-12">No subject data</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Subject Progress</CardTitle>
                <CardDescription>Chapters completed per subject</CardDescription>
              </CardHeader>
              <CardContent>
                {subjects.length > 0 ? (
                  <div className="space-y-4">
                    {subjects.map((subject) => {
                      const total = subject.chapters?.length || 0;
                      const completed = subject.chapters?.filter((c: any) => c.completed)?.length || 0;
                      const percentage = total > 0 ? (completed / total) * 100 : 0;
                      
                      return (
                        <div key={subject._id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                              <span className="font-medium">{subject.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{completed}/{total} chapters</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${percentage}%`, backgroundColor: subject.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No subjects added yet</p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No data yet</h3>
              <p className="text-muted-foreground mb-4">
                Start studying to see your analytics and progress
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
