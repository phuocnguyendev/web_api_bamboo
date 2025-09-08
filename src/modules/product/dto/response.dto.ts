import { BaseResponse } from 'src/common/dto/base-response.dto';
import { ProductResponse } from '../interfaces/product.interface';

export class IProductResponse extends BaseResponse<ProductResponse> {
  constructor(data: ProductResponse[], total: number) {
    super(data, total);
  }
}
