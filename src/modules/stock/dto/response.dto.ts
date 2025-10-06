import { BaseResponse } from 'src/common/dto/base-response.dto';
import { StockResponse } from '../interfaces/stock.interface';

export class IStockResponse extends BaseResponse<StockResponse> {
  constructor(data: StockResponse[], total: number) {
    super(data, total);
  }
}

export class StockSummary {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  lowStockProducts: number;
  warehouseCount: number;
}

export class StockSummaryResponse {
  summary: StockSummary;
  byWarehouse: Array<{
    warehouseId: string;
    warehouseName: string;
    productCount: number;
    totalStock: number;
    totalValue: number;
  }>;
  byProduct: Array<{
    productId: string;
    productName: string;
    totalStock: number;
    warehouseCount: number;
    averagePrice: number;
  }>;
}
