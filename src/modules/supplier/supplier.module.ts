import { Module } from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { SupplierValidator } from './validators/supplier.validator';
import { SupplierRepository } from './repositories/supplier.repository';

@Module({
  controllers: [SupplierController],
  providers: [
    SupplierService,
    SupplierRepository,
    SupplierValidator,
    PrismaService,
  ],
})
export class SupplierModule {}
