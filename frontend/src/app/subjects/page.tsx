'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { subjectsAPI } from '@/lib/api';
import { Plus, ChevronDown, Trash2, BookOpen, CheckCircle2, Loader2, X } from 'lucide-react';

interface Chapter {
  name: string;
  description?: string;
  difficulty: string;
  estimatedHours: number;
  priority: number;
  completed: boolean;
}

interface Subject {
  _id: string;
  name: string;
  color: string;
  chapters: Chapter[];
  description?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  
  const [newSubject, setNewSubject] = useState({ name: '', color: '#3B82F6', description: '' });
  const [newChapter, setNewChapter] = useState({ 
    name: '', 
    description: '', 
    difficulty: 'medium', 
    estimatedHours: 1, 
    priority: 5 
  });

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

  const addSubject = async () => {
    if (!newSubject.name.trim()) return;
    setSaving(true);
    try {
      const res = await subjectsAPI.create(newSubject);
      setSubjects([...subjects, res.data]);
      setNewSubject({ name: '', color: '#3B82F6', description: '' });
      setShowAddSubject(false);
    } catch (error) {
      console.error('Error adding subject:', error);
    } finally {
      setSaving(false);
    }
  };

  const addChapter = async (subjectId: string) => {
    if (!newChapter.name.trim()) return;
    setSaving(true);
    try {
      const res = await subjectsAPI.addChapter(subjectId, newChapter);
      setSubjects(subjects.map(s => s._id === subjectId ? res.data : s));
      setNewChapter({ name: '', description: '', difficulty: 'medium', estimatedHours: 1, priority: 5 });
      setShowAddChapter(null);
    } catch (error) {
      console.error('Error adding chapter:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await subjectsAPI.delete(id);
      setSubjects(subjects.filter(s => s._id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  const deleteChapter = async (subjectId: string, chapterIndex: number) => {
    try {
      await subjectsAPI.deleteChapter(subjectId, chapterIndex);
      setSubjects(subjects.map(s => {
        if (s._id === subjectId) {
          return { ...s, chapters: s.chapters.filter((_, i) => i !== chapterIndex) };
        }
        return s;
      }));
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const toggleChapterComplete = async (subjectId: string, chapterIndex: number) => {
    const subject = subjects.find(s => s._id === subjectId);
    if (!subject) return;
    
    const chapter = subject.chapters[chapterIndex];
    try {
      await subjectsAPI.updateChapter(subjectId, chapterIndex, { completed: !chapter.completed });
      setSubjects(subjects.map(s => {
        if (s._id === subjectId) {
          const chapters = [...s.chapters];
          chapters[chapterIndex] = { ...chapters[chapterIndex], completed: !chapters[chapterIndex].completed };
          return { ...s, chapters };
        }
        return s;
      }));
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  const totalChapters = subjects.reduce((sum, s) => sum + (s.chapters?.length || 0), 0);
  const completedChapters = subjects.reduce((sum, s) => sum + (s.chapters?.filter(c => c.completed)?.length || 0), 0);
  const totalHours = subjects.reduce((sum, s) => sum + s.chapters.reduce((h, c) => h + c.estimatedHours, 0), 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return '';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subjects & Chapters</h1>
            <p className="text-muted-foreground">Manage your subjects and chapters</p>
          </div>
          <Button onClick={() => setShowAddSubject(true)}>
            <Plus className="mr-2 h-5 w-5" />
            Add Subject
          </Button>
        </div>

        {subjects.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subjects.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalChapters}</div>
                {totalChapters > 0 && (
                  <Progress value={(completedChapters / totalChapters) * 100} className="mt-2 h-2" />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHours}h</div>
                <p className="text-xs text-muted-foreground">Estimated study time</p>
              </CardContent>
            </Card>
          </div>
        )}

        {showAddSubject && (
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Subject</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowAddSubject(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Name *</label>
                  <Input
                    placeholder="e.g., Mathematics"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Brief description"
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`h-8 w-8 rounded-full border-2 ${newSubject.color === color ? 'border-black dark:border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewSubject({ ...newSubject, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddSubject(false)}>Cancel</Button>
                <Button onClick={addSubject} disabled={!newSubject.name.trim() || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Subject'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {subjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No subjects yet</h3>
              <p className="text-muted-foreground mb-4">Add your first subject to get started</p>
              <Button onClick={() => setShowAddSubject(true)}>
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Subject
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject) => (
              <Card key={subject._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: subject.color }} />
                      <div>
                        <CardTitle>{subject.name}</CardTitle>
                        <CardDescription>
                          {subject.chapters?.length || 0} chapters • {subject.chapters?.reduce((h, c) => h + c.estimatedHours, 0) || 0}h total
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddChapter(showAddChapter === subject._id ? null : subject._id)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Chapter
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedSubject(expandedSubject === subject._id ? null : subject._id)}
                      >
                        <ChevronDown className={`h-5 w-5 transition-transform ${expandedSubject === subject._id ? 'rotate-180' : ''}`} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteSubject(subject._id)}>
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedSubject === subject._id && (
                  <CardContent>
                    {showAddChapter === subject._id && (
                      <div className="mb-4 rounded-lg border p-4 bg-muted/50">
                        <h4 className="font-medium mb-3">Add New Chapter</h4>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            placeholder="Chapter name *"
                            value={newChapter.name}
                            onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })}
                          />
                          <Input
                            placeholder="Description"
                            value={newChapter.description}
                            onChange={(e) => setNewChapter({ ...newChapter, description: e.target.value })}
                          />
                          <div className="flex gap-2">
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                              value={newChapter.difficulty}
                              onChange={(e) => setNewChapter({ ...newChapter, difficulty: e.target.value })}
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                            <Input
                              type="number"
                              placeholder="Hours"
                              className="w-24"
                              value={newChapter.estimatedHours}
                              onChange={(e) => setNewChapter({ ...newChapter, estimatedHours: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => setShowAddChapter(null)}>Cancel</Button>
                          <Button size="sm" onClick={() => addChapter(subject._id)} disabled={!newChapter.name.trim() || saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Chapter'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {(!subject.chapters || subject.chapters.length === 0) ? (
                      <p className="text-center text-muted-foreground py-8">
                        No chapters yet. Add chapters to create study plans.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {subject.chapters.map((chapter, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <button onClick={() => toggleChapterComplete(subject._id, index)}>
                                {chapter.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                                )}
                              </button>
                              <div>
                                <p className={`font-medium ${chapter.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {chapter.name}
                                </p>
                                {chapter.description && (
                                  <p className="text-sm text-muted-foreground">{chapter.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(chapter.difficulty)}`}>
                                {chapter.difficulty}
                              </span>
                              <span className="text-sm text-muted-foreground">{chapter.estimatedHours}h</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteChapter(subject._id, index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
