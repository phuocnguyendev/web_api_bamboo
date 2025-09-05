import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'VIEW_USER',
  })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({
    example: 'Xem thông tin người dùng',
  })
  @IsString()
  @IsNotEmpty()
  Name: string;
}
