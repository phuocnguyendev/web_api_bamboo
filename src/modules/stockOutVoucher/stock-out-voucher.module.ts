import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ProductModule } from '../product/product.module';
import { StockModule } from '../stock/stock.module';
import { WarehouseModule } from '../warehouse/warehouse.module';
import { StockOutVoucherRepository } from './repositories/stock-out-voucher.repository';
import { StockOutVoucherController } from './stock-out-voucher.controller';
import { StockOutVoucherService } from './stock-out-voucher.service';
import { StockOutVoucherValidator } from './validators/stock-out-voucher.validator';

@Module({
  imports: [ProductModule, WarehouseModule, StockModule],
  controllers: [StockOutVoucherController],
  providers: [
    StockOutVoucherService,
    StockOutVoucherRepository,
    StockOutVoucherValidator,
    PrismaService,
  ],
})
export class StockOutVoucherModule {}
