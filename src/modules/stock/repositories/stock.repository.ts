import { BaseRepository } from 'src/repository/baseRepository';
import {
  Stock,
  StockCreateData,
  StockResponse,
  StockUpdateData,
} from '../interfaces/stock.interface';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { ImportStockDto } from '../dto';

export const queryStock = {
  Id: true,
  QtyOnHand: true,
  QtyReserved: true,
  SafetyStock: true,
  ReorderPoint: true,
  MinQty: true,
  Warehouse: {
    select: { Id: true, Name: true },
  },
  Product: {
    select: { Id: true, Name: true },
  },
};

@Injectable()
export class StockRepository extends BaseRepository<Stock, any> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.stock);
  }

  private mapToStockResponse(stock: StockResponse) {
    return {
      Id: stock.Id,
      QtyOnHand: stock.QtyOnHand,
      QtyReserved: stock.QtyReserved,
      SafetyStock: stock.SafetyStock,
      ReorderPoint: stock.ReorderPoint,
      MinQty: stock.MinQty,
      Warehouse: stock.Warehouse,
      Product: stock.Product,
    };
  }

  async findAllStocks(
    page: number,
    pageSize: number,
    searchText: string,
  ): Promise<[StockResponse[], number]> {
    const offset = (page - 1) * pageSize;
    const where = searchText
      ? {
          OR: [
            {
              Warehouse: {
                Name: { contains: searchText, mode: 'insensitive' as const },
              },
            },
            {
              Product: {
                Name: { contains: searchText, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {};

    const [data, count] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        include: {
          Warehouse: { select: { Id: true, Name: true } },
          Product: { select: { Id: true, Name: true } },
        },
        skip: offset,
        take: pageSize,
        orderBy: { Warehouse: { Name: 'asc' } },
      }),
      this.prisma.stock.count({ where }),
    ]);

    const mappedData = data.map((item: any) => ({
      Id: item.Id,
      QtyOnHand: item.QtyOnHand,
      QtyReserved: item.QtyReserved,
      SafetyStock: item.SafetyStock,
      ReorderPoint: item.ReorderPoint,
      MinQty: item.MinQty,
      Warehouse: item.Warehouse,
      Product: item.Product,
    })) as StockResponse[];
    return [mappedData, count];
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
    return this.mapToStockResponse(stock);
  }

  async findStocksByWarehouse(
    warehouseId: string,
    page: number,
    pageSize: number,
    searchText: string,
  ): Promise<[StockResponse[], number]> {
    const offset = (page - 1) * pageSize;
    const where = {
      WarehouseId: warehouseId,
      ...(searchText && {
        Product: {
          Name: { contains: searchText, mode: 'insensitive' as const },
        },
      }),
    };

    const [data, count] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        include: {
          Warehouse: { select: { Id: true, Name: true } },
          Product: { select: { Id: true, Name: true } },
        },
        skip: offset,
        take: pageSize,
        orderBy: { Product: { Name: 'asc' } },
      }),
      this.prisma.stock.count({ where }),
    ]);

    const mappedData = data.map((item) => this.mapToStockResponse(item));
    return [mappedData, count];
  }

  async findStocksByProduct(
    productId: string,
    page: number,
    pageSize: number,
    searchText: string,
  ): Promise<[StockResponse[], number]> {
    const offset = (page - 1) * pageSize;
    const where = {
      ProductId: productId,
      ...(searchText && {
        Warehouse: {
          Name: { contains: searchText, mode: 'insensitive' as const },
        },
      }),
    };

    const [data, count] = await Promise.all([
      this.prisma.stock.findMany({
        where,
        include: {
          Warehouse: { select: { Id: true, Name: true } },
          Product: { select: { Id: true, Name: true } },
        },
        skip: offset,
        take: pageSize,
        orderBy: { Warehouse: { Name: 'asc' } },
      }),
      this.prisma.stock.count({ where }),
    ]);

    const mappedData = data.map((item) => this.mapToStockResponse(item));
    return [mappedData, count];
  }

  async findLowStocks(
    page: number,
    pageSize: number,
    searchText: string,
  ): Promise<[StockResponse[], number]> {
    const offset = (page - 1) * pageSize;
    const where = {
      OR: [
        {
          QtyOnHand: { lte: this.prisma.stock.fields.SafetyStock },
        },
        {
          QtyOnHand: { lte: this.prisma.stock.fields.ReorderPoint },
        },
      ],
      ...(searchText && {
        OR: [
          {
            Warehouse: {
              Name: { contains: searchText, mode: 'insensitive' as const },
            },
          },
          {
            Product: {
              Name: { contains: searchText, mode: 'insensitive' as const },
            },
          },
        ],
      }),
    };
    const lowStockQuery = `
      SELECT s."Id", s."WarehouseId", s."ProductId", s."QtyOnHand", 
             s."QtyReserved", s."SafetyStock", s."ReorderPoint", s."MinQty",
             w."Name" as "WarehouseName", p."Name" as "ProductName"
      FROM "Stock" s
      JOIN "Warehouse" w ON s."WarehouseId" = w."Id"
      JOIN "Product" p ON s."ProductId" = p."Id"
      WHERE (s."QtyOnHand" <= s."SafetyStock" OR s."QtyOnHand" <= s."ReorderPoint")
      ${searchText ? `AND (w."Name" ILIKE '%${searchText}%' OR p."Name" ILIKE '%${searchText}%')` : ''}
      ORDER BY w."Name" ASC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) as count
      FROM "Stock" s
      JOIN "Warehouse" w ON s."WarehouseId" = w."Id"
      JOIN "Product" p ON s."ProductId" = p."Id"
      WHERE (s."QtyOnHand" <= s."SafetyStock" OR s."QtyOnHand" <= s."ReorderPoint")
      ${searchText ? `AND (w."Name" ILIKE '%${searchText}%' OR p."Name" ILIKE '%${searchText}%')` : ''}
    `;

    const [data, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe(lowStockQuery),
      this.prisma.$queryRawUnsafe(countQuery),
    ]);

    const mappedData = (data as any[]).map((item) => ({
      Id: item.Id,
      QtyOnHand: item.QtyOnHand,
      QtyReserved: item.QtyReserved,
      SafetyStock: item.SafetyStock,
      ReorderPoint: item.ReorderPoint,
      MinQty: item.MinQty,
      Warehouse: {
        Id: item.WarehouseId,
        Name: item.WarehouseName,
      },
      Product: {
        Id: item.ProductId,
        Name: item.ProductName,
        Price: item.Price,
      },
    })) as StockResponse[];

    const count = parseInt((countResult as any[])[0].count);

    return [mappedData, count];
  }

  async getStockSummary() {
    const summary = await this.prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(DISTINCT s."ProductId") as "totalProducts",
        SUM(s."QtyOnHand") as "totalStock",
        COUNT(CASE WHEN s."QtyOnHand" <= s."SafetyStock" OR s."QtyOnHand" <= s."ReorderPoint" THEN 1 END) as "lowStockProducts",
        COUNT(DISTINCT s."WarehouseId") as "warehouseCount"
      FROM "Stock" s
      JOIN "Product" p ON s."ProductId" = p."Id"
    `);

    const byWarehouse = await this.prisma.$queryRawUnsafe(`
      SELECT 
        w."Id" as "warehouseId",
        w."Name" as "warehouseName",
        COUNT(s."ProductId") as "productCount",
        SUM(s."QtyOnHand") as "totalStock"
      FROM "Stock" s
      JOIN "Warehouse" w ON s."WarehouseId" = w."Id"
      JOIN "Product" p ON s."ProductId" = p."Id"
      GROUP BY w."Id", w."Name"
      ORDER BY w."Name"
    `);

    const byProduct = await this.prisma.$queryRawUnsafe(`
      SELECT 
        p."Id" as "productId",
        p."Name" as "productName",
        SUM(s."QtyOnHand") as "totalStock",
        COUNT(s."WarehouseId") as "warehouseCount"
      FROM "Stock" s
      JOIN "Product" p ON s."ProductId" = p."Id"
      GROUP BY p."Id", p."Name"
      ORDER BY p."Name"
    `);

    const summaryData = (summary as any[])[0];
    const convertedSummary = {
      totalProducts: Number(summaryData.totalProducts),
      totalStock: Number(summaryData.totalStock),
      lowStockProducts: Number(summaryData.lowStockProducts),
      warehouseCount: Number(summaryData.warehouseCount),
    };

    const convertedByWarehouse = (byWarehouse as any[]).map((item) => ({
      warehouseId: item.warehouseId,
      warehouseName: item.warehouseName,
      productCount: Number(item.productCount),
      totalStock: Number(item.totalStock),
    }));

    const convertedByProduct = (byProduct as any[]).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalStock: Number(item.totalStock),
      warehouseCount: Number(item.warehouseCount),
    }));

    return {
      summary: convertedSummary,
      byWarehouse: convertedByWarehouse,
      byProduct: convertedByProduct,
    };
  }

  async create(data: StockCreateData): Promise<Stock> {
    return this.prisma.stock.create({ data });
  }

  async createWithResponse(data: StockCreateData): Promise<StockResponse> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { Id: data.WarehouseId },
      select: { Id: true, Name: true },
    });
    if (!warehouse) {
      throw new ConflictException(`Không tìm thấy kho`);
    }

    const product = await this.prisma.product.findUnique({
      where: { Id: data.ProductId },
      select: { Id: true, Name: true },
    });
    if (!product) {
      throw new ConflictException(`Không tìm thấy sản phẩm`);
    }

    const stock = await this.prisma.stock.create({
      data,
      include: {
        Warehouse: { select: { Id: true, Name: true } },
        Product: { select: { Id: true, Name: true } },
      },
    });
    return this.mapToStockResponse(stock);
  }

  async updateStock(
    id: string,
    data: Partial<StockUpdateData>,
  ): Promise<StockResponse> {
    const stock = await this.prisma.stock.update({
      where: { Id: id },
      data,
      include: {
        Warehouse: { select: { Id: true, Name: true } },
        Product: { select: { Id: true, Name: true } },
      },
    });
    return this.mapToStockResponse(stock);
  }

  async resetStock(id: string, qtyOnHand: number): Promise<StockResponse> {
    return this.updateStock(id, { QtyOnHand: qtyOnHand, QtyReserved: 0 });
  }

  async deleteStock(id: string): Promise<void> {
    await this.prisma.stock.delete({
      where: { Id: id },
    });
  }

  async bulkImport(stocks: ImportStockDto[]): Promise<StockResponse[]> {
    const results: StockResponse[] = [];

    for (const stockData of stocks) {
      const existing = await this.findByWarehouseAndProduct(
        stockData.WarehouseId,
        stockData.ProductId,
      );

      if (existing) {
        const updated = await this.updateStock(existing.Id, {
          QtyOnHand: stockData.QtyOnHand,
          QtyReserved: stockData.QtyReserved || 0,
          SafetyStock: stockData.SafetyStock || existing.SafetyStock,
          ReorderPoint: stockData.ReorderPoint || existing.ReorderPoint,
          MinQty: stockData.MinQty || existing.MinQty,
        });
        results.push(updated);
      } else {
        const created = await this.createWithResponse({
          WarehouseId: stockData.WarehouseId,
          ProductId: stockData.ProductId,
          QtyOnHand: stockData.QtyOnHand,
          SafetyStock: stockData.SafetyStock || 0,
          ReorderPoint: stockData.ReorderPoint || 0,
          MinQty: stockData.MinQty || 0,
        });
        results.push(created);
      }
    }

    return results;
  }
}
