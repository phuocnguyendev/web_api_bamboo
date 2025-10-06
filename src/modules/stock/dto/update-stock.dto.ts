import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({
    example: 'b12f7a0c-6d54-4a6f-b4d7-84c9e9f8d123',
    description: 'ID của stock cần cập nhật',
  })
  @IsUUID()
  Id: string;

  @ApiPropertyOptional({
    example: 150,
    description: 'Số lượng tồn kho hiện tại',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  QtyOnHand?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Số lượng đã được đặt trước',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  QtyReserved?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Mức tồn kho an toàn (Safety Stock)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  SafetyStock?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Điểm đặt hàng lại (Reorder Point)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  ReorderPoint?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Số lượng tối thiểu',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  MinQty?: number;
}

export class ResetStockDto {
  @ApiProperty({
    example: 'b12f7a0c-6d54-4a6f-b4d7-84c9e9f8d123',
    description: 'ID của stock cần reset',
  })
  @IsUUID()
  Id: string;

  @ApiProperty({
    example: 100,
    description: 'Số lượng mới sau khi kiểm kê',
  })
  @IsNumber()
  @Min(0)
  QtyOnHand: number;
}

export class ImportStockDto {
  @ApiProperty({
    example: 'b12f7a0c-6d54-4a6f-b4d7-84c9e9f8d123',
    description: 'ID của kho chứa hàng',
  })
  @IsUUID()
  WarehouseId: string;

  @ApiProperty({
    example: 'c84f5a77-cc9c-4c2d-a313-5a46d2c1e2aa',
    description: 'ID của sản phẩm',
  })
  @IsUUID()
  ProductId: string;

  @ApiProperty({
    example: 150,
    description: 'Số lượng tồn kho hiện tại',
  })
  @IsNumber()
  @Min(0)
  QtyOnHand: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Số lượng đã được đặt trước',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  QtyReserved?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Mức tồn kho an toàn (Safety Stock)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  SafetyStock?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Điểm đặt hàng lại (Reorder Point)',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  ReorderPoint?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Số lượng tối thiểu',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  MinQty?: number;
}
