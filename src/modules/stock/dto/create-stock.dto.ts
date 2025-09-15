import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateStockDto {
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

  @ApiProperty({
    example: 20,
    description: 'Mức tồn kho an toàn (Safety Stock)',
  })
  @IsNumber()
  @Min(0)
  SafetyStock: number;

  @ApiProperty({
    example: 50,
    description: 'Điểm đặt hàng lại (Reorder Point)',
  })
  @IsNumber()
  @Min(0)
  ReorderPoint: number;

  @ApiProperty({
    example: 10,
    description: 'Số lượng tối thiểu có thể xuất/nhập',
  })
  @IsNumber()
  @Min(0)
  MinQty: number;
}
