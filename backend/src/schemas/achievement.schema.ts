import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Achievement extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  category: string;

  @Prop({ type: Object, default: {} })
  criteria: Record<string, any>;

  @Prop({ default: 100 })
  points: number;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
