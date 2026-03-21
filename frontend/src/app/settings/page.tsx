'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/dashboard-layout';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Moon,
  Sun,
} from 'lucide-react';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [timezone, setTimezone] = useState('America/New_York');
  const [dailyGoal, setDailyGoal] = useState(180);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    reminders: true,
    achievements: true,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile</CardTitle>
              </div>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" defaultValue="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Timezone</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                </select>
              </div>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <button
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications.email ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <button
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications.push ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      notifications.push ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Study Reminders</p>
                  <p className="text-sm text-muted-foreground">Get reminded about your tasks</p>
                </div>
                <button
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications.reminders ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onClick={() =>
                    setNotifications({ ...notifications, reminders: !notifications.reminders })
                  }
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      notifications.reminders ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Achievement Alerts</p>
                  <p className="text-sm text-muted-foreground">Celebrate your milestones</p>
                </div>
                <button
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications.achievements ? 'bg-primary' : 'bg-gray-200'
                  }`}
                  onClick={() =>
                    setNotifications({ ...notifications, achievements: !notifications.achievements })
                  }
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      notifications.achievements ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>Customize the look of your app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      className={`flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${
                        theme === t ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setTheme(t)}
                    >
                      {t === 'light' && <Sun className="h-5 w-5" />}
                      {t === 'dark' && <Moon className="h-5 w-5" />}
                      {t === 'system' && <Globe className="h-5 w-5" />}
                      <span className="capitalize">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Study Goals</CardTitle>
              </div>
              <CardDescription>Set your daily study targets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Study Goal (minutes)</label>
                <Input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(parseInt(e.target.value) || 0)}
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: 2-3 hours (120-180 minutes) per day
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weekly Target</label>
                <p className="text-2xl font-bold">{(dailyGoal * 7) / 60}h / week</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">Update your password regularly</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
