import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Injectable()
export class ReceiptItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByReceiptId(receiptId: string) {
    return this.prisma.receiptItem.findMany({
      where: { ReceiptId: receiptId },
    });
  }
}
