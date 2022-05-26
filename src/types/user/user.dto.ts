import { ExistsOnDb } from '@/types/generic.decorators';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CheckEmail, CheckUsername } from './user.decorators';

export class SignUpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @ExistsOnDb(new CheckUsername())
  public username: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @ExistsOnDb(new CheckEmail())
  public email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  public password: string;
}

export class SignInDTO {
  @IsString()
  public credential: string;

  @IsString()
  public password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  public username: string;
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  @IsEmail()
  public email: string;
}
