import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Công ty TNHH ABC', description: 'Tên nhà cung cấp' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  Name!: string;

  @ApiPropertyOptional({ example: '123456789', description: 'Mã số thuế' })
  @IsString()
  @IsOptional()
  TaxCode?: string;

  @ApiPropertyOptional({ example: '0909123456', description: 'Số điện thoại' })
  @IsString()
  @IsOptional()
  Phone?: string;

  @ApiPropertyOptional({
    example: 'abc@supplier.com',
    description: 'Email nhà cung cấp',
  })
  @IsEmail()
  @IsOptional()
  Email?: string;

  @ApiPropertyOptional({
    example: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    description: 'Địa chỉ',
  })
  @IsString()
  @IsOptional()
  Address?: string;

  @ApiPropertyOptional({ example: 5, description: 'Đánh giá (1-5)' })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  Rating?: number;

  @ApiPropertyOptional({
    example: 3,
    description: 'Thời gian giao hàng (ngày)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  LeadTime?: number;
}
