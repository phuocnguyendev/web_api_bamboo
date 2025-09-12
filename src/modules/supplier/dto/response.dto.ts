import { BaseResponse } from 'src/common/dto/base-response.dto';
import { SupplierResponse } from '../interfaces/supplier.interface';

export class ISupplierResponse extends BaseResponse<SupplierResponse> {
  constructor(data: SupplierResponse[], total: number) {
    super(data, total);
  }
}
