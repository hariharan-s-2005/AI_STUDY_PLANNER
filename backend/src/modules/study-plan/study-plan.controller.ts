import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { StudyPlanService } from "./study-plan.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("study-plans")
@UseGuards(AuthGuard("jwt"))
export class StudyPlanController {
  constructor(private studyPlanService: StudyPlanService) {}

  @Get()
  getStudyPlans(@CurrentUser() user: any) {
    return this.studyPlanService.getStudyPlans(user.id);
  }

  @Get("tasks")
  getTasks(@CurrentUser() user: any, @Query() query: any) {
    return this.studyPlanService.getTasks(user.id, query);
  }

  @Get(":id")
  getStudyPlan(@CurrentUser() user: any, @Param("id") id: string) {
    return this.studyPlanService.getStudyPlan(user.id, id);
  }

  @Post()
  createStudyPlan(@CurrentUser() user: any, @Body() data: any) {
    return this.studyPlanService.createStudyPlan(user.id, data);
  }

  @Post("generate")
  generateStudyPlan(@CurrentUser() user: any, @Body() data: any) {
    return this.studyPlanService.generateStudyPlan(user.id, data);
  }

  @Post("tasks")
  createTask(@CurrentUser() user: any, @Body() data: any) {
    return this.studyPlanService.createTask(user.id, data);
  }

  @Put("tasks/:taskId")
  updateTask(
    @CurrentUser() user: any,
    @Param("taskId") taskId: string,
    @Body() data: any,
  ) {
    return this.studyPlanService.updateTask(user.id, taskId, data);
  }

  @Delete("tasks/:taskId")
  deleteTask(@CurrentUser() user: any, @Param("taskId") taskId: string) {
    return this.studyPlanService.deleteTask(user.id, taskId);
  }
}
