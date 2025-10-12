import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateReceiptItemDto } from './create-receipt-item.dto';

export class CreateReceiptDto {
  @ApiProperty({ example: 'PN001' })
  @IsString()
  @IsNotEmpty()
  Code: string;

  @ApiProperty({ example: 'SUP001' })
  @IsString()
  @IsNotEmpty()
  SupplierId: string;

  @ApiProperty({ example: 'WH001' })
  @IsString()
  @IsNotEmpty()
  WarehouseId: string;

  @ApiProperty({ example: 'pending', required: false })
  @IsString()
  @IsOptional()
  Status?: string;

  @ApiProperty({ example: '2025-10-11T00:00:00.000Z' })
  @IsDateString()
  ReceivedAt: string;

  @ApiProperty({ example: 10000, required: false })
  @IsNumber()
  @IsOptional()
  FreightCost?: number;

  @ApiProperty({ example: 5000, required: false })
  @IsNumber()
  @IsOptional()
  HandlingCost?: number;

  @ApiProperty({ example: 2000, required: false })
  @IsNumber()
  @IsOptional()
  OtherCost?: number;

  @ApiProperty({ example: 'Ghi chú', required: false })
  @IsString()
  @IsOptional()
  Note?: string;

  @ApiProperty({ type: [CreateReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  Items: CreateReceiptItemDto[];
}
