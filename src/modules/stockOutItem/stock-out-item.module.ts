import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { StockOutItemAnalyticsHelper } from './helpers/stock-out-item.analytics';
import { StockOutItemRepository } from './repositories/stock-out-item.repository';
import { StockOutItemController } from './stock-out-item.controller';
import { StockOutItemService } from './stock-out-item.service';

@Module({
  controllers: [StockOutItemController],
  providers: [
    StockOutItemService,
    StockOutItemRepository,
    StockOutItemAnalyticsHelper,
    PrismaService,
  ],
})
export class StockOutItemModule {}
