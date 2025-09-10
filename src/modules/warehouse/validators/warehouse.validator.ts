import { Injectable } from '@nestjs/common';
import { ensureFieldUnique } from 'src/common/db.validator';
import { WarehouseRepository } from '../repositories/warehouse.repository';

@Injectable()
export class WarehouseValidator {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async checkWarehouseUniqueFields(row: any, warehouseRepo: any) {
    const checkFields = [
      { prop: 'Code', label: 'Mã kho' },
      { prop: 'Name', label: 'Tên kho' },
    ];
    const errorList: { Property: string; Message: string }[] = [];
    const currentId = row.Id;
    for (const field of checkFields) {
      try {
        await ensureFieldUnique(
          warehouseRepo,
          field.prop,
          row[field.prop],
          field.label,
          currentId, // truyền Id để bỏ qua chính nó khi update
        );
      } catch (e: any) {
        errorList.push({
          Property: field.prop,
          Message: e.message || `${field.label} đã tồn tại trong hệ thống`,
        });
      }
    }
    return errorList;
  }
}
