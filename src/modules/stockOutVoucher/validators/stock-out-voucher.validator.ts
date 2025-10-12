import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateStockOutVoucherDto } from '../dto/create-stock-out-voucher.dto';
import { ImportStockOutVoucherDto } from '../dto/import-stock-out-voucher.dto';

@Injectable()
export class StockOutVoucherValidator {
  async validateImportBatch(
    importDto: ImportStockOutVoucherDto,
  ): Promise<{ valid: CreateStockOutVoucherDto[]; invalid: any[] }> {
    const valid: CreateStockOutVoucherDto[] = [];
    const invalid: any[] = [];
    for (const voucher of importDto.vouchers) {
      const instance = plainToInstance(CreateStockOutVoucherDto, voucher);
      const errors = await validate(instance, { whitelist: true });
      if (errors.length === 0) {
        valid.push(voucher);
      } else {
        invalid.push({ ...voucher, errors });
      }
    }
    return { valid, invalid };
  }
}
