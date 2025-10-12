import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { ReceiptItemRepository } from './repositories/receipt-item.repository';
import { ReceiptRepository } from './repositories/receipt.repository';
import { ReceiptValidator } from './validators/receipt.validator';

@Module({
  controllers: [ReceiptController],
  providers: [
    ReceiptService,
    ReceiptItemRepository,
    ReceiptRepository,
    ReceiptValidator,
    PrismaService,
  ],
})
export class ReceiptModule {}
