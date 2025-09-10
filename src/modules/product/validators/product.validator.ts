import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ensureFieldUnique } from 'src/common/db.validator';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto';
import { validateSync } from 'class-validator';

@Injectable()
export class ProductValidator {
  constructor(private readonly productRepo: ProductRepository) {}

  async validateUnique(
    code: string,
    sku: string,
    barcode: string,
    hsCode: string,
  ): Promise<null> {
    const exist = await this.productRepo.findByCodeOrName(
      code,
      sku,
      barcode,
      hsCode,
    );

    if (!exist) return null;

    const checks: [keyof typeof exist, string | undefined, string][] = [
      ['Code', code, 'Mã sản phẩm'],
      ['Sku', sku, 'SKU sản phẩm'],
      ['Barcode', barcode, 'Barcode sản phẩm'],
      ['HSCode', hsCode, 'HSCode sản phẩm'],
    ];

    for (const [field, value, label] of checks) {
      if (value && exist[field] === value) {
        throw new HttpException(
          `${label} ${value} đã tồn tại`,
          HttpStatus.CONFLICT,
        );
      }
    }

    return null;
  }

  async validateImportRows(rows: CreateProductDto[]): Promise<string[]> {
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dto = Object.assign(new CreateProductDto(), row);
      const validationErrors = validateSync(dto, { whitelist: true });
      if (validationErrors.length > 0) {
        const msg = validationErrors
          .map((e) => Object.values(e.constraints || {}).join(', '))
          .join('; ');
        errors.push(`Dòng ${i + 2}: ${msg}`);
        continue;
      }
      const err = await this.validateUnique(
        row.Code,
        row.Sku!,
        row.Barcode!,
        row.HSCode!,
      );
      if (err) errors.push(`Dòng ${i + 2}: ${err}`);
    }
    return errors;
  }
}

const customMessages: Record<string, string> = {
  isString: 'Phải là chuỗi ký tự',
  isNotEmpty: 'Không được để trống',
  length: 'Độ dài không hợp lệ',
  isBoolean: 'Phải là true/false',
  isNumber: 'Phải là số',
  isPositive: 'Phải là số dương',
};

export function validateProductDto(
  dto: any,
): { Property: string; Message: string }[] {
  const validationErrors = validateSync(dto, { whitelist: true });
  const errorList: { Property: string; Message: string }[] = [];

  for (const error of validationErrors) {
    const constraints = error.constraints ?? {};
    for (const key in constraints) {
      let msg = customMessages[key] || constraints[key];

      if (key === 'max') {
        msg = `Tối đa ${constraints[key]} ký tự`;
      }
      if (key === 'min') {
        msg = `Tối thiểu ${constraints[key]} ký tự`;
      }

      errorList.push({ Property: error.property, Message: msg });
    }
  }

  return errorList;
}

export async function checkProductUniqueFields(row: any, productRepo: any) {
  const checkFields = [
    { prop: 'Code', label: 'Mã sản phẩm' },
    { prop: 'Sku', label: 'SKU' },
    { prop: 'Barcode', label: 'Barcode' },
    { prop: 'HSCode', label: 'HSCode' },
  ];
  const errorList: { Property: string; Message: string }[] = [];
  const currentId = row.Id;
  for (const field of checkFields) {
    try {
      await ensureFieldUnique(
        productRepo,
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
