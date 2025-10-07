import { Module } from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { StockMovementController } from './stock-movement.controller';
import { StockMovementRepository } from './repositories/stock_movement.repositoriy';
import { StockMovementValidator } from './validators/stock_movement.validator';
import { PrismaModule } from 'src/config/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StockMovementController],
  providers: [
    StockMovementService,
    StockMovementRepository,
    StockMovementValidator,
  ],
  exports: [
    StockMovementService,
    StockMovementRepository,
    StockMovementValidator,
  ],
})
export class StockMovementModule {}
