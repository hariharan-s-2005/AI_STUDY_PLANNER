'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Loader2, CheckCircle, BarChart3, Calendar, Zap } from 'lucide-react';
import { useAuthStore } from '@/store';
import { authAPI } from '@/lib/api';

const perks = [
  { icon: Brain, text: 'AI-generated personalized study plans' },
  { icon: BarChart3, text: 'Smart analytics and progress tracking' },
  { icon: Calendar, text: 'Adaptive scheduling that fits your life' },
  { icon: Zap, text: 'Study streaks and achievement rewards' },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login(formData);
      setAuth(response.data.user, response.data.token);
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex-col items-center justify-center p-12 text-white">
        {/* Blobs */}
        <div className="absolute top-0 left-0 h-80 w-80 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-white/10 translate-x-1/2 translate-y-1/2 blur-3xl" />

        <div className="relative z-10 max-w-md">
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Planner.AI</span>
          </Link>

          <h2 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            Welcome back! <br />
            <span className="opacity-80">Pick up right where you left off.</span>
          </h2>
          <p className="text-white/70 mb-10 text-base leading-relaxed">
            Your study plans, progress, and AI recommendations are waiting for you.
          </p>

          <ul className="space-y-4">
            {perks.map((perk) => (
              <li key={perk.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <perk.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-white/90">{perk.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 bg-white dark:bg-gray-950">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Planner.AI</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Sign in to your account</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-primary font-medium hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {['No credit card', 'Free forever plan', 'Setup in 2 min'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
