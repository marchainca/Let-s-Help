import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string; 

  @IsString()
  @IsOptional()
  idNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string; 

  @IsString()
  @IsOptional()
  birthdate?: string;

  @IsString()
  @IsOptional()
  profileImage?: string;

  @IsString()
  @IsOptional()
  password?: string
}
