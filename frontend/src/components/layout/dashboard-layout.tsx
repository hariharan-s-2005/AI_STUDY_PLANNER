'use client';

import { Sidebar } from './sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';
import Link from 'next/link';
import { Brain } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { toggleSidebar } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Mobile top header bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">Planner.AI</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Open navigation menu">
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <main className="lg:pl-64">
        <div className="container mx-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
