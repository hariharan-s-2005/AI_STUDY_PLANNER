import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudySession } from '../../schemas/study-session.schema';
import { Subject } from '../../schemas/subject.schema';
import { ProgressLog } from '../../schemas/progress-log.schema';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(StudySession.name) private sessionModel: Model<StudySession>,
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
    @InjectModel(ProgressLog.name) private progressLogModel: Model<ProgressLog>,
  ) {}

  async startSession(userId: string, data: { subjectId?: string; taskId?: string }) {
    return this.sessionModel.create({
      userId: new Types.ObjectId(userId),
      subjectId: data.subjectId ? new Types.ObjectId(data.subjectId) : undefined,
      taskId: data.taskId ? new Types.ObjectId(data.taskId) : undefined,
      startTime: new Date(),
    });
  }

  async endSession(userId: string, sessionId: string, data: any) {
    const session = await this.sessionModel.findOne({
      _id: new Types.ObjectId(sessionId),
      userId: new Types.ObjectId(userId),
    });

    if (!session) return null;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / 60000);

    return this.sessionModel.findByIdAndUpdate(
      sessionId,
      {
        endTime,
        duration,
        focusScore: data.focusScore,
        notes: data.notes,
        mood: data.mood,
      },
      { new: true }
    );
  }

  async getStudySessions(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId: new Types.ObjectId(userId) };

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.$gte = new Date(startDate);
      if (endDate) where.startTime.$lte = new Date(endDate);
    }

    return this.sessionModel.find(where)
      .populate('subjectId')
      .populate('taskId')
      .sort({ startTime: -1 })
      .limit(50);
  }

  async getWeeklyStats(userId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const sessions = await this.sessionModel.find({
      userId: new Types.ObjectId(userId),
      startTime: { $gte: weekAgo },
    }).populate('subjectId');

    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekAgo);
      date.setDate(date.getDate() + i);
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const daySessions = sessions.filter(
        s => s.startTime >= dayStart && s.startTime < dayEnd
      );

      const subjectBreakdown: Record<string, number> = {};
      daySessions.forEach(session => {
        if ((session as any).subjectId?.name) {
          const name = (session as any).subjectId.name;
          subjectBreakdown[name] = (subjectBreakdown[name] || 0) + session.duration;
        }
      });

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        totalMinutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
        sessionsCount: daySessions.length,
        subjectBreakdown,
      });
    }

    const totalMinutes = dailyStats.reduce((sum, d) => sum + d.totalMinutes, 0);

    return {
      dailyStats,
      totalMinutes,
      avgDailyMinutes: Math.round(totalMinutes / 7),
      totalSessions: sessions.length,
    };
  }

  async getSubjectAnalytics(userId: string) {
    const sessions = await this.sessionModel.find({ userId: new Types.ObjectId(userId) })
      .populate('subjectId');

    const subjectStats: Record<string, any> = {};
    sessions.forEach(session => {
      if ((session as any).subjectId) {
        const subject = (session as any).subjectId;
        if (!subjectStats[subject._id]) {
          subjectStats[subject._id] = {
            name: subject.name,
            color: subject.color,
            totalMinutes: 0,
            sessionsCount: 0,
          };
        }
        subjectStats[subject._id].totalMinutes += session.duration;
        subjectStats[subject._id].sessionsCount += 1;
      }
    });

    return Object.values(subjectStats).map((stat: any) => ({
      ...stat,
      avgSessionLength: Math.round(stat.totalMinutes / stat.sessionsCount),
    }));
  }

  async getProgressHistory(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const sessions = await this.sessionModel.find({
      userId: new Types.ObjectId(userId),
      startTime: { $gte: startDate },
    }).populate('subjectId');

    const dailyStats = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dayStart = new Date(date);
      const dayEnd = new Date(date);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const daySessions = sessions.filter(
        s => s.startTime >= dayStart && s.startTime < dayEnd
      );

      const subjectBreakdown: Record<string, number> = {};
      daySessions.forEach(session => {
        if ((session as any).subjectId?.name) {
          const name = (session as any).subjectId.name;
          subjectBreakdown[name] = (subjectBreakdown[name] || 0) + session.duration;
        }
      });

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        totalMinutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
        sessionsCount: daySessions.length,
        subjectBreakdown,
      });
    }

    const totalMinutes = dailyStats.reduce((sum, d) => sum + d.totalMinutes, 0);

    return {
      dailyStats,
      totalMinutes,
      avgDailyMinutes: Math.round(totalMinutes / days),
      totalSessions: sessions.length,
    };
  }

  async getAchievements(userId: string) {
    // Return empty achievements array to solve compilation error
    return [];
  }
}
