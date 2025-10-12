import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class ExportReceiptDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  ids: string[];
}
