import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { BaseRepository } from 'src/repository/baseRepository';
import {
  StockMovement,
  StockMovementCreateData,
  StockMovementResponse,
  StockMovementUpdateData,
  StockMovementStats,
  StockMovementFilter,
  StockMovementType,
} from '../interfaces/stock_movement.interface';
import { Decimal } from '@prisma/client/runtime/library';

export const queryStockMovement = {
  Id: true,
  Type: true,
  RefType: true,
  RefId: true,
  WarehouseId: true,
  WarehouseToId: true,
  ProductId: true,
  Qty: true,
  UnitCost: true,
  Reason: true,
  OccurredAt: true,
  CreatedBy: true,
  CreatedAt: true,
  Warehouse: {
    select: { Id: true, Name: true, Code: true },
  },
  WarehouseTo: {
    select: { Id: true, Name: true, Code: true },
  },
  Product: {
    select: { Id: true, Name: true, Code: true, Sku: true },
  },
};

@Injectable()
export class StockMovementRepository extends BaseRepository<
  StockMovement,
  any
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.stockMovement);
  }

  private mapToStockMovementResponse(movement: any): StockMovementResponse {
    return {
      Id: movement.Id,
      Type: movement.Type,
      RefType: movement.RefType,
      RefId: movement.RefId,
      WarehouseId: movement.WarehouseId,
      WarehouseToId: movement.WarehouseToId,
      ProductId: movement.ProductId,
      Qty: movement.Qty,
      UnitCost: movement.UnitCost ? Number(movement.UnitCost) : undefined,
      Reason: movement.Reason,
      OccurredAt: movement.OccurredAt,
      CreatedBy: movement.CreatedBy,
      CreatedAt: movement.CreatedAt,
      Warehouse: movement.Warehouse,
      WarehouseTo: movement.WarehouseTo,
      Product: movement.Product,
    };
  }

  async findAllStockMovements(
    page: number,
    pageSize: number,
    searchText?: string,
    filter?: StockMovementFilter,
  ): Promise<[StockMovementResponse[], number]> {
    const offset = (page - 1) * pageSize;

    const where: any = {};

    // Apply filters
    if (filter?.type) {
      where.Type = filter.type;
    }
    if (filter?.refType) {
      where.RefType = filter.refType;
    }
    if (filter?.warehouseId) {
      where.WarehouseId = filter.warehouseId;
    }
    if (filter?.warehouseToId) {
      where.WarehouseToId = filter.warehouseToId;
    }
    if (filter?.productId) {
      where.ProductId = filter.productId;
    }
    if (filter?.createdBy) {
      where.CreatedBy = filter.createdBy;
    }
    if (filter?.startDate || filter?.endDate) {
      where.OccurredAt = {};
      if (filter.startDate) {
        where.OccurredAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.OccurredAt.lte = filter.endDate;
      }
    }

    // Apply search
    if (searchText) {
      where.OR = [
        {
          Warehouse: {
            Name: { contains: searchText, mode: 'insensitive' as const },
          },
        },
        {
          WarehouseTo: {
            Name: { contains: searchText, mode: 'insensitive' as const },
          },
        },
        {
          Product: {
            Name: { contains: searchText, mode: 'insensitive' as const },
          },
        },
        {
          Product: {
            Code: { contains: searchText, mode: 'insensitive' as const },
          },
        },
        {
          Reason: { contains: searchText, mode: 'insensitive' as const },
        },
      ];
    }

    const [data, count] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          Warehouse: { select: { Id: true, Name: true, Code: true } },
          WarehouseTo: { select: { Id: true, Name: true, Code: true } },
          Product: { select: { Id: true, Name: true, Code: true, Sku: true } },
        },
        skip: offset,
        take: pageSize,
        orderBy: { OccurredAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    const mappedData = data.map((item) =>
      this.mapToStockMovementResponse(item),
    );
    return [mappedData, count];
  }

  async findStockMovementById(
    id: string,
  ): Promise<StockMovementResponse | null> {
    const movement = await this.prisma.stockMovement.findUnique({
      where: { Id: id },
      include: {
        Warehouse: { select: { Id: true, Name: true, Code: true } },
        WarehouseTo: { select: { Id: true, Name: true, Code: true } },
        Product: { select: { Id: true, Name: true, Code: true, Sku: true } },
      },
    });

    if (!movement) {
      return null;
    }

    return this.mapToStockMovementResponse(movement);
  }

  async findStockMovementsByProduct(
    productId: string,
    page: number,
    pageSize: number,
    searchText?: string,
  ): Promise<[StockMovementResponse[], number]> {
    const filter: StockMovementFilter = { productId };
    return this.findAllStockMovements(page, pageSize, searchText, filter);
  }

  async findStockMovementsByWarehouse(
    warehouseId: string,
    page: number,
    pageSize: number,
    searchText?: string,
  ): Promise<[StockMovementResponse[], number]> {
    const offset = (page - 1) * pageSize;

    const where: any = {
      OR: [{ WarehouseId: warehouseId }, { WarehouseToId: warehouseId }],
    };

    if (searchText) {
      where.AND = [
        {
          OR: [
            {
              Product: {
                Name: { contains: searchText, mode: 'insensitive' as const },
              },
            },
            {
              Product: {
                Code: { contains: searchText, mode: 'insensitive' as const },
              },
            },
            {
              Reason: { contains: searchText, mode: 'insensitive' as const },
            },
          ],
        },
      ];
    }

    const [data, count] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        include: {
          Warehouse: { select: { Id: true, Name: true, Code: true } },
          WarehouseTo: { select: { Id: true, Name: true, Code: true } },
          Product: { select: { Id: true, Name: true, Code: true, Sku: true } },
        },
        skip: offset,
        take: pageSize,
        orderBy: { OccurredAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    const mappedData = data.map((item) =>
      this.mapToStockMovementResponse(item),
    );
    return [mappedData, count];
  }

  async createStockMovement(
    data: StockMovementCreateData,
  ): Promise<StockMovementResponse> {
    const movement = await this.prisma.stockMovement.create({
      data: {
        ...data,
        UnitCost: data.UnitCost
          ? new Decimal(data.UnitCost.toString())
          : undefined,
      },
      include: {
        Warehouse: { select: { Id: true, Name: true, Code: true } },
        WarehouseTo: { select: { Id: true, Name: true, Code: true } },
        Product: { select: { Id: true, Name: true, Code: true, Sku: true } },
      },
    });

    return this.mapToStockMovementResponse(movement);
  }

  async updateStockMovement(
    id: string,
    data: StockMovementUpdateData,
  ): Promise<StockMovementResponse> {
    const movement = await this.prisma.stockMovement.update({
      where: { Id: id },
      data: {
        ...data,
        UnitCost: data.UnitCost
          ? new Decimal(data.UnitCost.toString())
          : undefined,
      },
      include: {
        Warehouse: { select: { Id: true, Name: true, Code: true } },
        WarehouseTo: { select: { Id: true, Name: true, Code: true } },
        Product: { select: { Id: true, Name: true, Code: true, Sku: true } },
      },
    });

    return this.mapToStockMovementResponse(movement);
  }

  async deleteStockMovement(id: string): Promise<void> {
    await this.prisma.stockMovement.delete({
      where: { Id: id },
    });
  }

  async getStockMovementStats(
    startDate?: Date,
    endDate?: Date,
    warehouseId?: string,
    productId?: string,
    type?: StockMovementType,
  ): Promise<StockMovementStats> {
    const where: any = {};

    if (startDate || endDate) {
      where.OccurredAt = {};
      if (startDate) where.OccurredAt.gte = startDate;
      if (endDate) where.OccurredAt.lte = endDate;
    }
    if (warehouseId) {
      where.OR = [{ WarehouseId: warehouseId }, { WarehouseToId: warehouseId }];
    }
    if (productId) where.ProductId = productId;
    if (type) where.Type = type;

    // Get basic stats
    const totalStats = await this.prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as "totalMovements",
        COUNT(CASE WHEN "Type" = 'IN' THEN 1 END) as "inMovements",
        COUNT(CASE WHEN "Type" = 'OUT' THEN 1 END) as "outMovements", 
        COUNT(CASE WHEN "Type" = 'TRANSFER' THEN 1 END) as "transferMovements",
        COALESCE(SUM(CASE WHEN "UnitCost" IS NOT NULL THEN "Qty" * "UnitCost" ELSE 0 END), 0) as "totalValue"
      FROM "StockMovement"
      ${this.buildWhereClause(where)}
    `);

    // Get stats by type
    const byTypeStats = await this.prisma.$queryRawUnsafe(`
      SELECT 
        "Type" as "type",
        COUNT(*) as "count",
        SUM("Qty") as "totalQty",
        COALESCE(SUM(CASE WHEN "UnitCost" IS NOT NULL THEN "Qty" * "UnitCost" ELSE 0 END), 0) as "totalValue"
      FROM "StockMovement"
      ${this.buildWhereClause(where)}
      GROUP BY "Type"
      ORDER BY "Type"
    `);

    // Get stats by warehouse
    const byWarehouseStats = await this.prisma.$queryRawUnsafe(`
      SELECT 
        w."Id" as "warehouseId",
        w."Name" as "warehouseName",
        COUNT(CASE WHEN sm."WarehouseId" = w."Id" AND sm."Type" = 'IN' THEN 1 END) as "inCount",
        COUNT(CASE WHEN sm."WarehouseId" = w."Id" AND sm."Type" = 'OUT' THEN 1 END) as "outCount",
        COUNT(CASE WHEN sm."WarehouseToId" = w."Id" AND sm."Type" = 'TRANSFER' THEN 1 END) as "transferInCount",
        COUNT(CASE WHEN sm."WarehouseId" = w."Id" AND sm."Type" = 'TRANSFER' THEN 1 END) as "transferOutCount",
        COALESCE(SUM(CASE WHEN sm."UnitCost" IS NOT NULL THEN sm."Qty" * sm."UnitCost" ELSE 0 END), 0) as "totalValue"
      FROM "Warehouse" w
      LEFT JOIN "StockMovement" sm ON (sm."WarehouseId" = w."Id" OR sm."WarehouseToId" = w."Id")
        ${this.buildAndWhereClause(where, 'sm')}
      GROUP BY w."Id", w."Name"
      ORDER BY w."Name"
    `);

    // Get stats by product
    const byProductStats = await this.prisma.$queryRawUnsafe(`
      SELECT 
        p."Id" as "productId",
        p."Name" as "productName",
        SUM(CASE WHEN sm."Type" = 'IN' THEN sm."Qty" ELSE 0 END) as "totalIn",
        SUM(CASE WHEN sm."Type" = 'OUT' THEN sm."Qty" ELSE 0 END) as "totalOut",
        SUM(CASE WHEN sm."Type" = 'TRANSFER' THEN sm."Qty" ELSE 0 END) as "totalTransfer",
        COALESCE(SUM(CASE WHEN sm."UnitCost" IS NOT NULL THEN sm."Qty" * sm."UnitCost" ELSE 0 END), 0) as "totalValue"
      FROM "Product" p
      INNER JOIN "StockMovement" sm ON sm."ProductId" = p."Id"
      ${this.buildWhereClause(where, 'sm')}
      GROUP BY p."Id", p."Name"
      ORDER BY p."Name"
    `);

    // Convert BigInt values to numbers
    const convertedTotalStats = (totalStats as any[])[0];
    const convertedByType = (byTypeStats as any[]).map((item) => ({
      type: item.type,
      count: Number(item.count),
      totalQty: Number(item.totalQty),
      totalValue: Number(item.totalValue),
    }));
    const convertedByWarehouse = (byWarehouseStats as any[]).map((item) => ({
      warehouseId: item.warehouseId,
      warehouseName: item.warehouseName,
      inCount: Number(item.inCount),
      outCount: Number(item.outCount),
      transferInCount: Number(item.transferInCount),
      transferOutCount: Number(item.transferOutCount),
      totalValue: Number(item.totalValue),
    }));
    const convertedByProduct = (byProductStats as any[]).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalIn: Number(item.totalIn),
      totalOut: Number(item.totalOut),
      totalTransfer: Number(item.totalTransfer),
      totalValue: Number(item.totalValue),
    }));

    return {
      totalMovements: Number(convertedTotalStats.totalMovements),
      inMovements: Number(convertedTotalStats.inMovements),
      outMovements: Number(convertedTotalStats.outMovements),
      transferMovements: Number(convertedTotalStats.transferMovements),
      totalValue: Number(convertedTotalStats.totalValue),
      byType: convertedByType,
      byWarehouse: convertedByWarehouse,
      byProduct: convertedByProduct,
      byDateRange: [], // This would require more complex date grouping logic
    };
  }

  private buildWhereClause(where: any, tableAlias?: string): string {
    if (!where || Object.keys(where).length === 0) return '';

    const alias = tableAlias ? `${tableAlias}.` : '';
    const conditions: string[] = [];

    if (where.Type) conditions.push(`${alias}"Type" = '${where.Type}'`);
    if (where.RefType)
      conditions.push(`${alias}"RefType" = '${where.RefType}'`);
    if (where.WarehouseId)
      conditions.push(`${alias}"WarehouseId" = '${where.WarehouseId}'`);
    if (where.WarehouseToId)
      conditions.push(`${alias}"WarehouseToId" = '${where.WarehouseToId}'`);
    if (where.ProductId)
      conditions.push(`${alias}"ProductId" = '${where.ProductId}'`);
    if (where.CreatedBy)
      conditions.push(`${alias}"CreatedBy" = '${where.CreatedBy}'`);

    if (where.OccurredAt) {
      if (where.OccurredAt.gte)
        conditions.push(
          `${alias}"OccurredAt" >= '${where.OccurredAt.gte.toISOString()}'`,
        );
      if (where.OccurredAt.lte)
        conditions.push(
          `${alias}"OccurredAt" <= '${where.OccurredAt.lte.toISOString()}'`,
        );
    }

    if (where.OR && Array.isArray(where.OR)) {
      const orConditions = where.OR.map((condition: any) => {
        if (condition.WarehouseId)
          return `${alias}"WarehouseId" = '${condition.WarehouseId}'`;
        if (condition.WarehouseToId)
          return `${alias}"WarehouseToId" = '${condition.WarehouseToId}'`;
        return '';
      }).filter(Boolean);

      if (orConditions.length > 0) {
        conditions.push(`(${orConditions.join(' OR ')})`);
      }
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  private buildAndWhereClause(where: any, tableAlias?: string): string {
    const whereClause = this.buildWhereClause(where, tableAlias);
    return whereClause ? `AND ${whereClause.substring(6)}` : '';
  }
}
