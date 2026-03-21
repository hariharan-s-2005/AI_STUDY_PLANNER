import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subject } from '../../schemas/subject.schema';
import { CreateSubjectDto } from './dto/subjects.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
  ) {}

  async getSubjects(userId: string) {
    return this.subjectModel.find({ userId: new Types.ObjectId(userId) });
  }

  async createSubject(userId: string, createSubjectDto: CreateSubjectDto) {
    const subject = await this.subjectModel.create({
      userId: new Types.ObjectId(userId),
      name: createSubjectDto.name,
      color: createSubjectDto.color || '#3B82F6',
      icon: createSubjectDto.icon,
      description: createSubjectDto.description,
      targetGrade: createSubjectDto.targetGrade,
      chapters: createSubjectDto.chapters || [],
    });
    return subject;
  }

  async addChapter(userId: string, subjectId: string, chapter: any) {
    const subject = await this.subjectModel.findOne({
      _id: new Types.ObjectId(subjectId),
      userId: new Types.ObjectId(userId),
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    subject.chapters.push(chapter);
    await subject.save();
    return subject;
  }

  async updateChapter(userId: string, subjectId: string, chapterIndex: number, data: any) {
    const subject = await this.subjectModel.findOne({
      _id: new Types.ObjectId(subjectId),
      userId: new Types.ObjectId(userId),
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (chapterIndex >= 0 && chapterIndex < subject.chapters.length) {
      subject.chapters[chapterIndex] = { ...subject.chapters[chapterIndex], ...data };
      await subject.save();
    }

    return subject;
  }

  async deleteChapter(userId: string, subjectId: string, chapterIndex: number) {
    const subject = await this.subjectModel.findOne({
      _id: new Types.ObjectId(subjectId),
      userId: new Types.ObjectId(userId),
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    subject.chapters.splice(chapterIndex, 1);
    await subject.save();
    return subject;
  }

  async updateSubject(userId: string, subjectId: string, data: any) {
    const subject = await this.subjectModel.findOneAndUpdate(
      { _id: new Types.ObjectId(subjectId), userId: new Types.ObjectId(userId) },
      data,
      { new: true }
    );

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  async deleteSubject(userId: string, subjectId: string) {
    const subject = await this.subjectModel.findOneAndDelete({
      _id: new Types.ObjectId(subjectId),
      userId: new Types.ObjectId(userId),
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return { message: 'Subject deleted successfully' };
  }
}
