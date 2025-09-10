import { IsEnum, IsUUID, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WarehouseStatus } from '../constants/constant';

export class ChangeWarehouseStatusDto {
  @ApiProperty({
    type: [String],
    example: [],
    description: 'Danh sách ID của kho cần cập nhật',
  })
  @IsUUID('4', { each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
  ids!: string[];

  @ApiProperty({
    enum: WarehouseStatus,
    example: WarehouseStatus.Active,
    description: '1=Active, 2=Inactive, 3=Maintenance, 4=PendingApproval',
  })
  @IsEnum(WarehouseStatus)
  status!: WarehouseStatus;
}
