import {
  IsEnum,
  IsUUID,
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  IsPositive,
  IsDecimal,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  StockMovementType,
  StockMovementRefType,
} from '../interfaces/stock_movement.interface';

export class CreateStockMovementDto {
  @ApiProperty({
    enum: StockMovementType,
    description: 'Loại di chuyển kho (IN/OUT/TRANSFER/ADJUST/RETURN/LOSS)',
  })
  @IsEnum(StockMovementType)
  Type: StockMovementType;

  @ApiPropertyOptional({
    enum: StockMovementRefType,
    description: 'Loại tham chiếu',
  })
  @IsOptional()
  @IsEnum(StockMovementRefType)
  RefType?: StockMovementRefType;

  @ApiPropertyOptional({
    description: 'ID tham chiếu',
  })
  @IsOptional()
  @IsString()
  RefId?: string;

  @ApiProperty({
    description: 'ID kho xuất phát',
  })
  @IsUUID()
  WarehouseId: string;

  @ApiPropertyOptional({
    description: 'ID kho đích (cho chuyển kho)',
  })
  @IsOptional()
  @IsUUID()
  WarehouseToId?: string;

  @ApiProperty({
    description: 'ID sản phẩm',
  })
  @IsUUID()
  ProductId: string;

  @ApiProperty({
    description: 'Số lượng',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  Qty: number;

  @ApiPropertyOptional({
    description: 'Đơn giá',
    type: 'number',
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  UnitCost?: string;

  @ApiPropertyOptional({
    description: 'Lý do di chuyển',
  })
  @IsOptional()
  @IsString()
  Reason?: string;

  @ApiProperty({
    description: 'Thời gian xảy ra',
  })
  @IsDateString()
  OccurredAt: string;

  @ApiProperty({
    description: 'Người tạo',
  })
  @IsString()
  CreatedBy: string;
}
