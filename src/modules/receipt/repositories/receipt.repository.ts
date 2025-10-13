import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { FilterReceiptDto } from '../dto/filter-receipt.dto';
import { UpdateReceiptDto } from '../dto/update-receipt.dto';
import { Receipt, ReceiptItem } from '../interfaces/receipt.interface';

@Injectable()
export class ReceiptRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCode(code: string): Promise<Receipt | null> {
    return (await this.prisma.receipt.findUnique({
      where: { Code: code },
      include: { Items: true },
    })) as any;
  }

  async create(data: CreateReceiptDto): Promise<Receipt> {
    const { Items, Status, ...receiptData } = data;
    const created = await this.prisma.receipt.create({
      data: {
        ...receiptData,
        Status: Status ?? 'pending',
        Items: {
          create: Items,
        },
      },
      include: { Items: true },
    });
    return created as any;
  }

  async update(id: string, data: UpdateReceiptDto): Promise<Receipt> {
    const { Items, ...receiptData } = data;
    // Xử lý update Items nếu cần
    const updated = await this.prisma.receipt.update({
      where: { Id: id },
      data: {
        ...receiptData,
        // Items: { ... } // cần custom nếu update items
      },
      include: { Items: true },
    });
    return updated as any;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.receipt.delete({ where: { Id: id } });
  }

  async findAll(
    filter: FilterReceiptDto,
  ): Promise<{ ListModel: Receipt[]; Count: number }> {
    const { searchText, fromDate, toDate, page = 1, pageSize = 20 } = filter;
    const where: any = {};
    if (searchText) {
      where.OR = [
        { Code: { contains: searchText, mode: 'insensitive' } },
        { Note: { contains: searchText, mode: 'insensitive' } },
      ];
    }
    if (fromDate) where.ReceivedAt = { gte: new Date(fromDate) };
    if (toDate)
      where.ReceivedAt = { ...(where.ReceivedAt || {}), lte: new Date(toDate) };
    const [ListModel, Count] = await Promise.all([
      this.prisma.receipt.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { ReceivedAt: 'desc' },
        include: { Items: true },
      }),
      this.prisma.receipt.count({ where }),
    ]);
    return { ListModel: ListModel as any, Count };
  }

  async findById(id: string): Promise<Receipt | null> {
    return (await this.prisma.receipt.findUnique({
      where: { Id: id },
      include: { Items: true },
    })) as any;
  }

  async getItems(receiptId: string): Promise<ReceiptItem[]> {
    return (await this.prisma.receiptItem.findMany({
      where: { ReceiptId: receiptId },
    })) as any;
  }
}
