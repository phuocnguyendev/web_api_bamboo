import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateStockOutItemDto } from './create-stock-out-item.dto';

export class CreateStockOutVoucherDto {
  @ApiProperty({ example: 'PX001' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ example: 'WH001' })
  @IsString()
  @IsNotEmpty()
  WarehouseId: string;

  @ApiProperty({ example: 'WH002', required: false })
  @IsString()
  @IsOptional()
  WarehouseToId?: string;

  @ApiProperty({ example: 'export', required: true })
  @IsString()
  @IsNotEmpty()
  Type: string;

  @ApiProperty({ example: 'Lý do xuất kho', required: false })
  @IsString()
  @IsOptional()
  Reason?: string;

  @ApiProperty({ example: '2025-10-12T00:00:00.000Z' })
  @IsDateString()
  IssuedAt: string;

  @ApiProperty({ example: 'pending', required: false })
  @IsString()
  @IsOptional()
  Status?: string;

  @ApiProperty({ type: [CreateStockOutItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockOutItemDto)
  Items: CreateStockOutItemDto[];
}
