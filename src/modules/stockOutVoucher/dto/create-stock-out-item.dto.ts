import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStockOutItemDto {
  @ApiProperty({ example: 'PROD001' })
  @IsString()
  @IsNotEmpty()
  ProductId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  Qty: number;

  @ApiProperty({ example: 10000 })
  @IsNumber()
  UnitCostSnapshot: number;

  @ApiProperty({ example: 'Ghi chú', required: false })
  @IsString()
  @IsOptional()
  Note?: string;
}
