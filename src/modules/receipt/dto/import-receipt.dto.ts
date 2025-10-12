import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateReceiptDto } from './create-receipt.dto';

export class ImportReceiptDto {
  @ApiProperty({ type: [CreateReceiptDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptDto)
  receipts: CreateReceiptDto[];
}
