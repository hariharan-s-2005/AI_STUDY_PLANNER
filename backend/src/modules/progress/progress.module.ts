import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { StudySession, StudySessionSchema } from '../../schemas/study-session.schema';
import { Subject, SubjectSchema } from '../../schemas/subject.schema';
import { ProgressLog, ProgressLogSchema } from '../../schemas/progress-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StudySession.name, schema: StudySessionSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: ProgressLog.name, schema: ProgressLogSchema },
    ]),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
