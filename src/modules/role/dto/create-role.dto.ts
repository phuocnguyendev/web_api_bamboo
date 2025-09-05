import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    example: 'ADMIN',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  Name: string;

  @ApiProperty({
    description: 'The Code of the role',
    example: 'ADMIN',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  Code: string;
}
