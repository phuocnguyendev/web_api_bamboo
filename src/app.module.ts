import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElasticsearchModule } from './config/elasticsearch/elasticsearch.module';
import { PrismaModule } from './config/prisma/prisma.module';
import { PrismaService } from './config/prisma/prisma.service';

import { AuthModule } from './modules/auth/auth.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ProductModule } from './modules/product/product.module';
import { ReceiptModule } from './modules/receipt/receipt.module';
import { RoleModule } from './modules/role/role.module';
import { StockMovementModule } from './modules/stock-movement/stock-movement.module';
import { StockModule } from './modules/stock/stock.module';
import { StockOutItemModule } from './modules/stockOutItem/stock-out-item.module';
import { StockOutVoucherModule } from './modules/stockOutVoucher/stock-out-voucher.module';
import { SupplierModule } from './modules/supplier/supplier.module';
import { UserModule } from './modules/user/user.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Core modules
    RoleModule,
    UserModule,
    AuthModule,

    PrismaModule,
    ConfigModule,
    ElasticsearchModule,
    PermissionModule,
    ProductModule,
    SupplierModule,
    WarehouseModule,
    StockModule,
    StockMovementModule,
    ReceiptModule,
    StockOutVoucherModule,
    StockOutItemModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
