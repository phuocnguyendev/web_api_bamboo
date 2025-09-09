import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { CreateProductDto, UpdateProductDto } from './dto';
import { IProductResponse } from './dto/response.dto';
import {
  exportFullProductSampleExcelStyled,
  parseProductExcel,
} from './helpers/product.excel';
import { ProductRepository } from './repositories/product.repository';
import {
  checkProductUniqueFields,
  ProductValidator,
  validateProductDto,
} from './validators/product.validator';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly productValidator: ProductValidator,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const err = await this.productValidator.validateUnique(
      createProductDto.Code,
      createProductDto.Sku!,
      createProductDto.Barcode!,
      createProductDto.HSCode!,
    );
    if (err) throw new BadRequestException(err);
    return this.productRepo.create(createProductDto);
  }

  async importExcel(buffer: Buffer) {
    const { data } = parseProductExcel(buffer);
    const rows: any[] = data.map((row) => ({
      Code: row[0],
      Sku: row[1] !== undefined && row[1] !== null ? String(row[1]) : undefined,
      Name: row[2],
      Material: row[3],
      SpecText: row[4],
      Uom: row[5],
      BaseCost:
        row[6] !== undefined && row[6] !== '' ? Number(row[6]) : undefined,
      Status: row[7] === 'true',
      Note: row[8],
      Barcode:
        row[9] !== undefined && row[9] !== null ? String(row[9]) : undefined,
      HSCode:
        row[10] !== undefined && row[10] !== null ? String(row[10]) : undefined,
      CountryOfOrigin: row[11],
      WeightKg:
        row[12] !== undefined && row[12] !== '' ? Number(row[12]) : undefined,
      LengthCm:
        row[13] !== undefined && row[13] !== '' ? Number(row[13]) : undefined,
      WidthCm:
        row[14] !== undefined && row[14] !== '' ? Number(row[14]) : undefined,
      HeightCm:
        row[15] !== undefined && row[15] !== '' ? Number(row[15]) : undefined,
      ImageUrl: row[16],
    }));

    return rows;
  }

  async insertMany(products: CreateProductDto[]) {
    if (!Array.isArray(products) || products.length === 0) {
      throw new BadRequestException('Danh sách sản phẩm trống');
    }
    const validRows: CreateProductDto[] = [];
    const invalidRows: any[] = [];
    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      const dto = Object.assign(new CreateProductDto(), row);
      let errorList = validateProductDto(dto);
      const uniqueErrors = await checkProductUniqueFields(
        row,
        this.productRepo,
      );
      errorList = errorList.concat(uniqueErrors);
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
    return {
      InsertedCount: inserted,
      InvalidStudents: invalidRows,
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
  async findOne(id: string) {
    const product = await this.productRepo.findProductById(id);
    if (!product) throw new BadRequestException('Product not found');
    return product;
  }
  async update(updateDto: UpdateProductDto) {
    const product = await this.productRepo.findProductById(updateDto.Id);
    if (!product) throw new BadRequestException('Product not found');

    const uniqueFields: (keyof UpdateProductDto)[] = [
      'Code',
      'Name',
      'Sku',
      'Barcode',
      'HSCode',
    ];

    const needValidate = uniqueFields.some(
      (field) => updateDto[field] && updateDto[field] !== product[field],
    );

    if (needValidate) {
      const err = await this.productValidator.validateUnique(
        updateDto.Code ?? product.Code,
        updateDto.Sku ?? product.Sku!,
        updateDto.Barcode ?? product.Barcode!,
        updateDto.HSCode ?? product.HSCode!,
      );
      if (err) throw new BadRequestException(err);
    }

    const updated = await this.productRepo.update({
      where: { Id: updateDto.Id },
      data: updateDto,
    });

    return this.productRepo.updateProduct(updateDto.Id, updated);
  }

  async remove(id: string) {
    const product = await this.productRepo.findProductById(id);
    if (!product) throw new BadRequestException('Product not found');

    await this.productRepo.delete({ where: { Id: id } });

    return {};
  }
}
