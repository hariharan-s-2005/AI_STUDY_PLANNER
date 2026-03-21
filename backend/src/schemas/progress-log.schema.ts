import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProgressLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ default: Date.now })
  date: Date;

  @Prop({ default: 0 })
  tasksCompleted: number;

  @Prop({ default: 0 })
  tasksPlanned: number;

  @Prop({ default: 0 })
  studyMinutes: number;

  @Prop()
  focusScore?: number;

  @Prop({ default: 0 })
  completionRate: number;
}

export const ProgressLogSchema = SchemaFactory.createForClass(ProgressLog);
