import {
  IsEnum,
  IsUUID,
  IsOptional,
  IsDateString,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  StockMovementType,
  StockMovementRefType,
} from '../interfaces/stock_movement.interface';

export class FilterStockMovementDto {
  @ApiPropertyOptional({
    description: 'Số trang',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng mỗi trang',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm',
  })
  @IsOptional()
  @IsString()
  searchText?: string;

  @ApiPropertyOptional({
    enum: StockMovementType,
    description: 'Lọc theo loại di chuyển',
  })
  @IsOptional()
  @IsEnum(StockMovementType)
  type?: StockMovementType;

  @ApiPropertyOptional({
    enum: StockMovementRefType,
    description: 'Lọc theo loại tham chiếu',
  })
  @IsOptional()
  @IsEnum(StockMovementRefType)
  refType?: StockMovementRefType;

  @ApiPropertyOptional({
    description: 'Lọc theo kho xuất phát',
  })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo kho đích',
  })
  @IsOptional()
  @IsUUID()
  warehouseToId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo sản phẩm',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo người tạo',
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class StockMovementStatsDto {
  @ApiPropertyOptional({
    description: 'Ngày bắt đầu thống kê (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc thống kê (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo kho',
  })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo sản phẩm',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    enum: StockMovementType,
    description: 'Lọc theo loại di chuyển',
  })
  @IsOptional()
  @IsEnum(StockMovementType)
  type?: StockMovementType;
}
