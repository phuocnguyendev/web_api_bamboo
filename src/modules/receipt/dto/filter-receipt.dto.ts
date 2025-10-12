import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterReceiptDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  pageSize?: number;
}
