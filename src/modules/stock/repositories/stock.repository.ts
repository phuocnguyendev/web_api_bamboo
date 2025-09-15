import { BaseRepository } from 'src/repository/baseRepository';
import {
  Stock,
  StockCreateData,
  StockResponse,
} from '../interfaces/stock.interface';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StockRepository extends BaseRepository<Stock, any> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.stock);
  }
  async findByWarehouseAndProduct(
    warehouseId: string,
    productId: string,
    withRelation = false,
  ) {
    return this.prisma.stock.findUnique({
      where: {
        WarehouseId_ProductId: {
          WarehouseId: warehouseId,
          ProductId: productId,
        },
      },
      include: withRelation
        ? {
            Warehouse: { select: { Id: true, Name: true } },
            Product: { select: { Id: true, Name: true } },
          }
        : undefined,
    });
  }

  async findStockById(id: string): Promise<StockResponse> {
    const stock = await this.prisma.stock.findUnique({
      where: { Id: id },
      include: {
        Warehouse: {
          select: { Id: true, Name: true },
        },
        Product: {
          select: { Id: true, Name: true },
        },
      },
    });
    if (!stock) {
      throw new Error(`Stock with id ${id} not found`);
    }
    return {
      ...stock,
    };
  }

  async create(data: StockCreateData): Promise<Stock> {
    return this.prisma.stock.create({ data });
  }

  async createWithResponse(data: StockCreateData): Promise<StockResponse> {
    const stock = await this.prisma.stock.create({
      data,
      include: {
        Warehouse: { select: { Id: true, Name: true } },
        Product: { select: { Id: true, Name: true } },
      },
    });
    return {
      ...stock,
    };
  }
}
