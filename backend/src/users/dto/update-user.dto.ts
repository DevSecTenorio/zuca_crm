import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { UserRole, UserStatus } from '../user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
