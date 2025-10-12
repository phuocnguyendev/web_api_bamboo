import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateStockOutVoucherDto } from './create-stock-out-voucher.dto';

export class ImportStockOutVoucherDto {
  @ApiProperty({ type: [CreateStockOutVoucherDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStockOutVoucherDto)
  vouchers: CreateStockOutVoucherDto[];
}
