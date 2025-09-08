import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductValidator } from './validators/product.validator';
import { ProductRepository } from './repositories/product.repository';
import { PrismaService } from 'src/config/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductValidator,
    ProductRepository,
    PrismaService,
  ],
})
export class ProductModule {}
