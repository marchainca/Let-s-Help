import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAttendanceDto {

  @IsString()
  @IsNotEmpty()
  activity: number;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;

  @IsString()
  @IsNotEmpty()
  program: string;
}
