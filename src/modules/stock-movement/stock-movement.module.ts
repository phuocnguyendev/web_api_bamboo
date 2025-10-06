import { Module } from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { StockMovementController } from './stock-movement.controller';

@Module({
  controllers: [StockMovementController],
  providers: [StockMovementService],
})
export class StockMovementModule {}
