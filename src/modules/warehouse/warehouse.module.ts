import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { WarehouseRepository } from './repositories/warehouse.repository';
import { WarehouseValidator } from './validators';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';

@Module({
  controllers: [WarehouseController],
  providers: [
    WarehouseService,
    PrismaService,
    WarehouseRepository,
    WarehouseValidator,
  ],
  exports: [WarehouseRepository],
})
export class WarehouseModule {}
