import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import { CreateProductDto } from '../dto';
import { validateSync } from 'class-validator';

@Injectable()
export class ProductValidator {
  constructor(private readonly productRepo: ProductRepository) {}

  async validateUnique(code: string, name: string): Promise<string | null> {
    const exist = await this.productRepo.findByCodeOrName(code, name);
    if (exist) {
      if (exist.Code === code) {
        throw new HttpException(
          `Mã sản phẩm ${code} đã tồn tại`,
          HttpStatus.CONFLICT,
        );
      }
      if (exist.Name === name) {
        throw new HttpException(
          `Tên sản phẩm ${name} đã tồn tại`,
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
      // Validate giá trị từng trường bằng class-validator
      const dto = Object.assign(new CreateProductDto(), row);
      const validationErrors = validateSync(dto, { whitelist: true });
      if (validationErrors.length > 0) {
        const msg = validationErrors
          .map((e) => Object.values(e.constraints || {}).join(', '))
          .join('; ');
        errors.push(`Dòng ${i + 2}: ${msg}`);
        continue;
      }
      // Validate unique
      const err = await this.validateUnique(row.Code, row.Name);
      if (err) errors.push(`Dòng ${i + 2}: ${err}`);
    }
    return errors;
  }
}
