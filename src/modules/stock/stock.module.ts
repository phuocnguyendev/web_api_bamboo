import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { StockRepository } from './repositories/stock.repository';
import { StockValidator } from './validators/stock.validator';

@Module({
  controllers: [StockController],
  providers: [StockService, StockRepository, StockValidator, PrismaService],
})
export class StockModule {}
