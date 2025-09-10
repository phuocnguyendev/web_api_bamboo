import { BadRequestException, Injectable } from '@nestjs/common';
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
    return {
      Data: data,
      ErrorDetail: {},
    };
  }

  async insertMany(items: any[][]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Danh sách sản phẩm trống');
    }
    const validRows: CreateProductDto[] = [];
    const invalidRows: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const dto: any = {
        Code: row[0],
        Sku: row[1],
        Name: row[2],
        Material: row[3],
        SpecText: row[4],
        Uom: row[5],
        BaseCost: row[6],
        Status: row[7],
        Note: row[8],
        Barcode:
          row[9] !== undefined && row[9] !== null ? String(row[9]) : null,
        HSCode:
          row[10] !== undefined && row[10] !== null ? String(row[10]) : null,
        CountryOfOrigin: row[11],
        WeightKg: row[12],
        LengthCm: row[13],
        WidthCm: row[14],
        HeightCm: row[15],
        ImageUrl: row[16],
      };
      let errorList = validateProductDto(dto);
      const uniqueErrors = await checkProductUniqueFields(
        dto,
        this.productRepo,
      );
      errorList = errorList.concat(uniqueErrors);
      errorList = errorList.filter(
        (e) =>
          e &&
          e.Message &&
          e.Message !== 'an unknown value was passed to the validate function',
      );
      if (errorList.length > 0) {
        const errorCells: number[] = [];
        const errorMsgs: string[] = [];
        for (const err of errorList) {
          const idx = [
            'Code',
            'Sku',
            'Name',
            'Material',
            'SpecText',
            'Uom',
            'BaseCost',
            'Status',
            'Note',
            'Barcode',
            'HSCode',
            'CountryOfOrigin',
            'WeightKg',
            'LengthCm',
            'WidthCm',
            'HeightCm',
            'ImageUrl',
          ].indexOf(err.Property);
          if (idx !== -1) errorCells.push(idx);
          errorMsgs.push(err.Message);
        }
        invalidRows.push({
          RowIndex: i,
          ErrorMessage: errorMsgs.length > 0 ? errorMsgs.join(', ') + '.' : '',
          ErrorCells: errorCells,
          CellValues: row,
        });
      } else {
        validRows.push(dto);
      }
    }
    let inserted = 0;
    if (validRows.length > 0) {
      await this.productRepo.bulkCreate(validRows);
      inserted = validRows.length;
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
