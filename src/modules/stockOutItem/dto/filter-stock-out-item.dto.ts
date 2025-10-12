import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterStockOutItemDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  StockOutVoucherId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ProductId?: string;
}
