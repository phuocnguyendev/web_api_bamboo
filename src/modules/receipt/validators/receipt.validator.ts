import { Injectable } from '@nestjs/common';
import { validateSync } from 'class-validator';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { ReceiptRepository } from '../repositories/receipt.repository';

@Injectable()
export class ReceiptValidator {
  constructor(private readonly receiptRepository: ReceiptRepository) {}

  async ensureUniqueCode(row: { Id?: string; Code: string }) {
    // Check if Code is unique (implement if needed)
    // const existing = await this.receiptRepository.findByCode(row.Code);
    // if (existing && existing.Id !== row.Id) {
    //   throw new ConflictException(`Mã phiếu nhập đã tồn tại: ${row.Code}`);
    // }
  }

  async validateImportRows(rows: CreateReceiptDto[]): Promise<string[]> {
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dto = Object.assign(new CreateReceiptDto(), row);
      const validationErrors = validateSync(dto, { whitelist: true });

      if (validationErrors.length > 0) {
        const msg = validationErrors
          .map((e) => Object.values(e.constraints || {}).join(', '))
          .join('; ');
        errors.push(`Dòng ${i + 2}: ${msg}`);
        continue;
      }

      try {
        await this.ensureUniqueCode(row);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Lỗi không xác định';
        errors.push(`Dòng ${i + 2}: ${message}`);
      }
    }
    return errors;
  }
}
