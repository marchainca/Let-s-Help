import { IsOptional, IsString, IsDate, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  identificacion: string;

  @IsString()
  @IsNotEmpty()
  nombresApellidos: string;

  @IsString()
  @IsNotEmpty()
  reporte: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;
}
