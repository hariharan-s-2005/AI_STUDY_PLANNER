import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StudyPlanController } from "./study-plan.controller";
import { StudyPlanService } from "./study-plan.service";
import { AiModule } from "../ai/ai.module";
import { StudyPlan, StudyPlanSchema } from "../../schemas/study-plan.schema";
import { Task, TaskSchema } from "../../schemas/task.schema";
import { Subject, SubjectSchema } from "../../schemas/subject.schema";
import { Topic, TopicSchema } from "../../schemas/topic.schema";
import { User, UserSchema } from "../../schemas/user.schema";
import {
  ProgressLog,
  ProgressLogSchema,
} from "../../schemas/progress-log.schema";

@Module({
  imports: [
    AiModule,
    MongooseModule.forFeature([
      { name: StudyPlan.name, schema: StudyPlanSchema },
      { name: Task.name, schema: TaskSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: User.name, schema: UserSchema },
      { name: ProgressLog.name, schema: ProgressLogSchema },
    ]),
  ],
  controllers: [StudyPlanController],
  providers: [StudyPlanService],
  exports: [StudyPlanService],
})
export class StudyPlanModule {}
