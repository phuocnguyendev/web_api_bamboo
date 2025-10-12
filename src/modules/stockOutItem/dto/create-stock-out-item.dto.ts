import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateStockOutItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  StockOutVoucherId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ProductId: string;

  @ApiProperty()
  @IsNumber()
  Qty: number;

  @ApiProperty()
  @IsNumber()
  UnitCostSnapshot: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  Note?: string;
}
