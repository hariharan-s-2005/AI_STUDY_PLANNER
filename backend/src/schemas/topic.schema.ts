import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Topic extends Document {
  @Prop({ type: Types.ObjectId, ref: "Subject", required: true })
  subjectId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: "medium" })
  difficulty: string;

  @Prop({ default: 5 })
  priority: number;

  @Prop({ default: 1 })
  estimatedHours: number;

  @Prop({ default: "not_started" })
  status: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);
