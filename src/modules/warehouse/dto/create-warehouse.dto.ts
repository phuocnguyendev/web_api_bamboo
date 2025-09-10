import {
  IsOptional,
  IsString,
  IsNotEmpty,
  Length,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { WarehouseStatus } from '../constants/constant';

export class CreateWarehouseDto {
  @ApiProperty({
    example: 'WH001',
    description: 'Mã kho duy nhất, tối đa 50 ký tự',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  Code!: string;

  @ApiProperty({
    example: 'Kho Hà Nội',
    description: 'Tên kho, tối đa 255 ký tự',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  Name!: string;

  @ApiPropertyOptional({
    example: 'Số 1 Cầu Giấy, Hà Nội',
    description: 'Địa chỉ kho (có thể bỏ trống)',
  })
  @IsString()
  @IsOptional()
  Address?: string;

  @ApiPropertyOptional({
    example: 'Miền Bắc',
    description: 'Chi nhánh quản lý kho (có thể bỏ trống)',
  })
  @IsString()
  @IsOptional()
  Branch?: string;

  @ApiPropertyOptional({
    enum: WarehouseStatus,
    example: WarehouseStatus.Active,
    description: 'Trạng thái của kho (mặc định: Active)',
  })
  @IsEnum(WarehouseStatus)
  @IsOptional()
  Status?: WarehouseStatus;
}
