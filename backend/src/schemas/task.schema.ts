import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ type: Types.ObjectId, ref: "StudyPlan", required: true })
  studyPlanId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Topic" })
  topicId?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ default: 30 })
  plannedMinutes: number;

  @Prop({ default: 0 })
  actualMinutes: number;

  @Prop({ default: "medium" })
  difficulty: string;

  @Prop({ default: "pending" })
  status: string;

  @Prop({ default: 5 })
  priority: number;

  @Prop()
  scheduledDate?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  startTime?: string;

  @Prop()
  endTime?: string;

  @Prop({ type: Object })
  metadata?: {
    subjectName?: string;
    chapterName?: string;
    timeSlot?: string;
  };
}

export const TaskSchema = SchemaFactory.createForClass(Task);
