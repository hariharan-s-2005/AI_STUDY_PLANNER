import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateStudyPlanDto {
  @ApiProperty({ example: "Final Exam Prep" })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: "2024-03-01" })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: "2024-03-15" })
  @IsDateString()
  endDate: string;
}

export class GeneratePlanDto {
  @ApiProperty({ example: "Final Exam Prep" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: [String],
    example: ["subject-uuid-1", "subject-uuid-2"],
  })
  @IsArray()
  @IsString({ each: true })
  subjectIds: string[];

  @ApiProperty({ example: 180 })
  @IsNumber()
  dailyAvailableMinutes: number;

  @ApiProperty({ example: "2024-03-01" })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: "2024-03-15" })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: "medium", enum: ["easy", "medium", "hard"] })
  @IsString()
  @IsOptional()
  difficultyLevel?: string;
}

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  actualMinutes?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;
}
