import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BaseRepository } from 'src/repository/baseRepository';
import { CreateProductDto, UpdateProductDto } from '../dto';
import {
  mapPrismaProductToDomain,
  mapProductDecimalFieldsToNumber,
} from '../helpers/product.mapper';
import { Product, ProductResponse } from '../interfaces/product.interface';

export const queryProduct = {
  Id: true,
  Code: true,
  Name: true,
  Material: true,
  SpecText: true,
  Uom: true,
  BaseCost: true,
  Status: true,
  Note: true,
  Barcode: true,
  HSCode: true,
  CountryOfOrigin: true,
  WeightKg: true,
  LengthCm: true,
  WidthCm: true,
  HeightCm: true,
  Version: true,
  ImageUrl: true,
  Sku: true,
  CreatedAt: true,
  UpdatedAt: true,
};

@Injectable()
export class ProductRepository extends BaseRepository<Product, any> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.product);
  }
  async findByCodeOrName(
    code: string,
    name: string,
    sku?: string,
    barcode?: string,
    hsCode?: string,
  ): Promise<Product | null> {
    const result = await this.prisma.product.findFirst({
      where: {
        OR: [
          { Code: code },
          { Name: name },
          { Sku: sku },
          { Barcode: barcode },
          { HSCode: hsCode },
        ],
      },
    });
    if (!result) return null;
    return mapPrismaProductToDomain(result);
  }

  async create(data: CreateProductDto): Promise<Product> {
    const created = await this.prisma.product.create({
      data: mapProductDecimalFieldsToNumber(data),
    });
    return mapPrismaProductToDomain(created);
  }

  async bulkCreate(products: CreateProductDto[]): Promise<Product[]> {
    const createdProducts = await this.prisma.$transaction(
      products.map((p) =>
        this.prisma.product.create({
          data: mapProductDecimalFieldsToNumber(p),
        }),
      ),
    );
    return createdProducts.map(mapPrismaProductToDomain);
  }

  async findAll(
    page: number,
    pageSize: number,
    searchText?: string,
  ): Promise<[ProductResponse[], number]> {
    const skip = (page - 1) * pageSize;
    const where = searchText
      ? {
          OR: [
            { Name: { contains: searchText, mode: 'insensitive' } },
            { Material: { contains: searchText, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const [data, count] = await Promise.all([
      this.model.findMany({
        skip,
        orderBy: {
          CreatedAt: 'asc',
        },
        take: pageSize,
        where,
        select: queryProduct,
      }),
      this.model.count({ where }),
    ]);

    const mappedData = data.map(mapProductDecimalFieldsToNumber);
    return [mappedData, count];
  }

  async findProductById(Id: string): Promise<Product | null> {
    const result = await this.model.findUnique({
      where: { Id: Id },
      select: queryProduct,
    });
    if (!result) return null;
    return mapProductDecimalFieldsToNumber(result);
  }

  async updateProduct(Id: string, data: Product): Promise<UpdateProductDto> {
    return this.model.update({
      where: { Id },
      data,
      select: queryProduct,
    });
  }
}
