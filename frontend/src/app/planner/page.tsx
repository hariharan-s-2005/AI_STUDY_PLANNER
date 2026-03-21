'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { subjectsAPI, studyPlanAPI } from '@/lib/api';
import { ArrowLeft, ArrowRight, Sparkles, Calendar, Clock, BookOpen, Check, Loader2, Plus, Minus } from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface Subject {
  _id: string;
  name: string;
  color: string;
  chapters: any[];
}

interface TimeSlot {
  id: string;
  label: string;
  hours: number;
  minutes: number;
}

type PlanDuration = 'daily' | 'weekly' | 'monthly';

export default function AiPlannerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [duration, setDuration] = useState<PlanDuration>('weekly');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addWeeks(new Date(), 1), 'yyyy-MM-dd'));
  const [difficulty, setDifficulty] = useState('medium');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await subjectsAPI.getAll();
      setSubjects(res.data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDurationChange = (d: PlanDuration) => {
    const start = new Date(startDate);
    let end = startDate;
    switch (d) {
      case 'daily': end = format(addDays(start, 1), 'yyyy-MM-dd'); break;
      case 'weekly': end = format(addWeeks(start, 1), 'yyyy-MM-dd'); break;
      case 'monthly': end = format(addMonths(start, 1), 'yyyy-MM-dd'); break;
    }
    setDuration(d);
    setEndDate(end);
  };

  const handleStartDateChange = (newDate: string) => {
    const start = new Date(newDate);
    let end = newDate;
    switch (duration) {
      case 'daily': end = format(addDays(start, 1), 'yyyy-MM-dd'); break;
      case 'weekly': end = format(addWeeks(start, 1), 'yyyy-MM-dd'); break;
      case 'monthly': end = format(addMonths(start, 1), 'yyyy-MM-dd'); break;
    }
    setStartDate(newDate);
    setEndDate(end);
  };

  const toggleSubject = (id: string) => {
    setSelectedSubjects(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const addTimeSlot = (slotId: string, label: string) => {
    if (timeSlots.find(s => s.id === slotId)) return;
    setTimeSlots([...timeSlots, { id: slotId, label, hours: 1, minutes: 0 }]);
  };

  const removeTimeSlot = (slotId: string) => {
    setTimeSlots(timeSlots.filter(s => s.id !== slotId));
  };

  const updateTimeSlotDuration = (slotId: string, hours: number, minutes: number) => {
    setTimeSlots(timeSlots.map(s => 
      s.id === slotId ? { ...s, hours: Math.max(0, Math.min(4, hours)), minutes } : s
    ));
  };

  const totalDailyMinutes = timeSlots.reduce((sum, s) => sum + (s.hours * 60) + s.minutes, 0);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      await studyPlanAPI.generate({
        subjectIds: selectedSubjects,
        dailyAvailableMinutes: totalDailyMinutes,
        //freeTimeSlots: timeSlots.map(s => s.id),
        timeSlotDurations: timeSlots.map(s => ({
          slot: s.id,
          minutes: (s.hours * 60) + s.minutes
        })),
        startDate,
        endDate,
        difficultyLevel: difficulty,
        planDuration: duration,
      });
      router.push('/tasks');
    } catch (error) {
      console.error('Error generating plan:', error);
      setGenerating(false);
    }
  };

  const steps = [
    { num: 1, title: 'Subjects', icon: BookOpen },
    { num: 2, title: 'Free Time', icon: Clock },
    { num: 3, title: 'Plan Type', icon: Calendar },
  ];

  const timeSlotOptions = [
    { id: 'early_morning', label: 'Early Morning', desc: '5 AM - 8 AM', icon: '🌅' },
    { id: 'morning', label: 'Morning', desc: '8 AM - 12 PM', icon: '☀️' },
    { id: 'afternoon', label: 'Afternoon', desc: '12 PM - 4 PM', icon: '🌤️' },
    { id: 'evening', label: 'Evening', desc: '4 PM - 8 PM', icon: '🌆' },
    { id: 'night', label: 'Night', desc: '8 PM - 11 PM', icon: '🌙' },
  ];

  const progressPercent = ((step - 1) / steps.length) * 100;

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
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">AI Study Plan Generator</h1>
          <p className="text-muted-foreground mt-2">Create a personalized study plan powered by AI</p>
        </div>

        {subjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No subjects found</h3>
              <p className="text-muted-foreground mb-4">Add subjects with chapters first to generate a study plan</p>
              <Button onClick={() => router.push('/subjects')}>
                <Plus className="mr-2 h-5 w-5" />
                Add Subjects
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-center">
                  <div className={`flex items-center gap-2 ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
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

            <Progress value={progressPercent} className="h-2" />

            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && 'Which subjects do you want to study?'}
                  {step === 2 && 'When can you study?'}
                  {step === 3 && 'Choose your plan duration'}
                </CardTitle>
                <CardDescription>
                  {step === 1 && 'Select the subjects you want to include'}
                  {step === 2 && 'Add time slots and set how long you can study during each'}
                  {step === 3 && 'Daily, weekly, or monthly plan?'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Subjects */}
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
                            !hasChapters 
                              ? 'opacity-50 cursor-not-allowed' 
                              : isSelected
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: subject.color }} />
                            <div className="text-left">
                              <p className="font-medium">{subject.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {hasChapters ? `${subject.chapters.length} chapters` : 'No chapters'}
                              </p>
                            </div>
                          </div>
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
                          }`}>
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Step 2: Free Time with Duration */}
                {step === 2 && (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      Click to add time slots, then set how many hours you can study during each slot.
                    </p>

                    {/* Available time slots */}
                    <div className="grid gap-2">
                      {timeSlotOptions.map((slot) => {
                        const isSelected = timeSlots.find(s => s.id === slot.id);
                        return (
                          <button
                            key={slot.id}
                            onClick={() => isSelected ? removeTimeSlot(slot.id) : addTimeSlot(slot.id, slot.label)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{slot.icon}</span>
                              <div className="text-left">
                                <p className="font-medium">{slot.label}</p>
                                <p className="text-xs text-muted-foreground">{slot.desc}</p>
                              </div>
                            </div>
                            <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'border-primary bg-primary text-white' : 'border-muted-foreground'
                            }`}>
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Duration inputs for selected slots */}
                    {timeSlots.length > 0 && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">How long can you study during each slot?</label>
                        {timeSlots.map((slot) => (
                          <div key={slot.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <span className="w-28 font-medium text-sm">{slot.label}</span>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTimeSlotDuration(slot.id, slot.hours - 1, slot.minutes)}
                                disabled={slot.hours <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-16 text-center font-mono">
                                {slot.hours}h {slot.minutes}m
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTimeSlotDuration(slot.id, slot.hours + 1, slot.minutes)}
                                disabled={slot.hours >= 4}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Total */}
                    {totalDailyMinutes > 0 && (
                      <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-sm text-muted-foreground">Total daily study time</p>
                        <p className="text-2xl font-bold">
                          {Math.floor(totalDailyMinutes / 60)}h {totalDailyMinutes % 60}m
                        </p>
                      </div>
                    )}

                    {/* Difficulty */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['easy', 'medium', 'hard'].map((level) => (
                          <Button
                            key={level}
                            variant={difficulty === level ? 'default' : 'outline'}
                            onClick={() => setDifficulty(level)}
                            className="capitalize"
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Duration */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      {[
                        { value: 'daily', label: 'Daily Plan', desc: '1 day intensive study', icon: '📅' },
                        { value: 'weekly', label: 'Weekly Plan', desc: '1 week (7 days)', icon: '📆' },
                        { value: 'monthly', label: 'Monthly Plan', desc: '1 month (30 days)', icon: '🗓️' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleDurationChange(option.value as PlanDuration)}
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            duration === option.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{option.icon}</span>
                            <div className="text-left">
                              <p className="font-medium">{option.label}</p>
                              <p className="text-sm text-muted-foreground">{option.desc}</p>
                            </div>
                          </div>
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                            duration === option.value
                              ? 'border-primary bg-primary text-white'
                              : 'border-muted-foreground'
                          }`}>
                            {duration === option.value && <Check className="h-4 w-4" />}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Start Date</label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => handleStartDateChange(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">End Date</label>
                        <Input type="date" value={endDate} disabled />
                      </div>
                    </div>

                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <h4 className="font-medium mb-2">Plan Summary</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Type: {duration} plan</li>
                        <li>• Daily time: {Math.floor(totalDailyMinutes / 60)}h {totalDailyMinutes % 60}m</li>
                        <li>• Time slots: {timeSlots.map(s => s.label).join(', ') || 'None selected'}</li>
                        <li>• Subjects: {selectedSubjects.length}</li>
                        <li>• Total study time: {duration === 'daily' ? totalDailyMinutes : duration === 'weekly' ? totalDailyMinutes * 7 : totalDailyMinutes * 30} minutes</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  
                  {step < 3 ? (
                    <Button 
                      onClick={() => setStep(step + 1)}
                      disabled={
                        (step === 1 && selectedSubjects.length === 0) ||
                        (step === 2 && timeSlots.length === 0)
                      }
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={generatePlan} 
                      disabled={generating || selectedSubjects.length === 0}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate Plan
                        </>
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
