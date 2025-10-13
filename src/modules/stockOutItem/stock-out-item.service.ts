import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStockOutItemDto } from './dto/create-stock-out-item.dto';
import { FilterStockOutItemDto } from './dto/filter-stock-out-item.dto';
import { UpdateStockOutItemDto } from './dto/update-stock-out-item.dto';
import { StockOutItemAnalyticsHelper } from './helpers/stock-out-item.analytics';
import { StockOutItemRepository } from './repositories/stock-out-item.repository';
import {
  IStockOutItemResponse,
  IStockOutItemReportResponse,
} from './dto/response.dto';

@Injectable()
export class StockOutItemService {
  constructor(
    private readonly stockOutItemRepo: StockOutItemRepository,
    private readonly analyticsHelper: StockOutItemAnalyticsHelper,
  ) {}

  async create(dto: CreateStockOutItemDto) {
    const existing = await this.stockOutItemRepo.findAll({
      StockOutVoucherId: dto.StockOutVoucherId,
      ProductId: dto.ProductId,
    });
    if (existing && existing.length > 0) {
      throw new ConflictException(
        'StockOutItem with this voucher and product already exists',
      );
    }
    return this.stockOutItemRepo.create(dto);
  }

  async update(id: string, dto: UpdateStockOutItemDto) {
    const current = await this.stockOutItemRepo.findById(id);
    if (!current) {
      throw new NotFoundException('StockOutItem not found');
    }
    const duplicate = await this.stockOutItemRepo.findAll({
      StockOutVoucherId: dto.StockOutVoucherId,
      ProductId: dto.ProductId,
    });
    if (duplicate && duplicate.length > 0 && duplicate[0].Id !== id) {
      throw new ConflictException(
        'StockOutItem with this voucher and product already exists',
      );
    }
    return this.stockOutItemRepo.update(id, dto);
  }

  async delete(id: string) {
    const current = await this.stockOutItemRepo.findById(id);
    if (!current) {
      throw new NotFoundException('StockOutItem not found');
    }
    return this.stockOutItemRepo.delete(id);
  }

  async findAll(filter: FilterStockOutItemDto): Promise<IStockOutItemResponse> {
    const data = await this.stockOutItemRepo.findAll(filter);
    return new IStockOutItemResponse(data, data.length);
  }

  async findByVoucherId(voucherId: string): Promise<IStockOutItemResponse> {
    const data = await this.stockOutItemRepo.findByVoucherId(voucherId);
    return new IStockOutItemResponse(data, data.length);
  }

  async findByProductId(productId: string): Promise<IStockOutItemResponse> {
    const data = await this.stockOutItemRepo.findByProductId(productId);
    return new IStockOutItemResponse(data, data.length);
  }

  async reportByProduct(params: {
    fromDate?: Date;
    toDate?: Date;
  }): Promise<IStockOutItemReportResponse> {
    const data = await this.stockOutItemRepo.reportByProduct(params);
    return new IStockOutItemReportResponse(data, data.length);
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
