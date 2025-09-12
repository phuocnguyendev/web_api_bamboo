import { ApiProperty } from '@nestjs/swagger';

export class TransferProductDto {
  @ApiProperty({ example: 'WH001', description: 'Id kho nguồn' })
  fromWarehouseId: string;

  @ApiProperty({ example: 'WH002', description: 'Id kho đích' })
  toWarehouseId: string;

  @ApiProperty({ example: 'P001', description: 'Id sản phẩm' })
  productId: string;

  @ApiProperty({ example: 10, description: 'Số lượng chuyển' })
  quantity: number;
}
