import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    required: true,
    example: 'He',
  })
  @IsString()
  @MaxLength(50)
  Name: string;

  @ApiProperty({
    description: 'The email address of the user',
    required: true,
    example: 'email@example.com',
  })
  @IsEmail()
  @MaxLength(50)
  @IsNotEmpty()
  Email: string;

  @ApiProperty({
    description: 'The password of the user',
    required: true,
    example: 'Admin@123',
  })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  Password: string;

  @ApiProperty({ description: 'The role ID of the user', format: 'uuid' })
  @IsUUID()
  RoleId: string;

  @ApiProperty({
    description: 'The avatar URL of the user',
    required: false,
    example: 'https://example.com/avatar.png',
  })
  @IsOptional()
  @IsString()
  Avatar_url?: string;

  @ApiProperty({
    description: 'The phone number of the user',
    required: false,
  })
  Phone?: string;

  @ApiProperty({
    description: 'The status of the user (active/inactive)',
    example: true,
  })
  Status: boolean;
}
