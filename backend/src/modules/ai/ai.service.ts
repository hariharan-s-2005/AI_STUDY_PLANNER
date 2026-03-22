import fetch from "node-fetch";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AiService {
  private apiKey: string;
  private readonly MODEL = "meta-llama/Llama-3.2-1B-Instruct";
  private readonly API_URL =
    "https://router.huggingface.co/v1/chat/completions";

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get("HF_API_KEY") || "";
  }

  private async callAI(
    messages: { role: string; content: string }[],
    maxTokens = 1024,
    temperature = 0.7,
  ): Promise<string> {
    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.MODEL,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI API error: ${response.status} - ${err}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }

  async generateStudyPlan(input: any) {
    return this.generateSimplePlan(input);
  }

  async chat(
    message: string,
    history: { role: string; content: string }[] = [],
  ) {
    try {
      const cleanMessage = this.sanitizeMessage(message);
      const messages = [
        {
          role: "system",
          content: `You are PlannerBot, a knowledgeable and friendly AI study assistant. Help students with study techniques, exam prep, time management, motivation, and subject-specific advice. Give clear, detailed answers with bullet points or numbered steps.`,
        },
        ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: cleanMessage },
      ];
      const reply = await this.callAI(messages, 1024, 0.7);
      return { reply: reply || "I could not generate a response." };
    } catch (error: any) {
      console.error("AI Error:", error?.message || error);
      return { reply: this.getBuiltInResponse(message) };
    }
  }

  private sanitizeMessage(message: string): string {
    let clean = String(message || "").trim();
    const patterns = [
      /image\.png/gi, /image\.jpg/gi, /image\.jpeg/gi, /image\.gif/gi,
      /\.png/gi, /\.jpg/gi, /\.jpeg/gi, /\.gif/gi,
      /screenshot/gi, /data:image/gi, /base64/gi,
    ];
    for (const p of patterns) clean = clean.replace(p, "");
    return clean.trim() || "Hello";
  }

  private getBuiltInResponse(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes("pomodoro") || lower.includes("timer"))
      return "**Pomodoro Technique:**\n1. Study 25 min\n2. Break 5 min\n3. After 4 rounds, 15-30 min break";
    if (lower.includes("memory") || lower.includes("memorize"))
      return "**Memory Tips:**\n• Spaced Repetition\n• Active Recall\n• Teach Others\n• Mind Maps";
    if (lower.includes("exam") || lower.includes("test"))
      return "**Exam Tips:**\n1. Start 1 week before\n2. Practice past papers\n3. Focus on understanding\n4. Get enough sleep";
    if (lower.includes("motivat") || lower.includes("lazy"))
      return "**Staying Motivated:**\n• Set small goals\n• Reward yourself\n• Study with friends\n• Take regular breaks";
    if (lower.includes("focus") || lower.includes("concentrat"))
      return "**Improving Focus:**\n1. Put phone away\n2. Use website blockers\n3. Study in quiet space\n4. Break every 25-45 min";
    if (lower.includes("stress") || lower.includes("overwhelm"))
      return "**Managing Stress:**\n1. Break into chunks\n2. Deep breathing\n3. Exercise\n4. Get 7-8 hours sleep";
    if (lower.includes("math") || lower.includes("calculus"))
      return "**Math Tips:**\n1. Understand formulas\n2. Practice lots of problems\n3. Work step by step\n4. Use Khan Academy";
    if (lower.includes("science") || lower.includes("physics") || lower.includes("chemistry"))
      return "**Science Tips:**\n• Draw diagrams\n• Real-world examples\n• Flashcards for formulas\n• Watch Crash Course videos";
    return "I can help with:\n• Study tips\n• Exam preparation\n• Memory improvement\n• Time management\n• Motivation and focus\n\nWhat would you like to know?";
  }

  /**
   * Generates a study plan using user-defined time windows.
   *
   * Input:
   *   subjects          – [{ name, chapters[] }]
   *   timeWindows       – [{ startTime: "HH:MM", endTime: "HH:MM" }]  (ordered)
   *   startDate / endDate – "YYYY-MM-DD"
   *
   * Algorithm:
   *   1. Parse time windows → sorted list of (startMin, endMin, durationMin)
   *   2. numDays = endDate − startDate + 1
   *   3. Chapter assignment per day:
   *      - If chapters ≥ days  → round-robin (multiple chapters per day)
   *      - If chapters < days  → cycle chapters so EVERY day has at least one
   *   4. Per day: calculate each chapter's equal time slice.
   *   5. Pack study tasks + 5-min breaks into windows sequentially.
   *      - If a task doesn't fit in the remaining window, move to the next window.
   *      - Breaks are skipped if there is no room (window boundary = natural break).
   */
  private generateSimplePlan(input: any) {
    // ── Parse time windows ────────────────────────────────────────
    interface Window {
      startMin: number;
      endMin: number;
      durationMin: number;
    }

    const rawWindows: { startTime: string; endTime: string }[] =
      input.timeWindows || [];

    const fmt = (min: number) => {
      const h = Math.floor(min / 60) % 24;
      const m = min % 60;
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    };

    const parseMin = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    // Build and sort windows; discard zero-duration or invalid ones
    let windows: Window[] = rawWindows
      .map((w) => {
        const startMin = parseMin(w.startTime);
        const endMin = parseMin(w.endTime);
        return { startMin, endMin, durationMin: endMin - startMin };
      })
      .filter((w) => w.durationMin > 0)
      .sort((a, b) => a.startMin - b.startMin);

    // Fallback if no windows provided
    if (windows.length === 0) {
      const start = parseMin(input.startTime || "09:00");
      const dur = Math.max(30, input.dailyAvailableMinutes || 60);
      windows = [{ startMin: start, endMin: start + dur, durationMin: dur }];
    }

    const dailyMinutes = windows.reduce((s, w) => s + w.durationMin, 0);

    // ── Date range ────────────────────────────────────────────────
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const numDays = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1,
    );

    // ── Collect all chapters ──────────────────────────────────────
    const allChapters: { subjectName: string; name: string; difficulty: string }[] = [];
    for (const subject of input.subjects || []) {
      for (const chapter of subject.chapters || []) {
        allChapters.push({
          subjectName: subject.name,
          name: chapter.name || chapter.title || "Chapter",
          difficulty: chapter.difficulty || "medium",
        });
      }
    }

    if (allChapters.length === 0) {
      return {
        totalHours: 0,
        tasks: [],
        insights: { strengths: [], areasToFocus: [], tips: [] },
      };
    }

    const numChapters = allChapters.length;

    // ── Assign chapters to each day ───────────────────────────────
    //
    // Strategy:
    //   • More chapters than days  → round-robin (pack multiple per day)
    //   • Fewer chapters than days → cycle so every day has exactly one
    //
    const chaptersPerDay: typeof allChapters[] = Array.from(
      { length: numDays },
      () => [],
    );

    if (numChapters >= numDays) {
      // Round-robin: distribute all chapters across days
      allChapters.forEach((ch, i) => chaptersPerDay[i % numDays].push(ch));
    } else {
      // Cycle: assign chapter[day % numChapters] so every day has work
      for (let d = 0; d < numDays; d++) {
        chaptersPerDay[d].push(allChapters[d % numChapters]);
      }
    }

    // ── Build tasks day by day ────────────────────────────────────
    const tasks: any[] = [];

    for (let day = 0; day < numDays; day++) {
      const current = new Date(startDate);
      current.setDate(current.getDate() + day);
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const dd = String(current.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const chapters = chaptersPerDay[day];
      if (chapters.length === 0) continue;

      // Time per chapter (weighted proportional split based on difficulty, minus breaks)
      const breakCount = chapters.length > 1 ? chapters.length - 1 : 0;
      const studyBudget = Math.max(1, dailyMinutes - breakCount * 5);

      const getDifficultyWeight = (diff: string) => {
        const d = (diff || "medium").toLowerCase();
        if (d === "easy") return 1;
        if (d === "hard") return 3;
        return 2; // medium
      };

      const totalWeight = chapters.reduce((sum, ch) => sum + getDifficultyWeight(ch.difficulty), 0);

      // Build atomic task queue: [study, break, study, break, ...]
      const taskQueue: { type: "study" | "break"; chapter?: typeof allChapters[0]; minutes: number }[] = [];
      chapters.forEach((ch, ci) => {
        const weight = getDifficultyWeight(ch.difficulty);
        const minsForThisChapter = Math.max(1, Math.floor((weight / totalWeight) * studyBudget));
        
        taskQueue.push({ type: "study", chapter: ch, minutes: minsForThisChapter });
        if (ci < chapters.length - 1) {
          taskQueue.push({ type: "break", minutes: 5 });
        }
      });

      // ── Pack task queue into windows ──────────────────────────
      //
      // Rules:
      //   • Each task is atomic: if it doesn't fit in remaining window, move to next.
      //   • If no remaining windows, stop (don't create tasks beyond time budget).
      //   • Breaks that don't fit are skipped (the window gap is a natural break).
      //
      let wi = 0;
      let cursor = windows[0].startMin;

      const windowRemaining = () =>
        wi < windows.length ? windows[wi].endMin - cursor : 0;

      const advanceWindow = () => {
        wi++;
        if (wi < windows.length) {
          cursor = windows[wi].startMin;
        }
      };

      for (const task of taskQueue) {
        // Skip if out of windows
        if (wi >= windows.length) break;

        // If current window is exhausted, advance
        while (wi < windows.length && windowRemaining() <= 0) {
          advanceWindow();
        }
        if (wi >= windows.length) break;

        if (task.type === "break") {
          // Skip break if not enough room — gap between windows IS the break
          if (windowRemaining() < task.minutes) continue;
          tasks.push({
            title: "Break",
            description: "Take a short break",
            plannedMinutes: task.minutes,
            difficulty: "",
            priority: 0,
            scheduledDate: dateStr,
            startTime: fmt(cursor),
            endTime: fmt(cursor + task.minutes),
            timeSlot: "break",
          });
          cursor += task.minutes;
        } else {
          // Study task — if it doesn't fit in this window, try next window
          if (windowRemaining() < task.minutes) {
            advanceWindow();
            if (wi >= windows.length) break;
          }

          const avail = Math.min(task.minutes, windowRemaining());
          if (avail <= 0) continue;

          tasks.push({
            title: `${task.chapter!.subjectName} - ${task.chapter!.name}`,
            description: `Study ${task.chapter!.subjectName}: ${task.chapter!.name}`,
            subjectName: task.chapter!.subjectName,
            chapterName: task.chapter!.name,
            plannedMinutes: avail,
            difficulty: task.chapter!.difficulty,
            priority: 5,
            scheduledDate: dateStr,
            startTime: fmt(cursor),
            endTime: fmt(cursor + avail),
            timeSlot: `${fmt(windows[wi].startMin)}-${fmt(windows[wi].endMin)}`,
          });
          cursor += avail;
        }
      }
    }

    return {
      totalHours: (dailyMinutes * numDays) / 60,
      tasks,
      insights: {
        strengths: ["Plan fits exactly within your available time windows"],
        areasToFocus: [
          "Tackle your most challenging chapters during the time you feel most alert",
        ],
        tips: [
          "The gap between your time windows is your natural break — use it well",
          "Review yesterday's notes for 5 minutes before starting today",
          "Consistency across all days matters more than long single sessions",
        ],
      },
    };
  }
}
