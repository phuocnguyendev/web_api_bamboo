import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateStockOutVoucherDto } from '../dto/create-stock-out-voucher.dto';
import { FilterStockOutVoucherDto } from '../dto/filter-stock-out-voucher.dto';
import { UpdateStockOutVoucherDto } from '../dto/update-stock-out-voucher.dto';
import {
  StockOutItem,
  StockOutVoucher,
} from '../interfaces/stock-out-voucher.interface';

@Injectable()
export class StockOutVoucherRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateStockOutVoucherDto): Promise<StockOutVoucher> {
    const { Items, Status, ...voucherData } = data;
    const created = await this.prisma.stockOutVoucher.create({
      data: {
        ...voucherData,
        Status: Status ?? 'pending',
        Items: {
          create: Items,
        },
      },
      include: { Items: true },
    });
    return created as any;
  }

  async update(
    id: string,
    data: UpdateStockOutVoucherDto,
  ): Promise<StockOutVoucher> {
    const { Items, ...voucherData } = data;
    // Xử lý update Items nếu cần
    const updated = await this.prisma.stockOutVoucher.update({
      where: { Id: id },
      data: {
        ...voucherData,
        // Items: { ... } // cần custom nếu update items
      },
      include: { Items: true },
    });
    return updated as any;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.stockOutVoucher.delete({ where: { Id: id } });
  }

  async findAll(
    filter: FilterStockOutVoucherDto,
  ): Promise<{ ListModel: StockOutVoucher[]; Count: number }> {
    const { searchText, fromDate, toDate, page = 1, pageSize = 20 } = filter;
    const where: any = {};
    if (searchText) {
      where.OR = [
        { Code: { contains: searchText, mode: 'insensitive' } },
        { Reason: { contains: searchText, mode: 'insensitive' } },
      ];
    }
    if (fromDate) where.IssuedAt = { gte: new Date(fromDate) };
    if (toDate)
      where.IssuedAt = { ...(where.IssuedAt || {}), lte: new Date(toDate) };
    const [ListModel, Count] = await Promise.all([
      this.prisma.stockOutVoucher.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { IssuedAt: 'desc' },
        include: { Items: true },
      }),
      this.prisma.stockOutVoucher.count({ where }),
    ]);
    return { ListModel: ListModel as any, Count };
  }

  async findById(id: string): Promise<StockOutVoucher | null> {
    return (await this.prisma.stockOutVoucher.findUnique({
      where: { Id: id },
      include: { Items: true },
    })) as any;
  }

  async getItems(stockOutVoucherId: string): Promise<StockOutItem[]> {
    return (await this.prisma.stockOutItem.findMany({
      where: { StockOutVoucherId: stockOutVoucherId },
    })) as any;
  }
}
