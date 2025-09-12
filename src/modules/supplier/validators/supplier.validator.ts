import { Injectable } from '@nestjs/common';
import { ensureFieldUnique } from 'src/common/db.validator';
import { SupplierRepository } from '../repositories/supplier.repository';

@Injectable()
export class SupplierValidator {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async checkSupplierUniqueFields(row: any, SupplierRepo: any) {
    const checkFields = [
      { prop: 'Phone', label: 'Số điện thoại' },
      { prop: 'Email', label: 'Email' },
      { prop: 'TaxCode', label: 'Mã số thuế' },
    ];
    const errorList: { Property: string; Message: string }[] = [];
    const currentId = row.Id;
    for (const field of checkFields) {
      try {
        await ensureFieldUnique(
          SupplierRepo,
          field.prop,
          row[field.prop],
          field.label,
          currentId,
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
