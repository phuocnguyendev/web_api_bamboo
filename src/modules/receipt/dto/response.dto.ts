import { BaseResponse } from 'src/common/dto/base-response.dto';
import { Receipt } from '../interfaces/receipt.interface';

export class IReceiptResponse extends BaseResponse<Receipt> {
  constructor(data: Receipt[], total: number) {
    super(data, total);
  }
}
