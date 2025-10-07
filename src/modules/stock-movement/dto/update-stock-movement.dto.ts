import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateStockMovementDto } from './create-stock-movement.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStockMovementDto extends PartialType(
  OmitType(CreateStockMovementDto, ['CreatedBy'] as const),
) {
  @ApiPropertyOptional({
    description: 'Lý do cập nhật',
  })
  @IsOptional()
  @IsString()
  UpdateReason?: string;
}
