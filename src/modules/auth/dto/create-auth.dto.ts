import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class CreateAuthDto {
  @ApiProperty({ example: 'phuoc@gmail.com' })
  @IsEmail()
  Email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @IsNotEmpty()
  Password: string;
}
