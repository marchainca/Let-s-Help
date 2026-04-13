import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string; 

  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string; 

  @IsString()
  @IsNotEmpty()
  birthdate: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  urlImage:string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

}
