import { Injectable } from '@nestjs/common';
import { StockRepository } from '../repositories/stock.repository';
import { StockWithRelation } from '../interfaces/stock.interface';

@Injectable()
export class StockValidator {
  async ensureUniqueCombination(row: any, stockRepository: StockRepository) {
    const currentId = row.Id;

    const existing = (await stockRepository.findByWarehouseAndProduct(
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
}
