import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAttendanceDto {

  @IsNumber()
  @IsNotEmpty()
  IdActivity: number;

  @IsNumber()
  @IsNotEmpty()
  IdBeneficiary: number;

  @IsString()
  @IsNotEmpty()
  status: string;
}
