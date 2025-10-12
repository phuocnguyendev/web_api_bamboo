import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { StockRepository } from './repositories/stock.repository';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockValidator } from './validators/stock.validator';

@Module({
  controllers: [StockController],
  providers: [StockService, StockRepository, StockValidator, PrismaService],
  exports: [StockRepository],
})
export class StockModule {}
