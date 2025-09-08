import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { Product, ProductResponse } from '../interfaces/product.interface';
import {
  mapPrismaProductToDomain,
  mapProductDecimalFieldsToNumber,
} from '../helpers/product.mapper';
import { CreateProductDto } from '../dto';
import { BaseRepository } from 'src/repository/baseRepository';

@Injectable()
export class ProductRepository extends BaseRepository<Product, any> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.product);
  }
  async findByCodeOrName(code: string, name: string): Promise<Product | null> {
    const result = await this.prisma.product.findFirst({
      where: {
        OR: [{ Code: code }, { Name: name }],
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
      ? { Name: { contains: searchText, mode: 'insensitive' } }
      : undefined;

    const [data, count] = await Promise.all([
      this.model.findMany({
        skip,
        orderBy: {
          CreatedAt: 'asc',
        },
        take: pageSize,
        where,
        select: {
          Id: true,
          Code: true,
          Name: true,
          Material: true,
          SpecText: true,
          Uom: true,
          BaseCost: true,
          Status: true,
          Note: true,
          CreatedAt: true,
          UpdatedAt: true,
        },
      }),
      this.model.count({ where }),
    ]);

    return [data, count];
  }
}
