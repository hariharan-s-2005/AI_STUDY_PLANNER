import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StudyPlan } from '../../schemas/study-plan.schema';
import { Task } from '../../schemas/task.schema';
import { Subject } from '../../schemas/subject.schema';
import { User } from '../../schemas/user.schema';
import { ProgressLog } from '../../schemas/progress-log.schema';
import { AiService } from '../ai/ai.service';

@Injectable()
export class StudyPlanService {
  constructor(
    @InjectModel(StudyPlan.name) private planModel: Model<StudyPlan>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ProgressLog.name) private progressLogModel: Model<ProgressLog>,
    private aiService: AiService,
  ) {}

  async createStudyPlan(userId: string, data: any) {
    const plan = await this.planModel.create({
      userId: new Types.ObjectId(userId),
      name: data.name,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
    return plan;
  }

  async generateStudyPlan(userId: string, data: any) {
    const { subjectIds, dailyAvailableMinutes, startDate, endDate, difficultyLevel, planDuration } = data;

    const subjects = await this.subjectModel.find({
      _id: { $in: subjectIds.map((id: string) => new Types.ObjectId(id)) },
      userId: new Types.ObjectId(userId),
    });

    if (subjects.length === 0) {
      throw new NotFoundException('No subjects found');
    }

    const aiPlan = await this.aiService.generateStudyPlan({
      subjects: subjects.map(s => ({
        name: s.name,
        chapters: s.chapters,
      })),
      dailyAvailableMinutes,
      startDate,
      endDate,
      difficultyLevel,
    });

    const studyPlan = await this.planModel.create({
      userId: new Types.ObjectId(userId),
      name: `${planDuration || 'Custom'} Study Plan`,
      description: `AI-generated ${planDuration} plan`,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      aiGenerated: true,
      totalHours: aiPlan.totalHours,
    });

    const tasks = await Promise.all(
      aiPlan.tasks.map((task: any) =>
        this.taskModel.create({
          studyPlanId: studyPlan._id,
          title: task.title,
          description: task.description,
          plannedMinutes: task.plannedMinutes,
          difficulty: task.difficulty,
          priority: task.priority,
          scheduledDate: new Date(task.scheduledDate),
          status: 'pending',
          metadata: {
            subjectName: task.subjectName,
            chapterName: task.chapterName,
          },
        })
      )
    );

    return {
      ...studyPlan.toObject(),
      tasks,
      aiInsights: aiPlan.insights,
    };
  }

  async getStudyPlans(userId: string) {
    return this.planModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  async getStudyPlan(userId: string, planId: string) {
    const plan = await this.planModel.findOne({
      _id: new Types.ObjectId(planId),
      userId: new Types.ObjectId(userId),
    });

    if (!plan) {
      throw new NotFoundException('Study plan not found');
    }

    const tasks = await this.taskModel.find({ studyPlanId: plan._id })
      .sort({ scheduledDate: 1, priority: -1 });

    return { ...plan.toObject(), tasks };
  }

  async getTasks(userId: string, filters?: any) {
    const plans = await this.planModel.find({ userId: new Types.ObjectId(userId) });
    const planIds = plans.map(p => p._id);

    const query: any = { studyPlanId: { $in: planIds } };

    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.scheduledDate = { $gte: startOfDay, $lt: endOfDay };
    }

    return this.taskModel.find(query).sort({ scheduledDate: 1, priority: -1 });
  }

  async updateTask(userId: string, taskId: string, data: any) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const updated = await this.taskModel.findByIdAndUpdate(
      taskId,
      { ...data, completedAt: data.status === 'completed' ? new Date() : undefined },
      { new: true }
    );

    if (data.status === 'completed') {
      await this.updateUserProgress(userId, task.plannedMinutes);
    }

    return updated;
  }

  async createTask(userId: string, data: any) {
    return this.taskModel.create({
      ...data,
      studyPlanId: new Types.ObjectId(data.studyPlanId),
      status: 'pending',
    });
  }

  async deleteTask(userId: string, taskId: string) {
    await this.taskModel.findByIdAndDelete(taskId);
    return { message: 'Task deleted' };
  }

  private async updateUserProgress(userId: string, minutesStudied: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { totalStudyMinutes: minutesStudied, experiencePoints: Math.floor(minutesStudied / 10) },
      lastStudyDate: new Date(),
    });

    let log = await this.progressLogModel.findOne({
      userId: new Types.ObjectId(userId),
      date: { $gte: today, $lt: new Date(today.getTime() + 86400000) },
    });

    if (log) {
      await this.progressLogModel.findByIdAndUpdate(log._id, {
        $inc: { tasksCompleted: 1, studyMinutes: minutesStudied },
      });
    } else {
      await this.progressLogModel.create({
        userId: new Types.ObjectId(userId),
        date: today,
        tasksCompleted: 1,
        tasksPlanned: 1,
        studyMinutes: minutesStudied,
        completionRate: 100,
      });
    }
  }
}
