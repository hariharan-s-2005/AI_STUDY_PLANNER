import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Brain,
  BarChart3,
  Calendar,
  Target,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Sparkles,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Planning',
    description:
      'Let AI analyze your subjects, goals, and schedule to create optimal study plans tailored specifically for you.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description:
      'Track your study hours, completion rates, and progress with beautiful visualizations and actionable insights.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Calendar,
    title: 'Adaptive Scheduling',
    description:
      'Plans automatically adjust based on your performance and missed tasks to keep you consistently on track.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Zap,
    title: 'Instant Recommendations',
    description:
      'Get real-time study tips, difficulty adjustments, and chapter prioritization powered by AI.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: BookOpen,
    title: 'Chapter Tracking',
    description:
      'Organize subjects into chapters, mark progress, and always know exactly where you left off.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Streak & Gamification',
    description:
      'Stay motivated with study streaks, level-ups, and achievement badges that reward consistency.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
];

const steps = [
  { icon: Target, title: 'Set Your Goals', desc: 'Define your subjects, chapters, and exam deadlines.' },
  { icon: Brain, title: 'AI Creates Your Plan', desc: 'Get a personalized, optimized study schedule instantly.' },
  { icon: Calendar, title: 'Study Smarter', desc: 'Follow your daily tasks with built-in session tracking.' },
  { icon: Zap, title: 'Track & Improve', desc: 'Watch your growth through rich analytics and achievements.' },
];

const stats = [
  { value: '10,000+', label: 'Active Students' },
  { value: '95%', label: 'Report Better Grades' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '500K+', label: 'Study Sessions Logged' },
];

const testimonials = [
  {
    name: 'Priya S.',
    role: 'Engineering Student',
    avatar: 'PS',
    quote:
      'Planner.AI completely transformed how I prepare for exams. The AI-generated schedules are incredibly accurate and I use it every single day.',
  },
  {
    name: 'Rahul M.',
    role: 'Medical Student',
    avatar: 'RM',
    quote:
      "I went from failing to topping my class in one semester. The adaptive planner caught up for me whenever I missed sessions — it's like having a personal tutor.",
  },
  {
    name: 'Sara K.',
    role: 'UPSC Aspirant',
    avatar: 'SK',
    quote:
      'Managing 15+ subjects for competitive exams was a nightmare. Planner.AI simplified everything and the streak system keeps me motivated!',
  },
];

export default function HomePage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-x-hidden">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-50 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <nav className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">Planner.AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            </div>
            <div className="flex gap-3 items-center">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="shadow-sm">
                  Get Started
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Background gradient blobs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-3xl animate-float" />
            <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl animate-float-slow" />
          </div>

          <div className="container mx-auto px-4 py-24 md:py-32 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered study planning is here
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
              Study Smarter,{' '}
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Not Harder
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground leading-relaxed">
              Generate personalized study plans powered by AI, track your progress with smart analytics, 
              and achieve your academic goals with confidence.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="text-base h-12 px-8 shadow-lg shadow-primary/25">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Free — No Card Needed
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-base h-12 px-8">
                  View Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {['Free forever plan', 'No credit card required', 'Setup in 2 minutes'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats Strip ── */}
        <section className="border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-900 px-4 py-1.5 text-sm font-medium text-purple-700 dark:text-purple-300 mb-4">
              Everything you need
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Powerful Features Built for Students</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed to maximize your learning efficiency and keep you motivated.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="group relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.bg}`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{f.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── How it Works ── */}
        <section id="how-it-works" className="bg-gray-50 dark:bg-gray-900/50 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-4">
                Simple 4-step process
              </div>
              <h2 className="text-4xl font-bold tracking-tight mb-4">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                Get started in minutes and see results from your very first study session.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  {i < steps.length - 1 && (
                    <div className="absolute top-8 left-[calc(50%+2rem)] right-0 hidden h-0.5 bg-gradient-to-r from-primary/40 to-transparent md:block" />
                  )}
                  <div className="mx-auto mb-5 relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-900 border-2 border-primary text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 px-4 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 mb-4">
              <Star className="h-3.5 w-3.5 fill-current" />
              Student success stories
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Loved by Students Everywhere</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm bg-gray-50 dark:bg-gray-900/60">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-8 pb-24">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-center text-white shadow-2xl">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/10 translate-y-1/2 -translate-x-1/2 blur-2xl" />

              <div className="relative">
                <Users className="mx-auto mb-6 h-14 w-14 opacity-90" />
                <h2 className="mb-4 text-4xl font-extrabold tracking-tight">
                  Ready to Transform Your Studies?
                </h2>
                <p className="mb-10 max-w-xl mx-auto text-lg opacity-90">
                  Join 10,000+ students who have dramatically improved their study habits and academic
                  performance with Planner.AI.
                </p>
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-white/90 text-base h-12 px-10 font-semibold shadow-lg"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Planner.AI</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/auth/register" className="hover:text-foreground transition-colors">Get Started</Link>
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            </div>

            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Planner.AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
