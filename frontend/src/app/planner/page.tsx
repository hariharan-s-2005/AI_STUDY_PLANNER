'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { subjectsAPI, studyPlanAPI } from '@/lib/api';
import {
  ArrowLeft, ArrowRight, Sparkles, Calendar, Clock, BookOpen,
  Check, Loader2, Plus, Trash2,
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface Subject {
  _id: string;
  name: string;
  color: string;
  chapters: any[];
}

interface TimeWindow {
  id: string;
  startTime: string;
  endTime: string;
}

type PlanDuration = 'daily' | 'weekly' | 'monthly';

// Parse "HH:MM" → total minutes from midnight
const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Calculate duration in minutes for a window (0 if invalid)
const windowDuration = (w: TimeWindow) => Math.max(0, toMin(w.endTime) - toMin(w.startTime));

// Format minutes → "Xh Ym" display string
const fmtDur = (min: number) => {
  if (min <= 0) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

let idCounter = 0;
const newId = () => String(++idCounter);

export default function AiPlannerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState('');

  // Step 1 — Subjects
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Step 2 — Time windows
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([
    { id: newId(), startTime: '09:00', endTime: '10:00' },
  ]);

  // Step 3 — Plan duration
  const [duration, setDuration] = useState<PlanDuration>('weekly');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addWeeks(new Date(), 1), 'yyyy-MM-dd'));

  // Derived
  const totalDailyMinutes = timeWindows.reduce((s, w) => s + windowDuration(w), 0);

  const selectedChapterCount = subjects
    .filter(s => selectedSubjects.includes(s._id))
    .reduce((sum, s) => sum + (s.chapters?.length || 0), 0);

  const breakCount = selectedChapterCount > 1 ? selectedChapterCount - 1 : 0;
  const studyBudget = Math.max(0, totalDailyMinutes - breakCount * 5);
  const minsPerChapter = selectedChapterCount > 0
    ? Math.floor(studyBudget / selectedChapterCount)
    : 0;

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const res = await subjectsAPI.getAll();
      setSubjects(res.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleDurationChange = (d: PlanDuration) => {
    const start = new Date(startDate);
    let end = startDate;
    switch (d) {
      case 'daily':   end = format(addDays(start, 0), 'yyyy-MM-dd'); break;
      case 'weekly':  end = format(addWeeks(start, 1), 'yyyy-MM-dd'); break;
      case 'monthly': end = format(addMonths(start, 1), 'yyyy-MM-dd'); break;
    }
    setDuration(d); setEndDate(end);
  };

  const handleStartDateChange = (newDate: string) => {
    const start = new Date(newDate);
    let end = newDate;
    switch (duration) {
      case 'daily':   end = format(addDays(start, 0), 'yyyy-MM-dd'); break;
      case 'weekly':  end = format(addWeeks(start, 1), 'yyyy-MM-dd'); break;
      case 'monthly': end = format(addMonths(start, 1), 'yyyy-MM-dd'); break;
    }
    setStartDate(newDate); setEndDate(end);
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id],
    );
  };

  const addWindow = () => {
    // Default: 30 min after the last window's end time
    const last = timeWindows[timeWindows.length - 1];
    const lastEnd = last ? toMin(last.endTime) : toMin('09:00');
    const newStart = lastEnd + 30; // 30-min gap
    const newEnd = newStart + 60;  // 1h default
    const toStr = (min: number) => {
      const h = Math.floor(min / 60) % 24;
      const m = min % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };
    setTimeWindows(prev => [
      ...prev,
      { id: newId(), startTime: toStr(newStart), endTime: toStr(newEnd) },
    ]);
  };

  const updateWindow = (id: string, field: 'startTime' | 'endTime', value: string) => {
    setTimeWindows(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const removeWindow = (id: string) => {
    setTimeWindows(prev => prev.filter(w => w.id !== id));
  };

  const generatePlan = async () => {
    const validWindows = timeWindows.filter(w => windowDuration(w) > 0);
    if (validWindows.length === 0) {
      setError('Please add at least one valid time window (end time must be after start time).');
      return;
    }
    if (totalDailyMinutes < 5) {
      setError('Please set at least 5 minutes of study time.');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      await studyPlanAPI.generate({
        subjectIds: selectedSubjects,
        dailyAvailableMinutes: totalDailyMinutes,
        timeWindows: validWindows.map(w => ({ startTime: w.startTime, endTime: w.endTime })),
        startDate,
        endDate,
        difficultyLevel: 'medium',
        planDuration: duration,
      } as any);
      router.push('/tasks');
    } catch (err: any) {
      console.error('Error generating plan:', err);
      setError(err?.response?.data?.message || 'Failed to generate plan. Please try again.');
      setGenerating(false);
    }
  };

  const steps = [
    { num: 1, title: 'Subjects', icon: BookOpen },
    { num: 2, title: 'Study Time', icon: Clock },
    { num: 3, title: 'Plan Type', icon: Calendar },
  ];

  const canProceedStep2 = timeWindows.some(w => windowDuration(w) > 0) && totalDailyMinutes >= 5;

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
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">AI Study Plan Generator</h1>
          <p className="text-muted-foreground mt-2">
            Create a personalised study plan based on your subjects and available time
          </p>
        </div>

        {subjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No subjects found</h3>
              <p className="text-muted-foreground mb-4">Add subjects with chapters first</p>
              <Button onClick={() => router.push('/subjects')}>
                <Plus className="mr-2 h-5 w-5" /> Add Subjects
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-2">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <div className={`flex items-center gap-2 ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {step > s.num ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                    </div>
                    <span className="font-medium hidden sm:block">{s.title}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-12 sm:w-24 h-1 mx-2 ${step > s.num ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>

            <Progress value={((step - 1) / steps.length) * 100} className="h-2" />

            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && 'Which subjects do you want to study?'}
                  {step === 2 && 'When and how long can you study each day?'}
                  {step === 3 && 'Choose your plan duration'}
                </CardTitle>
                <CardDescription>
                  {step === 1 && 'Select the subjects (with chapters) to include'}
                  {step === 2 && 'Add one or more time windows for each day'}
                  {step === 3 && 'Pick how many days your plan should cover'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">

                {/* ── Step 1: Subjects ── */}
                {step === 1 && (
                  <div className="grid gap-3">
                    {subjects.map((subject) => {
                      const hasChapters = subject.chapters && subject.chapters.length > 0;
                      const isSelected = selectedSubjects.includes(subject._id);
                      return (
                        <button
                          key={subject._id}
                          onClick={() => hasChapters && toggleSubject(subject._id)}
                          disabled={!hasChapters}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            !hasChapters ? 'opacity-50 cursor-not-allowed'
                              : isSelected ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: subject.color }} />
                            <div className="text-left">
                              <p className="font-medium">{subject.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {hasChapters
                                  ? `${subject.chapters.length} chapter${subject.chapters.length > 1 ? 's' : ''}`
                                  : 'No chapters — add chapters first'}
                              </p>
                            </div>
                          </div>
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-white' : 'border-muted-foreground'}`}>
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ── Step 2: Time Windows ── */}
                {step === 2 && (
                  <div className="space-y-5">
                    <p className="text-sm text-muted-foreground">
                      Add the time slots when you can study. You can add multiple separate slots per day
                      (e.g. <strong>6:00–6:30</strong> and <strong>8:30–9:00</strong>).
                    </p>

                    <div className="space-y-3">
                      {timeWindows.map((w, idx) => {
                        const dur = windowDuration(w);
                        const isValid = dur > 0;
                        return (
                          <div
                            key={w.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border ${isValid ? 'border-primary/30 bg-primary/5' : 'border-destructive/30 bg-destructive/5'}`}
                          >
                            <span className="text-sm font-medium text-muted-foreground w-16 shrink-0">
                              Slot {idx + 1}
                            </span>

                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <label className="text-xs text-muted-foreground">From</label>
                                <Input
                                  type="time"
                                  className="w-28 h-8 text-sm"
                                  value={w.startTime}
                                  onChange={(e) => updateWindow(w.id, 'startTime', e.target.value)}
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <label className="text-xs text-muted-foreground">To</label>
                                <Input
                                  type="time"
                                  className="w-28 h-8 text-sm"
                                  value={w.endTime}
                                  onChange={(e) => updateWindow(w.id, 'endTime', e.target.value)}
                                />
                              </div>
                              {isValid && (
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  {fmtDur(dur)}
                                </span>
                              )}
                              {!isValid && (
                                <span className="text-xs text-destructive">
                                  End must be after start
                                </span>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => removeWindow(w.id)}
                              disabled={timeWindows.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>

                    <Button variant="outline" size="sm" onClick={addWindow} className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Add another time slot
                    </Button>

                    {/* Summary */}
                    {totalDailyMinutes > 0 && (
                      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total daily study time</span>
                          <span className="text-xl font-bold">{fmtDur(totalDailyMinutes)}</span>
                        </div>
                        {timeWindows.length > 1 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Time slots</span>
                            <span className="font-medium">{timeWindows.filter(w => windowDuration(w) > 0).length} windows</span>
                          </div>
                        )}
                        {selectedChapterCount > 0 && minsPerChapter > 0 && (
                          <div className="border-t border-primary/20 pt-2 mt-2">
                            <p className="text-xs text-muted-foreground">
                              {selectedChapterCount} chapters across {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} →{' '}
                              <strong>~{minsPerChapter} min per chapter</strong>
                              {selectedChapterCount > 1 && `, ${selectedChapterCount - 1} × 5-min breaks`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Step 3: Plan Duration ── */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {[
                        { value: 'daily',   label: 'Daily Plan',   desc: 'One session covering all chapters in a single day', icon: '📅' },
                        { value: 'weekly',  label: 'Weekly Plan',  desc: 'Spread study across 7 days (a chapter per day)', icon: '📆' },
                        { value: 'monthly', label: 'Monthly Plan', desc: 'Spread study across 30 days', icon: '🗓️' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDurationChange(option.value as PlanDuration)}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            duration === option.value ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{option.icon}</span>
                            <div className="text-left">
                              <p className="font-medium">{option.label}</p>
                              <p className="text-sm text-muted-foreground">{option.desc}</p>
                            </div>
                          </div>
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${duration === option.value ? 'border-primary bg-primary text-white' : 'border-muted-foreground'}`}>
                            {duration === option.value && <Check className="h-4 w-4" />}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Start Date</label>
                        <Input type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">End Date</label>
                        <Input type="date" value={endDate} disabled />
                      </div>
                    </div>

                    {/* Plan summary */}
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <h4 className="font-medium mb-3">Plan Summary</h4>
                      <ul className="text-sm space-y-1.5 text-muted-foreground">
                        <li className="flex justify-between">
                          <span>Subjects</span>
                          <span className="font-medium text-foreground">{selectedSubjects.length}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Total chapters</span>
                          <span className="font-medium text-foreground">{selectedChapterCount}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Daily study time</span>
                          <span className="font-medium text-foreground">{fmtDur(totalDailyMinutes)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Time windows per day</span>
                          <span className="font-medium text-foreground">
                            {timeWindows.filter(w => windowDuration(w) > 0).map(w => `${w.startTime}–${w.endTime}`).join(', ')}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span>Plan type</span>
                          <span className="font-medium text-foreground capitalize">{duration}</span>
                        </li>
                        {minsPerChapter > 0 && (
                          <li className="flex justify-between border-t border-primary/20 pt-1.5 mt-1">
                            <span>Time per chapter (per day)</span>
                            <span className="font-medium text-foreground">~{minsPerChapter} min</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {error && (
                      <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>

                  {step < 3 ? (
                    <Button
                      onClick={() => setStep(step + 1)}
                      disabled={
                        (step === 1 && selectedSubjects.length === 0) ||
                        (step === 2 && !canProceedStep2)
                      }
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={generatePlan}
                      disabled={generating || selectedSubjects.length === 0 || !canProceedStep2}
                    >
                      {generating ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating...</>
                      ) : (
                        <><Sparkles className="mr-2 h-5 w-5" />Generate Plan</>
                      )}
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
