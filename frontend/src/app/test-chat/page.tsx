'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const responses: Record<string, string> = {
  focus: "To improve focus: 1) Remove distractions - put your phone away. 2) Use Pomodoro - 25 min study, 5 min break. 3) Start with hard subjects when fresh. 4) Break tasks into chunks. 5) Stay hydrated.",
  exam: "Exam tips: 1) Start revising 2 weeks before. 2) Make summary notes. 3) Practice past papers. 4) Teach others. 5) Sleep well before exam. 6) Review within 24 hours of learning.",
  remember: "Memory tips: 1) Spaced repetition - review at intervals. 2) Write by hand. 3) Use flashcards. 4) Mnemonic devices. 5) Sleep 7-8 hours. 6) Test yourself - don't just re-read.",
  schedule: "Schedule tips: 1) List subjects by importance. 2) More time for hard subjects. 3) Include breaks every 25-30 min. 4) Be realistic. 5) Schedule reviews. 6) Include rest time. 7) Stick to it!",
  motivate: "Stay motivated: 1) Set small daily goals. 2) Track progress. 3) Reward yourself. 4) Remember your 'why'. 5) Study with friends. 6) Take breaks when tired. 7) Visualize success!",
};

export default function TestPage() {
  const [messages, setMessages] = useState<{role: string; content: string}[]>([
    { role: 'assistant', content: "Hello! I'm a simple study assistant. Type a message to chat." }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');

    // Simple keyword matching
    const text = userMsg.toLowerCase();
    let response = "Thanks for your message! For study help, try asking about: focus, exams, memory, schedules, or motivation. How can I help you?";
    
    if (text.includes('focus') || text.includes('concentrate')) response = responses.focus;
    else if (text.includes('exam') || text.includes('test')) response = responses.exam;
    else if (text.includes('remember') || text.includes('memory')) response = responses.remember;
    else if (text.includes('schedule') || text.includes('plan') || text.includes('time')) response = responses.schedule;
    else if (text.includes('motivate') || text.includes('tired') || text.includes('lazy')) response = responses.motivate;

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Test Chat
        </h1>
        <p className="text-muted-foreground mb-4">This is a simple test page with no backend</p>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 font-medium">This page does NOT call any backend API</p>
            <p className="text-sm text-muted-foreground mt-2">All responses are generated locally in your browser</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && <Bot className="h-5 w-5 mt-1 text-primary" />}
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && <User className="h-5 w-5 mt-1" />}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Type here..." 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage}><Send className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
