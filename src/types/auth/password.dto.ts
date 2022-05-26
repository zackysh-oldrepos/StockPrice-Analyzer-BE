/* eslint-disable indent */
import { IsString, MinLength, MaxLength } from 'class-validator';

export class RestorePasswordDto {
  @IsString()
  credential: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  code: string;
}

export class CheckPasswordDto {
  @IsString()
  credential: string;

  @IsString()
  code: string;
}
