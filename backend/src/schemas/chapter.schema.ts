import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Chapter extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: "medium" })
  difficulty: string;

  @Prop({ default: 1 })
  estimatedHours: number;

  @Prop({ default: 5 })
  priority: number;

  @Prop({ default: false })
  completed: boolean;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);
