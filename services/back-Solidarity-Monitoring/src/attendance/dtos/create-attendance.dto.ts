import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAttendanceDto {
  @IsString()
  @IsNotEmpty()
  program: string;

  @IsString()
  @IsNotEmpty()
  subProgram: string;

  @IsString()
  @IsNotEmpty()
  activity: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsString()
  @IsNotEmpty()
  documentNumber: string;
}
