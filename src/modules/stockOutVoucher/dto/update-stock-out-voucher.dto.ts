import { PartialType } from '@nestjs/swagger';
import { CreateStockOutVoucherDto } from './create-stock-out-voucher.dto';

export class UpdateStockOutVoucherDto extends PartialType(
  CreateStockOutVoucherDto,
) {}
