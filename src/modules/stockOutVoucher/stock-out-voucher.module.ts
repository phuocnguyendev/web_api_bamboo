import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { StockOutVoucherRepository } from './repositories/stock-out-voucher.repository';
import { StockOutVoucherController } from './stock-out-voucher.controller';
import { StockOutVoucherService } from './stock-out-voucher.service';
import { StockOutVoucherValidator } from './validators/stock-out-voucher.validator';

@Module({
  controllers: [StockOutVoucherController],
  providers: [
    StockOutVoucherService,
    StockOutVoucherRepository,
    StockOutVoucherValidator,
    PrismaService,
  ],
})
export class StockOutVoucherModule {}
