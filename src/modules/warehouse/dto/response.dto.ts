import { BaseResponse } from 'src/common/dto/base-response.dto';
import { WarehouseResponse } from '../interfaces/warehouse.interface';

export class IWarehouseResponse extends BaseResponse<WarehouseResponse> {
  constructor(data: WarehouseResponse[], total: number) {
    super(data, total);
  }
}
