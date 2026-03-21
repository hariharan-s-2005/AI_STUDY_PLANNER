import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubjectsService } from './subjects.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('subjects')
@UseGuards(AuthGuard('jwt'))
export class SubjectsController {
  constructor(private subjectsService: SubjectsService) {}

  @Get()
  getSubjects(@CurrentUser() user: any) {
    return this.subjectsService.getSubjects(user.id);
  }

  @Post()
  createSubject(@CurrentUser() user: any, @Body() data: any) {
    return this.subjectsService.createSubject(user.id, data);
  }

  @Put(':id')
  updateSubject(@CurrentUser() user: any, @Param('id') id: string, @Body() data: any) {
    return this.subjectsService.updateSubject(user.id, id, data);
  }

  @Delete(':id')
  deleteSubject(@CurrentUser() user: any, @Param('id') id: string) {
    return this.subjectsService.deleteSubject(user.id, id);
  }

  @Post(':id/chapters')
  addChapter(@CurrentUser() user: any, @Param('id') id: string, @Body() chapter: any) {
    return this.subjectsService.addChapter(user.id, id, chapter);
  }

  @Put(':id/chapters/:chapterIndex')
  updateChapter(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('chapterIndex') chapterIndex: string,
    @Body() data: any
  ) {
    return this.subjectsService.updateChapter(user.id, id, parseInt(chapterIndex), data);
  }

  @Delete(':id/chapters/:chapterIndex')
  deleteChapter(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('chapterIndex') chapterIndex: string
  ) {
    return this.subjectsService.deleteChapter(user.id, id, parseInt(chapterIndex));
  }
}
