import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: "UTC" })
  timezone: string;

  @Prop({ default: 240 })
  dailyGoal: number;

  @Prop({ default: 0 })
  streakCount: number;

  @Prop()
  lastStudyDate?: Date;

  @Prop({ default: 0 })
  totalStudyMinutes: number;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  experiencePoints: number;

  subjects: Types.ObjectId[];
  studyPlans: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
