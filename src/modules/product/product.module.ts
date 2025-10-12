import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './repositories/product.repository';
import { ProductValidator } from './validators/product.validator';

@Module({
  imports: [],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductValidator,
    ProductRepository,
    PrismaService,
  ],
  exports: [ProductRepository],
})
export class ProductModule {}
