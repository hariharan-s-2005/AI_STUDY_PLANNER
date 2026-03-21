import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('progress')
@UseGuards(AuthGuard('jwt'))
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post('sessions/start')
  startSession(@CurrentUser() user: any, @Body() data: { subjectId?: string; taskId?: string }) {
    return this.progressService.startSession(user.id, data);
  }

  @Post('sessions/:sessionId/end')
  endSession(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string,
    @Body() data: { focusScore?: number; notes?: string; mood?: string },
  ) {
    return this.progressService.endSession(user.id, sessionId, data);
  }

  @Get('sessions')
  getSessions(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.progressService.getStudySessions(user.id, startDate, endDate);
  }

  @Get('weekly')
  getWeeklyStats(@CurrentUser() user: any) {
    return this.progressService.getWeeklyStats(user.id);
  }

  @Get('history')
  getProgressHistory(@CurrentUser() user: any, @Query('days') days?: string) {
    return this.progressService.getProgressHistory(user.id, days ? parseInt(days) : 30);
  }

  @Get('subjects')
  getSubjectAnalytics(@CurrentUser() user: any) {
    return this.progressService.getSubjectAnalytics(user.id);
  }

  @Get('achievements')
  getAchievements(@CurrentUser() user: any) {
    return this.progressService.getAchievements(user.id);
  }
}
