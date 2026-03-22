import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class StudyPlan extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 0 })
  totalHours: number;

  @Prop({ default: "active" })
  status: string;

  @Prop({ default: false })
  aiGenerated: boolean;

  tasks: Types.ObjectId[];
}

export const StudyPlanSchema = SchemaFactory.createForClass(StudyPlan);
