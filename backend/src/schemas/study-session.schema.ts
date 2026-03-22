import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class StudySession extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Subject" })
  subjectId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Task" })
  taskId?: Types.ObjectId;

  @Prop({ default: Date.now })
  startTime: Date;

  @Prop()
  endTime?: Date;

  @Prop({ default: 0 })
  duration: number;

  @Prop()
  focusScore?: number;

  @Prop()
  notes?: string;

  @Prop()
  mood?: string;
}

export const StudySessionSchema = SchemaFactory.createForClass(StudySession);
