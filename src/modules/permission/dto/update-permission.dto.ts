import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {
  @ApiProperty({
    example: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  Id: string;
}
