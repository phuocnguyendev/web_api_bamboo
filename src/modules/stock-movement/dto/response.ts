import { BaseResponse } from 'src/common/dto/base-response.dto';
import { StockMovementResponse } from '../interfaces/stock_movement.interface';

export class IStockMovementResponse extends BaseResponse<StockMovementResponse> {
  constructor(data: StockMovementResponse[], total: number) {
    super(data, total);
  }
}
