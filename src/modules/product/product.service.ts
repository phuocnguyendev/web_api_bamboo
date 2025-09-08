import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductRepository } from './repositories/product.repository';
import { ProductValidator } from './validators/product.validator';
import {
  exportFullProductSampleExcelStyled,
  parseProductExcel,
} from './helpers/product.excel';
import * as XLSX from 'xlsx';
import { IProductResponse } from './dto/response.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly productValidator: ProductValidator,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const err = await this.productValidator.validateUnique(
      createProductDto.Code,
      createProductDto.Name,
    );
    if (err) throw new BadRequestException(err);
    return this.productRepo.create(createProductDto);
  }

  async importExcel(buffer: Buffer) {
    const { data, header } = parseProductExcel(buffer);
    const rows: CreateProductDto[] = data.map((row) => ({
      Code: row[0],
      Sku: row[1],
      Name: row[2],
      Material: row[3],
      SpecText: row[4],
      Uom: row[5],
      BaseCost: row[6],
      Status: row[7] === 'true',
      Note: row[8],
      Barcode: row[9],
      HSCode: row[10],
      CountryOfOrigin: row[11],
      WeightKg: row[12],
      LengthCm: row[13],
      WidthCm: row[14],
      HeightCm: row[15],
      ImageUrl: row[16],
    }));

    const validRows: CreateProductDto[] = [];
    const invalidRows: any[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dto = Object.assign(new CreateProductDto(), row);
      const validationErrors = (await import('class-validator')).validateSync(
        dto,
        { whitelist: true },
      );
      const errorList: { Property: string; Message: string }[] = [];
      if (validationErrors.length > 0) {
        for (const e of validationErrors) {
          if (e.constraints) {
            for (const key in e.constraints) {
              let msg = e.constraints[key];
              if (key === 'isString') msg = 'Phải là chuỗi ký tự';
              if (key === 'isNotEmpty') msg = 'Không được để trống';
              if (key === 'length') msg = 'Độ dài không hợp lệ';
              if (key === 'isBoolean') msg = 'Phải là true/false';
              if (e.property === 'BaseCost' && key === 'isString')
                msg = 'Giá vốn phải là chuỗi';
              errorList.push({ Property: e.property, Message: msg });
            }
          }
        }
      }
      let uniqueErr: string | null = null;
      try {
        uniqueErr = await this.productValidator.validateUnique(
          row.Code,
          row.Name,
        );
      } catch (e: any) {
        errorList.push({ Property: 'Code/Name', Message: e.message });
      }
      if (errorList.length > 0) {
        invalidRows.push({ Errors: errorList, ...row });
      } else {
        validRows.push(row);
      }
    }
    let inserted = 0;
    if (validRows.length > 0) {
      await this.productRepo.bulkCreate(validRows);
      inserted = validRows.length;
    }
    // Nếu có lỗi, ghi file lỗi
    if (invalidRows.length > 0) {
      const filePath = 'src/assets/files/InvalidProduct.xlsx';
      const ws = XLSX.utils.aoa_to_sheet([
        header,
        ...invalidRows.map((r) => Object.values(r)),
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'InvalidProducts');
      XLSX.writeFile(wb, filePath);
    }
    return {
      InsertedCount: inserted,
      InvalidProducts: invalidRows,
    };
  }

  async exportSampleExcel(filePath: string) {
    await exportFullProductSampleExcelStyled(filePath);
    return filePath;
  }

  async findAll(
    page = 1,
    pageSize = 30,
    searchText = '',
  ): Promise<IProductResponse> {
    const [data, count] = await this.productRepo.findAll(
      page,
      pageSize,
      searchText,
    );
    return new IProductResponse(data, count);
  }
  // async findOne(id: string) {
  //   const product = await this.productRepo.findOne(id);
  //   if (!product) throw new BadRequestException('Product not found');
  //   return product;
  // }
  // async update(id: string, dto: UpdateProductDto) {
  //   const product = await this.productRepo.findOne(id);
  //   if (!product) throw new BadRequestException('Product not found');
  //   // Check unique nếu đổi code/name
  //   if (
  //     (dto.Code && dto.Code !== product.Code) ||
  //     (dto.Name && dto.Name !== product.Name)
  //   ) {
  //     const err = await this.productValidator.validateUnique(
  //       dto.Code ?? product.Code,
  //       dto.Name ?? product.Name,
  //     );
  //     if (err) throw new BadRequestException(err);
  //   }
  //   return this.productRepo.update(id, dto);
  // }
  // async remove(id: string) {
  //   const product = await this.productRepo.findOne(id);
  //   if (!product) throw new BadRequestException('Product not found');
  //   return this.productRepo.remove(id);
  // }
}
