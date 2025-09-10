import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateWarehouseDto } from './create-warehouse.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) {
  @ApiProperty({
    description: 'The ID of the warehouse',
    example: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  Id: string;
}
