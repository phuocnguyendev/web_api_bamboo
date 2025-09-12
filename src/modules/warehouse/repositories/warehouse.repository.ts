import { BaseRepository } from 'src/repository/baseRepository';
import {
  Warehouse,
  WarehouseCreateData,
  WarehouseResponse,
} from '../interfaces/warehouse.interface';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ChangeWarehouseStatusDto } from '../dto';
import { WarehouseStatus } from '../constants/constant';

export const queryWarehouse = {
  Id: true,
  Code: true,
  Name: true,
  Address: true,
  Branch: true,
  Status: true,
  CreatedAt: true,
  UpdatedAt: true,
};
@Injectable()
export class WarehouseRepository extends BaseRepository<Warehouse, any> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.warehouse);
  }

  async createWarehouse(data: WarehouseCreateData): Promise<Warehouse> {
    const createData = {
      ...data,
      Status: data.Status ?? WarehouseStatus.Active,
    };
    return this.model.create({
      data: createData,
      select: queryWarehouse,
    });
  }

  async updateWarehouse(
    id: string,
    data: Partial<WarehouseCreateData>,
  ): Promise<Warehouse> {
    return this.model.update({
      where: { Id: id },
      data,
      select: queryWarehouse,
    });
  }

  async deleteWarehouse(id: string): Promise<Warehouse> {
    return this.model.delete({
      where: { Id: id },
      select: queryWarehouse,
    });
  }

  async findAllWarehouse(
    page: number,
    pageSize: number,
    searchText?: string,
  ): Promise<[WarehouseResponse[], number]> {
    const skip = (page - 1) * pageSize;
    const where = searchText
      ? {
          Name: { contains: searchText, mode: 'insensitive' },
          Code: { contains: searchText, mode: 'insensitive' },
        }
      : undefined;
    const [data, count] = await Promise.all([
      this.model.findMany({
        skip,
        take: pageSize,
        where,
        select: queryWarehouse,
      }),
      this.model.count({ where }),
    ]);
    return [data, count];
  }

  async findOneById(id: string): Promise<WarehouseResponse | null> {
    return this.model.findUnique({
      where: { Id: id },
      select: queryWarehouse,
    });
  }

  async changeStatus(dto: ChangeWarehouseStatusDto) {
    const { ids, status } = dto;
    await this.model.updateMany({
      where: { Id: { in: ids } },
      data: { Status: status },
    });
    const updated = await this.model.findMany({
      where: { Id: { in: ids }, Status: status },
      select: { Id: true },
    });
    return updated.map((w) => w.Id);
  }

  async getProductsInWarehouse(
    warehouseId: string,
    page: number,
    pageSize: number,
    searchText?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const where: any = {
      WarehouseId: warehouseId,
    };
    if (searchText) {
      where.Product = { Name: { contains: searchText, mode: 'insensitive' } };
    }
    const [data, count] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        skip,
        take: pageSize,
        include: { Product: true },
      }),
      this.prisma.stock.count({ where }),
    ]);

    return [data, count];
  }

  async getStock(warehouseId: string, productId: string) {
    return this.prisma.stock.findUnique({
      where: {
        WarehouseId_ProductId: {
          WarehouseId: warehouseId,
          ProductId: productId,
        },
      },
    });
  }

  async updateStockQty(warehouseId: string, productId: string, delta: number) {
    return this.prisma.stock.update({
      where: {
        WarehouseId_ProductId: {
          WarehouseId: warehouseId,
          ProductId: productId,
        },
      },
      data: { QtyOnHand: { increment: delta } },
    });
  }
}
