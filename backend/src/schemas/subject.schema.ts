import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Subject extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '#3B82F6' })
  color: string;

  @Prop()
  icon?: string;

  @Prop()
  description?: string;

  @Prop()
  targetGrade?: string;

  @Prop({ type: [{ name: String, description: String, difficulty: { type: String, default: 'medium' }, estimatedHours: { type: Number, default: 1 }, priority: { type: Number, default: 5 }, completed: { type: Boolean, default: false } }], default: [] })
  chapters: {
    name: string;
    description?: string;
    difficulty: string;
    estimatedHours: number;
    priority: number;
    completed: boolean;
  }[];
}

export const SubjectSchema = SchemaFactory.createForClass(Subject);
