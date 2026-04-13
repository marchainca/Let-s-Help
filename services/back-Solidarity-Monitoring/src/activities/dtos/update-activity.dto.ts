import { IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateActivityDto {
  @IsNotEmpty()
  @IsString()
  programId: string;

  @IsNotEmpty()
  @IsString()
  subprogramId: string;

  @IsNotEmpty()
  @IsString()
  activityId: string;

  @IsNotEmpty()
  @IsNumber()
  weekNumber: number;

  @IsOptional()
  @IsNumber()
  projectedActivities?: number;

  @IsOptional()
  @IsNumber()
  executedActivities?: number;

  @IsOptional()
  @IsNumber()
  projectedAttendees?: number;

  @IsOptional()
  @IsNumber()
  actualAttendees?: number;

  @IsOptional()
  @IsString()
  responsible?: string;
}
