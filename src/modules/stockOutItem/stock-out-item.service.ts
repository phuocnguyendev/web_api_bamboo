import { Injectable } from '@nestjs/common';
import { CreateStockOutItemDto } from './dto/create-stock-out-item.dto';
import { FilterStockOutItemDto } from './dto/filter-stock-out-item.dto';
import { UpdateStockOutItemDto } from './dto/update-stock-out-item.dto';
import { StockOutItemAnalyticsHelper } from './helpers/stock-out-item.analytics';
import { StockOutItemRepository } from './repositories/stock-out-item.repository';

@Injectable()
export class StockOutItemService {
  constructor(
    private readonly stockOutItemRepo: StockOutItemRepository,
    private readonly analyticsHelper: StockOutItemAnalyticsHelper,
  ) {}

  async create(dto: CreateStockOutItemDto) {
    return this.stockOutItemRepo.create(dto);
  }

  async update(id: string, dto: UpdateStockOutItemDto) {
    return this.stockOutItemRepo.update(id, dto);
  }

  async delete(id: string) {
    return this.stockOutItemRepo.delete(id);
  }

  async findAll(filter: FilterStockOutItemDto) {
    return this.stockOutItemRepo.findAll(filter);
  }

  async findByVoucherId(voucherId: string) {
    return this.stockOutItemRepo.findByVoucherId(voucherId);
  }

  async findByProductId(productId: string) {
    return this.stockOutItemRepo.findByProductId(productId);
  }

  async reportByProduct(params: { fromDate?: Date; toDate?: Date }) {
    return this.stockOutItemRepo.reportByProduct(params);
  }

  async forecastProductDemand(productId: string, months?: number) {
    return this.analyticsHelper.forecastProductDemand(productId, months);
  }

  async compareExportAndCurrentPrice(productId: string) {
    return this.analyticsHelper.compareExportAndCurrentPrice(productId);
  }

  async getAuditTrail(itemId: string) {
    return this.analyticsHelper.getAuditTrail(itemId);
  }
}
