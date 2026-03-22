import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { User, UserSchema } from "../../schemas/user.schema";
import { Subject, SubjectSchema } from "../../schemas/subject.schema";
import { Task, TaskSchema } from "../../schemas/task.schema";
import {
  StudySession,
  StudySessionSchema,
} from "../../schemas/study-session.schema";
import {
  ProgressLog,
  ProgressLogSchema,
} from "../../schemas/progress-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Task.name, schema: TaskSchema },
      { name: StudySession.name, schema: StudySessionSchema },
      { name: ProgressLog.name, schema: ProgressLogSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
