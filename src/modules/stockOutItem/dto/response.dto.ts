import { StockOutItem } from '../interfaces/stock-out-item.interface';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { StockOutItemReport } from '../interfaces/stock-out-item.interface';

export class IStockOutItemResponse extends BaseResponse<StockOutItem> {
  constructor(data: StockOutItem[], total: number) {
    super(data, total);
  }
}

export class IStockOutItemReportResponse extends BaseResponse<StockOutItemReport> {
  constructor(data: StockOutItemReport[], total: number) {
    super(data, total);
  }
}
