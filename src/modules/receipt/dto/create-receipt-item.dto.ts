import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReceiptItemDto {
  @ApiProperty({ example: 'PROD001' })
  @IsString()
  @IsNotEmpty()
  ProductId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  Qty: number;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  UnitCost: number;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  VatRate?: number;

  @ApiProperty({ example: 'Ghi chú', required: false })
  @IsString()
  @IsOptional()
  Note?: string;
}
