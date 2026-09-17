import { IsArray, IsUUID } from 'class-validator';

export class SetMembersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];
}
