import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['Password'] as const),
) {
  @ApiProperty({
    description: 'The ID of the User',
    example: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  Id: string;
}
