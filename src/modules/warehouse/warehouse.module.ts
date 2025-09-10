import { Module } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.controller';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { WarehouseRepository } from './repositories/warehouse.repository';
import { WarehouseValidator } from './validators';

@Module({
  controllers: [WarehouseController],
  providers: [
    WarehouseService,
    PrismaService,
    WarehouseRepository,
    WarehouseValidator,
  ],
})
export class WarehouseModule {}
