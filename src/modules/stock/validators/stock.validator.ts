import { Injectable } from '@nestjs/common';
import { StockRepository } from '../repositories/stock.repository';
import { StockWithRelation } from '../interfaces/stock.interface';
import { validateSync } from 'class-validator';
import { ImportStockDto } from '../dto';

@Injectable()
export class StockValidator {
  constructor(private readonly stockRepository: StockRepository) {}

  async ensureUniqueCombination(row: any, stockRepository?: StockRepository) {
    const repo = stockRepository || this.stockRepository;
    const currentId = row.Id;

    const existing = (await repo.findByWarehouseAndProduct(
      row.WarehouseId,
      row.ProductId,
      true,
    )) as StockWithRelation | null;

    if (existing && existing.Id !== currentId) {
      const warehouseName = existing.Warehouse?.Name ?? row.WarehouseId;
      const productName = existing.Product?.Name ?? row.ProductId;

      throw new Error(`Kho "${warehouseName}" đã có sản phẩm "${productName}"`);
    }
  }

  async validateImportRows(rows: ImportStockDto[]): Promise<string[]> {
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dto = Object.assign(new ImportStockDto(), row);
      const validationErrors = validateSync(dto, { whitelist: true });

      if (validationErrors.length > 0) {
        const msg = validationErrors
          .map((e) => Object.values(e.constraints || {}).join(', '))
          .join('; ');
        errors.push(`Dòng ${i + 2}: ${msg}`);
        continue;
      }

      try {
        await this.ensureUniqueCombination(row);
      } catch (err: any) {
        errors.push(`Dòng ${i + 2}: ${err.message}`);
      }
    }
    return errors;
  }
}

const customMessages: Record<string, string> = {
  isString: 'Phải là chuỗi ký tự',
  isNotEmpty: 'Không được để trống',
  isUUID: 'Phải là UUID hợp lệ',
  isNumber: 'Phải là số',
  min: 'Phải >= 0',
};

export function validateStockDto(
  dto: any,
): { Property: string; Message: string }[] {
  const validationErrors = validateSync(dto, { whitelist: true });
  const errorList: { Property: string; Message: string }[] = [];

  for (const error of validationErrors) {
    const constraints = error.constraints ?? {};
    for (const key in constraints) {
      let msg = customMessages[key] || constraints[key];
      errorList.push({ Property: error.property, Message: msg });
    }
  }

  return errorList;
}

export async function checkStockUniqueFields(
  row: any,
  stockRepo: StockRepository,
) {
  const errorList: { Property: string; Message: string }[] = [];
  const currentId = row.Id;

  try {
    const existing = await stockRepo.findByWarehouseAndProduct(
      row.WarehouseId,
      row.ProductId,
      true,
    );

    if (existing && existing.Id !== currentId) {
      errorList.push({
        Property: 'WarehouseId',
        Message: `Kho và sản phẩm này đã tồn tại trong hệ thống`,
      });
    }
  } catch (e: any) {
    errorList.push({
      Property: 'WarehouseId',
      Message: e.message || 'Lỗi kiểm tra tính duy nhất',
    });
  }

  return errorList;
}
