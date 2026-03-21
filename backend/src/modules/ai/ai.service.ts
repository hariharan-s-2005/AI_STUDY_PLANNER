import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HfInference } from '@huggingface/inference';

@Injectable()
export class AiService {
  private hf: HfInference;
  // private readonly MODEL = 'meta-llama/Llama-3.1-8B-Instruct';
  private readonly MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';
  

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('HF_API_KEY');
    this.hf = new HfInference(apiKey);
  }

  async generateStudyPlan(input: any) {
    const subjectsData = input.subjects?.map((s: any) => ({
      name: s.name,
      chapters: (s.chapters || []).map((c: any) => ({
        name: c.title || c.name,
        difficulty: c.difficulty,
      })),
    })) || [];

    // Calculate number of days
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const numDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    // Get time slot durations
    const timeSlotDurations = input.timeSlotDurations || [];
    const dailyMinutes = input.dailyAvailableMinutes || 120;
    const freeTimeSlots = input.freeTimeSlots || [];

    // Build time slot info
    const slotInfo = timeSlotDurations.length > 0
      ? timeSlotDurations.map((t: any) => `${t.slot}: ${t.minutes} min`).join(', ')
      : `Total daily: ${dailyMinutes} minutes`;

    const prompt = `Create a ${numDays}-day study plan.

Subjects: ${JSON.stringify(subjectsData, null, 2)}
Time slots per day: ${slotInfo}
Start date: ${input.startDate}
Days: ${numDays}
Difficulty: ${input.difficultyLevel || 'medium'}

Rules:
1. Create tasks for EACH day from start to end date
2. Each day should have study sessions during the specified time slots
3. Show exact times like "9:00 AM - 9:45 AM"
4. Add 10-minute breaks between 45-min sessions
5. Spread chapters across days

Return ONLY JSON:
{"tasks":[{"title":"Study Chapter Name","description":"details","subjectName":"subject","chapterName":"chapter","plannedMinutes":45,"difficulty":"medium","priority":5,"scheduledDate":"2026-03-21","startTime":"09:00","endTime":"09:45","timeSlot":"9:00 AM - 9:45 AM"}],"insights":{"strengths":[],"areasToFocus":[],"tips":[]}}`;

    try {
      const response = await this.hf.chatCompletion({
        model: this.MODEL,
        messages: [
          { role: 'system', content: 'You are an expert study planner. Return ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      let responseText = response.choices?.[0]?.message?.content || '{}';
      responseText = responseText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        responseText = responseText.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(responseText);
      const tasks = parsed.tasks || [];
      
      // Check if tasks are distributed across days
      const uniqueDates = new Set(tasks.map((t: any) => t.scheduledDate));
      
      // If AI didn't generate enough tasks for all days, use simple plan
      if (uniqueDates.size < numDays * 0.5 || tasks.length < numDays) {
        console.log('AI did not distribute tasks properly, using simple plan');
        return this.generateSimplePlan(input);
      }
      
      return {
        totalHours: (dailyMinutes * numDays) / 60,
        tasks,
        insights: parsed.insights || {
          strengths: ['Good plan'],
          areasToFocus: ['Practice'],
          tips: ['Stay consistent']
        }
      };
    } catch (error: any) {
      console.error('AI Error:', error?.message || error);
      return this.generateSimplePlan(input);
    }
  }

  async chat(message: string) {
    try {
      const response = await this.hf.chatCompletion({
        model: this.MODEL,
        messages: [
          { role: 'system', content: 'You are a helpful study assistant named PlannerBot. Help with studying, tips, motivation.' },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const reply = response.choices?.[0]?.message?.content || 'I could not generate a response.';
      return { reply };
    } catch (error: any) {
      console.error('HF Error:', error?.message || error);
      return { reply: this.getBuiltInResponse(message) };
    }
  }

  private getBuiltInResponse(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('tip') || lower.includes('study')) {
      return 'Here are study tips:\n• Pomodoro: 25 min study, 5 min break\n• Active Recall: test yourself\n• Spaced Repetition: review at intervals';
    }
    return 'I can help with study tips, exam prep, and time management. What do you need?';
  }

  private generateSimplePlan(input: any) {
    const tasks = [];
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const numDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const dailyMinutes = input.dailyAvailableMinutes || 120;
    
    // Time slot mapping
    const slotTimes: Record<string, number> = {
      early_morning: 6,
      morning: 9,
      afternoon: 13,
      evening: 17,
      night: 20,
    };

    const freeTimeSlots = input.freeTimeSlots || ['morning'];
    const timeSlotDurations = input.timeSlotDurations || [];

    // Create tasks for each day
    for (let day = 0; day < numDays; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Get chapters for this day (rotate through subjects)
      const allChapters: any[] = [];
      for (const subject of input.subjects || []) {
        for (const chapter of subject.chapters || []) {
          allChapters.push({ ...chapter, subjectName: subject.name });
        }
      }

      // Pick chapters for this day
      const chaptersForDay = allChapters.filter((_, i) => i % numDays === day || allChapters.length <= numDays);
      
      let hour = 9;
      let minutesRemaining = dailyMinutes;

      for (const chapter of chaptersForDay) {
        if (minutesRemaining <= 0) break;

        // Get time slot for this hour
        const slot = freeTimeSlots.find(s => {
          const slotHour = slotTimes[s] || 9;
          return hour >= slotHour && hour < slotHour + 4;
        }) || freeTimeSlots[0] || 'morning';

        const slotDuration = timeSlotDurations.find((t: any) => t.slot === slot);
        const sessionMinutes = Math.min(slotDuration ? slotDuration.minutes : 45, minutesRemaining, 60);
        
        const endHour = hour + Math.floor(sessionMinutes / 60);
        const endMinute = sessionMinutes % 60;

        tasks.push({
          title: `Study ${chapter.title || chapter.name || 'Chapter'}`,
          description: `Review ${chapter.title || chapter.name} from ${chapter.subjectName}`,
          subjectName: chapter.subjectName,
          chapterName: chapter.title || chapter.name,
          plannedMinutes: sessionMinutes,
          difficulty: chapter.difficulty || 'medium',
          priority: 5,
          scheduledDate: dateStr,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
          timeSlot: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'} - ${endHour > 12 ? endHour - 12 : endHour}:${endMinute.toString().padStart(2, '0')} ${endHour >= 12 ? 'PM' : 'AM'}`,
        });

        // Add break
        if (minutesRemaining > sessionMinutes + 10) {
          const breakStart = endHour;
          const breakEnd = endHour + Math.floor((endMinute + 10) / 60);
          const breakEndMin = (endMinute + 10) % 60;
          
          tasks.push({
            title: 'Break',
            description: 'Take a 10-minute break',
            plannedMinutes: 10,
            difficulty: '',
            priority: 0,
            scheduledDate: dateStr,
            startTime: `${breakStart.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
            endTime: `${breakEnd.toString().padStart(2, '0')}:${breakEndMin.toString().padStart(2, '0')}`,
            timeSlot: '',
          });
          hour = breakEnd;
          minutesRemaining -= sessionMinutes + 10;
        } else {
          hour = endHour;
          minutesRemaining -= sessionMinutes;
        }
      }
    }

    return {
      totalHours: (dailyMinutes * numDays) / 60,
      tasks,
      insights: {
        strengths: ['Plan created successfully'],
        areasToFocus: ['Focus on difficult topics first'],
        tips: ['Study consistently every day', 'Take breaks between sessions'],
      },
    };
  }
}
