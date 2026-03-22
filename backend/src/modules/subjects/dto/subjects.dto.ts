import { IsString, IsOptional, IsArray } from "class-validator";

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  targetGrade?: string;

  @IsArray()
  @IsOptional()
  chapters?: {
    name: string;
    description?: string;
    difficulty?: string;
    estimatedHours?: number;
    priority?: number;
  }[];
}
