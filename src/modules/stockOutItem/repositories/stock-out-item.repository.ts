function decimalToNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val);
  if (typeof val.toNumber === 'function') return val.toNumber();
  return Number(val);
}

function mapStockOutItem(item: any): StockOutItem {
  return {
    Id: item.Id,
    StockOutVoucherId: item.StockOutVoucherId,
    ProductId: item.ProductId,
    Qty: item.Qty,
    UnitCostSnapshot: decimalToNumber(item.UnitCostSnapshot),
    Note: item.Note ?? undefined,
  };
}
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateStockOutItemDto } from '../dto/create-stock-out-item.dto';
import { FilterStockOutItemDto } from '../dto/filter-stock-out-item.dto';
import { UpdateStockOutItemDto } from '../dto/update-stock-out-item.dto';
import {
  StockOutItem,
  StockOutItemReport,
} from '../interfaces/stock-out-item.interface';

@Injectable()
export class StockOutItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStockOutItemDto): Promise<StockOutItem> {
    const created = await this.prisma.stockOutItem.create({ data });
    return mapStockOutItem(created);
  }

  async update(id: string, data: UpdateStockOutItemDto): Promise<StockOutItem> {
    const updated = await this.prisma.stockOutItem.update({
      where: { Id: id },
      data,
    });
    return mapStockOutItem(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.stockOutItem.delete({ where: { Id: id } });
  }

  async findAll(filter: FilterStockOutItemDto): Promise<StockOutItem[]> {
    const items = await this.prisma.stockOutItem.findMany({ where: filter });
    return items.map(mapStockOutItem);
  }

  async findByVoucherId(voucherId: string): Promise<StockOutItem[]> {
    const items = await this.prisma.stockOutItem.findMany({
      where: { StockOutVoucherId: voucherId },
    });
    return items.map(mapStockOutItem);
  }

  async findByProductId(productId: string): Promise<StockOutItem[]> {
    const items = await this.prisma.stockOutItem.findMany({
      where: { ProductId: productId },
    });
    return items.map(mapStockOutItem);
  }

  async reportByProduct({
    fromDate,
    toDate,
  }: {
    fromDate?: Date;
    toDate?: Date;
  }): Promise<StockOutItemReport[]> {
    // Example: group by ProductId, sum Qty, sum Qty*UnitCostSnapshot
    const result = await this.prisma.stockOutItem.groupBy({
      by: ['ProductId'],
      _sum: { Qty: true },
      _min: { UnitCostSnapshot: true },
      _max: { UnitCostSnapshot: true },
      _avg: { UnitCostSnapshot: true },
    });
    // Map to report interface
    return result.map((r) => ({
      ProductId: r.ProductId,
      ProductName: '', // join thêm nếu cần
      TotalQty: r._sum.Qty ?? 0,
      TotalValue: (r._sum.Qty ?? 0) * decimalToNumber(r._avg.UnitCostSnapshot),
      MinUnitCost: decimalToNumber(r._min.UnitCostSnapshot),
      MaxUnitCost: decimalToNumber(r._max.UnitCostSnapshot),
      AvgUnitCost: decimalToNumber(r._avg.UnitCostSnapshot),
    }));
  }
}
