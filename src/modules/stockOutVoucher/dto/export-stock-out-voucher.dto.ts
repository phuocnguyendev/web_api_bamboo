import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class ExportStockOutVoucherDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  ids: string[];
}
