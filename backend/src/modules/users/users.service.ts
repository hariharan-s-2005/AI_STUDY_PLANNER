import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "../../schemas/user.schema";
import { Subject } from "../../schemas/subject.schema";
import { Task } from "../../schemas/task.schema";
import { StudySession } from "../../schemas/study-session.schema";
import { ProgressLog } from "../../schemas/progress-log.schema";
import { UpdateUserDto, CreateSubjectDto } from "./dto/users.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
    @InjectModel(Task.name) private taskModel: Model<Task>,
    @InjectModel(StudySession.name) private sessionModel: Model<StudySession>,
    @InjectModel(ProgressLog.name) private progressLogModel: Model<ProgressLog>,
  ) {}

  async findById(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const { password, ...sanitized } = user.toObject();
    return { ...sanitized, id: sanitized._id };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const { password, ...sanitized } = user.toObject();
    return { ...sanitized, id: sanitized._id };
  }

  async getSubjects(userId: string) {
    return this.subjectModel.find({ userId: new Types.ObjectId(userId) });
  }

  async createSubject(userId: string, createSubjectDto: CreateSubjectDto) {
    const subject = await this.subjectModel.create({
      ...createSubjectDto,
      userId: new Types.ObjectId(userId),
    });
    return subject;
  }

  async deleteSubject(userId: string, subjectId: string) {
    const subject = await this.subjectModel.findOneAndDelete({
      _id: new Types.ObjectId(subjectId),
      userId: new Types.ObjectId(userId),
    });

    if (!subject) {
      throw new NotFoundException("Subject not found");
    }

    return { message: "Subject deleted successfully" };
  }

  async getStats(userId: string) {
    const user = await this.userModel.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyProgress = await this.progressLogModel
      .find({
        userId: new Types.ObjectId(userId),
        date: { $gte: weekAgo, $lte: today },
      })
      .sort({ date: 1 });

    const totalTasks = await this.taskModel.countDocuments();
    const completedTasks = await this.taskModel.countDocuments({
      status: "completed",
    });

    const recentSessions = await this.sessionModel
      .find({
        userId: new Types.ObjectId(userId),
        startTime: { $gte: weekAgo },
      })
      .sort({ startTime: -1 })
      .limit(10);

    return {
      streakCount: user?.streakCount || 0,
      level: user?.level || 1,
      experiencePoints: user?.experiencePoints || 0,
      totalStudyMinutes: user?.totalStudyMinutes || 0,
      weeklyProgress,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      recentSessions,
    };
  }
}
