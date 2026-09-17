import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangeOwnPasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}
